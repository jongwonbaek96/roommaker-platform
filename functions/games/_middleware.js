// ============================================================
// /games/*.html 직접 접근 차단
// 세션 쿠키가 유효하면 통과(next()), 아니면 /play/{game} 로 보낸다.
// 이미지·JS·CSS 등 비-HTML 자산은 그대로 통과 (게임 본문이 아님).
// ============================================================
import { slugForFile, validSession } from '../_lib/gate.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (!url.pathname.endsWith('.html')) return next();

  const slug = slugForFile(url.pathname);
  if (!slug) return next(); // 등록되지 않은 파일은 게이트 대상 아님

  if (env.DB && await validSession(env, slug, request)) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('cache-control', 'no-store'); // 게이트 뒤 콘텐츠는 캐시 금지
    return out;
  }

  return Response.redirect(new URL('/play/' + slug, url).toString(), 302);
}
