// ============================================================
// /games/* 게임 본문 직접 접근 차단
// · 관리자 세션 → 게임 본문 전부 통과 (비공개 게임 미리보기 포함, 토큰 소모 없음)
// · 구매자 → 공개(published) + 유효 세션일 때만 통과
// · 비공개(draft) 게임은 구매자에게 존재 자체를 숨긴다(404)
//
// ⚠️ Cloudflare Pages는 /games/x.html 을 /games/x 로 바꾸는 308을 자동으로 건다.
// ".html로 끝나는 경로"만 검사하면 확장자 없는 경로로 게이트가 통째로 우회된다
// (2026-07-15 실측 사고) → 자산 확장자만 통과시키고 나머지는 전부 검사한다.
//
// 🔒 제작 MD(/games/{id}/docs/*) — 정답이 전부 들어 있다.
//    관리자 포함 **누구도** 정적 경로로는 읽을 수 없다. 무조건 404.
//    열람은 오직 /api/docs/* (관리자 세션 필수)를 통해서만.
//    지시서 #05 · 실행보고 §1-4 사고(확장자 없는 경로 우회) 재발 방지.
// ============================================================
import { slugFromPath, baseSlug, validSession, getGame } from '../_lib/gate.js';
import { validAdmin } from '../_lib/admin.js';

// 게임 본문이 아닌 정적 자산 — 게이트 대상 아님
const ASSET = /\.(js|css|png|jpe?g|gif|svg|webp|avif|ico|mp3|mp4|wav|ogg|webm|woff2?|ttf|otf|json|map|txt)$/i;

// 제작 문서 경로 — 정적 서빙 전면 금지 (확장자 유무·대소문자 무관)
const DOCS = /^\/games\/[^/]+\/docs(\/|$)/i;

const pass = async (next) => {
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('cache-control', 'no-store'); // 게이트 뒤 콘텐츠는 캐시 금지
  return out;
};

const notFound = () => new Response(
  '<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">존재하지 않는 게임입니다.</body>',
  { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

// %2e%2e, %2F 같은 인코딩 우회를 막기 위해 디코딩한 경로로 검사한다.
function safePath(pathname) {
  let p = pathname;
  for (let i = 0; i < 3; i++) {
    let d;
    try { d = decodeURIComponent(p); } catch (e) { break; }
    if (d === p) break;
    p = d;
  }
  return p.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = safePath(url.pathname);

  // ── 0) 제작 MD는 무조건 차단. 관리자도 예외 없음. (검사 순서 최우선)
  if (DOCS.test(path)) return notFound();

  if (ASSET.test(path)) return next();

  const raw = slugFromPath(path);
  // /games/ 아래인데 게임 파일도 자산도 아닌 경로 → 존재를 알리지 않는다.
  if (!raw) return notFound();

  // 관리자는 프리패스 (비공개 게임·정답 페이지 포함)
  if (await validAdmin(env, request)) return pass(next);

  const slug = baseSlug(raw); // dawn-444-answers → dawn-444
  const game = await getGame(env, slug);
  if (!game || game.status !== 'published') return notFound(); // 비공개는 구매자에게 없는 게임

  if (await validSession(env, slug, request)) return pass(next);

  return Response.redirect(new URL('/play/' + slug, url).toString(), 302);
}
