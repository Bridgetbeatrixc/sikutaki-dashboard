import "server-only";
import { AREAS, answerLevel, answerScore, NOTE_TYPES, type NoteType } from "@/lib/catalog";
import type { Dataset, Note, WeekAgg } from "@/lib/model";
import { addDays, lastWeeks, monthKey, MONTHS, rotationIndex, shortDate, today, weekStart } from "@/lib/week";
import { db } from "./db";

/*
 * Builds the HR dataset for one company. Every number leaves this file as a group aggregate:
 * a group (a division, or the whole company) with fewer respondents than the company's minimum
 * gets no scores at all, only its headcount and response count.
 */

const WEEK_COUNT = 12;
const AREA_IDS = new Set(AREAS.map((a) => a.id));

type CheckinRow = { team_id: string | null; week: string; answers: Record<string, number>; cause_area: string | null; causes: string[] };
type DailyRow = { team_id: string | null; week: string; user_id: string; mood: number; sleep: number };

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

function aggregate(rows: CheckinRow[], daily: DailyRow[], size: number, minGroup: number): WeekAgg {
  const resp = rows.length;
  const users = new Set(daily.map((d) => d.user_id)).size;
  const dailyAgg = users >= minGroup ? {
    users,
    mood: daily.reduce((s, d) => s + d.mood, 0) / daily.length,
    moodDist: [1, 2, 3, 4, 5].map((k) => pct(daily.filter((d) => d.mood === k).length, daily.length)),
    sleep: daily.reduce((s, d) => s + d.sleep, 0) / daily.length,
  } : null;
  if (resp < minGroup) return { resp, size, hidden: true, areas: {}, sev: {}, causes: {}, daily: dailyAgg };

  const answers: Record<string, number[]> = {};
  for (const r of rows) for (const [area, v] of Object.entries(r.answers)) if (AREA_IDS.has(area)) (answers[area] ??= []).push(v);
  const areas: WeekAgg["areas"] = {}, sev: WeekAgg["sev"] = {};
  for (const [area, vs] of Object.entries(answers)) {
    // An area answered by fewer people than the minimum (e.g. after a mid-week change) stays hidden too.
    if (vs.length < minGroup) continue;
    areas[area] = Math.round(vs.reduce((s, v) => s + answerScore(v), 0) / vs.length);
    const levels = [0, 0, 0];
    for (const v of vs) levels[answerLevel(v)]++;
    sev[area] = [pct(levels[0], vs.length), pct(levels[1], vs.length), pct(levels[2], vs.length)];
  }

  const causes: WeekAgg["causes"] = {};
  const byArea: Record<string, string[][]> = {};
  for (const r of rows) if (r.cause_area && r.causes.length) (byArea[r.cause_area] ??= []).push(r.causes);
  for (const [area, lists] of Object.entries(byArea)) {
    if (lists.length < minGroup) continue;
    const counts: Record<string, number> = {};
    for (const l of lists) for (const c of new Set(l)) counts[c] = (counts[c] ?? 0) + 1;
    causes[area] = { n: lists.length, pct: Object.fromEntries(Object.entries(counts).map(([c, n]) => [c, pct(n, lists.length)])) };
  }
  return { resp, size, hidden: false, areas, sev, causes, daily: dailyAgg };
}

