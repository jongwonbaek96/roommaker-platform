// ============================================================
// 접속 게이트 공용 로직 (Cloudflare Pages Functions)
// D1 바인딩 이름: DB
//
// 게임 목록은 이제 D1 games 테이블이 정본이다(하드코딩 없음).
//  · status='published' → 구매자에게 공개
//  · status='draft'     → 비공개. 구매자는 목록·상세·플레이 전부 차단,
//                          관리자만 미리보기 가능.
// 게임 본문 파일 경로는 games.meta.file 에 있다.
// ============================================================

export const SESSION_DAYS = 7;

// D1에서 게임 1건 (없거나 DB 없으면 null)
export async function getGame(env, slug) {
  if (!env.DB || !slug) return null;
  const row = await env.DB.prepare(
    `SELECT id, title, subtitle, genre, emoji, accent_color, status, engine, description, meta
       FROM games WHERE id=? OR slug=?`
  ).bind(slug, slug).first();
  if (!row) return null;
  let meta = {};
  try { meta = JSON.parse(row.meta || '{}'); } catch (e) {}
  row.meta = meta;
  row.file = meta.file || ('games/' + row.id + '.html');
  return row;
}

// 공개된 게임 목록 (구매자용)
export async function publicGames(env) {
  if (!env.DB) return [];
  const r = await env.DB.prepare(
    `SELECT id, title, subtitle, genre, emoji, accent_color, description, meta
       FROM games WHERE status='published' ORDER BY sort_order, updated_at DESC`
  ).all();
  return (r.results || []).map(g => {
    let meta = {};
    try { meta = JSON.parse(g.meta || '{}'); } catch (e) {}
    return { ...g, meta };
  });
}

// 파일 경로 → slug. Cloudflare Pages가 .html을 떼어낸 경로도 반드시 잡아야 한다.
// games/{slug}.html · games/{slug} · games/{slug}-answers 전부 같은 게임으로 본다.
export function slugFromPath(pathname) {
  const p = pathname
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\.html$/i, '');
  const m = p.match(/^games\/([a-z0-9-]+)$/i);
  if (!m) return null;
  // dawn-444-answers → dawn-444 로도 시도할 수 있게 원본을 그대로 넘긴다.
  return m[1];
}

// 파생 파일(-answers 등)을 본 게임 slug로 되돌린다.
export function baseSlug(name) {
  return String(name || '').replace(/-(answers|answer|solution|guide)$/i, '');
}

export const cookieName = (slug) => 'rm_sess_' + String(slug).replace(/[^a-z0-9_-]/gi, '');

export function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function newSessionKey() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function newId(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// 유효한 구매자 세션인지 확인 (만료·무효화 토큰은 거부)
export async function validSession(env, slug, request) {
  if (!env.DB) return null;
  const key = readCookie(request, cookieName(slug));
  if (!key) return null;
  const row = await env.DB.prepare(
    `SELECT s.id, s.token_id, t.status AS token_status
       FROM sessions s JOIN tokens t ON t.id = s.token_id
      WHERE s.session_key = ? AND s.game_id = ? AND s.expires_at > datetime('now')`
  ).bind(key, slug).first();
  if (!row) return null;
  if (row.token_status === 'revoked') return null;
  return row;
}

// 토큰 검증 → used 처리 → 세션 발급
export async function redeemToken(env, slug, rawToken) {
  const token = String(rawToken || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!token) return { error: '코드를 입력해 주세요.' };

  const t = await env.DB.prepare(`SELECT * FROM tokens WHERE token = ?`).bind(token).first();
  if (!t) return { error: '존재하지 않는 코드입니다. 카톡으로 받은 코드를 다시 확인해 주세요.' };
  if (t.game_id !== slug) return { error: '이 코드는 다른 게임용 코드입니다.' };
  if (t.status === 'used') return { error: '이미 사용된 코드입니다. 접속이 안 되면 판매처로 문의해 주세요.' };
  if (t.status === 'revoked') return { error: '사용할 수 없는 코드입니다. 판매처로 문의해 주세요.' };

  // 경쟁 조건 방지: unused → used 로 바뀐 "그 한 번"만 성공
  const upd = await env.DB.prepare(
    `UPDATE tokens SET status='used', used_at=datetime('now') WHERE id=? AND status='unused'`
  ).bind(t.id).run();
  if (!upd.meta || upd.meta.changes !== 1) {
    return { error: '이미 사용된 코드입니다. 접속이 안 되면 판매처로 문의해 주세요.' };
  }

  const sessionKey = newSessionKey();
  await env.DB.prepare(
    `INSERT INTO sessions (id, token_id, game_id, session_key, expires_at)
     VALUES (?,?,?,?, datetime('now', '+${SESSION_DAYS} days'))`
  ).bind(newId('ses'), t.id, slug, sessionKey).run();

  return { sessionKey };
}

export function sessionCookie(slug, sessionKey) {
  return `${cookieName(slug)}=${sessionKey}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
}
