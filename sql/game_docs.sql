-- ============================================================
-- 제작 MD 수정본 저장소 (지시서 #05 §C)
--
-- 정본 원본은 레포의 games/{id}/docs/*.md 다.
-- 관리자가 /admin/docs에서 올린 수정본만 여기에 쌓인다.
--   applied = 0  → "MD는 고쳤지만 게임에는 아직 미반영"  (관리자 목록에 경고 표시)
--   applied = 1  → 게임 재빌드로 반영 완료
--
-- 적용:  npx wrangler d1 execute <DB이름> --remote --file=sql/game_docs.sql
-- (functions/_lib/docs.js 의 ensureSchema()가 런타임에도 같은 걸 만든다)
-- ============================================================

CREATE TABLE IF NOT EXISTS game_docs (
  game_id    TEXT NOT NULL,
  filename   TEXT NOT NULL,
  content    TEXT NOT NULL,
  bytes      INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  applied    INTEGER NOT NULL DEFAULT 0,
  note       TEXT,
  PRIMARY KEY (game_id, filename)
);

CREATE TABLE IF NOT EXISTS game_docs_history (
  id       TEXT PRIMARY KEY,
  game_id  TEXT NOT NULL,
  filename TEXT NOT NULL,
  content  TEXT NOT NULL,
  bytes    INTEGER NOT NULL DEFAULT 0,
  saved_at TEXT NOT NULL DEFAULT (datetime('now')),
  note     TEXT
);

CREATE INDEX IF NOT EXISTS idx_docs_hist ON game_docs_history(game_id, filename, saved_at DESC);
