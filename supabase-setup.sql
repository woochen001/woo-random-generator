-- Run this in Supabase Dashboard > SQL Editor.
-- Creates a word table and a server-side random-word function.
create table if not exists public.words (
  word text primary key
);

alter table public.words enable row level security;

-- Allow anonymous visitors to read/search words, but not insert/update/delete them.
drop policy if exists "Public can read words" on public.words;
create policy "Public can read words" on public.words
  for select to anon, authenticated using (true);

create or replace function public.random_word()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select word from public.words order by random() limit 1;
$$;

grant select on public.words to anon, authenticated;
grant execute on function public.random_word() to anon, authenticated;
