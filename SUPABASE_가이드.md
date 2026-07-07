# 어디서나 공유 편집 — Supabase 설정 가이드

이 단계를 마치면 폰·PC·Claude 어디서 고쳐도 모든 기기의 앱에 즉시 반영됩니다. 전부 무료 범위.

## 1. Supabase 프로젝트 만들기 (5분)

1. https://supabase.com 접속 → **Start your project** → GitHub 계정으로 로그인
2. **New project** 클릭
   - Name: `roommaker` (아무거나)
   - Database Password: 적당히 정하고 **메모해두기**
   - Region: `Northeast Asia (Seoul)` 권장
3. 생성까지 1~2분 대기

## 2. 테이블 만들기 (SQL 실행)

1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. 같은 폴더의 `supabase-setup.sql` 내용을 전부 복사해 붙여넣기
3. 오른쪽 아래 **Run** 클릭 → "Success" 뜨면 완료 (게임 3종 자동 입력됨)

## 3. 내 로그인 계정 1개 만들기

1. 왼쪽 메뉴 **Authentication** → **Users** → **Add user** → **Create new user**
2. 본인 이메일/비밀번호 입력 → **Auto Confirm User** 체크 → 생성
   (이 이메일/비밀번호로 앱에서 로그인하게 됩니다)

## 4. 연결 값 두 개 복사

1. 왼쪽 메뉴 **Project Settings**(톱니) → **API**
2. 두 가지를 복사:
   - **Project URL** (예: `https://abcdxyz.supabase.co`)
   - **anon public** key (`eyJ...`로 시작하는 긴 문자열)
3. 이 두 값을 **저(Claude)에게 알려주시면** `config.js`에 넣어드립니다.
   (anon key는 공개돼도 안전합니다 — RLS 보안으로 보호됨)

## 5. 배포

`config.js`가 채워지면 폴더에서:
```
./publish.ps1 "Supabase 연동"
```
→ 1~2분 뒤 앱에서 우측 상단 **로그인** → 편집하면 모든 기기에 즉시 반영됩니다.

---

설정 전에도 앱은 정상 작동합니다(읽기 전용). 설정을 마치는 순간 공유 편집이 켜집니다.
