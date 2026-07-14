// GET /public/games — 구매자용 공개 게임 목록 (인증 불필요, 공개된 것만)
import { publicGames } from '../_lib/gate.js';

export async function onRequestGet({ env }) {
  const games = await publicGames(env);
  return new Response(JSON.stringify({ games }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
