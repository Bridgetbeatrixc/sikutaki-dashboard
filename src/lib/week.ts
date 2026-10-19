// Calendar helpers in Western Indonesia Time (WIB, UTC+7, no daylight saving).
// Days are "YYYY-MM-DD" strings; a check-in week starts on Monday and closes Sunday 23.59 WIB.

const WIB_MS = 7 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const MONTHS_LONG = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const DAYS_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const parse = (day: string) => Date.parse(`${day}T00:00:00Z`);
const format = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Today's date in WIB. */
export const today = (now = Date.now()) => format(now + WIB_MS);
export const addDays = (day: string, n: number) => format(parse(day) + n * DAY_MS);
/** 0 = Sunday ... 6 = Saturday. */
export const weekday = (day: string) => new Date(parse(day)).getUTCDay();
/** Monday of the week that contains this day. */
export const weekStart = (day: string) => addDays(day, -((weekday(day) + 6) % 7));
export const daysBetween = (a: string, b: string) => Math.round((parse(b) - parse(a)) / DAY_MS);

/** Rotation index of a week, counted from Monday 1 January 2024. */
export const rotationIndex = (monday: string) => Math.floor(daysBetween("2024-01-01", monday) / 7);

/** "13 Okt" */
export const shortDate = (day: string) => {
  const d = new Date(parse(day));
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};
/** "Selasa, 13 Oktober" */
export const longDate = (day: string) => {
  const d = new Date(parse(day));
  return `${DAYS_LONG[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]}`;
};
/** "Oktober 2026" */
export const monthLabel = (day: string) => {
  const d = new Date(parse(day));
  return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
/** "2026-10" */
export const monthKey = (day: string) => day.slice(0, 7);

/** The last n Mondays, oldest first, ending with the current week. */
export function lastWeeks(n: number, day = today()) {
  const cur = weekStart(day);
  return Array.from({ length: n }, (_, i) => addDays(cur, -7 * (n - 1 - i)));
}
