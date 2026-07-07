-- ============================================================
-- 룸메이커 플랫폼 · Supabase 초기 설정
-- 사용법: Supabase 대시보드 → SQL Editor → New query → 아래 전체 붙여넣고 RUN
-- ============================================================

-- 1) 게임 테이블
create table if not exists public.games (
  id          text primary key,
  title       text not null,
  subtitle    text,
  genre       text,
  file        text not null,
  status      text default '완성',
  puzzles     int  default 0,
  accent      text default '#6c8cff',
  bg          text default '#0a0e1a',
  emoji       text default '🎮',
  memo        text default '',
  sort        int  default 0,
  created_at  date default current_date,
  updated_at  timestamptz default now()
);

-- 2) 수정 시각 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_games_touch on public.games;
create trigger trg_games_touch before update on public.games
for each row execute function public.touch_updated_at();

-- 3) 기존 게임 3종 시드 (이미 있으면 갱신)
insert into public.games (id,title,subtitle,genre,file,status,puzzles,accent,bg,emoji,sort,created_at) values
('light-first','빛이 먼저 왔다','LUMOS-7 달 기지','SF 스릴러','games/light-first.html','완성',14,'#00c8ff','#050a14','🛰️',1,'2026-06-29'),
('magic-school','마법학교 졸업은 글렀어요','졸업시험 최후의 밤','판타지','games/magic-school.html','완성',0,'#ffd700','#0d0520','🎓',2,'2026-06-26'),
('your-letter','너의 편지를 아직 읽지 못했어','리마스터드','감성 미스터리','games/your-letter.html','완성',0,'#e8637a','#fff8f5','💌',3,'2026-06-27')
on conflict (id) do update set
  title=excluded.title, subtitle=excluded.subtitle, genre=excluded.genre,
  file=excluded.file, status=excluded.status, puzzles=excluded.puzzles,
  accent=excluded.accent, bg=excluded.bg, emoji=excluded.emoji, sort=excluded.sort;

-- 4) 보안(RLS): 읽기는 누구나, 쓰기는 로그인한 사용자만
alter table public.games enable row level security;

drop policy if exists "read all" on public.games;
create policy "read all" on public.games
  for select using (true);

drop policy if exists "write authenticated" on public.games;
create policy "write authenticated" on public.games
  for all to authenticated using (true) with check (true);

-- 5) 실시간 동기화 활성화 (수정이 모든 기기에 즉시 반영)
alter publication supabase_realtime add table public.games;

-- 완료. 이제 Authentication → Users 에서 본인 계정 1개만 만들면 됩니다.
