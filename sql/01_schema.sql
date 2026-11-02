-- ACIM Phase 1A. Run in Supabase SQL Editor as project administrator.
create extension if not exists pgcrypto;
create table if not exists public.acim_authorized_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.acim_associates (
  associate_id uuid primary key default gen_random_uuid(),
  first_name text not null check (length(btrim(first_name)) between 1 and 100),
  last_name text not null check (length(btrim(last_name)) between 1 and 100),
  employee_number text unique,
  active_flag boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_number_nonempty check (employee_number is null or length(btrim(employee_number)) > 0)
);
create index if not exists acim_associates_name_idx on public.acim_associates (last_name, first_name);
create table if not exists public.acim_clubs (
  club_id uuid primary key default gen_random_uuid(),
  associate_id uuid not null references public.acim_associates(associate_id) on delete restrict,
  club_type text not null check (club_type in ('Driver','Fairway','Hybrid','Iron','Wedge','Putter')),
  quantity integer not null default 1 check (quantity between 1 and 99),
  head_model text not null check (length(btrim(head_model)) > 0),
  loft_set_makeup text not null default '',
  shaft_model text not null default '',
  grip text not null default '',
  sort_order integer not null default 0,
  active_flag boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists acim_clubs_owner_idx on public.acim_clubs (associate_id, active_flag, club_type, sort_order);
create table if not exists public.acim_visits (
  visit_id uuid primary key default gen_random_uuid(),
  associate_id uuid not null references public.acim_associates(associate_id) on delete restrict,
  visit_date date not null,
  inventory_snapshot jsonb not null default '[]'::jsonb check (jsonb_typeof(inventory_snapshot) = 'array'),
  status text not null default 'Prepared' check (status in ('Prepared','CheckedIn','CheckedOut','Voided')),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists acim_visits_owner_idx on public.acim_visits(associate_id, visit_date desc);
create or replace function public.acim_touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists acim_associates_updated_at on public.acim_associates;
create trigger acim_associates_updated_at before update on public.acim_associates for each row execute function public.acim_touch_updated_at();
drop trigger if exists acim_clubs_updated_at on public.acim_clubs;
create trigger acim_clubs_updated_at before update on public.acim_clubs for each row execute function public.acim_touch_updated_at();
-- SECURITY DEFINER function avoids recursive RLS checks on allowlist.
create or replace function public.acim_is_authorized() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.acim_authorized_users u where u.user_id = (select auth.uid()) and u.enabled = true)
$$;
revoke all on function public.acim_is_authorized() from public;
grant execute on function public.acim_is_authorized() to authenticated;
alter table public.acim_authorized_users enable row level security;
alter table public.acim_associates enable row level security;
alter table public.acim_clubs enable row level security;
alter table public.acim_visits enable row level security;
-- No client-facing policy on allowlist: only administrators can modify it in SQL Editor.
drop policy if exists acim_associates_access on public.acim_associates;
create policy acim_associates_access on public.acim_associates for all to authenticated using ((select public.acim_is_authorized())) with check ((select public.acim_is_authorized()));
drop policy if exists acim_clubs_access on public.acim_clubs;
create policy acim_clubs_access on public.acim_clubs for all to authenticated using ((select public.acim_is_authorized())) with check ((select public.acim_is_authorized()));
drop policy if exists acim_visits_access on public.acim_visits;
create policy acim_visits_access on public.acim_visits for all to authenticated using ((select public.acim_is_authorized())) with check ((select public.acim_is_authorized()));
revoke all on public.acim_authorized_users from anon, authenticated;
revoke all on public.acim_associates, public.acim_clubs, public.acim_visits from anon;
grant select, insert, update, delete on public.acim_associates, public.acim_clubs, public.acim_visits to authenticated;
-- No seed associate is inserted automatically. See 02_setup.sql.
