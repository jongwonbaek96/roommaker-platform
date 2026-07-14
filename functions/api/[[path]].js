// ============================================================
// 관리자 API — 게임/챕터/블록 편집 + 토큰 발급
// roommaker-studio(Vercel)의 api/index.js를 Pages Functions로 이식.
//
// 차이점:
//  · Cloudflare REST API + CF 토큰을 쓰지 않는다 → D1 바인딩(env.DB) 직결.
//    코드에 시크릿이 전혀 없다.
//  · 편집 키(x-rm-key) 대신 관리자 세션 쿠키로 인증한다 (functions/api/_middleware.js).
// ============================================================

const q = async (env, sql, params = []) => {
  const r = await env.DB.prepare(sql).bind(...params.map(v => (v === undefined ? null : v))).all();
  return r.results || [];
};
const run = (env, sql, params = []) =>
  env.DB.prepare(sql).bind(...params.map(v => (v === undefined ? null : v))).run();

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const pick = (obj, keys) => {
  const o = {};
  for (const k of keys) if (obj && obj[k] !== undefined) o[k] = obj[k];
  return o;
};

// 헷갈리는 글자(0/O, 1/I/L) 제외. 형식: RM-XXXX-XXXX
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function makeToken() {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  let s = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) s += '-';
    s += ALPHABET[b[i] % ALPHABET.length];
  }
  return 'RM-' + s;
}
const newId = (prefix) => prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method;
  const url = new URL(request.url);
  const p = (params.path || []).filter(Boolean); // /api/games/dawn-444 → ['games','dawn-444']

  if (method === 'OPTIONS') return new Response(null, { status: 204 });
  if (!env.DB) return json({ error: '서버 설정 오류: D1 바인딩(DB)이 없습니다' }, 500);

  let body = {};
  if (method !== 'GET' && method !== 'DELETE') {
    try { body = await request.json(); } catch (e) { body = {}; }
  }

  try {
    // ══════════════════════════════════════════════════════
    // 토큰 (구매자 접속 코드)
    // ══════════════════════════════════════════════════════

    // POST /api/tokens — 발급 { game_id, order_ref?, note?, count? (최대 50) }
    if (method === 'POST' && p[0] === 'tokens' && !p[1]) {
      const game_id = String(body.game_id || '').trim();
      if (!game_id) return json({ error: 'game_id가 필요합니다' }, 400);
      const count = Math.min(Math.max(parseInt(body.count, 10) || 1, 1), 50);
      const order_ref = String(body.order_ref || '').trim();
      const note = String(body.note || '').trim();
      const made = [];
      for (let i = 0; i < count; i++) {
        const id = newId('tok');
        let token = null;
        for (let attempt = 0; attempt < 5 && !token; attempt++) {
          const t = makeToken();
          try {
            await run(env, `INSERT INTO tokens (id,game_id,token,order_ref,status,note) VALUES (?,?,?,?,'unused',?)`,
              [id, game_id, t, order_ref, note]);
            token = t;
          } catch (e) { /* token UNIQUE 충돌 — 다시 뽑는다 */ }
        }
        if (!token) return json({ error: '토큰 생성 실패' }, 500);
        made.push({ id, game_id, token, order_ref, note, status: 'unused' });
      }
      return json({ ok: true, tokens: made });
    }

    // GET /api/tokens?game=&status=&q= — 목록 (활성 세션 수 포함)
    if (method === 'GET' && p[0] === 'tokens' && !p[1]) {
      const where = []; const args = [];
      const g = url.searchParams.get('game'); const s = url.searchParams.get('status'); const kw = url.searchParams.get('q');
      if (g) { where.push('t.game_id=?'); args.push(g); }
      if (s) { where.push('t.status=?'); args.push(s); }
      if (kw) { where.push('(t.token LIKE ? OR t.order_ref LIKE ? OR t.note LIKE ?)'); args.push('%'+kw+'%','%'+kw+'%','%'+kw+'%'); }
      const rows = await q(env,
        `SELECT t.*, (SELECT COUNT(*) FROM sessions s WHERE s.token_id=t.id AND s.expires_at > datetime('now')) AS active_sessions
           FROM tokens t ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
          ORDER BY t.issued_at DESC LIMIT 500`, args);
      return json(rows);
    }

    // POST /api/tokens/:id/revoke — 무효화 (연결된 세션도 즉시 끊음)
    if (method === 'POST' && p[0] === 'tokens' && p[1] && p[2] === 'revoke') {
      const id = decodeURIComponent(p[1]);
      const rows = await q(env, `SELECT * FROM tokens WHERE id=? OR token=?`, [id, id]);
      if (!rows.length) return json({ error: '토큰을 찾을 수 없습니다' }, 404);
      const t = rows[0];
      await run(env, `UPDATE tokens SET status='revoked' WHERE id=?`, [t.id]);
      await run(env, `DELETE FROM sessions WHERE token_id=?`, [t.id]);
      return json({ ok: true, id: t.id, status: 'revoked' });
    }

    // POST /api/tokens/:id/reissue — 무효화 + 같은 주문으로 새 코드
    if (method === 'POST' && p[0] === 'tokens' && p[1] && p[2] === 'reissue') {
      const id = decodeURIComponent(p[1]);
      const rows = await q(env, `SELECT * FROM tokens WHERE id=? OR token=?`, [id, id]);
      if (!rows.length) return json({ error: '토큰을 찾을 수 없습니다' }, 404);
      const old = rows[0];
      await run(env, `UPDATE tokens SET status='revoked' WHERE id=?`, [old.id]);
      await run(env, `DELETE FROM sessions WHERE token_id=?`, [old.id]);
      const nid = newId('tok');
      const note = (old.note ? old.note + ' / ' : '') + '재발급(' + old.token + ')';
      let token = null;
      for (let attempt = 0; attempt < 5 && !token; attempt++) {
        const t = makeToken();
        try {
          await run(env, `INSERT INTO tokens (id,game_id,token,order_ref,status,note) VALUES (?,?,?,?,'unused',?)`,
            [nid, old.game_id, t, old.order_ref || '', note]);
          token = t;
        } catch (e) { /* 충돌 — 재시도 */ }
      }
      if (!token) return json({ error: '토큰 재발급 실패' }, 500);
      return json({ ok: true, token: { id: nid, game_id: old.game_id, token, order_ref: old.order_ref, note, status: 'unused' } });
    }

    // ══════════════════════════════════════════════════════
    // 게임 / 챕터 / 블록
    // ══════════════════════════════════════════════════════

    // GET /api/games — 목록
    if (method === 'GET' && p[0] === 'games' && !p[1]) {
      const rows = await q(env,
        `SELECT id,slug,title,subtitle,genre,emoji,accent_color,bg_color,engine,status,version,updated_at,
          (SELECT COUNT(*) FROM chapters c WHERE c.game_id=games.id) AS chapter_count,
          (SELECT COUNT(*) FROM blocks b JOIN chapters c ON b.chapter_id=c.id WHERE c.game_id=games.id AND b.type='puzzle') AS puzzle_count
         FROM games ORDER BY sort_order, updated_at DESC`);
      return json(rows);
    }

    // GET /api/games/:id — 게임 트리 (게임+챕터+블록)
    if (method === 'GET' && p[0] === 'games' && p[1]) {
      const id = decodeURIComponent(p[1]);
      const games = await q(env, `SELECT * FROM games WHERE id=? OR slug=?`, [id, id]);
      if (!games.length) return json({ error: '게임을 찾을 수 없습니다' }, 404);
      const game = games[0];
      const chapters = await q(env, `SELECT * FROM chapters WHERE game_id=? ORDER BY order_index`, [game.id]);
      const blocks = await q(env, `SELECT b.* FROM blocks b JOIN chapters c ON b.chapter_id=c.id WHERE c.game_id=? ORDER BY b.order_index`, [game.id]);
      blocks.forEach(b => { try { b.data = JSON.parse(b.data); } catch (e) {} });
      return json({ game, chapters, blocks });
    }

    // PUT /api/games/:id — 메타 수정
    if (method === 'PUT' && p[0] === 'games' && p[1]) {
      const id = decodeURIComponent(p[1]);
      const f = pick(body, ['title','subtitle','genre','emoji','accent_color','bg_color','difficulty','description','status','sort_order','meta','html']);
      const keys = Object.keys(f);
      if (!keys.length) return json({ error: '수정할 필드가 없습니다' }, 400);
      await run(env, `UPDATE games SET ${keys.map(k => k + '=?').join(',')}, version=version+1, updated_at=datetime('now') WHERE id=?`,
        [...keys.map(k => String(f[k])), id]);
      return json({ ok: true });
    }

    // PUT /api/chapters/:id
    if (method === 'PUT' && p[0] === 'chapters' && p[1]) {
      const id = decodeURIComponent(p[1]);
      const f = pick(body, ['label','title','subtitle','order_index','meta']);
      const keys = Object.keys(f);
      if (!keys.length) return json({ error: '수정할 필드가 없습니다' }, 400);
      await run(env, `UPDATE chapters SET ${keys.map(k => k + '=?').join(',')} WHERE id=?`, [...keys.map(k => String(f[k])), id]);
      await run(env, `UPDATE games SET version=version+1, updated_at=datetime('now') WHERE id=(SELECT game_id FROM chapters WHERE id=?)`, [id]);
      return json({ ok: true });
    }

    // PUT /api/blocks/:id — 편집의 핵심
    if (method === 'PUT' && p[0] === 'blocks' && p[1]) {
      const id = decodeURIComponent(p[1]);
      const sets = []; const vals = [];
      if (body.data !== undefined) { sets.push('data=?'); vals.push(typeof body.data === 'string' ? body.data : JSON.stringify(body.data)); }
      if (body.type !== undefined) { sets.push('type=?'); vals.push(String(body.type)); }
      if (body.order_index !== undefined) { sets.push('order_index=?'); vals.push(String(body.order_index)); }
      if (body.chapter_id !== undefined) { sets.push('chapter_id=?'); vals.push(String(body.chapter_id)); }
      if (!sets.length) return json({ error: '수정할 필드가 없습니다' }, 400);
      await run(env, `UPDATE blocks SET ${sets.join(',')} WHERE id=?`, [...vals, id]);
      await run(env, `UPDATE games SET version=version+1, updated_at=datetime('now') WHERE id=(SELECT c.game_id FROM chapters c JOIN blocks b ON b.chapter_id=c.id WHERE b.id=?)`, [id]);
      return json({ ok: true });
    }

    // POST /api/blocks — 추가
    if (method === 'POST' && p[0] === 'blocks' && !p[1]) {
      const { chapter_id, type, data, order_index } = body;
      if (!chapter_id || !type) return json({ error: 'chapter_id와 type이 필요합니다' }, 400);
      const id = newId('blk');
      await run(env, `INSERT INTO blocks (id,chapter_id,order_index,type,data) VALUES (?,?,?,?,?)`,
        [id, chapter_id, String(order_index || 0), type, JSON.stringify(data || { type })]);
      await run(env, `UPDATE games SET version=version+1, updated_at=datetime('now') WHERE id=(SELECT game_id FROM chapters WHERE id=?)`, [chapter_id]);
      return json({ ok: true, id });
    }

    // DELETE /api/blocks/:id
    if (method === 'DELETE' && p[0] === 'blocks' && p[1]) {
      const id = decodeURIComponent(p[1]);
      await run(env, `UPDATE games SET version=version+1, updated_at=datetime('now') WHERE id=(SELECT c.game_id FROM chapters c JOIN blocks b ON b.chapter_id=c.id WHERE b.id=?)`, [id]);
      await run(env, `DELETE FROM blocks WHERE id=?`, [id]);
      return json({ ok: true });
    }

    // PUT /api/reorder — {ids:[...]} 배열 순서 = 새 순서
    if (method === 'PUT' && p[0] === 'reorder') {
      const ids = body.ids || [];
      if (!ids.length) return json({ error: 'ids가 필요합니다' }, 400);
      const cases = ids.map(() => 'WHEN ? THEN ?').join(' ');
      const args = [];
      ids.forEach((id, i) => { args.push(String(id), String(i)); });
      await run(env, `UPDATE blocks SET order_index=CASE id ${cases} END WHERE id IN (${ids.map(() => '?').join(',')})`,
        [...args, ...ids.map(String)]);
      return json({ ok: true });
    }

    // POST /api/games — 게임 통째 업로드 (제작 파이프라인용)
    if (method === 'POST' && p[0] === 'games' && !p[1]) {
      const { game, chapters = [], blocks = [] } = body;
      if (!game || !game.id || !game.title) return json({ error: 'game.id와 game.title이 필요합니다' }, 400);
      await run(env, `DELETE FROM blocks WHERE chapter_id IN (SELECT id FROM chapters WHERE game_id=?)`, [game.id]);
      await run(env, `DELETE FROM chapters WHERE game_id=?`, [game.id]);
      await run(env, `DELETE FROM games WHERE id=?`, [game.id]);
      await run(env, `INSERT INTO games (id,slug,title,subtitle,genre,emoji,accent_color,bg_color,difficulty,description,engine,status,meta,html)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [game.id, game.slug || game.id, game.title, game.subtitle || '', game.genre || '', game.emoji || '🎮',
         game.accent_color || '#7c5cff', game.bg_color || '#0f0f0f', String(game.difficulty || 3), game.description || '',
         game.engine || 'blocks', game.status || 'draft', JSON.stringify(game.meta || {}), game.html || '']);
      for (const c of chapters) {
        await run(env, `INSERT INTO chapters (id,game_id,order_index,label,title,subtitle,meta) VALUES (?,?,?,?,?,?,?)`,
          [c.id, game.id, String(c.order_index || 0), c.label || '', c.title || '', c.subtitle || '', JSON.stringify(c.meta || {})]);
      }
      for (const b of blocks) {
        await run(env, `INSERT INTO blocks (id,chapter_id,order_index,type,data) VALUES (?,?,?,?,?)`,
          [b.id, b.chapter_id, String(b.order_index || 0), b.type, typeof b.data === 'string' ? b.data : JSON.stringify(b.data || {})]);
      }
      return json({ ok: true, game_id: game.id, chapters: chapters.length, blocks: blocks.length });
    }

    return json({ error: '알 수 없는 API 경로: ' + url.pathname }, 404);
  } catch (e) {
    return json({ error: String((e && e.message) || e) }, 500);
  }
}
