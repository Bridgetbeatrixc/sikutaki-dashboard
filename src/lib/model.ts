// The HR dashboard reads everything through this model. The server builds a Dataset of group
// aggregates (never single answers): live data from the database, or the demo company's sample data.
// Groups below the company's minimum size arrive with `hidden: true` and no scores.

import { AREAS, areaStatus, CAUSES, followUpQuestion, MOODS, wellbeingFrom, wellbeingStatus, type Cause, type NoteType, type Status } from "./catalog";

/** One group (the whole company or one division) in one week. */
export type WeekAgg = {
  /** People who sent this week's check-in. */
  resp: number;
  /** Registered employees in the group. */
  size: number;
  /** Fewer respondents than the minimum group size: no scores are included. */
  hidden: boolean;
  /** Mean score per area asked this week, 0 to 100 (higher needs more attention). */
  areas: Record<string, number>;
  /** Share of respondents per level per area: [rendah, sedang, tinggi] in %. */
  sev: Record<string, [number, number, number]>;
  /** Follow-up answers per area: how many answered and the share choosing each cause (%). */
  causes: Record<string, { n: number; pct: Record<string, number> }>;
  /** Daily mood and sleep notes of the week, when enough people wrote them. */
  daily: { users: number; mood: number; moodDist: number[]; sleep: number } | null;
};

export type DataTeam = { id: string; name: string; size: number; lead?: string };
export type Note = { id: string; team: string; week: number; date: string; type: NoteType; area?: string; text: string; by: string };
export type Partner = {
  id: string; name: string; focus: string; schedule: string; contact: string;
  kind: "psikolog" | "komplementer";
  /** Complementary practitioners: practice type, credential HR recorded, who confirmed it, and open reports. */
  practice: string; credential: string; verifiedBy: string; suspended: boolean; reports: number;
};

export type Dataset = {
  /** False for the demo company. */
  live: boolean;
  company: {
    name: string; employees: number; industry: string; inviteCode: string;
    minGroup: number; retentionMonths: number; checkinDay: number; reminder: boolean;
    /** Latihan Energi in the employee app (each employee still turns it on). */
    energySection: boolean;
  };
  user: { name: string; email: string };
  teams: DataTeam[];
  /** The last 12 weeks, oldest first; the last one is the current week. */
  weeks: { label: string; start: string }[];
  /** Rotation index of the first week. */
  rotation0: number;
  /** "all" and every team id. */
  scopes: Record<string, WeekAgg[]>;
  /** Psychologist contacts per month, a count only; complementary practitioner contacts in `complementary`. */
  referrals: { months: string[]; byMonth: number[]; complementary: number[] };
  notes: Note[];
  partners: Partner[];
  /** This week's check-in funnel for the whole company. */
  funnel: { registered: number; opened: number; completed: number };
  /**
   * Use of in-app programs per division, counted by the app (numbers only). `before` and `after` are the
   * program's area score among participants with a check-in before and after; null when too few have both.
   */
  programUse: ProgramUse[];
};

export type ProgramUse = {
  team: string; program: string; area: string; startWeek: number;
  invited: number; started: number; finished: number;
  before: number | null; after: number | null; paired: number;
};

export type Scope = "all" | string;
export type Focus = { area: string; v: number; d: number; reason: "naik" | "tinggi" | "waspada" };
export type Shares = { question: string; n: number; rows: { cause: Cause; pct: number }[] };
export type Alert = { id: string; team: string; kind: "naik" | "tinggi" | "partisipasi"; area?: string; value: number; delta: number; text: string };

/** A rotating area is asked once every 8 weeks, so its latest score stays current that long. */
const CARRY_WEEKS = 8;
const round1 = (n: number) => Math.round(n * 10) / 10;

export type Model = ReturnType<typeof makeModel>;

