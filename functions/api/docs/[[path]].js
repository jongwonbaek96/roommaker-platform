// ============================================================
// /api/docs/** — 제작 MD 열람 · 다운로드 · 업로드 (지시서 #05 §B, §C)
//
// 🔒 인증: 이 라우트는 /api/* 아래라 functions/api/_middleware.js 의
//    관리자 세션 게이트를 반드시 통과한다. 쿠키 없으면 401.
//    (MD에는 정답이 전부 들어 있다 — 구매자 표면 노출 절대 금지)
//
//  GET  /api/docs                        게임별 MD 현황 (누락·미반영 표시)
//  GET  /api/docs/{game}                 그 게임의 MD 파일 목록
//  GET  /api/docs/{game}/{file}          MD 원문 (text/plain)
//  GET  /api/docs/{game}/{file}?dl=1     단건 다운로드
//  GET  /api/docs/{game}/zip             게임별 전체 zip 다운로드
//  GET  /api/docs/{game}/{file}/history  변경 이력
//  PUT  /api/docs/{game}/{file}          수정본 업로드(덮어쓰기) → 이력 적재 + '미반영' 표시
//  POST /api/docs/{game}/{file}/applied  '게임에 반영 완료'로 표시 → 미반영 해제
//  POST /api/docs/{game}/{file}/revert   수정본 폐기 → 레포 원본으로 복귀
//  GET  /api/docs/_selftest              배포 후 1회: 레포 MD를 실제로 읽는지 점검
// ============================================================
import {
  STANDARD_FILES, isSafeGameId, isSafeFile, ensureSchema,
  readDoc, readRepoDoc, readDbDoc, docsOverview, makeZip,
} from '../../_lib/docs.js';
import { DOCS_MANIFEST } from '../../_lib/docs-manifest.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const MAX_BYTES = 512 * 1024; // MD 1개 상한 512KB