export async function buildDataset(companyId: string, userId: string): Promise<Dataset> {
  const sql = await db();
  const [company] = await sql<{ name: string; industry: string; invite_code: string; min_group: number; retention_months: number; checkin_day: number; reminder: boolean }[]>`
    select name, industry, invite_code, min_group, retention_months, checkin_day, reminder from companies where id = ${companyId}`;
  if (!company) throw new Error("Perusahaan tidak ditemukan");

  // Answers older than the company's retention period are deleted, not just hidden.
  const keepFrom = addDays(today(), -Math.round(company.retention_months * 30.44));
  await sql`delete from checkins where company_id = ${companyId} and week < ${keepFrom}`;
  await sql`delete from daily_logs d using users u where u.id = d.user_id and u.company_id = ${companyId} and d.day < ${keepFrom}`;

  const weeks = lastWeeks(WEEK_COUNT);
  const from = weeks[0];
  const [user] = await sql<{ name: string; email: string }[]>`select name, email from users where id = ${userId}`;
  const teams = await sql<{ id: string; name: string; size: number }[]>`
    select t.id, t.name, count(u.id)::int as size
    from teams t left join users u on u.team_id = t.id and u.role = 'employee'
    where t.company_id = ${companyId} group by t.id order by t.created_at, t.name`;
  const [{ employees }] = await sql<{ employees: number }[]>`select count(*)::int as employees from users where company_id = ${companyId} and role = 'employee'`;

  const checkins = await sql<CheckinRow[]>`
    select team_id, to_char(week, 'YYYY-MM-DD') as week, answers, cause_area, causes
    from checkins where company_id = ${companyId} and week >= ${from}`;
  const daily = await sql<DailyRow[]>`
    select u.team_id, to_char(date_trunc('week', d.day), 'YYYY-MM-DD') as week, d.user_id, d.mood, d.sleep
    from daily_logs d join users u on u.id = d.user_id
    where u.company_id = ${companyId} and u.role = 'employee' and d.day >= ${from}`;

  // Group size per week counts only employees who had joined by the end of that week,
  // so weeks before anyone joined show no participation instead of 0%.
  const joined = await sql<{ team_id: string | null; day: string }[]>`
    select team_id, to_char(created_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD') as day
    from users where company_id = ${companyId} and role = 'employee'`;
  const sizeAt = (w: string, team?: string) =>
    joined.filter((u) => u.day < addDays(w, 7) && (team === undefined || u.team_id === team)).length;

  const min = company.min_group;
  const scopes: Dataset["scopes"] = {
    all: weeks.map((w) => aggregate(checkins.filter((c) => c.week === w), daily.filter((d) => d.week === w), sizeAt(w), min)),
  };
  for (const t of teams) {
    scopes[t.id] = weeks.map((w) => aggregate(
      checkins.filter((c) => c.week === w && c.team_id === t.id), daily.filter((d) => d.week === w && d.team_id === t.id), sizeAt(w, t.id), min));
  }

  // Counselling contacts: a count per month, never who.
  const months = [3, 2, 1, 0].map((k) => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - k); return d.toISOString().slice(0, 10); });
  const refRows = await sql<{ month: string; n: number }[]>`
    select month, count(*)::int as n from referrals where company_id = ${companyId} and month >= ${monthKey(months[0])} group by month`;

  const noteRows = await sql<{ id: string; team_id: string; area: string | null; type: NoteType; text: string; by_name: string; day: string }[]>`
    select id, team_id, area, type, text, by_name, to_char(created_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD') as day
    from notes where company_id = ${companyId} order by created_at`;
  const notes: Note[] = noteRows.filter((n) => NOTE_TYPES.includes(n.type)).map((n) => ({
    id: n.id, team: n.team_id, week: weeks.indexOf(weekStart(n.day)), date: shortDate(n.day),
    type: n.type, area: n.area ?? undefined, text: n.text, by: n.by_name,
  }));

  const partners = await sql<{ id: string; name: string; focus: string; schedule: string; contact: string }[]>`
    select id, name, focus, schedule, contact from partners where company_id = ${companyId} order by created_at`;

  const cur = weeks[weeks.length - 1];
  const [{ opened }] = await sql<{ opened: number }[]>`
    select count(*)::int as opened from checkin_opens o join users u on u.id = o.user_id where u.company_id = ${companyId} and o.week = ${cur}`;

  return {
    live: true,
    company: {
      name: company.name, employees, industry: company.industry, inviteCode: company.invite_code,
      minGroup: min, retentionMonths: company.retention_months, checkinDay: company.checkin_day, reminder: company.reminder,
    },
    user: user ?? { name: "HR", email: "" },
    teams: teams.map((t) => ({ id: t.id, name: t.name, size: t.size })),
    weeks: weeks.map((w) => ({ start: w, label: shortDate(w) })),
    rotation0: rotationIndex(from),
    scopes,
    referrals: {
      months: months.map((m) => MONTHS[Number(m.slice(5, 7)) - 1]),
      byMonth: months.map((m) => refRows.find((r) => r.month === monthKey(m))?.n ?? 0),
    },
    notes,
    partners: partners.map((p) => ({ ...p })),
    funnel: { registered: employees, opened: Math.max(opened, scopes.all[WEEK_COUNT - 1].resp), completed: scopes.all[WEEK_COUNT - 1].resp },
  };
}
