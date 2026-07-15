// ============================================================
// 제작 MD 공용 로직 (지시서 #05)
//
// 정본은 레포의 games/{game-id}/docs/*.md 다.
// 관리자가 /admin/docs에서 수정본을 올리면 D1(game_docs)에 **덮어쓰기 사본**으로
// 쌓이고, 그때부터 그 파일은 "레포보다 새로운 수정본이 있다 = 게임에 미반영"
// 상태가 된다. 게임 HTML 재생성은 이번 범위 밖(수동 흐름) — 지시서 #05 §C.
//
// ⚠️ MD에는 정답이 전부 들어 있다. 이 모듈을 쓰는 라우트는 반드시
//    /api/* 아래(= functions/api/_middleware.js 관리자 게이트 뒤)에 둘 것.
// ============================================================
import { DOCS_MANIFEST } from './docs-manifest.js';

// 표준 구조 — sugar-melts/docs 를 기준으로 삼는다 (지시서 #05 §3-A-1)
export const STANDARD_FILES = [
  { name: '01_story.md', label: '스토리 · 세계관 · 엔딩' },
  { name: '02_quiz.md', label: '문제 · 미션 · 정답 · 힌트' },
  { name: '03_image_bgm_guide.md', label: '이미지 프롬프트 · BGM · 연출' },
  { name: '04_meeting.md', label: '기획 의사결정 기록' },
  { name: '05_deploy.md', label: '배포 · 자산 경로' },
];
const STANDARD_NAMES = STANDARD_FILES.map(f => f.name);

const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SAFE_FILE = /^[a-z0-9][a-z0-9_.-]{0,63}\.md$/i;

export const isSafeGameId = (s) => SAFE_ID.test(String(s || ''));
export const isSafeFile = (s) => SAFE_FILE.test(String(s || '')) && !String(s).includes('..');

// ── D1 스키마 (없으면 만든다. sql/game_docs.sql 과 동일)
let ensured = false;
export async function ensureSchema(env) {
  if (ensured || !env.DB) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS game_docs (
      game_id    TEXT NOT NULL,
      filename   TEXT NOT NULL,
      content    TEXT NOT NULL,
      bytes      INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      applied    INTEGER NOT NULL DEFAULT 0,
      note       TEXT,
      PRIMARY KEY (game_id, filename)
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS game_docs_history (
      id       TEXT PRIMARY KEY,
      game_id  TEXT NOT NULL,
      filename TEXT NOT NULL,
      content  TEXT NOT NULL,
      bytes    INTEGER NOT NULL DEFAULT 0,
      saved_at TEXT NOT NULL DEFAULT (datetime('now')),
      note     TEXT
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_docs_hist ON game_docs_history(game_id, filename, saved_at DESC)`),
  ]);
  ensured = true;
}

// ── 레포 원본 읽기 ────────────────────────────────────────────
// env.ASSETS 는 정적 자산을 **함수 라우팅을 거치지 않고** 직접 읽는다.
// (그래서 /games/*/docs/* 를 404로 막아 놔도 여기서는 읽힌다)
export async function readRepoDoc(env, request, gameId, filename) {
  if (!env.ASSETS) return null;
  const url = new URL(`/games/${gameId}/docs/${filename}`, request.url);
  try {
    const res = await env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }));
    if (!res.ok) return null;
    const text = await res.text();
    // 404 HTML이 잘못 돌아온 경우 방어
    if (/^\s*<!doctype html/i.test(text) && !/^#/m.test(text)) return null;
    return text;
  } catch (e) {
    return null;
  }
}

// ── D1 수정본 읽기 ───────────────────────────────────────────
export async function readDbDoc(env, gameId, filename) {
  await ensureSchema(env);
  return await env.DB.prepare(
    `SELECT content, bytes, updated_at, applied FROM game_docs WHERE game_id=? AND filename=?`
  ).bind(gameId, filename).first();
}

// 실제로 보여줄 내용: D1 수정본이 있으면 그게 우선(그게 정본 후보), 없으면 레포 원본.
export async function readDoc(env, request, gameId, filename) {
  const db = await readDbDoc(env, gameId, filename);
  if (db) return { content: db.content, source: 'db', updatedAt: db.updated_at, applied: !!db.applied };
  const repo = await readRepoDoc(env, request, gameId, filename);
  if (repo == null) return null;
  return { content: repo, source: 'repo', updatedAt: manifestMeta(gameId, filename)?.mtime || null, applied: true };
}

function manifestMeta(gameId, filename) {
  const g = DOCS_MANIFEST[gameId];
  if (!g) return null;
  return g.files.find(f => f.name === filename) || null;
}

// ── 게임별 MD 현황 ───────────────────────────────────────────
// registry(D1 games) 목록 위에 manifest(레포) + game_docs(수정본)를 얹는다.
export async function docsOverview(env, games) {
  await ensureSchema(env);
  const r = await env.DB.prepare(
    `SELECT game_id, filename, bytes, updated_at, applied FROM game_docs`
  ).all();
  const overrides = {};
  for (const row of (r.results || [])) {
    (overrides[row.game_id] ||= {})[row.filename] = row;
  }

  return games.map(g => {
    const man = DOCS_MANIFEST[g.id];
    const ov = overrides[g.id] || {};
    const names = new Set([...(man ? man.files.map(f => f.name) : []), ...Object.keys(ov)]);

    const files = [...names].sort().map(name => {
      const m = man && man.files.find(f => f.name === name);
      const o = ov[name];
      return {
        name,
        label: (STANDARD_FILES.find(s => s.name === name) || {}).label || '',
        bytes: o ? o.bytes : (m ? m.bytes : 0),
        updatedAt: o ? o.updated_at : (m ? m.mtime : null),
        source: o ? 'db' : 'repo',
        pending: o ? !o.applied : false,   // 수정됐으나 게임에 미반영
        inRepo: !!m,
      };
    });

    const missing = STANDARD_NAMES.filter(n => !names.has(n));
    const pendingCount = files.filter(f => f.pending).length;

    return {
      id: g.id,
      title: g.title,
      emoji: g.emoji,
      status: g.status,
      fileCount: files.length,
      missing,                                   // 표준 5종 중 없는 것
      hasDocs: files.length > 0,
      pendingCount,                              // 미반영 수정본 개수
      note: (man && man.note) || null,           // 예: "v4 기준, 게임 미반영"
      files,
    };
  });
}

// ── ZIP (무압축 store) — 라이브러리 없이 Worker에서 생성 ────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// entries: [{ name, data: Uint8Array }]
export function makeZip(entries) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  const u16 = (n) => new Uint8Array([n & 0xFF, (n >>> 8) & 0xFF]);
  const u32 = (n) => new Uint8Array([n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]);
  const cat = (...arrs) => {
    const len = arrs.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(len);
    let p = 0;
    for (const a of arrs) { out.set(a, p); p += a.length; }
    return out;
  };

  for (const e of entries) {
    const nameBytes = enc.encode(e.name);
    const crc = crc32(e.data);
    const local = cat(
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), // 0x0800 = UTF-8 파일명
      u32(crc), u32(e.data.length), u32(e.data.length),
      u16(nameBytes.length), u16(0), nameBytes
    );
    chunks.push(local, e.data);
    central.push(cat(
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
      u32(crc), u32(e.data.length), u32(e.data.length),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(offset), nameBytes
    ));
    offset += local.length + e.data.length;
  }

  const centralBlob = cat(...central);
  const end = cat(
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralBlob.length), u32(offset), u16(0)
  );
  return cat(...chunks, centralBlob, end);
}
