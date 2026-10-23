-- BrainQ Workforce (/brainq). Run in the SQL Editor after schema.sql; safe to run again.
-- Anonymous scan results per team. No person ids, no names, no safety (red flag) answers.
-- The tables are closed to the browser; three functions are the only way in, and the dashboard function
-- returns team numbers only when a team has at least min_group (default 8) results in a cycle.

create table if not exists public.bq_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  min_group int not null default 8,
  created_at timestamptz not null default now()
);

create table if not exists public.bq_teams (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bq_companies(id) on delete cascade,
  name text not null,
  headcount int not null check (headcount >= 0),
  sort int not null default 0,
  unique (company_id, name)
);

create table if not exists public.bq_responses (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.bq_companies(id) on delete cascade,
  team_id uuid not null references public.bq_teams(id) on delete cascade,
  cycle_date date not null,
  score int not null check (score between 0 and 100),
  health int not null check (health between 0 and 100),
  focus int not null check (focus between 0 and 100),
  memory int not null check (memory between 0 and 100),
  thinking int not null check (thinking between 0 and 100),
  growth int not null check (growth between 0 and 100),
  adaptability int not null check (adaptability between 0 and 100),
  fog_level text not null check (fog_level in ('Rendah','Sedang','Tinggi')),
  bottleneck text not null,
  readiness_demand int not null check (readiness_demand between 0 and 100),
  readiness_current int not null check (readiness_current between 0 and 100),
  created_at timestamptz not null default now()
);
create index if not exists bq_responses_team_cycle on public.bq_responses (team_id, cycle_date);
create index if not exists bq_responses_company_cycle on public.bq_responses (company_id, cycle_date);
create index if not exists bq_teams_company on public.bq_teams (company_id);

alter table public.bq_companies enable row level security;
alter table public.bq_teams enable row level security;
alter table public.bq_responses enable row level security;
revoke all on public.bq_companies, public.bq_teams, public.bq_responses from anon, authenticated;

-- Pulse cycles start on the 1st and the 15th of each month.
create or replace function public.bq_cycle_of(d date) returns date
language sql immutable set search_path = '' as $$
  select case when extract(day from d) >= 15 then date_trunc('month', d)::date + 14 else date_trunc('month', d)::date end
$$;

-- Company name and teams for the employee scan page.
create or replace function public.bq_company(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'name', c.name,
    'teams', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name) order by t.sort, t.name)
                       from public.bq_teams t where t.company_id = c.id), '[]'::jsonb))
  from public.bq_companies c where c.code = upper(trim(p_code))
$$;

-- Stores one anonymous result. Called by /api/brainq/submit after BrainQ has scored the answers.
create or replace function public.bq_submit(p_code text, p_team uuid, p jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare c public.bq_companies;
begin
  select * into c from public.bq_companies where code = upper(trim(p_code));
  if c.id is null then raise exception 'Kode perusahaan tidak dikenal'; end if;
  if not exists (select 1 from public.bq_teams where id = p_team and company_id = c.id) then
    raise exception 'Tim tidak dikenal';
  end if;
  insert into public.bq_responses (company_id, team_id, cycle_date, score, health, focus, memory, thinking, growth,
    adaptability, fog_level, bottleneck, readiness_demand, readiness_current)
  values (c.id, p_team, public.bq_cycle_of((now() at time zone 'Asia/Jakarta')::date),
    (p->>'score')::int, (p->>'health')::int, (p->>'focus')::int, (p->>'memory')::int, (p->>'thinking')::int,
    (p->>'growth')::int, (p->>'adaptability')::int, p->>'fog_level', left(p->>'bottleneck', 120),
    (p->>'readiness_demand')::int, (p->>'readiness_current')::int);
  return true;
end $$;

-- Everything the dashboard shows, aggregated. Teams below min_group in a cycle come back without numbers or counts.
create or replace function public.bq_dashboard(p_code text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare c public.bq_companies; result jsonb;
begin
  select * into c from public.bq_companies where code = upper(trim(p_code));
  if c.id is null then return null; end if;

  with r as (select * from public.bq_responses where company_id = c.id),
  team_bott as (
    select distinct on (team_id, cycle_date) team_id, cycle_date, bottleneck, n
    from (select team_id, cycle_date, bottleneck, count(*) as n from r group by 1, 2, 3) x
    order by team_id, cycle_date, n desc, bottleneck
  ),
  team_cycle as (
    select r.team_id, r.cycle_date, count(*) as n,
      round(avg(r.score))::int as score,
      round(100.0 * avg((r.fog_level = 'Tinggi')::int))::int as fog_high,
      round(avg(r.health))::int as health, round(avg(r.focus))::int as focus, round(avg(r.memory))::int as memory,
      round(avg(r.thinking))::int as thinking, round(avg(r.growth))::int as growth, round(avg(r.adaptability))::int as adaptability,
      round(avg(r.readiness_demand))::int as demand, round(avg(r.readiness_current))::int as readiness,
      max(b.bottleneck) as bottleneck,
      round(100.0 * max(b.n) / count(*))::int as bottleneck_share
    from r join team_bott b on b.team_id = r.team_id and b.cycle_date = r.cycle_date
    group by r.team_id, r.cycle_date
  ),
  co_cycle as (
    select cycle_date, count(*) as n,
      round(avg(score))::int as score,
      round(100.0 * avg((fog_level = 'Tinggi')::int))::int as fog_high,
      round(avg(health))::int as health, round(avg(focus))::int as focus, round(avg(memory))::int as memory,
      round(avg(thinking))::int as thinking, round(avg(growth))::int as growth, round(avg(adaptability))::int as adaptability,
      round(avg(readiness_demand))::int as demand, round(avg(readiness_current))::int as readiness
    from r group by cycle_date
  ),
  bott as (
    select cycle_date, jsonb_agg(jsonb_build_object('bottleneck', bottleneck, 'n', n) order by n desc) as items
    from (select cycle_date, bottleneck, count(*) as n from r group by cycle_date, bottleneck) x
    group by cycle_date
  )
  select jsonb_build_object(
    'company', c.name,
    'minGroup', c.min_group,
    'headcount', (select coalesce(sum(headcount), 0) from public.bq_teams where company_id = c.id),
    'teams', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'headcount', headcount) order by sort, name)
                       from public.bq_teams where company_id = c.id), '[]'::jsonb),
    'cycles', coalesce((select jsonb_agg(to_jsonb(co_cycle) || jsonb_build_object('bottlenecks', bott.items) order by co_cycle.cycle_date)
                        from co_cycle left join bott using (cycle_date)), '[]'::jsonb),
    'teamCycles', coalesce((select jsonb_agg(
        case when n >= c.min_group then to_jsonb(team_cycle)
             else jsonb_build_object('team_id', team_id, 'cycle_date', cycle_date, 'hidden', true) end
        order by cycle_date) from team_cycle), '[]'::jsonb)
  ) into result;
  return result;
end $$;

grant execute on function public.bq_company(text) to anon, authenticated;
grant execute on function public.bq_dashboard(text) to anon, authenticated;
grant execute on function public.bq_submit(text, uuid, jsonb) to anon, authenticated;

-- A company and its teams (example). Share /brainq/scan?kode=KODE with employees and open /brainq?kode=KODE as HR.
-- with c as (insert into public.bq_companies (name, code) values ('Nama Perusahaan', 'KODE') returning id)
-- insert into public.bq_teams (company_id, name, headcount, sort)
-- select c.id, t.name, t.hc, t.s from c, (values ('Sales', 30, 1), ('Finance', 12, 2)) t(name, hc, s);
