import "server-only";
import postgres from "postgres";

/*
 * Postgres connection (Neon, Supabase, Vercel Postgres or any Postgres 13+), set through DATABASE_URL.
 * Tables are created on first use, so a fresh database needs no migration step.
 */

const SCHEMA = /* sql */ `
create table if not exists companies (
  id text primary key,
  name text not null,
  industry text not null default '',
  invite_code text not null unique,
  min_group int not null default 5 check (min_group >= 5),
  retention_months int not null default 24,
  checkin_day int not null default 1 check (checkin_day between 1 and 5),
  reminder boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists teams (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create table if not exists users (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  team_id text references teams(id) on delete set null,
  role text not null check (role in ('hr', 'employee')),
  name text not null,
  email text not null unique,
  password_hash text not null,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists sessions (
  token_hash text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists reset_tokens (
  token_hash text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists daily_logs (
  user_id text not null references users(id) on delete cascade,
  day date not null,
  mood smallint not null check (mood between 1 and 5),
  sleep real not null check (sleep between 0 and 16),
  primary key (user_id, day)
);
create table if not exists checkins (
  user_id text not null references users(id) on delete cascade,
  week date not null,
  company_id text not null references companies(id) on delete cascade,
  team_id text references teams(id) on delete set null,
  answers jsonb not null,
  cause_area text,
  causes text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (user_id, week)
);
create index if not exists checkins_company_week on checkins (company_id, week);
create table if not exists checkin_opens (
  user_id text not null references users(id) on delete cascade,
  week date not null,
  primary key (user_id, week)
);
create table if not exists exercise_logs (
  user_id text not null references users(id) on delete cascade,
  day date not null,
  exercise text not null,
  primary key (user_id, day, exercise)
);
create table if not exists partners (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  name text not null,
  focus text not null default '',
  schedule text not null default '',
  contact text not null,
  created_at timestamptz not null default now()
);
create table if not exists referrals (
  company_id text not null references companies(id) on delete cascade,
  user_id text references users(id) on delete set null,
  month text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists referrals_once on referrals (company_id, user_id, month);
create table if not exists notes (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  team_id text not null references teams(id) on delete cascade,
  area text,
  type text not null check (type in ('dilakukan', 'rencana', 'pantau')),
  text text not null,
  by_name text not null,
  created_at timestamptz not null default now()
);
`;

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __sql?: Sql; __schema?: Promise<void> };

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

export class NoDatabaseError extends Error {
  constructor() { super("DATABASE_URL belum diatur"); }
}

/** The shared client, with the schema in place. */
export async function db(): Promise<Sql> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new NoDatabaseError();
  if (!g.__sql) {
    const local = /localhost|127\.0\.0\.1/.test(url);
    g.__sql = postgres(url, { ssl: local ? false : "require", max: 5, idle_timeout: 20, onnotice: () => {} });
  }
  const sql = g.__sql;
  g.__schema ??= sql.unsafe(SCHEMA).then(() => undefined).catch((e) => { g.__schema = undefined; throw e; });
  await g.__schema;
  return sql;
}
