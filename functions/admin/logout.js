// /admin/logout — 관리자 로그아웃 (세션 삭제 + 쿠키 제거)
import { logoutAdmin, clearAdminCookie } from '../_lib/admin.js';

async function bye({ env, request }) {
  await logoutAdmin(env, request);
  return new Response(null, {
    status: 303,
    headers: { location: '/admin/login', 'set-cookie': clearAdminCookie(), 'cache-control': 'no-store' },
  });
}

export const onRequestGet = bye;
export const onRequestPost = bye;
