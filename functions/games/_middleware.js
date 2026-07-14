// ============================================================
// /games/* 게임 본문 직접 접근 차단
// · 관리자 세션 → 전부 통과 (비공개 게임 미리보기 포함, 토큰 소모 없음)
// · 구매자 → 공개(published) + 유효 세션일 때만 통과
// · 비공개(draft) 게임은 구매자에게 존재 자체를 숨긴다(404)
//
// ⚠️ Cloudflare Pages는 /games/x.html 을 /games/x 로 바꾸는 308을 자동으로 건다.
// ".html로 끝나는 경로"만 검사하면 확장자 없는 경로로 게이트가 통째로 우회된다
// (2026-07-15 실측 사고) → 자산 확장자만 통과시키고 나머지는 전부 검사한다.
// ============================================================
import { slugFromPath, baseSlug, validSession, getGame } from '../_lib/gate.js';
import { validAdmin } from '../_lib/admin.js';

// 게임 본문이 아닌 정적 자산 — 게이트 대상 아님
const ASSET = /\.(js|css|png|jpe?g|gif|svg|webp|avif|ico|mp3|mp4|wav|ogg|webm|woff2?|ttf|otf|json|map|txt)$/i;

const pass = async (next) => {
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('cache-control', 'no-store'); // 게이트 뒤 콘텐츠는 캐시 금지
  return out;
};

const notFound = () => new Response(
  '<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">존재하지 않는 게임입니다.</body>',
  { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (ASSET.test(url.pathname)) return next();

  const raw = slugFromPath(url.pathname);
  if (!raw) return next(); // /games/ 아래 게임 파일이 아님

  // 관리자는 프리패스 (비공개 게임·정답 페이지 포함)
  if (await validAdmin(env, request)) return pass(next);

  const slug = baseSlug(raw); // dawn-444-answers → dawn-444
  const game = await getGame(env, slug);
  if (!game || game.status !== 'published') return notFound(); // 비공개는 구매자에게 없는 게임

  if (await validSession(env, slug, request)) return pass(next);

  return Response.redirect(new URL('/play/' + slug, url).toString(), 302);
}
