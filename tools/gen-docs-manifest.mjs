// ============================================================
// games/{id}/docs/*.md 를 스캔해 functions/_lib/docs-manifest.js 를 만든다.
//
// 왜 필요한가: Cloudflare Pages Functions는 디렉터리를 나열할 수 없다.
// 어떤 게임에 어떤 MD가 있는지는 배포 시점에 **코드로 굳혀** 넣어야 한다.
// (manifest는 functions/ 안에 있으므로 정적 서빙되지 않는다 = 유출 없음)
//
// MD를 추가·삭제하면 반드시 다시 돌릴 것:
//   node tools/gen-docs-manifest.mjs
// ============================================================
import { readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAMES = path.join(ROOT, 'games');
const OUT = path.join(ROOT, 'functions', '_lib', 'docs-manifest.js');
const NOTES = path.join(ROOT, 'tools', 'docs-notes.json'); // 게임별 비고(선택, functions에만 반영 — 정적 서빙 안 됨)

const notes = existsSync(NOTES) ? JSON.parse(readFileSync(NOTES, 'utf8')) : {};

const manifest = {};
for (const entry of await readdir(GAMES, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'assets') continue;
  const docsDir = path.join(GAMES, entry.name, 'docs');
  if (!existsSync(docsDir)) continue;

  const files = [];
  for (const f of (await readdir(docsDir)).sort()) {
    if (!f.endsWith('.md')) continue;
    const s = await stat(path.join(docsDir, f));
    files.push({ name: f, bytes: s.size, mtime: s.mtime.toISOString().slice(0, 19).replace('T', ' ') });
  }
  if (!files.length) continue;
  manifest[entry.name] = { files, ...(notes[entry.name] ? { note: notes[entry.name] } : {}) };
}

const body = `// ⚠️ 자동 생성 파일 — 직접 고치지 말 것.
//    생성: node tools/gen-docs-manifest.mjs   (생성 시각: ${new Date().toISOString().slice(0, 19).replace('T', ' ')})
//    games/{id}/docs/*.md 목록 스냅샷. Functions는 디렉터리를 못 읽으므로 이 파일이 필요하다.
export const DOCS_MANIFEST = ${JSON.stringify(manifest, null, 2)};
`;
await writeFile(OUT, body, 'utf8');

const games = Object.keys(manifest);
const total = games.reduce((s, g) => s + manifest[g].files.length, 0);
console.log(`docs-manifest.js 생성 완료 — 게임 ${games.length}개 / MD ${total}개`);
for (const g of games) console.log(`  ${g}: ${manifest[g].files.map(f => f.name).join(', ')}`);
