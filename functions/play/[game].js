// ============================================================
// /play/{game} — 구매자 접속 게이트 (판매 링크)
//   GET  : 관리자면 바로 게임 / 세션 있으면 바로 게임 / 없으면 코드 입력 화면
//   POST : 코드 검증 → 1회성 폐기(used) → 7일 세션 쿠키 → 게임
// 실패는 항상 명확한 메시지로 끝난다 (무한 로딩 금지)
// 비공개(draft) 게임은 구매자에게 404 — 관리자만 미리보기 가능.
// ============================================================
import { validSession, redeemToken, sessionCookie, getGame } from '../_lib/gate.js';
import { validAdmin } from '../_lib/admin.js';

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

function page(slug, game, error) {
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(game.title)} — 입장 코드</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:24px;
    background:#0b0b10;color:#eaeaf0;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}
  .card{width:100%;max-width:380px;text-align:center}
  .emoji{font-size:44px;margin-bottom:14px}
  h1{font-size:20px;margin:0 0 6px;font-weight:700}
  p.sub{margin:0 0 26px;color:#8f8fa3;font-size:13px;line-height:1.6}
  input{width:100%;padding:16px;font-size:19px;text-align:center;letter-spacing:2px;text-transform:uppercase;
    border:1px solid #2c2c3a;border-radius:12px;background:#14141c;color:#fff;outline:none}
  input:focus{border-color:#7c5cff}
  button{width:100%;margin-top:12px;padding:16px;font-size:16px;font-weight:700;border:0;border-radius:12px;
    background:#7c5cff;color:#fff;cursor:pointer}
  button:disabled{opacity:.5;cursor:default}
  .err{margin-top:16px;padding:12px 14px;border-radius:10px;background:#2a1216;border:1px solid #5c2530;
    color:#ff9aa8;font-size:13px;line-height:1.6;text-align:left}
  .help{margin-top:22px;color:#5b5b6e;font-size:12px;line-height:1.7}
  .help a{color:#5b5b6e}
</style></head><body>
<div class="card">
  <div class="emoji">🔐</div>
  <h1>${esc(game.title)}</h1>
  <p class="sub">구매 후 카카오톡으로 받은 <b>입장 코드</b>를 입력해 주세요.<br>코드는 한 번만 입력하면 되고, 이후 7일간 이 기기에서는 바로 입장됩니다.</p>
  <form method="POST" action="/play/${esc(slug)}" id="f">
    <input name="token" id="t" placeholder="RM-XXXX-XXXX" autocomplete="off"
           autocapitalize="characters" spellcheck="false" required>
    <button type="submit" id="b">입장하기</button>
  </form>
  ${error ? `<div class="err">${esc(error)}</div>` : ''}
  <div class="help">코드가 없거나 접속이 안 되면 구매하신 판매처로 문의해 주세요.<br><a href="/g/${esc(slug)}">← 게임 소개로</a></div>
</div>
<script>
  var f=document.getElementById('f'), b=document.getElementById('b');
  f.addEventListener('submit', function(){ b.disabled=true; b.textContent='확인 중…';
    setTimeout(function(){ b.disabled=false; b.textContent='입장하기'; }, 8000);
  });
  document.getElementById('t').focus();
</script>
</body></html>`;
}

const html = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...headers } });

const notFound = () =>
  html('<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">존재하지 않는 게임입니다.</body>', 404);

// 구매자에게 보여도 되는 게임인지 (관리자면 비공개도 OK)
async function resolve(context) {
  const { params, env, request } = context;
  const slug = params.game;
  const game = await getGame(env, slug);
  if (!game) return { notFound: true };
  const isAdmin = !!(await validAdmin(env, request));
  if (game.status !== 'published' && !isAdmin) return { notFound: true }; // 비공개 은닉
  return { slug, game, isAdmin };
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.DB) return html('<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">서버 설정 오류입니다(DB 연결 없음).</body>', 500);

  const r = await resolve(context);
  if (r.notFound) return notFound();
  const { slug, game, isAdmin } = r;

  // 관리자는 입장 코드 없이 바로 (토큰 소모 없음)
  if (isAdmin) return Response.redirect(new URL('/' + game.file, request.url).toString(), 302);

  if (await validSession(env, slug, request)) {
    return Response.redirect(new URL('/' + game.file, request.url).toString(), 302);
  }
  return html(page(slug, game, null));
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return html('<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">서버 설정 오류입니다(DB 연결 없음). 판매처로 문의해 주세요.</body>', 500);

  const r = await resolve(context);
  if (r.notFound) return notFound();
  const { slug, game } = r;

  let token = '';
  try {
    const form = await request.formData();
    token = form.get('token') || '';
  } catch (e) {
    return html(page(slug, game, '코드를 다시 입력해 주세요.'), 400);
  }

  let result;
  try {
    result = await redeemToken(env, slug, token);
  } catch (e) {
    return html(page(slug, game, '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'), 500);
  }

  if (result.error) return html(page(slug, game, result.error), 200);

  return new Response(null, {
    status: 303,
    headers: {
      location: '/' + game.file,
      'set-cookie': sessionCookie(slug, result.sessionKey),
      'cache-control': 'no-store',
    },
  });
}
