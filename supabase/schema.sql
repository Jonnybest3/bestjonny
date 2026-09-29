-- Earn3X initial database schema for Supabase/Postgres.
-- Run this in Supabase SQL Editor after creating your project.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('worker','client','admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.task_status as enum ('draft','published','paused','completed','cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.submission_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.withdrawal_status as enum ('pending','approved','rejected','paid');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone text,
  role public.user_role not null default 'worker',
  plan_slug text,
  plan_activated_at timestamptz,
  wallet_balance numeric(18,2) not null default 0,
  client_approved boolean not null default false,
  withdrawals_this_week integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  reward numeric(18,2) not null check (reward > 0),
  slots integer not null check (slots > 0),
  status public.task_status not null default 'draft',
  funded_amount numeric(18,2) not null default 0,
  platform_fee_percent numeric(5,2) not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  proof text not null,
  status public.submission_status not null default 'pending',
  reward_amount numeric(18,2) not null default 0,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18,2) not null check (amount >= 2000 and amount <= 300000000),
  fee numeric(18,2) not null default 100,
  net_amount numeric(18,2) generated always as (amount - fee) stored,
  bank_name text not null,
  account_number text not null,
  account_name text,
  status public.withdrawal_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('deposit','task_reward','platform_fee','withdrawal','refund','adjustment')),
  amount numeric(18,2) not null,
  reference text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists submissions_worker_idx on public.submissions(worker_id);
create index if not exists withdrawals_user_idx on public.withdrawals(user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, first_name, last_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name',''),
    coalesce(new.raw_user_meta_data->>'last_name',''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone',''),
    case when (new.raw_user_meta_data->>'role') = 'client' then 'client'::public.user_role else 'worker'::public.user_role end
  ) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.submissions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.ledger enable row level security;

-- Profiles: users can see/update their own profile; admins can see/update all.
create policy profiles_select on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());

-- Published tasks are visible to authenticated workers. Clients see their own tasks; admins see all.
create policy tasks_select on public.tasks for select using (
  public.is_admin() or client_id=auth.uid() or status='published'
);
create policy tasks_insert_client on public.tasks for insert with check (
  client_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='client' and p.client_approved=true)
);
create policy tasks_update_owner_admin on public.tasks for update using (client_id=auth.uid() or public.is_admin()) with check (client_id=auth.uid() or public.is_admin());

-- Submissions: workers manage their own; task clients/admins can review.
create policy submissions_select on public.submissions for select using (
  worker_id=auth.uid() or public.is_admin() or exists(select 1 from public.tasks t where t.id=task_id and t.client_id=auth.uid())
);
create policy submissions_insert on public.submissions for insert with check (worker_id=auth.uid());
create policy submissions_update_review on public.submissions for update using (
  public.is_admin() or exists(select 1 from public.tasks t where t.id=task_id and t.client_id=auth.uid())
);

-- Withdrawals: workers insert/view their own; admins review.
create policy withdrawals_select on public.withdrawals for select using (user_id=auth.uid() or public.is_admin());
create policy withdrawals_insert on public.withdrawals for insert with check (user_id=auth.uid());
create policy withdrawals_update_admin on public.withdrawals for update using (public.is_admin()) with check (public.is_admin());

-- Ledger is private to the user and admin.
create policy ledger_select on public.ledger for select using (user_id=auth.uid() or public.is_admin());

-- IMPORTANT: payment webhooks and balance-changing operations must use server-side service credentials / verified provider signatures.
