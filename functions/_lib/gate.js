// ============================================================
// 접속 게이트 공용 로직 (Cloudflare Pages Functions)
// D1 바인딩 이름: DB  (Pages 설정 → Functions → D1 database bindings)
// 시크릿은 코드에 없음 — 바인딩만 사용한다.
// ============================================================

export const SESSION_DAYS = 7;

// 게임 slug ↔ 실제 파일. registry.json과 동일하게 유지할 것.
export const GAMES = {
  'sugar-melts':         { file: 'games/sugar-melts.html',         title: '설탕은 녹는다' },
  'dragon-heart':        { file: 'games/dragon-heart.html',        title: '용의 심장' },
  'colorless-white':     { file: 'games/colorless-white.html',     title: '색깔없는세상 : 왱?' },
  'colorless-green':     { file: 'games/colorless-green.html',     title: '색깔없는세상 : APT APT' },
  'colorless-blue':      { file: 'games/colorless-blue.html',      title: '색깔없는세상 : 수능만점' },
  'colorless-yellow':    { file: 'games/colorless-yellow.html',    title: '색깔없는세상 : 나는 부자가 될 거에요!' },
  'colorless-red':       { file: 'games/colorless-red.html',       title: '색깔없는세상 : 난 오늘도 일을 나간다' },
  'midnight-frequency':  { file: 'games/midnight-frequency.html',  title: '자정의 주파수' },
  'dawn-444':            { file: 'games/dawn-444.html',            title: '새벽 4시 44분' },
  'light-first':         { file: 'games/light-first.html',         title: '빛이 먼저 왔다' },
  'magic-school':        { file: 'games/magic-school.html',        title: '마법학교 졸업은 글렀어요' },
  'your-letter':         { file: 'games/your-letter.html',         title: '너의 편지를 아직 읽지 못했어' },
};

// 파일 경로 → slug (게이트 미들웨어에서 역방향 조회)
// Cloudflare Pages가 .html을 떼어낸 경로(/games/dawn-444)도 반드시 잡아야 한다.
export function slugForFile(pathname) {
  const p = pathname
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\.html$/i, ''); // 확장자 유무 모두 수용

  for (const [slug, g] of Object.entries(GAMES)) {
    const base = g.file.replace(/\.html$/i, ''); // 예: games/dawn-444
    if (p === base) return slug;
    // dawn-444-answers 같은 파생 파일(정답 페이지 등)도 같은 게임으로 묶는다
    if (p.startsWith(base + '-')) return slug;
  }
  return null;
}

export const cookieName = (slug) => 'rm_sess_' + slug.replace(/[^a-z0-9_-]/gi, '');

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

// 유효한 세션인지 확인 (만료 지난 세션은 무효 + 정리)
export async function validSession(env, slug, request) {
  const key = readCookie(request, cookieName(slug));
  if (!key) return null;
  const row = await env.DB.prepare(
    `SELECT s.id, s.token_id, t.status AS token_status
       FROM sessions s JOIN tokens t ON t.id = s.token_id
      WHERE s.session_key = ? AND s.game_id = ? AND s.expires_at > datetime('now')`
  ).bind(key, slug).first();
  if (!row) return null;
  // 무효화(revoked)된 토큰의 세션은 즉시 차단 (편집기에서 세션을 지우지만 이중 방어)
  if (row.token_status === 'revoked') return null;
  return row;
}

// 토큰 검증 → used 처리 → 세션 발급. 실패 시 { error } 를 그대로 사용자에게 보여준다.
export async function redeemToken(env, slug, rawToken) {
  const token = String(rawToken || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!token) return { error: '코드를 입력해 주세요.' };

  const t = await env.DB.prepare(`SELECT * FROM tokens WHERE token = ?`).bind(token).first();
  if (!t) return { error: '존재하지 않는 코드입니다. 카톡으로 받은 코드를 다시 확인해 주세요.' };
  if (t.game_id !== slug) return { error: '이 코드는 다른 게임용 코드입니다.' };
  if (t.status === 'used') return { error: '이미 사용된 코드입니다. 접속이 안 되면 판매처로 문의해 주세요.' };
  if (t.status === 'revoked') return { error: '사용할 수 없는 코드입니다. 판매처로 문의해 주세요.' };

  // 경쟁 조건 방지: unused → used 로 바뀐 "그 한 번"만 성공 처리
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
