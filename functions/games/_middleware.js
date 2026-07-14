// ============================================================
// /games/* 게임 본문 직접 접근 차단
// 세션 쿠키가 유효하면 통과(next()), 아니면 /play/{game} 로 보낸다.
//
// ⚠️ 중요: Cloudflare Pages는 /games/x.html 을 /games/x 로 바꾸는
// 308 리다이렉트를 자동으로 건다. 따라서 ".html로 끝나는 경로"만
// 검사하면 확장자 없는 경로로 게이트가 통째로 우회된다(실측 확인).
// → 자산 확장자(js/css/이미지 등)만 통과시키고 나머지는 전부 검사한다.
// ============================================================
import { slugForFile, validSession } from '../_lib/gate.js';

// 게임 본문이 아닌 정적 자산 — 게이트 대상 아님
const ASSET = /\.(js|css|png|jpe?g|gif|svg|webp|avif|ico|mp3|mp4|wav|ogg|webm|woff2?|ttf|otf|json|map|txt)$/i;

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (ASSET.test(url.pathname)) return next();

  const slug = slugForFile(url.pathname);
  if (!slug) return next(); // 등록되지 않은 경로는 게이트 대상 아님

  if (env.DB && await validSession(env, slug, request)) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('cache-control', 'no-store'); // 게이트 뒤 콘텐츠는 캐시 금지
    return out;
  }

  return Response.redirect(new URL('/play/' + slug, url).toString(), 302);
}
