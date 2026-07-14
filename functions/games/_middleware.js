// ============================================================
// /games/* 게임 본문 직접 접근 차단
// · 관리자로 로그인돼 있으면 토큰 없이 그냥 통과 (검수·테스트용)
// · 구매자는 세션 쿠키가 유효할 때만 통과, 아니면 /play/{game} 로
//
// ⚠️ Cloudflare Pages는 /games/x.html 을 /games/x 로 바꾸는 308을
// 자동으로 건다. ".html로 끝나는 경로"만 검사하면 확장자 없는 경로로
// 게이트가 통째로 우회된다(실측 확인) → 자산 확장자만 통과시킨다.
// ============================================================
import { slugForFile, validSession } from '../_lib/gate.js';
import { validAdmin } from '../_lib/admin.js';

// 게임 본문이 아닌 정적 자산 — 게이트 대상 아님
const ASSET = /\.(js|css|png|jpe?g|gif|svg|webp|avif|ico|mp3|mp4|wav|ogg|webm|woff2?|ttf|otf|json|map|txt)$/i;

const pass = async (next) => {
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('cache-control', 'no-store'); // 게이트 뒤 콘텐츠는 캐시 금지
  return out;
};

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (ASSET.test(url.pathname)) return next();

  const slug = slugForFile(url.pathname);
  if (!slug) return next(); // 등록되지 않은 경로는 게이트 대상 아님

  // 관리자는 프리패스
  if (await validAdmin(env, request)) return pass(next);

  if (env.DB && await validSession(env, slug, request)) return pass(next);

  return Response.redirect(new URL('/play/' + slug, url).toString(), 302);
}
