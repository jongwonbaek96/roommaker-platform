// ============================================================
// /play/{game} — 구매자 접속 게이트
//   GET  : 세션 있으면 게임으로, 없으면 코드 입력 화면
//   POST : 코드 검증 → 1회성 폐기(used) → 7일 세션 쿠키 발급 → 게임으로
// 실패는 항상 명확한 메시지로 끝난다 (무한 로딩 금지)
// ============================================================
import { GAMES, validSession, redeemToken, sessionCookie } from '../_lib/gate.js';

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
  <div class="help">코드가 없거나 접속이 안 되면 구매하신 판매처로 문의해 주세요.</div>
</div>
<script>
  var f=document.getElementById('f'), b=document.getElementById('b');
  f.addEventListener('submit', function(){ b.disabled=true; b.textContent='확인 중…';
    // 응답이 늦거나 실패해도 버튼이 영영 잠기지 않게 되돌린다
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

export async function onRequestGet(context) {
  const { params, env, request } = context;
  const slug = params.game;
  const game = GAMES[slug];
  if (!game) return notFound();

  if (env.DB && await validSession(env, slug, request)) {
    return Response.redirect(new URL('/' + game.file, request.url).toString(), 302);
  }
  return html(page(slug, game, null));
}

export async function onRequestPost(context) {
  const { params, env, request } = context;
  const slug = params.game;
  const game = GAMES[slug];
  if (!game) return notFound();

  if (!env.DB) return html(page(slug, game, '서버 설정 오류입니다(DB 연결 없음). 판매처로 문의해 주세요.'), 500);

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
    // 어떤 예외가 나도 화면은 반드시 결론을 보여준다
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
