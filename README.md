# Sikutaki Dashboard

Sikutaki: situs perusahaan, **Dashboard HR**, dan **aplikasi karyawan** untuk memantau kesehatan mental tim secara anonim. Next.js di Vercel, akun dan data di **Supabase**, dan **Asisten AI** berbasis Google Gemini yang berjalan di server.

- **Akun sungguhan.** HR mendaftarkan perusahaan di `/daftar`, karyawan bergabung dengan kode undangan di `/gabung`, semua masuk di `/masuk` dengan email dan kata sandi (Supabase Auth). Ada lupa kata sandi dan keluar.
- **Data tersimpan di Supabase.** Mood dan jam tidur harian, check-in mingguan, latihan dan program, permintaan konseling, serta pengaturan, catatan, dan psikolog mitra milik HR.
- **Privasi dijaga database.** Row level security di `supabase/schema.sql`: data karyawan hanya bisa dibaca karyawan itu sendiri. HR hanya mendapat jumlah dan rata-rata kelompok minimal 5 orang, dan permintaan konseling sampai ke HR tanpa id akun.
- **Asisten AI di server.** Key Gemini (`GEMINI_API_KEY`) hanya ada di server dan tidak pernah sampai ke peramban. Asisten hanya bisa dipakai karyawan yang sudah masuk.
- **Mode demo tetap ada.** `/demo/hr` dan `/demo/karyawan` membuka aplikasi dengan perusahaan contoh tanpa akun; isiannya tersimpan di peramban saja.

Angka grafik Dashboard HR masih memakai perusahaan contoh, karena rata-rata kelompok butuh banyak karyawan. Di Beranda HR ada kartu **Data asli perusahaan Anda** yang membaca jumlah karyawan, check-in, dan rata-rata mood dari Supabase.

## Asisten AI (Gemini)

Tab **Asisten** di aplikasi karyawan (`/dashboard-employee/asisten`). Karyawan menceritakan kondisinya. Asisten mendengarkan dan bertanya dulu, lalu bila dibutuhkan menyarankan paling banyak 3 latihan atau program dari katalog Sikutaki, ditampilkan sebagai kartu yang langsung bisa dibuka.

- Peramban mengirim percakapan dan ringkasan konteks ke `/api/assistant`. Server memeriksa sesi Supabase, menyusun instruksi sistem (`src/lib/assistant.ts`), lalu memanggil Gemini.
- Asisten tidak mendiagnosis dan hanya boleh menyarankan latihan yang ada di katalog.
- Bila pesan berisi tanda krisis, aplikasi selalu menampilkan Healing119 (119 ext 8) dan 112, apa pun jawaban model.
- Yang dikirim ke Google: pesan percakapan dan ringkasan mood, tidur, check-in minggu ini, serta program yang berjalan. Tidak ada nama lengkap atau email. Percakapan tidak disimpan di database.

## Route

| Route | Isi |
|---|---|
| `/`, `/tentang`, `/harga`, `/keamanan`, `/kontak`, `/privasi`, `/syarat` | Situs perusahaan |
| `/masuk` | Masuk dengan email dan kata sandi (HR dan karyawan), plus tombol mode demo |
| `/daftar` | HR membuat akun dan perusahaan |
| `/gabung?kode=...` | Karyawan membuat akun dengan kode undangan |
| `/lupa-sandi`, `/atur-sandi` | Minta tautan reset lewat email, lalu buat kata sandi baru |
| `/demo/hr`, `/demo/karyawan` | Buka aplikasi dalam mode demo, tanpa akun |
| `/auth/callback` | Tujuan tautan dari email Supabase (konfirmasi, reset) |
| `/api/assistant` | Asisten AI di server (Gemini) |
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
| `/dashboard-employee/profil` | Profil, keluar, hapus akun |

## Struktur

