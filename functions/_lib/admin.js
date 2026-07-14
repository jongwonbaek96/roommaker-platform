// ============================================================
// 관리자 인증 (비밀번호 1개 + 세션 쿠키)
//
// 비밀번호는 코드에 없다. Cloudflare Pages 시크릿으로만 들어온다.
//   · 권장: ADMIN_PW_HASH = "스킴$솔트$해시"  (sha256$<salt>$<hex>)
//   · 임시: ADMIN_PW      = 평문 (해시 미설정 시 폴백. 되도록 해시로 옮길 것)
// 비교는 항상 timing-safe.
//
// 해시 만드는 법(브라우저 콘솔 아무 데서나):
//   const salt=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('');
//   const h=[...new Uint8Array(await crypto.subtle.digest('SHA-256',
//       new TextEncoder().encode(salt+':'+'여기에비밀번호')))].map(b=>b.toString(16).padStart(2,'0')).join('');
//   console.log('sha256$'+salt+'$'+h);
//
// 계정 테이블은 두지 않지만, admin_sessions에 note 컬럼이 있어
// 나중에 계정제로 확장할 때 사용자 식별자를 넣을 수 있다.
// ============================================================

export const ADMIN_COOKIE = 'rm_admin';
export const ADMIN_DAYS = 30;

export function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function randKey(bytes = 24) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// 타이밍 공격 방지용 상수시간 비교
function safeEqual(a, b) {
  const x = new TextEncoder().encode(String(a));
  const y = new TextEncoder().encode(String(b));
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// 비밀번호 검증. 해시(ADMIN_PW_HASH)가 있으면 그걸 쓰고, 없으면 평문(ADMIN_PW) 폴백.
async function checkPassword(env, password) {
  const stored = env.ADMIN_PW_HASH;
  if (stored) {
    const [scheme, salt, digest] = String(stored).split('$');
    if (scheme !== 'sha256' || !salt || !digest) return { error: '서버의 비밀번호 해시 형식이 잘못됐습니다. (sha256$솔트$해시)' };
    const calc = await sha256Hex(salt + ':' + password);
    return safeEqual(calc, digest) ? { ok: true } : { ok: false };
  }
  if (env.ADMIN_PW) return safeEqual(password, env.ADMIN_PW) ? { ok: true } : { ok: false };
  return { error: '서버에 관리자 비밀번호가 설정되어 있지 않습니다. (Pages 시크릿 ADMIN_PW_HASH)' };
}

// 로그인된 관리자인지 확인. 유효하면 세션 row, 아니면 null.
export async function validAdmin(env, request) {
  if (!env.DB) return null;
  const key = readCookie(request, ADMIN_COOKIE);
  if (!key) return null;
  return await env.DB.prepare(
    `SELECT id FROM admin_sessions WHERE session_key = ? AND expires_at > datetime('now')`
  ).bind(key).first();
}

// 비밀번호 검증 → 관리자 세션 발급
export async function loginAdmin(env, password) {
  if (!password) return { error: '비밀번호를 입력해 주세요.' };

  const r = await checkPassword(env, password);
  if (r.error) return { error: r.error };
  if (!r.ok) {
    await new Promise(res => setTimeout(res, 600)); // 무차별 대입 완화
    return { error: '비밀번호가 올바르지 않습니다.' };
  }

  const sessionKey = randKey();
  await env.DB.prepare(
    `INSERT INTO admin_sessions (id, session_key, expires_at)
     VALUES (?, ?, datetime('now', '+${ADMIN_DAYS} days'))`
  ).bind('adm-' + Date.now().toString(36) + '-' + randKey(3), sessionKey).run();

  await env.DB.prepare(`DELETE FROM admin_sessions WHERE expires_at <= datetime('now')`).run();
  return { sessionKey };
}

export async function logoutAdmin(env, request) {
  const key = readCookie(request, ADMIN_COOKIE);
  if (key && env.DB) await env.DB.prepare(`DELETE FROM admin_sessions WHERE session_key = ?`).bind(key).run();
}

export const adminCookie = (sessionKey) =>
  `${ADMIN_COOKIE}=${sessionKey}; Path=/; Max-Age=${ADMIN_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;

export const clearAdminCookie = () =>
  `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
