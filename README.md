# Sikutaki Dashboard

Sikutaki dalam satu project Next.js: **situs perusahaan**, **Dashboard HR**, dan **aplikasi karyawan**, dengan backend Postgres.
HR hanya melihat rata-rata kelompok minimal 5 orang, tidak pernah jawaban per orang. Aturan ini dijaga di server.

## Cara kerja

1. HR mendaftar di `/daftar` dan membuat perusahaan beserta divisinya.
2. Dashboard HR menampilkan kode undangan. Karyawan bergabung lewat `/gabung?kode=...` dan memilih divisi.
3. Karyawan mencatat mood dan tidur setiap hari, lalu mengisi check-in mingguan (8 pertanyaan: 5 area inti dan 3 area bergiliran dari 42 area).
4. Server menghitung rata-rata per divisi. Divisi dengan responden di bawah batas minimum (bawaan 5) ditampilkan "Disembunyikan".

Skor area adalah sinyal skrining dari check-in, bukan diagnosis.

## Route

| Route | Isi |
|---|---|
| `/`, `/tentang`, `/harga`, `/keamanan`, `/kontak`, `/privasi`, `/syarat` | Situs perusahaan |
| `/daftar` | Daftar akun HR dan buat perusahaan |
| `/gabung?kode=...` | Karyawan bergabung dengan kode undangan |
| `/masuk` | Masuk (HR dan karyawan), plus tombol demo |
| `/reset/[token]` | Atur ulang kata sandi lewat tautan yang dibuat HR |
| `/demo/hr`, `/demo/karyawan` | Demo tanpa akun dengan perusahaan contoh. Tidak ada yang disimpan |
| `/dashboard-hr` | Beranda HR: wellbeing, partisipasi, mood, fokus per divisi |
| `/dashboard-hr/divisi`, `/dashboard-hr/divisi/[id]` | Divisi, penyebab, catatan tindakan HR |
| `/dashboard-hr/area`, `/dashboard-hr/area/[id]` | 42 area dan detail per area |
| `/dashboard-hr/check-in` | Jadwal check-in dan corong partisipasi |
| `/dashboard-hr/laporan` | Laporan bulanan, bisa disimpan sebagai PDF |
| `/dashboard-hr/pengaturan` | Organisasi, karyawan, privasi, psikolog mitra |
| `/dashboard-employee` | Kenalan (janji privasi), sekali saja |
| `/dashboard-employee/beranda` | Catat mood dan tidur, rencana hari ini |
| `/dashboard-employee/check-in` | Check-in mingguan |
| `/dashboard-employee/insight` | Insight pribadi (hanya karyawan itu sendiri) |
| `/dashboard-employee/latihan`, `/dashboard-employee/latihan/[id]` | Latihan napas dan pemutarnya |
| `/dashboard-employee/konseling` | Kontak psikolog mitra dan Healing119 |
| `/dashboard-employee/tenang` | Alat tenangkan diri saat cemas atau panik |
| `/dashboard-employee/profil` | Profil, kata sandi, keluar, hapus akun |

## Struktur

```
src/
  app/                    Route (App Router). page.tsx tipis, hanya merender fitur.
  server/
    db.ts                 Koneksi Postgres dan skema (dibuat otomatis saat pertama dipakai)
    auth.ts               Kata sandi (scrypt), sesi cookie httpOnly, mode demo
    dataset.ts            Agregat untuk HR: rata-rata per divisi, aturan minimal 5 orang, retensi data
    employee.ts           Data milik karyawan itu sendiri
    actions/              Server action: auth, karyawan, HR
  features/
    hr/                   Dashboard HR
    employee/             Aplikasi karyawan
    landing/, site/       Situs perusahaan dan halaman masuk/daftar
  components/             Komponen dasar dan grafik SVG
  lib/
    catalog.ts            42 area, skala jawaban, penyebab, rotasi check-in
    model.ts              Perhitungan dashboard dari dataset agregat
    sample.ts             Perusahaan contoh untuk demo
    week.ts               Tanggal dan minggu (WIB)
```

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi DATABASE_URL
npm run dev                  # http://localhost:3000
npm run typecheck
npm run build && npm start
```

Tanpa `DATABASE_URL`, situs dan demo tetap berjalan, tetapi daftar dan masuk menampilkan pemberitahuan.

## Deploy ke Vercel

1. Impor repo ini di [vercel.com/new](https://vercel.com/new).
2. Di **Storage**, tambahkan database Postgres (misalnya Neon) dan sambungkan ke project. Vercel mengisi `DATABASE_URL` otomatis. Bisa juga isi `DATABASE_URL` sendiri di **Settings > Environment Variables**.
3. Deploy ulang. Tabel dibuat otomatis saat permintaan pertama.

Workflow `.github/workflows/ci.yml` menjalankan typecheck dan build di setiap push dan pull request.

## Belum ada

- Pengiriman email. Undangan memakai kode atau tautan, dan reset kata sandi memakai tautan yang dibuat HR di Pengaturan.
- Login SSO kantor (Google Workspace, Microsoft).
