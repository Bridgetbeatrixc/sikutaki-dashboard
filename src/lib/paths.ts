/** Route map for the whole site. Keep every link here so routes change in one place. */
export const ROUTES = {
  home: "/",
  hr: {
    root: "/dashboard-hr",
    divisions: "/dashboard-hr/divisi",
    division: (id: string) => `/dashboard-hr/divisi/${id}`,
    areas: "/dashboard-hr/area",
    area: (id: string) => `/dashboard-hr/area/${id}`,
    checkin: "/dashboard-hr/check-in",
    reports: "/dashboard-hr/laporan",
    settings: "/dashboard-hr/pengaturan",
  },
  employee: {
    root: "/dashboard-employee",
    home: "/dashboard-employee/beranda",
    checkin: "/dashboard-employee/check-in",
    insight: "/dashboard-employee/insight",
    exercises: "/dashboard-employee/latihan",
    exercise: (id: string) => `/dashboard-employee/latihan/${id}`,
    counseling: "/dashboard-employee/konseling",
  },
} as const;

/** Prefixes a file in /public with the base path (next/link does this for routes, plain <img> does not). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
