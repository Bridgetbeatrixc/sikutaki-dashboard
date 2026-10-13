# Sikutaki Dashboard

Prototipe Sikutaki: **Dashboard HR** dan **Aplikasi karyawan** dalam satu project Next.js + Tailwind CSS.
Semua angka adalah data contoh. HR hanya melihat rata-rata kelompok minimal 5 orang, tidak pernah jawaban per orang.

## Route

| Route | Isi |
|---|---|
| `/` | Halaman pilihan: Dashboard HR atau Aplikasi karyawan |
| `/dashboard-hr` | Beranda HR: metrik, mood, fokus per divisi |
| `/dashboard-hr/divisi`, `/dashboard-hr/divisi/[id]` | Daftar divisi dan detail (fokus, penyebab, catatan HR) |
| `/dashboard-hr/area`, `/dashboard-hr/area/[id]` | 17 area dan detail per area |
| `/dashboard-hr/check-in` | Jadwal dan partisipasi check-in |
| `/dashboard-hr/laporan` | Laporan bulanan |
| `/dashboard-hr/pengaturan` | Karyawan dan privasi |
| `/dashboard-employee` | Kenalan (janji privasi) |
| `/dashboard-employee/beranda` | Catat mood dan tidur, rencana hari ini |
| `/dashboard-employee/check-in` | Check-in mingguan 6 pertanyaan |
| `/dashboard-employee/insight` | Insight pribadi |
| `/dashboard-employee/latihan`, `/dashboard-employee/latihan/[id]` | Daftar latihan dan pemutar latihan napas |
| `/dashboard-employee/konseling` | Pesan sesi psikolog |

Kedua dashboard saling terhubung lewat tombol di top bar ("Aplikasi karyawan" dan "Dashboard HR").

## Struktur

```
src/
  app/                    Route (App Router). page.tsx tipis, hanya merender fitur.
    dashboard-hr/         Layout HR (HrProvider + HrShell) dan halamannya
    dashboard-employee/   Layout karyawan (EmployeeProvider + EmployeeShell) dan halamannya
  features/
    hr/                   Shell, state, dan halaman Dashboard HR
    employee/             Shell (mockup HP), state, konten, dan layar aplikasi karyawan
  components/
    ui/                   Komponen dasar: Card, Button, Kpi, Icon, dll.
    charts/               Grafik SVG: LineChart, CompareBars, MoodBar, dll.
  lib/                    Data contoh, logika, format angka, dan daftar route (paths.ts)
```

Styling memakai Tailwind CSS v4. Token warna dan font ada di `src/app/globals.css` (`@theme`).

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build      # hasil statis di folder out/
```

## Deploy ke GitHub Pages

Workflow `.github/workflows/deploy.yml` membangun dan men-deploy setiap push ke `main`.

Satu kali saja: buka **Settings > Pages** di repo, lalu pilih **Source: GitHub Actions**.

Situs akan tersedia di `https://<username>.github.io/<nama-repo>/`, misalnya
`/dashboard-hr/` dan `/dashboard-employee/` di bawah alamat itu.
