// ============================================================
// /admin/login — 관리자 로그인 (비밀번호 1개)
//   GET  : 비밀번호 입력 화면 (이미 로그인돼 있으면 /admin 으로)
//   POST : 검증 → 관리자 세션 쿠키(30일) → /admin
// ============================================================
import { loginAdmin, validAdmin, adminCookie } from '../_lib/admin.js';

const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

function page(error) {
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>룸메이커 관리자</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:24px;
    background:#0d0d16;color:#e8e8f2;font-family:'Segoe UI','Apple SD Gothic Neo',sans-serif}
  .card{width:100%;max-width:360px;text-align:center}
  .emoji{font-size:42px;margin-bottom:12px}
  h1{font-size:19px;margin:0 0 6px}
  p.sub{margin:0 0 24px;color:#8a8aa8;font-size:12px}
  input{width:100%;padding:14px;font-size:16px;text-align:center;
    border:1px solid #2a2a45;border-radius:10px;background:#1d1d30;color:#fff;outline:none}
  input:focus{border-color:#7c5cff}
  button{width:100%;margin-top:10px;padding:14px;font-size:15px;font-weight:700;border:0;border-radius:10px;
    background:#7c5cff;color:#fff;cursor:pointer}
  .err{margin-top:14px;padding:11px 13px;border-radius:9px;background:#2a1216;border:1px solid #5c2530;
    color:#ff9aa8;font-size:12px;line-height:1.6;text-align:left}
  .back{margin-top:20px;display:block;color:#5b5b6e;font-size:12px;text-decoration:none}
</style></head><body>
<div class="card">
  <div class="emoji">🧩</div>
  <h1>룸메이커 관리자</h1>
  <p class="sub">게임 편집 · 토큰 발급</p>
  <form method="POST" action="/admin/login" id="f">
    <input name="pw" id="pw" type="password" placeholder="관리자 비밀번호" autocomplete="current-password" required>
    <button type="submit" id="b">로그인</button>
  </form>
  ${error ? `<div class="err">${esc(error)}</div>` : ''}
  <a class="back" href="/">← 게임 목록으로</a>
</div>
<script>
  var f=document.getElementById('f'), b=document.getElementById('b');
  f.addEventListener('submit',function(){ b.disabled=true; b.textContent='확인 중…';
    setTimeout(function(){ b.disabled=false; b.textContent='로그인'; },8000); });
  document.getElementById('pw').focus();
</script>
</body></html>`;
}

const html = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...headers } });

export async function onRequestGet({ env, request }) {
  if (await validAdmin(env, request)) return Response.redirect(new URL('/admin', request.url).toString(), 302);
  return html(page(null));
}

export async function onRequestPost({ env, request }) {
  let pw = '';
  try {
    const form = await request.formData();
    pw = form.get('pw') || '';
  } catch (e) {
    return html(page('입력을 읽지 못했습니다. 다시 시도해 주세요.'), 400);
  }

  let result;
  try {
    result = await loginAdmin(env, pw);
  } catch (e) {
    return html(page('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'), 500);
  }
  if (result.error) return html(page(result.error), 200);

  return new Response(null, {
    status: 303,
    headers: {
      location: '/admin',
      'set-cookie': adminCookie(result.sessionKey),
      'cache-control': 'no-store',
    },
  });
}
