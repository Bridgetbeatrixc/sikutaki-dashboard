import { AREAS, causesFor, checkinAreas, CORE, followUpArea } from "@/lib/catalog";
import { addDays, rotationIndex, today, weekStart } from "@/lib/week";
import type { CounselRequest } from "./counseling";
import type { EmployeeLocal } from "./employee";
import { KEYS, write } from "./local";

/*
 * Demo data for the employee app: ten weeks of check-ins (every one of the 42 areas answered at least once),
 * daily notes, practices, a finished program and two counseling requests, all dated from today so the
 * personal report and its PDF are always full. This week's check-in is left open for the visitor to try.
 */

const WEEKS = 10;

/** A fixed profile, so the demo reads the same every time: a few areas high, most medium or low. */
const BASE: Record<string, number> = {
  stres: 3, burnout: 3, insomnia: 3, anxiety: 3, overthinking: 3, baterai: 3, panik: 1, sedih: 2,
};
// Clinical areas stay low so the demo does not open the crisis guidance.
const baseOf = (id: string, i: number) => BASE[id] ?? (AREAS[i].group === "clinical" ? i % 2 : [0, 1, 2, 1, 1, 2, 0][i % 7]);

export function seedDemoEmployee() {
  const day = today();
  const thisWeek = weekStart(day);
  const checkins: EmployeeLocal["checkins"] = {};
  for (let w = WEEKS; w >= 1; w--) {
    const start = addDays(thisWeek, -7 * w);
    const areas = checkinAreas(rotationIndex(start));
    // Core areas ease a little over the weeks, after the program and the counseling sessions.
    const ease = w <= 3 ? 1 : 0;
    const answers = Object.fromEntries(areas.map((a) => {
      const b = baseOf(a, AREAS.findIndex((x) => x.id === a));
      return [a, Math.max(0, Math.min(4, b - (CORE.includes(a) ? ease : 0) + (w % 3 === 0 && b > 0 && b < 3 ? 1 : 0)))];
    }));
    const causeArea = followUpArea(areas, answers);
    checkins[start] = { answers, causeArea, causes: causeArea ? causesFor(causeArea).slice(0, 2) : [] };
  }

  const days: EmployeeLocal["days"] = [];
  const done: EmployeeLocal["done"] = {};
  const picks = ["napas", "lega", "leher", "tidur", "pindai", "jalan", "syukur", "hujan"];
  for (let i = 59; i >= 1; i--) {
    const d = addDays(day, -i);
    const better = i < 25 ? 1 : 0;
    days.push({ day: d, mood: Math.min(5, 2 + ((i * 7) % 3) + better), sleep: Math.min(8, 5 + ((i * 5) % 3) + better) });
    if (i % 2 === 0 || i < 14) done[d] = [picks[i % picks.length], ...(i % 3 === 0 ? [picks[(i + 3) % picks.length]] : [])];
  }

  const local: EmployeeLocal = {
    profile: { name: "Dimas", email: "", teamId: "cs" },
    onboarded: true,
    days, checkins, done,
    programs: [],
    energyOptIn: false,
    finished: [
      { program: "stres-7", startedOn: addDays(day, -27), finishedOn: addDays(day, -20) },
      { program: "tidur-7", startedOn: addDays(day, -13), finishedOn: addDays(day, -6) },
    ],
  };

  const at = (n: number, time: string) => `${addDays(day, -n)}T${time}:00+07:00`;
  const requests: CounselRequest[] = [
    {
      id: "demo-k2", createdAt: at(4, "20.15"), name: "Dimas", code: "K-4821", teamId: "cs", partnerId: "p2",
      mode: "online", times: ["Malam"], days: "Selasa atau Kamis", via: "asisten", status: "dijadwalkan",
      schedule: { date: addDays(day, 2), time: "19.30", partnerId: "p2", place: "Online (tautan dikirim lewat email)" },
      messages: [
        { from: "karyawan", text: "Akhir-akhir ini sering cemas sebelum rapat dan susah berhenti memikirkan pekerjaan.", at: at(4, "20.15") },
        { from: "hr", text: "Terima kasih sudah bercerita. Sesi dengan Raka Pratama, M.Psi., Psikolog sudah dijadwalkan.", at: at(3, "10.05") },
      ],
      unreadHr: false, unreadEmployee: false,
    },
    {
      id: "demo-k1", createdAt: at(26, "19.40"), name: "Dimas", code: "K-3157", teamId: "cs", partnerId: "p1",
      mode: "tatap muka", times: ["Sore", "Malam"], days: "Senin sampai Jumat", via: "form", status: "selesai",
      schedule: { date: addDays(day, -22), time: "18.30", partnerId: "p1", place: "Ruang konseling lantai 3" },
      messages: [
        { from: "karyawan", text: "Saya merasa lelah terus dan sulit tidur sejak jadwal shift berubah.", at: at(26, "19.40") },
        { from: "hr", text: "Sudah kami jadwalkan dengan Dita Anggraini, M.Psi., Psikolog. Semoga membantu.", at: at(25, "09.20") },
      ],
      unreadHr: false, unreadEmployee: false,
    },
  ];

  write(KEYS.employee, local);
  write(KEYS.counsel, requests);
}
