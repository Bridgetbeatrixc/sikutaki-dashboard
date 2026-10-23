-- Sikutaki database for Supabase.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste this file > Run.
-- Safe to run again: everything is created with "if not exists" or "create or replace".
--
-- Privacy rules kept by the database itself (row level security):
--   * An employee's mood notes, check-ins and app state are readable only by that employee.
--   * HR never reads single answers. HR gets counts and averages through company_summary(),
--     and averages only for groups of at least the company's minimum size (5 by default).
--   * Counseling requests reach HR without the employee's account id.

create extension if not exists pgcrypto;

-- ---------- Tables ----------

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  industry text not null default '',
  invite_code text not null unique,
  -- checkinDay, reminder, energySection, minGroup, retentionMonths, teamNames, partners, contacts
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  role text not null check (role in ('hr', 'employee')),
  name text not null default '',
  email text not null default '',
  team_id text,
  created_at timestamptz not null default now()
);
create index if not exists profiles_company_idx on public.profiles (company_id);

-- HR-only data of a company (action notes per division).
create table if not exists public.company_hr (
  company_id uuid primary key references public.companies (id) on delete cascade,
  notes jsonb not null default '[]'::jsonb
);

-- Daily mood (1-5) and hours of sleep.
create table if not exists public.daily_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  team_id text,
  day date not null,
  mood smallint not null check (mood between 1 and 5),
  sleep numeric(3, 1) not null check (sleep between 0 and 16),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
create index if not exists daily_logs_company_day_idx on public.daily_logs (company_id, day);

-- Weekly check-in: answers 0-4 per area, plus the causes picked for the follow-up area.
create table if not exists public.checkins (
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  team_id text,
  week_start date not null,
  answers jsonb not null,
  cause_area text,
  causes text[] not null default '{}',
  submitted_at timestamptz not null default now(),
  primary key (user_id, week_start)
);
create index if not exists checkins_company_week_idx on public.checkins (company_id, week_start);

-- The rest of the employee app (onboarding, practices done, programs, energy choice, finished programs).
create table if not exists public.employee_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Requests to HR to arrange a counseling session, with the short thread between employee and HR.
create table if not exists public.counseling_requests (
  id text primary key,
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists counseling_company_idx on public.counseling_requests (company_id, updated_at desc);

-- ---------- Helpers ----------

create or replace function public.my_company() returns uuid
language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_hr() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'hr')
$$;

create or replace function public.new_invite_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  abc constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(abc, 1 + floor(random() * length(abc))::int, 1);
    end loop;
    exit when not exists (select 1 from public.companies where invite_code = code);
  end loop;
  return code;
end $$;

-- ---------- Sign-up: create the company (HR) or join one (employee) ----------
-- The sign-up form sends role, name and either the company or the invite code as user metadata.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  cid uuid;
begin
  if meta->>'role' = 'hr' then
    insert into public.companies (name, industry, invite_code)
    values (left(coalesce(nullif(trim(meta->>'company'), ''), 'Perusahaan saya'), 120), left(coalesce(meta->>'industry', ''), 60), public.new_invite_code())
    returning id into cid;
    insert into public.company_hr (company_id) values (cid);
    insert into public.profiles (id, company_id, role, name, email)
    values (new.id, cid, 'hr', left(coalesce(meta->>'name', ''), 80), coalesce(new.email, ''));
  elsif meta->>'role' = 'employee' then
    select id into cid from public.companies where invite_code = upper(trim(coalesce(meta->>'invite_code', '')));
    if cid is null then
      raise exception 'Kode undangan tidak ditemukan';
    end if;
    insert into public.profiles (id, company_id, role, name, email, team_id)
    values (new.id, cid, 'employee', left(coalesce(meta->>'name', ''), 80), coalesce(new.email, ''), nullif(meta->>'team', ''));
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row level security ----------

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.company_hr enable row level security;
alter table public.daily_logs enable row level security;
alter table public.checkins enable row level security;
alter table public.employee_state enable row level security;
alter table public.counseling_requests enable row level security;

drop policy if exists "members read their company" on public.companies;
create policy "members read their company" on public.companies
  for select to authenticated using (id = public.my_company());
drop policy if exists "hr updates the company" on public.companies;
create policy "hr updates the company" on public.companies
  for update to authenticated using (id = public.my_company() and public.is_hr()) with check (id = public.my_company());

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Only the name and division can be changed from the app, never the role or the company.
revoke update on public.profiles from anon, authenticated;
grant update (name, team_id) on public.profiles to authenticated;

