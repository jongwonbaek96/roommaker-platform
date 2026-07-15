# 설탕은 녹는다 — 배포 · 자산 경로

> 게임 id: `sugar-melts` · 동화 재해석 미스터리 스릴러 · 퍼즐 33개 · 등재 2026-07-13

---

## 1. 파일

| 항목 | 값 |
|---|---|
| 게임 본문 | `games/sugar-melts.html` (단일 파일 자체완결형) |
| 제작 MD | `games/sugar-melts/docs/*.md` — **관리자 전용, 정적 접근 차단됨** |
| registry | `registry.json` → id `sugar-melts` |
| 자산 | 외부 이미지 자산 있음 → `docs/03_assets_urls.md` 참고. 오디오: Web Audio(코드 내장). |

## 2. 표시 설정 (registry.json)

```json
{
  "id": "sugar-melts",
  "title": "설탕은 녹는다",
  "subtitle": "헨젤과 그레텔 검증 보고서",
  "genre": "동화 재해석 미스터리 스릴러",
  "file": "games/sugar-melts.html",
  "status": "완성",
  "puzzles": 33,
  "accent": "#E8B04B",
  "bg": "#232220",
  "emoji": "🍬"
}
```

## 3. 접속 게이트

- 구매자는 `/play/sugar-melts` 에서 **토큰(RM-XXXX-XXXX)** 입력 → 세션 쿠키(7일) → `/games/sugar-melts.html` 접근 허용.
- 관리자는 세션 쿠키만으로 프리패스(토큰 소모 없음).
- 게임 공개/비공개는 D1 `games.status` (`published` / `draft`) — 관리자 대시보드에서 토글.
- 토큰 발급: 관리자 → 🎟 토큰 발급 탭.

## 4. 배포 절차

```
# 1) MD를 추가·삭제했다면 매니페스트 재생성
node tools/gen-docs-manifest.mjs

# 2) 커밋 + 푸시 (사용자 PC에서만 가능)
./publish.ps1 "message in ascii"
```

- GitHub `jongwonbaek96/roommaker-platform` → **Cloudflare Pages 자동배포** (https://roommaker-platform.pages.dev)
- Vercel(`roommaker-platform.vercel.app`)은 현재 Pages로 **301 리다이렉트**만 한다 (`vercel.json`).

## 5. 주의

- 이 폴더의 MD에는 **정답이 전부** 들어 있다. `/games/sugar-melts/docs/*` 는 미들웨어와 함수 라우트 **양쪽에서 404**로 막혀 있어 어떤 경로로도 정적 서빙되지 않는다.
- 열람은 관리자 화면 `/admin/docs` (내부적으로 `/api/docs/*`) 로만.
