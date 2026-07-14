// ============================================================
// /admin/* 보호 — 로그인 안 했으면 /admin/login 으로 보낸다.
// (로그인·로그아웃 경로 자체는 통과)
// ============================================================
import { validAdmin } from '../_lib/admin.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const p = url.pathname.replace(/\/$/, '');

  if (p === '/admin/login' || p === '/admin/logout') return next();

  if (await validAdmin(env, request)) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('cache-control', 'no-store'); // 관리 화면은 캐시 금지
    return out;
  }

  return Response.redirect(new URL('/admin/login', url).toString(), 302);
}
