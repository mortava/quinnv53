-- Quinn AI Deal Desk — Supabase schema
-- Run this once in Supabase Studio → SQL editor → Run.
-- Project: vxoqwyntwsszipabhiuv

create extension if not exists pgcrypto;

-- ========== CHAT LOGS ==========
create table if not exists public.quinn_chat_logs (
  id           uuid primary key default gen_random_uuid(),
  session_id   text not null,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  attachments  jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists quinn_chat_logs_session_id_idx on public.quinn_chat_logs (session_id);
create index if not exists quinn_chat_logs_created_at_idx on public.quinn_chat_logs (created_at desc);

-- ========== PRICING LOGS ==========
create table if not exists public.quinn_pricing_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  scenario    jsonb not null,
  result      jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists quinn_pricing_logs_session_id_idx on public.quinn_pricing_logs (session_id);
create index if not exists quinn_pricing_logs_created_at_idx on public.quinn_pricing_logs (created_at desc);

-- ========== SEARCH LOGS ==========
create table if not exists public.quinn_search_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  query       text not null,
  doc_id      text,
  created_at  timestamptz not null default now()
);
create index if not exists quinn_search_logs_session_id_idx on public.quinn_search_logs (session_id);
create index if not exists quinn_search_logs_created_at_idx on public.quinn_search_logs (created_at desc);

-- ========== 3-DAY TTL ==========
-- Cron job that deletes rows older than 3 days. Runs every hour.
-- Requires the pg_cron extension; if your project doesn't have it, run the
-- DELETE manually or set up an external scheduled task.
create extension if not exists pg_cron;

select cron.schedule(
  'quinn_logs_retention',
  '0 * * * *',
  $$
    delete from public.quinn_chat_logs    where created_at < now() - interval '3 days';
    delete from public.quinn_pricing_logs where created_at < now() - interval '3 days';
    delete from public.quinn_search_logs  where created_at < now() - interval '3 days';
  $$
);

-- ========== RLS ==========
-- Anon can INSERT (so the browser logger works) and SELECT (so /admin can read).
-- The /admin panel is gated by a passcode at the UI layer (Winner26!).
-- For tighter security replace the SELECT policy with a service_role rule and
-- proxy admin reads through a Vercel function.
alter table public.quinn_chat_logs    enable row level security;
alter table public.quinn_pricing_logs enable row level security;
alter table public.quinn_search_logs  enable row level security;

drop policy if exists "anon insert chat"    on public.quinn_chat_logs;
drop policy if exists "anon select chat"    on public.quinn_chat_logs;
drop policy if exists "anon insert pricing" on public.quinn_pricing_logs;
drop policy if exists "anon select pricing" on public.quinn_pricing_logs;
drop policy if exists "anon insert search"  on public.quinn_search_logs;
drop policy if exists "anon select search"  on public.quinn_search_logs;

create policy "anon insert chat"    on public.quinn_chat_logs    for insert to anon with check (true);
create policy "anon select chat"    on public.quinn_chat_logs    for select to anon using (true);
create policy "anon insert pricing" on public.quinn_pricing_logs for insert to anon with check (true);
create policy "anon select pricing" on public.quinn_pricing_logs for select to anon using (true);
create policy "anon insert search"  on public.quinn_search_logs  for insert to anon with check (true);
create policy "anon select search"  on public.quinn_search_logs  for select to anon using (true);
