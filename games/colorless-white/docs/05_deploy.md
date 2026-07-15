# 색깔없는세상 : 왱? — 배포 · 자산 경로

> 게임 id: `colorless-white` · 잔혹동화 방탈출 · 퍼즐 30개 · 등재 2026-07-08

---

## 1. 파일

| 항목 | 값 |
|---|---|
| 게임 본문 | `games/colorless-white.html` + 공용 엔진(`colorless-core*.js`, `colorless-style.css`) |
| 제작 MD | `games/colorless-white/docs/*.md` — **관리자 전용, 정적 접근 차단됨** |
| registry | `registry.json` → id `colorless-white` |
| 자산 | ⚠️ 이미지 자산 미제작. 공용 엔진 `colorless-core.js`(구버전) + `colorless-style.css`. |

## 2. 표시 설정 (registry.json)

```json
{
  "id": "colorless-white",
  "title": "색깔없는세상 : 왱?",
  "subtitle": "하양의 그림일기 — 에피소드 5/5",
  "genre": "잔혹동화 방탈출",
  "file": "games/colorless-white.html",
  "status": "완성",
  "puzzles": 30,
  "accent": "#f0efe9",
  "bg": "#101012",
  "emoji": "🤍"
}
```

## 3. 접속 게이트

- 구매자는 `/play/colorless-white` 에서 **토큰(RM-XXXX-XXXX)** 입력 → 세션 쿠키(7일) → `/games/colorless-white.html` 접근 허용.
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

- 이 폴더의 MD에는 **정답이 전부** 들어 있다. `/games/colorless-white/docs/*` 는 미들웨어와 함수 라우트 **양쪽에서 404**로 막혀 있어 어떤 경로로도 정적 서빙되지 않는다.
- 열람은 관리자 화면 `/admin/docs` (내부적으로 `/api/docs/*`) 로만.
