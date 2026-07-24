-- ============================================================
-- 막차: 내리실 역은 없습니다 (last-train) — D1 games 행 등록/공개
--
-- 왜 필요한가: 플랫폼의 목록·상세(/g)·플레이(/play)는 모두 D1 games 테이블이 정본이다.
-- registry.json 은 더 이상 쓰이지 않는다. last-train 은 D1 에 행이 없어서
-- "플랫폼에서 시작이 안 되는" 상태였다. 이 SQL 한 번으로 등록 + 공개된다.
--
-- 실행 방법(둘 중 하나):
--  A) Cloudflare 대시보드 → Workers & Pages → D1 → (해당 DB) → Console 에
--     아래 INSERT 문을 붙여넣고 실행.
--  B) 로컬에서 wrangler:
--       wrangler d1 execute <DB_NAME> --remote --file=sql/seed-last-train.sql
--     (DB_NAME 은 Pages 프로젝트의 D1 바인딩에 연결된 데이터베이스 이름)
--
-- 게임 본문 파일은 games/last-train.html (이미 레포에 있음). meta.file 로 지정.
-- 이미 행이 있으면 공개 상태·메타만 갱신한다(ON CONFLICT).
-- ============================================================
INSERT INTO games (id, slug, title, subtitle, genre, emoji, accent_color, bg_color, difficulty, description, engine, status, sort_order, meta)
VALUES (
  'last-train',
  'last-train',
  '막차: 내리실 역은 없습니다',
  '심야 시리즈 #2 · 서환선 7788편성 막차',
  '공포',
  '🚇',
  '#FF9F1C',
  '#0B0E14',
  4,
  '막차에 올랐다. 그런데 내려야 할 역이 오지 않는다. 1996년 명원터널 사고, 그리고 그 승객 — 서환선 7788편성 막차에서 벌어지는 실시간 공포 방탈출. 미션 25 + 퀴즈 10, 총 35문제.',
  'html',
  'published',
  1,
  '{"file":"games/last-train.html","puzzles":35,"time":"60분+","players":"1인"}'
)
ON CONFLICT(id) DO UPDATE SET
  status       = 'published',
  title        = excluded.title,
  subtitle     = excluded.subtitle,
  genre        = excluded.genre,
  emoji        = excluded.emoji,
  accent_color = excluded.accent_color,
  bg_color     = excluded.bg_color,
  description  = excluded.description,
  engine       = excluded.engine,
  meta         = excluded.meta,
  updated_at   = datetime('now');
