# Sikutaki Dashboard

Prototipe Sikutaki: **Dashboard HR** dan **Aplikasi karyawan** dalam satu project Next.js + Tailwind CSS.
Semua angka adalah data contoh. HR hanya melihat rata-rata kelompok minimal 5 orang, tidak pernah jawaban per orang.

## Route

| Route | Isi |
|---|---|
| `/` | Landing page Sikutaki (gaya Calm Health) dengan tombol ke kedua dashboard |
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
    landing/              Landing page: section, mockup HP dan dashboard, konten
  components/
    ui/                   Komponen dasar: Card, Button, Kpi, Icon, dll.
    charts/               Grafik SVG: LineChart, CompareBars, MoodBar, dll.
  lib/                    Data contoh, logika, format angka, dan daftar route (paths.ts)
```

Styling memakai Tailwind CSS v4. Token warna dan font ada di `src/app/globals.css` (`@theme`).

## Arsitektur

**Sekarang (prototipe):** front-end Next.js + Tailwind, semua halaman dibuat statis. Data adalah data contoh di `src/lib/data.ts` dan `src/features/*/content.ts`. Isian karyawan disimpan di state React (`EmployeeProvider`), jadi hilang saat halaman di-refresh. GitHub Actions menjalankan typecheck dan build di setiap push, lalu Vercel men-deploy `main`.

**Usulan produksi:** front-end yang sama tersambung ke backend API dengan database dan login akun kantor. Jawaban perorangan disimpan terpisah dari identitas, dan server hanya mengirim rata-rata tim ke HR bila tim berisi minimal 5 orang, sehingga aturan anonim dijaga di server.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build      # hasil statis di folder out/
```

## Deploy ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new) dan login dengan GitHub.
2. Pilih repo **sikutaki-dashboard**, lalu klik **Deploy**. Vercel otomatis mengenali Next.js, pengaturan bawaan sudah cukup.

Setiap push ke `main` akan ter-deploy ulang otomatis. Workflow `.github/workflows/ci.yml` menjalankan typecheck dan build di setiap push dan pull request.

Untuk hosting di sub-path (misalnya GitHub Pages di `/<nama-repo>/`), set `NEXT_PUBLIC_BASE_PATH=/<nama-repo>` saat build.
