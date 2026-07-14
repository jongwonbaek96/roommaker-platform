// ============================================================
// /api/* 보호 — 관리자 세션 쿠키가 없으면 전부 401.
// (게임 데이터·토큰 목록이 공개되면 게이트가 무의미해진다)
// ============================================================
import { validAdmin } from '../_lib/admin.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  if (request.method === 'OPTIONS') return next();

  if (await validAdmin(env, request)) return next();

  return new Response(JSON.stringify({ error: '로그인이 필요합니다', login: '/admin/login' }), {
    status: 401,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