export function makeModel(ds: Dataset) {
  const TEAMS = ds.teams;
  const WEEKS = ds.weeks;
  const MIN_GROUP = ds.company.minGroup;
  const empty: WeekAgg = { resp: 0, size: 0, hidden: true, areas: {}, sev: {}, causes: {}, daily: null };
  const agg = (s: Scope, w: number): WeekAgg => ds.scopes[s]?.[w] ?? empty;
  const hasData = (s: Scope, w: number) => !agg(s, w).hidden && Object.keys(agg(s, w).areas).length > 0;

  /** The week the dashboard reports on: the latest week with results for the whole company, or -1. */
  let NOW = -1;
  for (let w = WEEKS.length - 1; w >= 0; w--) if (hasData("all", w)) { NOW = w; break; }
  const isEmpty = NOW < 0;
  const at = (w: number) => Math.max(0, w);

  const teamById = (id: string) => TEAMS.find((t) => t.id === id);
  const respondents = (s: Scope, w = NOW) => agg(s, at(w)).resp;
  const isHidden = (s: Scope, w = NOW) => !hasData(s, at(w));
  const part = (s: Scope, w = NOW) => {
    const a = agg(s, at(w));
    return a.size ? Math.round((a.resp / a.size) * 100) : 0;
  };

  /** Latest score of an area at or before week w (rotating areas carry forward up to 8 weeks). */
  function areaValue(s: Scope, area: string, w = NOW): number | null {
    for (let k = at(w); k >= 0 && k > w - CARRY_WEEKS; k--) {
      const a = agg(s, k);
      if (!a.hidden && a.areas[area] !== undefined) return a.areas[area];
    }
    return null;
  }
  /** Change since `back` weeks earlier, or null when either side has no score. */
  function areaDelta(s: Scope, area: string, back = 2, w = NOW): number | null {
    const v = areaValue(s, area, w), p = areaValue(s, area, w - back);
    return v === null || p === null || w - back < 0 ? null : v - p;
  }
  /** Scores as measured, null in weeks the area was not asked. */
  const areaSeries = (s: Scope, area: string) =>
    WEEKS.map((_, w) => { const a = agg(s, w); return a.hidden ? null : a.areas[area] ?? null; });

  function wellbeing(s: Scope, w = NOW): number | null {
    const a = agg(s, at(w));
    if (a.hidden || w < 0) return null;
    return wellbeingFrom(a.areas);
  }
  const wellbeingSeries = (s: Scope) => WEEKS.map((_, w) => wellbeing(s, w));

  const participation = (s: Scope, w = NOW) => part(s, w);
  const participationSeries = (s: Scope) => WEEKS.map((_, w) => (agg(s, w).size ? part(s, w) : null));
  const respondentsScope = (s: Scope, w = NOW) => respondents(s, w);
  const sizeScope = (s: Scope) => (s === "all" ? ds.company.employees : teamById(s)?.size ?? 0);

  const scoredAreas = (s: Scope, w = NOW) =>
    AREAS.map((a) => ({ area: a, v: areaValue(s, a.id, w), d: areaDelta(s, a.id, 2, w) }))
      .filter((x): x is { area: (typeof AREAS)[number]; v: number; d: number | null } => x.v !== null);

  function teamStatus(team: string, w = NOW): Status {
    const scores = scoredAreas(team, w).map((x) => x.v);
    const top = scores.length ? Math.max(...scores) : 0;
    const wb = wellbeing(team, w);
    const ws = wb === null ? "baik" : wellbeingStatus(wb);
    if (top >= 62 || ws === "perhatian") return "perhatian";
    if (top >= 54 || ws === "waspada") return "waspada";
    return "baik";
  }
  const topAreas = (s: Scope, n = 3, w = NOW) => scoredAreas(s, w).sort((x, y) => y.v - x.v).slice(0, n);
  /** Areas sorted by change over 4 weeks, biggest rise first. */
  const movers = (s: Scope, w = NOW) =>
    AREAS.map((a) => ({ area: a, d: areaDelta(s, a.id, 4, w) }))
      .filter((x): x is { area: (typeof AREAS)[number]; d: number } => x.d !== null).sort((x, y) => y.d - x.d);

  /** Share of respondents at each level for the latest week the area was asked. */
  function severity(s: Scope, area: string, w = NOW) {
    for (let k = at(w); k >= 0 && k > w - CARRY_WEEKS; k--) {
      const a = agg(s, k);
      if (!a.hidden && a.sev[area]) { const [rendah, sedang, tinggi] = a.sev[area]; return { rendah, sedang, tinggi }; }
    }
    return null;
  }

  /** A rise of 5+ points over 2 weeks, a level in "Perlu perhatian", or participation under 60%. */
  function alerts(w = NOW): Alert[] {
    if (w < 0) return [];
    const out: Alert[] = [];
    for (const t of TEAMS) {
      if (isHidden(t.id, w)) continue;
      const p = part(t.id, w);
      if (p < 60) out.push({ id: `${t.id}-part`, team: t.id, kind: "partisipasi", value: p, delta: p - part(t.id, w - 2), text: `Partisipasi ${t.name} turun ke ${p}%` });
      for (const x of scoredAreas(t.id, w)) {
        if (x.d !== null && x.d >= 5 && x.v >= 52) out.push({ id: `${t.id}-${x.area.id}`, team: t.id, kind: "naik", area: x.area.id, value: x.v, delta: x.d, text: `${x.area.name} naik ${x.d} poin di ${t.name}` });
        else if (x.v >= 62) out.push({ id: `${t.id}-${x.area.id}`, team: t.id, kind: "tinggi", area: x.area.id, value: x.v, delta: x.d ?? 0, text: `${x.area.name} tinggi di ${t.name}` });
      }
    }
    const rank = (x: Alert) => (x.kind === "naik" ? 0 : x.kind === "tinggi" ? 1 : 2) * 1000 - x.value;
    return out.sort((x, y) => rank(x) - rank(y));
  }

  /** What employees in a division say causes an area, from the latest week it was asked. */
  function causeShares(team: string, area: string, w = NOW): Shares {
    for (let k = at(w); k >= 0 && k > w - CARRY_WEEKS; k--) {
      const a = agg(team, k);
      const c = a.hidden ? undefined : a.causes[area];
      if (c) {
        const rows = Object.entries(c.pct).filter(([id]) => CAUSES[id]).map(([id, pct]) => ({ cause: CAUSES[id], pct }));
        return { question: followUpQuestion(area), n: c.n, rows: rows.sort((x, y) => y.pct - x.pct) };
      }
    }
    return { question: followUpQuestion(area), n: 0, rows: [] };
  }

  /** Focus areas for a division: rising or high areas first, then "waspada" areas. Max 3. */
  function focusAreas(team: string): Focus[] {
    if (isHidden(team)) return [];
    const out: Focus[] = alerts().filter((a) => a.team === team && a.area).map((a) => ({ area: a.area!, v: a.value, d: a.delta, reason: a.kind as "naik" | "tinggi" }));
    const extra = scoredAreas(team).filter((x) => areaStatus(x.v) !== "baik" && !out.some((o) => o.area === x.area.id))
      .sort((x, y) => y.v - x.v).map((x) => ({ area: x.area.id, v: x.v, d: x.d ?? 0, reason: "waspada" as const }));
    return [...out, ...extra].slice(0, 3);
  }

  /** How the note's area moved since the note was written. */
  const noteChange = (n: Note) => {
    if (!n.area || n.week < 0 || n.week >= NOW) return null;
    const before = areaValue(n.team, n.area, Math.max(0, n.week - 1)), now = areaValue(n.team, n.area);
    return before === null || now === null ? null : { before, now };
  };

  const daily = (s: Scope, w = NOW) => (w < 0 ? null : agg(s, w).daily);
  const sleepHours = (s: Scope, w = NOW) => { const d = daily(s, w); return d ? round1(d.sleep) : null; };
  const sleepSeries = (s: Scope) => WEEKS.map((_, w) => sleepHours(s, w));
  const moodAvg = (s: Scope, w = NOW) => { const d = daily(s, w); return d ? round1(d.mood) : null; };
  const moodDist = (s: Scope, w = NOW) => daily(s, w)?.moodDist ?? null;
  /** Share of registered employees who wrote a daily note this week. */
  const dailyActive = (s: Scope, w = NOW) => { const d = daily(s, w), size = sizeScope(s); return d && size ? Math.round((d.users / size) * 100) : null; };
  const topCompanyAreas = (n = 5) => scoredAreas("all").map((x) => ({ ...x, d: areaDelta("all", x.area.id, 4) })).sort((x, y) => y.v - x.v).slice(0, n);

  const r = ds.referrals.byMonth;
  const REFERRALS = { ...ds.referrals, thisMonth: r[r.length - 1] ?? 0, lastMonth: r[r.length - 2] ?? 0 };
  /** Rotation slot (0-7) of a week. */
  const rotationAt = (w: number) => (ds.rotation0 + w) % 8;

  return {
    ds, live: ds.live, isEmpty, TEAMS, WEEKS, NOW, MIN_GROUP, COMPANY: ds.company, REFERRALS, MOODS,
    teamById, respondents, isHidden, part, areaValue, areaDelta, areaSeries, wellbeing, wellbeingSeries,
    participation, participationSeries, respondentsScope, sizeScope, teamStatus, topAreas, movers, severity,
    alerts, causeShares, focusAreas, noteChange, sleepHours, sleepSeries, moodAvg, moodDist, dailyActive,
    topCompanyAreas, rotationAt, scoredAreas,
  };
}
