# Sikutaki Dashboard (versi frontend + Asisten AI)

Cabang `frontend-gemini`: versi **murni frontend** dari Sikutaki, tanpa server dan database. Isinya sama dengan cabang `backend-real-app` (situs perusahaan, Dashboard HR, aplikasi karyawan, latihan mandiri, program), ditambah **Asisten AI** berbasis Google Gemini yang menyarankan latihan dari katalog.

Versi dengan backend Postgres ada di cabang `backend-real-app`.

- Data karyawan dan perubahan HR tersimpan di `localStorage` peramban, tidak dikirim ke server mana pun.
- Angka Dashboard HR memakai data contoh (perusahaan fiktif), karena agregat butuh banyak karyawan.
- HR dan karyawan di peramban yang sama berbagi data: psikolog dan praktisi mitra, bagian energi, jumlah kontak, dan laporan praktisi.
- Situs diekspor statis (`out/`), jadi bisa dipasang di hosting statis mana saja.

## Asisten AI (Gemini, untuk uji coba)

Tab **Asisten** di aplikasi karyawan (`/dashboard-employee/asisten`). Karyawan menceritakan kondisinya. Asisten mendengarkan dan bertanya dulu, lalu bila dibutuhkan menyarankan paling banyak 3 latihan atau program dari katalog Sikutaki, ditampilkan sebagai kartu yang langsung bisa dibuka.

- Asisten tidak mendiagnosis dan hanya boleh menyarankan latihan yang ada di katalog (`src/lib/assistant.ts`).
- Bila pesan berisi tanda krisis, aplikasi selalu menampilkan Healing119 (119 ext 8) dan 112, apa pun jawaban model.
- Yang dikirim ke Google: pesan percakapan dan ringkasan mood, tidur, check-in minggu ini, serta program yang berjalan. Tidak ada nama lengkap atau email.

### API key

1. Buat key gratis di [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Pilih salah satu:
   - Tempel di aplikasi: buka tab Asisten, tekan ikon pengaturan, isi key. Key disimpan di peramban itu saja.
   - Atau isi saat build: `NEXT_PUBLIC_GEMINI_API_KEY=...` di `.env.local` atau di Environment Variables hosting.
3. Model bawaan `gemini-3.5-flash-lite`, bisa diganti di pengaturan asisten.

> **Hanya untuk uji coba.** Key dipakai langsung dari peramban, jadi siapa pun yang membuka situs bisa melihatnya. Untuk produksi, panggilan Gemini perlu dipindah ke server, misalnya ditambahkan ke cabang `backend-real-app`.

## Route

| Route | Isi |
|---|---|
| `/`, `/tentang`, `/harga`, `/keamanan`, `/kontak`, `/privasi`, `/syarat` | Situs perusahaan |
| `/daftar` | Daftar akun HR dan buat perusahaan |
| `/gabung?kode=...` | Karyawan bergabung dengan kode undangan |
| `/masuk` | Tautan ke Dashboard HR dan aplikasi karyawan |
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
| `/dashboard-employee/asisten` | Asisten AI (Gemini) yang menyarankan latihan |
| `/dashboard-employee/konseling` | Kontak psikolog mitra dan Healing119 |
| `/dashboard-employee/tenang` | Alat tenangkan diri saat cemas atau panik |
| `/dashboard-employee/profil` | Profil, keluar, hapus data di peramban |

## Struktur

```
src/
  app/                    Route (App Router). page.tsx tipis, hanya merender fitur.
  store/
    local.ts              Baca dan tulis localStorage
    hr.ts, hr-actions.ts  Data HR lokal di atas perusahaan contoh
    employee.ts, employee-actions.ts  Data karyawan di peramban
    account.ts            Daftar, gabung, keluar
    gemini.ts             Panggilan ke Gemini API
  features/
    hr/                   Dashboard HR
    employee/             Aplikasi karyawan
    landing/, site/       Situs perusahaan dan halaman masuk/daftar
  components/             Komponen dasar dan grafik SVG
  lib/
    catalog.ts            42 area, skala jawaban, penyebab, rotasi check-in
    model.ts              Perhitungan dashboard dari dataset agregat
    sample.ts             Perusahaan contoh
    assistant.ts          Aturan dan katalog untuk Asisten AI
    week.ts               Tanggal dan minggu (WIB)
```

## Menjalankan

```bash
npm install
npm run dev                  # http://localhost:3000
npm run typecheck
npm run build                # hasil statis di out/
npx serve out                # coba hasil build
```

Untuk GitHub Pages atau hosting di subfolder, isi `NEXT_PUBLIC_BASE_PATH` (misalnya `/sikutaki-dashboard`) saat build.

## Deploy ke Vercel

Impor repo di [vercel.com/new](https://vercel.com/new) dan pilih cabang `frontend-gemini`. Tidak perlu database. Bila ingin key Gemini bawaan, isi `NEXT_PUBLIC_GEMINI_API_KEY` di **Settings > Environment Variables**.

## Batasan versi ini

- Data hanya ada di satu peramban. Membersihkan data situs menghapusnya.
- Angka HR tidak berasal dari karyawan sungguhan. Menambah atau menghapus divisi belum bisa.
- Tidak ada akun atau kata sandi sungguhan.
