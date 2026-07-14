// ============================================================
// 관리자 인증 (비밀번호 1개 + 세션 쿠키)
//
// 비밀번호는 코드에 없다. Cloudflare Pages 시크릿 `ADMIN_PW` 로만 들어온다.
//   Pages → Settings → Variables and secrets → ADMIN_PW (type: Secret)
// D1 바인딩 이름: DB
// ============================================================

export const ADMIN_COOKIE = 'rm_admin';
export const ADMIN_DAYS = 30; // 관리자 세션 유지 기간

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
  if (!env.ADMIN_PW) return { error: '서버에 관리자 비밀번호가 설정되어 있지 않습니다. (Pages 시크릿 ADMIN_PW)' };
  if (!password) return { error: '비밀번호를 입력해 주세요.' };
  if (!safeEqual(password, env.ADMIN_PW)) {
    await new Promise(r => setTimeout(r, 600)); // 무차별 대입 완화
    return { error: '비밀번호가 올바르지 않습니다.' };
  }
  const sessionKey = randKey();
  await env.DB.prepare(
    `INSERT INTO admin_sessions (id, session_key, expires_at)
     VALUES (?, ?, datetime('now', '+${ADMIN_DAYS} days'))`
  ).bind('adm-' + Date.now().toString(36) + '-' + randKey(3), sessionKey).run();

  // 만료된 세션 청소
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