drop policy if exists "hr only" on public.company_hr;
create policy "hr only" on public.company_hr
  for all to authenticated using (company_id = public.my_company() and public.is_hr()) with check (company_id = public.my_company() and public.is_hr());

drop policy if exists "own daily logs" on public.daily_logs;
create policy "own daily logs" on public.daily_logs
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and company_id = public.my_company());

drop policy if exists "own checkins" on public.checkins;
create policy "own checkins" on public.checkins
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and company_id = public.my_company());

drop policy if exists "own app state" on public.employee_state;
create policy "own app state" on public.employee_state
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own counseling requests" on public.counseling_requests;
create policy "own counseling requests" on public.counseling_requests
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and company_id = public.my_company());

-- ---------- Functions the app calls ----------

-- Join page: the company's name and division names for an invite code (works before signing in).
create or replace function public.company_by_invite(code text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('name', name, 'teamNames', coalesce(settings->'teamNames', '{}'::jsonb))
  from public.companies where invite_code = upper(trim(code))
$$;

create or replace function public.regenerate_invite() returns text
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not public.is_hr() then raise exception 'Hanya HR'; end if;
  code := public.new_invite_code();
  update public.companies set invite_code = code where id = public.my_company();
  return code;
end $$;

-- An employee contacted a partner: HR sees one more contact this month, never who.
create or replace function public.record_referral(kind text, month text) returns void
language plpgsql security definer set search_path = public as $$
declare
  cid uuid := public.my_company();
  c jsonb;
begin
  if cid is null or kind not in ('psikolog', 'komplementer') or month !~ '^\d{4}-\d{2}$' then return; end if;
  select coalesce(settings->'contacts', '{}'::jsonb) into c from public.companies where id = cid;
  if c->>'month' is distinct from month then
    c := jsonb_build_object('month', month, 'psikolog', 0, 'komplementer', 0);
  end if;
  c := jsonb_set(c, array[kind], to_jsonb(coalesce((c->>kind)::int, 0) + 1));
  update public.companies set settings = jsonb_set(settings, '{contacts}', c) where id = cid;
end $$;

-- An employee reported a complementary practitioner: hidden until HR reviews it. The reporter is not stored.
create or replace function public.report_partner(partner_id text) returns void
language sql security definer set search_path = public as $$
  update public.companies
  set settings = jsonb_set(settings, '{partners}', coalesce((
    select jsonb_agg(case when p->>'id' = partner_id
      then p || jsonb_build_object('suspended', true, 'reports', coalesce((p->>'reports')::int, 0) + 1)
      else p end)
    from jsonb_array_elements(coalesce(settings->'partners', '[]'::jsonb)) p), '[]'::jsonb))
  where id = public.my_company()
$$;

-- HR reads counseling requests without the employee's account id.
create or replace function public.hr_counseling_requests() returns setof jsonb
language sql stable security definer set search_path = public as $$
  select payload from public.counseling_requests
  where public.is_hr() and company_id = public.my_company()
  order by updated_at desc
$$;

create or replace function public.hr_save_counseling(req_id text, req jsonb) returns void
language sql security definer set search_path = public as $$
  update public.counseling_requests set payload = req, updated_at = now()
  where id = req_id and public.is_hr() and company_id = public.my_company()
$$;

-- Real numbers for the HR dashboard. Averages only when enough people answered.
create or replace function public.company_summary(week date) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  cid uuid := public.my_company();
  min_group int;
  loggers int;
begin
  if not public.is_hr() then return null; end if;
  select greatest(5, coalesce((settings->>'minGroup')::int, 5)) into min_group from public.companies where id = cid;
  select count(distinct user_id) into loggers from public.daily_logs where company_id = cid and day >= week and day < week + 7;
  return json_build_object(
    'employees', (select count(*) from public.profiles where company_id = cid and role = 'employee'),
    'checkins', (select count(*) from public.checkins where company_id = cid and week_start = week),
    'loggers', loggers,
    'minGroup', min_group,
    'avgMood', case when loggers >= min_group then
      (select round(avg(mood)::numeric, 2) from public.daily_logs where company_id = cid and day >= week and day < week + 7) end,
    'avgSleep', case when loggers >= min_group then
      (select round(avg(sleep)::numeric, 1) from public.daily_logs where company_id = cid and day >= week and day < week + 7) end
  );
end $$;

-- An employee deletes their account and everything stored for it.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.is_hr() then raise exception 'Akun HR dihapus lewat tim Sikutaki'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- Internal helpers are not callable from the app.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.new_invite_code() from public, anon, authenticated;
