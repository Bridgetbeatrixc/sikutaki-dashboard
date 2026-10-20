/** Route map for the whole site. Keep every link here so routes change in one place. */
export const ROUTES = {
  home: "/",
  about: "/tentang",
  pricing: "/harga",
  security: "/keamanan",
  contact: "/kontak",
  privacy: "/privasi",
  terms: "/syarat",
  login: "/masuk",
  signup: "/daftar",
  /** Employee sign-up with the company's invite code. */
  join: (code?: string) => (code ? `/gabung?kode=${encodeURIComponent(code)}` : "/gabung"),
  reset: (token: string) => `/reset/${token}`,
  /** Opens the demo company without an account. */
  demo: { hr: "/demo/hr", employee: "/demo/karyawan" },
  hr: {
    root: "/dashboard-hr",
    divisions: "/dashboard-hr/divisi",
    division: (id: string) => `/dashboard-hr/divisi/${id}`,
    areas: "/dashboard-hr/area",
    area: (id: string) => `/dashboard-hr/area/${id}`,
    checkin: "/dashboard-hr/check-in",
    reports: "/dashboard-hr/laporan",
    settings: "/dashboard-hr/pengaturan",
    settingsTab: (tab: string) => `/dashboard-hr/pengaturan?tab=${tab}`,
  },
  employee: {
    root: "/dashboard-employee",
    home: "/dashboard-employee/beranda",
    checkin: "/dashboard-employee/check-in",
    insight: "/dashboard-employee/insight",
    exercises: "/dashboard-employee/latihan",
    exercise: (id: string) => `/dashboard-employee/latihan/${id}`,
    /** A practice opened as today's session of a program. */
    session: (practice: string, enrollment: string, slot: string) => `/dashboard-employee/latihan/${practice}?program=${encodeURIComponent(enrollment)}&slot=${slot}`,
    program: (id: string) => `/dashboard-employee/latihan/program/${id}`,
    counseling: "/dashboard-employee/konseling",
    calm: "/dashboard-employee/tenang",
    profile: "/dashboard-employee/profil",
  },
} as const;

/** Prefixes a file in /public with the base path (next/link does this for routes, plain <img> does not). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