```
src/
  app/                    Route (App Router). page.tsx tipis, hanya merender fitur.
  proxy.ts                Memperbarui sesi Supabase, mengarahkan tamu ke /masuk
  app/api/assistant/      Asisten AI: memanggil Gemini dari server
  app/auth/callback/      Tautan dari email Supabase
  server/gemini.ts        Panggilan ke Gemini API (hanya server)
  store/
    cloud.ts              Sinkron dengan Supabase: muat saat aplikasi dibuka, simpan setiap perubahan
    local.ts              Salinan data di peramban (satu-satunya salinan di mode demo)
    hr.ts, hr-actions.ts  Data dan perubahan HR
    employee.ts, employee-actions.ts  Data dan perubahan karyawan
    account.ts            Masuk, daftar, gabung, reset kata sandi, keluar
    assistant.ts          Kirim percakapan ke /api/assistant
  features/
    hr/                   Dashboard HR
    employee/             Aplikasi karyawan
    landing/, site/       Situs perusahaan dan halaman masuk/daftar
  components/             Komponen dasar dan grafik SVG
  lib/
    supabase/             Klien Supabase untuk peramban dan server
    catalog.ts            42 area, skala jawaban, penyebab, rotasi check-in
    model.ts              Perhitungan dashboard dari dataset agregat
    sample.ts             Perusahaan contoh
    assistant.ts          Aturan dan katalog untuk Asisten AI
    week.ts               Tanggal dan minggu (WIB)
```

## Menyiapkan Supabase

1. Buat project di [supabase.com](https://supabase.com) (region terdekat, misalnya Singapore).
2. **SQL Editor > New query**, tempel seluruh isi `supabase/schema.sql`, lalu **Run**. Aman dijalankan ulang.
3. **Authentication > URL Configuration**
   - **Site URL**: alamat situs di Vercel, misalnya `https://sikutaki-dashboard.vercel.app`
   - **Redirect URLs**: tambahkan `https://sikutaki-dashboard.vercel.app/auth/callback` dan `http://localhost:3000/auth/callback`
4. **Authentication > Sign In / Providers > Email**: biarkan *Confirm email* menyala bila pengguna harus mengonfirmasi email dulu, atau matikan agar akun langsung bisa dipakai saat uji coba. Email bawaan Supabase dibatasi beberapa email per jam; untuk dipakai sungguhan, atur SMTP sendiri di **Authentication > Emails > SMTP Settings**.
5. Salin **Project URL** dan **Publishable key** (atau *anon key*) dari tombol **Connect** atau **Project Settings > API Keys**.

## Deploy ke Vercel

1. Impor repo di [vercel.com/new](https://vercel.com/new). Framework: **Next.js**. Production branch: `main`. Biarkan *Build Command* dan *Output Directory* kosong (bawaan); versi lama memakai folder `out/`, jadi hapus isian itu bila pernah diubah.
2. **Settings > Environment Variables**, isi untuk Production dan Preview:

   | Nama | Isi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (atau anon key) dari Supabase |
   | `GEMINI_API_KEY` | Key dari [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Jangan diberi awalan `NEXT_PUBLIC_` |
   | `GEMINI_MODEL` | Opsional, bawaan `gemini-3.5-flash-lite` |

3. **Deployments > Redeploy** setelah mengisi variabel. Variabel `NEXT_PUBLIC_` dibaca saat build, jadi perlu build ulang.
4. Hapus `NEXT_PUBLIC_GEMINI_API_KEY` bila pernah diisi; key itu dulu terbuka untuk semua pengunjung.

Setiap push ke `main` ter-deploy ulang otomatis. Workflow `.github/workflows/ci.yml` menjalankan typecheck dan build di setiap push dan pull request.

## Menjalankan di komputer

```bash
cp .env.example .env.local   # isi key Supabase dan Gemini
npm install
npm run dev                  # http://localhost:3000
npm run typecheck
npm run build && npm start
```

Tanpa variabel Supabase, situs tetap jalan dalam mode demo saja.

### Foto masuk/daftar

Foto di samping formulir masuk, daftar, dan gabung masih sementara (Unsplash):

- `public/img/auth/masuk.jpg` untuk `/masuk`, `/lupa-sandi`, `/atur-sandi`
- `public/img/auth/daftar.jpg` untuk `/daftar` dan `/gabung`

Panduan mengganti, ukuran yang disarankan, dan prompt siap pakai untuk ChatGPT (DALL·E) ada di `proposal/Prompt_Foto_Masuk_Daftar.md` di folder proyek. Cukup timpa file dengan nama yang sama (JPG, di bawah ~300 KB); kode tidak perlu diubah.

## Batasan saat ini

- Grafik Dashboard HR memakai angka perusahaan contoh dengan 8 divisi contoh. Nama divisi bisa diganti, tapi menambah atau menghapus divisi belum bisa.
- Jurnal latihan tersimpan di peramban saja, tidak dikirim ke server.
- Pesan antara HR dan karyawan di permintaan konseling muncul setelah halaman dimuat ulang (belum realtime).
- Mode demo tidak memakai Asisten AI, agar key Gemini tidak bisa dipakai siapa pun tanpa akun.
