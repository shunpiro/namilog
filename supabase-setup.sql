-- ===== 波ログ：Supabaseの準備（SQL Editorに全部貼って「Run」を1回押すだけ）=====
-- 何をしているか：
--   1. 記録を入れる表（sessions）とプロフィールの表（profile）を作る
--   2. 「ログインした本人の行だけ」読み書きできるルール（RLS）をかける
--   3. 写真・動画の置き場（media）を作り、自分のフォルダだけ触れるようにする

-- 1) セッションの記録：1回の海 = 1行。中身は data（JSON）にまとめて入れる
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sessions_user_date on public.sessions (user_id, date desc);

-- 2) プロフィール：1人1行
create table if not exists public.profile (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3) 本人だけ読み書きできるルール
alter table public.sessions enable row level security;
alter table public.profile enable row level security;

drop policy if exists "own sessions" on public.sessions;
create policy "own sessions" on public.sessions
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own profile" on public.profile;
create policy "own profile" on public.profile
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) 写真・動画の置き場（非公開・1ファイル50MBまで）
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', false, 52428800)
on conflict (id) do nothing;

-- ファイルは「media/自分のID/ファイル名」に置く。自分のIDのフォルダだけ触れる
drop policy if exists "own media read" on storage.objects;
drop policy if exists "own media write" on storage.objects;
drop policy if exists "own media update" on storage.objects;
drop policy if exists "own media delete" on storage.objects;
create policy "own media read" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own media write" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own media update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own media delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
