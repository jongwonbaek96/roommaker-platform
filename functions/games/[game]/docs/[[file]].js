// ============================================================
// 🔒 /games/{id}/docs/** — 2차 하드 게이트
//
// _middleware.js에서 이미 막지만, 미들웨어가 빠지거나 _routes.json이
// 잘못 바뀌어도 정답이 새지 않도록 **함수 라우트 자체로 한 번 더** 막는다.
// Pages는 함수 라우트를 정적 파일보다 먼저 잡으므로, 이 파일이 있는 한
// /games/*/docs/* 는 어떤 경로·확장자·대소문자로도 정적 서빙되지 않는다.
//
// 관리자 열람은 /api/docs/* 로만 (env.ASSETS 로 우회 없이 직접 읽는다).
// ============================================================
export const onRequest = () => new Response(
  '<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">존재하지 않는 페이지입니다.</body>',
  { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }
);
