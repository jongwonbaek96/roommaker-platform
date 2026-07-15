# 빛이 먼저 왔다 — 배포 · 자산 경로

> 게임 id: `light-first` · SF 스릴러 · 퍼즐 14개 · 등재 2026-06-29

---

## 1. 파일

| 항목 | 값 |
|---|---|
| 게임 본문 | `games/light-first.html` (단일 파일 자체완결형) |
| 제작 MD | `games/light-first/docs/*.md` — **관리자 전용, 정적 접근 차단됨** |
| registry | `registry.json` → id `light-first` |
| 자산 | 외부 이미지·오디오 없음 (CSS/SVG/이모지로 자체 렌더) |

## 2. 표시 설정 (registry.json)

```json
{
  "id": "light-first",
  "title": "빛이 먼저 왔다",
  "subtitle": "LUMOS-7 달 기지",
  "genre": "SF 스릴러",
  "file": "games/light-first.html",
  "status": "완성",
  "puzzles": 14,
  "accent": "#00c8ff",
  "bg": "#050a14",
  "emoji": "🛰️"
}
```

## 3. 접속 게이트

- 구매자는 `/play/light-first` 에서 **토큰(RM-XXXX-XXXX)** 입력 → 세션 쿠키(7일) → `/games/light-first.html` 접근 허용.
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

- 이 폴더의 MD에는 **정답이 전부** 들어 있다. `/games/light-first/docs/*` 는 미들웨어와 함수 라우트 **양쪽에서 404**로 막혀 있어 어떤 경로로도 정적 서빙되지 않는다.
- 열람은 관리자 화면 `/admin/docs` (내부적으로 `/api/docs/*`) 로만.
