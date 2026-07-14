// ============================================================
// /g/{game} — 구매자용 게임 상세 (공개)
// 설명·인원·소요시간·플레이 방법 + [플레이하기] 버튼 하나.
// 편집·정답·토큰발급 UI는 이 응답 HTML에 아예 존재하지 않는다.
// 비공개(draft) 게임은 404 (관리자만 열람 가능).
// ============================================================
import { getGame } from '../_lib/gate.js';
import { validAdmin } from '../_lib/admin.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const html = (body, status = 200) =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

const notFound = () => html(`<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>없는 게임</title></head>
<body style="margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;background:#0a0e1a;color:#8a96b3;font-family:'Malgun Gothic',sans-serif">
<div style="text-align:center"><div style="font-size:40px">🗝️</div><p>존재하지 않는 게임입니다.</p>
<a href="/" style="color:#6c8cff">← 게임 목록으로</a></div></body></html>`, 404);

export async function onRequestGet(context) {
  const { params, env, request } = context;
  if (!env.DB) return html('<body>서버 설정 오류(DB 연결 없음)</body>', 500);

  const game = await getGame(env, params.game);
  if (!game) return notFound();

  const isAdmin = !!(await validAdmin(env, request));
  if (game.status !== 'published' && !isAdmin) return notFound();

  const m = game.meta || {};
  const accent = game.accent_color || '#6c8cff';
  const chips = [
    game.genre ? `<span class="tag">${esc(game.genre)}</span>` : '',
    m.puzzles ? `<span class="tag">퍼즐 ${esc(m.puzzles)}문제</span>` : '',
    m.time ? `<span class="tag">${esc(m.time)}</span>` : '',
    m.players ? `<span class="tag">${esc(m.players)}</span>` : '',
  ].join('');

  return html(`<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0a0e1a">
<title>${esc(game.title)} — 룸메이커</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:radial-gradient(1200px 600px at 50% -10%,#172044 0%,#0a0e1a 60%);color:#e6ecf7;
    font-family:'Pretendard','Malgun Gothic',-apple-system,sans-serif;min-height:100svh;padding:24px 16px 60px}
  .wrap{max-width:560px;margin:0 auto}
  .back{display:inline-block;color:#8a96b3;text-decoration:none;font-size:.85rem;margin-bottom:20px}
  .cover{height:150px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:64px;
    background:linear-gradient(135deg,${esc(accent)}44,${esc(accent)}0d);border:1px solid #26314f}
  h1{font-size:1.5rem;font-weight:800;margin:20px 0 6px;letter-spacing:-.01em}
  .sub{color:#8a96b3;font-size:.9rem}
  .tags{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0}
  .tag{font-size:.72rem;color:${esc(accent)};background:${esc(accent)}1f;border:1px solid ${esc(accent)}44;
    padding:5px 10px;border-radius:9px}
  .desc{background:#131a2e;border:1px solid #26314f;border-radius:14px;padding:16px;
    font-size:.9rem;line-height:1.7;color:#c3cde3;white-space:pre-wrap;margin-bottom:16px}
  h2{font-size:.85rem;color:#8a96b3;margin:22px 0 8px;font-weight:700}
  ol{margin-left:18px;font-size:.85rem;line-height:1.9;color:#aeb9d6}
  .play{display:block;width:100%;margin-top:26px;padding:17px;border:0;border-radius:14px;text-align:center;
    background:linear-gradient(135deg,#6c8cff,#a06bff);color:#fff;font-size:1rem;font-weight:800;
    text-decoration:none;cursor:pointer}
  .note{margin-top:14px;color:#5f6b88;font-size:.75rem;line-height:1.7;text-align:center}
  .adm{margin-top:18px;padding:10px 12px;border-radius:10px;background:rgba(255,176,32,.12);
    border:1px solid rgba(255,176,32,.35);color:#ffce6b;font-size:.75rem;text-align:center}
</style></head>
<body><div class="wrap">
  <a class="back" href="/">← 게임 목록</a>
  <div class="cover">${esc(game.emoji || '🎮')}</div>
  <h1>${esc(game.title)}</h1>
  ${game.subtitle ? `<div class="sub">${esc(game.subtitle)}</div>` : ''}
  <div class="tags">${chips}</div>
  ${game.description ? `<div class="desc">${esc(game.description)}</div>` : ''}
  <h2>플레이 방법</h2>
  <ol>
    <li>구매 후 카카오톡으로 <b>입장 코드</b>를 받습니다.</li>
    <li>아래 [플레이하기]를 누르고 코드를 입력합니다.</li>
    <li>코드는 처음 한 번만 — 이후 7일간 같은 기기에서 바로 이어서 할 수 있습니다.</li>
    <li>코드는 1인 1회용이라 다른 분과 공유하면 접속이 막힙니다.</li>
  </ol>
  <a class="play" href="/play/${esc(game.id)}">▶ 플레이하기</a>
  <div class="note">입장 코드가 필요합니다. 아직 구매 전이라면 스마트스토어에서 구매해 주세요.</div>
  ${game.status !== 'published' ? '<div class="adm">비공개(draft) 게임입니다 — 관리자에게만 보입니다.</div>' : ''}
</div></body></html>`);
}