async function allGames(env) {
  const r = await env.DB.prepare(
    `SELECT id, title, emoji, status FROM games ORDER BY sort_order, updated_at DESC`
  ).all();
  return r.results || [];
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method;
  const url = new URL(request.url);
  const p = (params.path || []).filter(Boolean);

  if (method === 'OPTIONS') return new Response(null, { status: 204 });
  if (!env.DB) return json({ error: '서버 설정 오류: D1 바인딩(DB)이 없습니다' }, 500);

  try {
    await ensureSchema(env);

    // ── 배포 점검: 레포 MD를 실제로 읽어낼 수 있는가 (env.ASSETS 동작 확인)
    if (method === 'GET' && p[0] === '_selftest') {
      const gid = Object.keys(DOCS_MANIFEST)[0];
      if (!gid) return json({ ok: false, reason: 'manifest가 비어 있음 — node tools/gen-docs-manifest.mjs 실행 필요' });
      const fn = DOCS_MANIFEST[gid].files[0].name;
      const text = await readRepoDoc(env, request, gid, fn);
      const blocked = await fetch(new URL(`/games/${gid}/docs/${fn}`, url).toString(), {
        headers: { cookie: '' },
      }).then(r => r.status).catch(() => 'err');
      return json({
        ok: !!text,
        assetsBinding: !!env.ASSETS,
        sample: `${gid}/${fn}`,
        readBytes: text ? text.length : 0,
        publicStatus: blocked, // 404 여야 정상 (정적 경로 차단됨)
        verdict: text ? (blocked === 404 ? '정상 — 읽기 OK / 공개경로 차단 OK' : '⚠️ 공개경로가 404가 아님! 차단 확인 필요')
                      : '⚠️ 레포 MD를 읽지 못함 (env.ASSETS 확인)',
      });
    }

    // ── GET /api/docs — 전체 현황
    if (method === 'GET' && !p[0]) {
      const games = await allGames(env);
      return json({
        standard: STANDARD_FILES,
        games: await docsOverview(env, games),
      });
    }

    const gameId = p[0];
    if (!isSafeGameId(gameId)) return json({ error: '잘못된 게임 id' }, 400);

    // ── GET /api/docs/{game} — 파일 목록
    if (method === 'GET' && !p[1]) {
      const games = (await allGames(env)).filter(g => g.id === gameId);
      if (!games.length) return json({ error: '없는 게임' }, 404);
      const [row] = await docsOverview(env, games);
      return json(row);
    }

    // ── GET /api/docs/{game}/zip — 게임 전체 zip
    if (method === 'GET' && p[1] === 'zip' && !p[2]) {
      const names = new Set((DOCS_MANIFEST[gameId]?.files || []).map(f => f.name));
      const r = await env.DB.prepare(`SELECT filename FROM game_docs WHERE game_id=?`).bind(gameId).all();
      for (const row of (r.results || [])) names.add(row.filename);
      if (!names.size) return json({ error: '이 게임에는 제작 MD가 없습니다' }, 404);

      const enc = new TextEncoder();
      const entries = [];
      for (const name of [...names].sort()) {
        const doc = await readDoc(env, request, gameId, name);
        if (!doc) continue;
        entries.push({ name: `${gameId}/docs/${name}`, data: enc.encode(doc.content) });
      }
      if (!entries.length) return json({ error: '읽을 수 있는 MD가 없습니다' }, 404);

      const zip = makeZip(entries);
      return new Response(zip, {
        headers: {
          'content-type': 'application/zip',
          'content-disposition': `attachment; filename="${gameId}-docs.zip"`,
          'cache-control': 'no-store',
        },
      });
    }

    const file = p[1];
    if (!isSafeFile(file)) return json({ error: '잘못된 파일명 (영문/숫자 .md 만)' }, 400);

    // ── GET /api/docs/{game}/{file}/history — 변경 이력
    if (method === 'GET' && p[2] === 'history') {
      const r = await env.DB.prepare(
        `SELECT id, bytes, saved_at, note FROM game_docs_history
          WHERE game_id=? AND filename=? ORDER BY saved_at DESC LIMIT 50`
      ).bind(gameId, file).all();
      return json({ history: r.results || [] });
    }

    // ── POST /api/docs/{game}/{file}/applied — 게임 반영 완료 표시
    if (method === 'POST' && p[2] === 'applied') {
      const row = await readDbDoc(env, gameId, file);
      if (!row) return json({ error: '수정본이 없습니다' }, 404);
      await env.DB.prepare(`UPDATE game_docs SET applied=1 WHERE game_id=? AND filename=?`)
        .bind(gameId, file).run();
      return json({ ok: true, applied: true });
    }

    // ── POST /api/docs/{game}/{file}/revert — 수정본 폐기 (레포 원본으로)
    if (method === 'POST' && p[2] === 'revert') {
      const repo = await readRepoDoc(env, request, gameId, file);
      if (repo == null) return json({ error: '레포에 원본이 없어 되돌릴 수 없습니다' }, 409);
      await env.DB.prepare(`DELETE FROM game_docs WHERE game_id=? AND filename=?`)
        .bind(gameId, file).run();
      return json({ ok: true, reverted: true });
    }

    // ── PUT /api/docs/{game}/{file} — 수정본 업로드(덮어쓰기)
    if (method === 'PUT' && !p[2]) {
      const content = await request.text();
      if (!content || !content.trim()) return json({ error: '내용이 비어 있습니다' }, 400);
      const bytes = new TextEncoder().encode(content).length;
      if (bytes > MAX_BYTES) return json({ error: `파일이 너무 큽니다 (${Math.round(bytes / 1024)}KB / 상한 512KB)` }, 413);

      const note = url.searchParams.get('note') || null;

      // 덮어쓰기 전 상태를 이력에 남긴다 (지시서 #05 §C — 변경 이력)
      const prev = await readDbDoc(env, gameId, file);
      const prevContent = prev ? prev.content : await readRepoDoc(env, request, gameId, file);
      if (prevContent != null) {
        await env.DB.prepare(
          `INSERT INTO game_docs_history (id, game_id, filename, content, bytes, note)
           VALUES (?,?,?,?,?,?)`
        ).bind(
          'dh-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
          gameId, file, prevContent, new TextEncoder().encode(prevContent).length,
          prev ? '수정본 덮어쓰기 전' : '레포 원본 (최초 수정 전)'
        ).run();
      }

      await env.DB.prepare(
        `INSERT INTO game_docs (game_id, filename, content, bytes, updated_at, applied, note)
         VALUES (?,?,?,?,datetime('now'),0,?)
         ON CONFLICT(game_id, filename) DO UPDATE SET
           content=excluded.content, bytes=excluded.bytes,
           updated_at=datetime('now'), applied=0, note=excluded.note`
      ).bind(gameId, file, content, bytes, note).run();

      return json({ ok: true, bytes, pending: true, message: 'MD는 저장됐지만 게임에는 아직 미반영입니다.' });
    }

    // ── GET /api/docs/{game}/{file} — 원문 열람 / 단건 다운로드
    if (method === 'GET' && !p[2]) {
      const doc = await readDoc(env, request, gameId, file);
      if (!doc) return json({ error: '파일이 없습니다' }, 404);

      if (url.searchParams.get('dl')) {
        return new Response(doc.content, {
          headers: {
            'content-type': 'text/markdown; charset=utf-8',
            'content-disposition': `attachment; filename="${gameId}_${file}"`,
            'cache-control': 'no-store',
          },
        });
      }
      return json({
        game: gameId, file, source: doc.source, updatedAt: doc.updatedAt,
        pending: doc.source === 'db' && !doc.applied,
        bytes: new TextEncoder().encode(doc.content).length,
        content: doc.content,
      });
    }

    return json({ error: '알 수 없는 경로' }, 404);
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
}
