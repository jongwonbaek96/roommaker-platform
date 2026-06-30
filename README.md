# 룸메이커 방탈출 플랫폼

방탈출 게임을 한곳에 모아 관리하는 웹앱(PWA) + 자동 배포 구조.

## 폴더 구조

```
룸메이커_플랫폼/
├── index.html            관리 대시보드 (핸드폰 PWA)
├── registry.json         게임 목록·상태 (이게 "등재 명단")
├── manifest.webmanifest  PWA 설정 (홈화면 추가용)
├── sw.js                 오프라인 캐싱
├── vercel.json           배포 설정
├── icons/                앱 아이콘
└── games/
    ├── light-first.html   빛이 먼저 왔다
    ├── magic-school.html  마법학교 졸업은 글렀어요
    └── your-letter.html   너의 편지를 아직 읽지 못했어
```

## 새 게임을 자동 등재하는 방법

게임 1개가 완성되면 **두 단계**만 하면 대시보드에 자동으로 뜬다.

1. 완성된 HTML을 `games/` 폴더에 넣는다. 파일명은 영문 슬러그 권장 (예: `secret-garden.html`).
2. `registry.json`의 `games` 배열에 항목 하나 추가:

```json
{
  "id": "secret-garden",
  "title": "비밀의 정원",
  "subtitle": "사라진 정원사",
  "genre": "미스터리",
  "file": "games/secret-garden.html",
  "status": "완성",
  "puzzles": 10,
  "accent": "#4caf50",
  "bg": "#0d1f12",
  "emoji": "🌿",
  "createdAt": "2026-07-01"
}
```

3. GitHub에 push → Vercel이 자동 빌드·배포 → 핸드폰 앱 새로고침하면 새 게임이 보인다.

> 앞으로 "방탈출 게임 만들어줘"라고 하면, 게임 제작 → `games/`에 저장 → `registry.json` 갱신 → 배포까지 한 번에 처리하도록 만들 수 있다.

## 핸드폰에 앱으로 설치 (PWA)

1. 배포된 주소를 핸드폰 브라우저로 연다.
2. **iPhone(Safari)**: 공유 → "홈 화면에 추가"
   **Android(Chrome)**: 메뉴(⋮) → "앱 설치" / "홈 화면에 추가"
3. 홈에 생긴 🗝️ 아이콘으로 전체화면 앱처럼 실행.

## 상태/메모 편집

대시보드의 "✎ 편집"에서 제목·상태·메모 수정 가능. 현재는 **해당 기기에만 저장**(localStorage)된다.
모든 기기에서 공유되는 편집은 백엔드(또는 GitHub API 자동 커밋) 연결이 필요 — 다음 단계 작업.

## 로컬에서 미리 보기

```bash
cd 룸메이커_플랫폼
python3 -m http.server 8099
# 브라우저에서 http://localhost:8099
```
