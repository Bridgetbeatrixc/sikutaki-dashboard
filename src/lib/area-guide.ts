// Plain-language guide to the 42 areas, shown to employees (Insight, personal report, assistant) and to HR.
// Every area is scored the same way: how often the person experienced it. A high score always means
// "happens often, needs attention", never "has a lot of it" in a good sense. `high` says that in the
// area's own words, so no name can be read two ways (e.g. Kelelahan Sosial = social battery drained, not used a lot).

export type AreaGuide = {
  /** What a high score means, in one sentence. */
  high: string;
  /** One small step the employee can take on their own. */
  tip: string;
  /** A practice from the catalog that fits this area. */
  practice: string;
};

export const AREA_GUIDE: Record<string, AreaGuide> = {
  sedih: { high: "Rasa sedih sering datang dan sulit hilang.", tip: "Tulis apa yang membuatmu sedih tanpa menilai dirimu, lalu ceritakan ke satu orang yang kamu percaya.", practice: "ekspresif" },
  kecewa: { high: "Kamu sering merasa sangat kecewa, pada pekerjaan, orang lain, atau diri sendiri.", tip: "Pisahkan yang bisa kamu ubah dari yang tidak. Pilih satu hal kecil yang bisa kamu ubah minggu ini.", practice: "refleksi" },
  hampa: { high: "Pekerjaan sering terasa kosong atau tanpa makna.", tip: "Ingat satu momen kerja yang terasa berarti, lalu cari satu tugas minggu ini yang mirip.", practice: "refleksi" },
  moodswing: { high: "Suasana hatimu sering berubah drastis dalam waktu singkat.", tip: "Catat mood harian beberapa kali seminggu untuk melihat pemicunya, misalnya kurang tidur atau lapar.", practice: "jeda" },
  matirasa: { high: "Kamu sering sulit merasakan emosi apa pun.", tip: "Mulai dari tubuh: perhatikan sensasi kecil seperti hangat, dingin, atau tegang selama satu menit.", practice: "pindai" },
  duka: { high: "Duka karena kehilangan masih sering terasa berat.", tip: "Beri waktu khusus untuk mengenang, misalnya menulis surat untuk yang hilang. Duka tidak punya batas waktu.", practice: "ekspresif" },
  apatis: { high: "Kamu sering merasa tidak peduli lagi pada pekerjaan atau orang di sekitarmu.", tip: "Lakukan satu hal kecil yang dulu kamu sukai, walau belum terasa ingin. Minat sering kembali setelah bergerak.", practice: "jalan" },
  stres: { high: "Tekanan dari pekerjaan atau hal sehari-hari sering terasa.", tip: "Tulis tiga prioritas hari ini saja, dan ambil jeda napas 3 menit di antara tugas berat.", practice: "napas" },
  anxiety: { high: "Rasa cemas atau khawatir sering muncul dan sulit dihentikan.", tip: "Sediakan 10 menit “waktu khawatir” setiap hari. Di luar waktu itu, catat kekhawatiran dan tunda memikirkannya.", practice: "lega" },
  overthinking: { high: "Kamu sering memikirkan hal yang sama berulang-ulang.", tip: "Tuliskan pikirannya di kertas, lalu tanya: apa satu langkah yang bisa kulakukan? Sisanya lepaskan dulu.", practice: "lepas" },
  panik: { high: "Episode takut tiba-tiba, dengan jantung berdebar atau sesak, sering terjadi.", tip: "Saat panik datang, buang napas lebih panjang dari tarikan dan sebutkan 5 hal yang kamu lihat.", practice: "lega" },
  galau: { high: "Kamu sering sangat gelisah sampai sulit tenang atau fokus.", tip: "Gerakkan tubuh sebentar, misalnya jalan 5 menit, lalu lanjutkan dengan napas pelan.", practice: "jalan" },
  disosiasi: { high: "Kamu sering merasa tidak benar-benar hadir, seperti melihat dirimu dari jauh.", tip: "Sentuh benda di sekitarmu dan sebutkan teksturnya. Latihan 5-4-3-2-1 membantu kembali ke saat ini.", practice: "hadir" },
  eksistensial: { high: "Kamu sering mempertanyakan arti atau tujuan hidup sampai terasa membebani.", tip: "Tulis tiga hal yang penting bagimu. Pertanyaan besar lebih ringan bila dibahas sedikit demi sedikit.", practice: "refleksi" },
  burnout: { high: "Kamu sering merasa lelah secara fisik dan emosional karena pekerjaan. Energimu terkuras.", tip: "Lindungi waktu istirahat: berhenti sejenak setiap 90 menit dan hindari pesan kerja setelah jam kerja.", practice: "jeda" },
  insomnia: { high: "Kamu sering sulit tidur, terbangun, atau bangun tanpa merasa segar.", tip: "Tidur dan bangun di jam yang sama, dan jauhkan ponsel 30 menit sebelum tidur.", practice: "tidur" },
  baterai: { high: "Energimu cepat habis setelah berinteraksi dengan orang lain, jadi baterai sosialmu sedang terkuras.", tip: "Setelah rapat atau melayani banyak orang, ambil 5 menit sendiri tanpa layar untuk mengisi ulang.", practice: "hadir" },
  minder: { high: "Kamu sering merasa kurang percaya diri dibanding orang lain.", tip: "Catat satu hal yang kamu kerjakan dengan baik setiap hari, sekecil apa pun.", practice: "syukur" },
  selfesteem: { high: "Kamu sering merasa dirimu tidak berharga.", tip: "Bicaralah pada dirimu seperti kamu bicara pada sahabat yang sedang kesulitan.", practice: "syukur" },
  impostor: { high: "Kamu sering merasa keberhasilanmu bukan karena kemampuanmu sendiri.", tip: "Simpan daftar bukti: masukan baik, tugas yang selesai, masalah yang kamu pecahkan.", practice: "refleksi" },
  trauma: { high: "Pengalaman berat di masa lalu masih sering mengganggumu.", tip: "Saat ingatan berat muncul, tenangkan tubuh dulu dengan napas panjang. Kamu tidak harus membahasnya sendirian.", practice: "lega" },
  dendam: { high: "Sakit hati yang belum selesai sering teringat.", tip: "Tulis apa yang terjadi dan apa yang kamu butuhkan sekarang. Memaafkan tidak harus terburu-buru.", practice: "ekspresif" },
  marah: { high: "Emosimu sering meledak, atau kamu sering memendam marah.", tip: "Saat marah naik, beri jeda 10 napas sebelum menjawab. Salurkan lewat gerak, bukan kata-kata.", practice: "otot" },
  sosial: { high: "Kamu sering takut atau sangat tidak nyaman saat berinteraksi atau dinilai orang lain.", tip: "Mulai dari interaksi kecil yang aman, misalnya menyapa satu rekan, dan beri dirimu pujian setelahnya.", practice: "lega" },
  relasi: { high: "Kamu sering khawatir ditinggalkan oleh orang terdekat.", tip: "Saat cemas, cek fakta: apa buktinya? Sampaikan kebutuhanmu dengan tenang ke orangnya.", practice: "lepas" },
  pleaser: { high: "Kamu sering sulit menolak permintaan orang lain walau merugikan dirimu.", tip: "Latih satu kalimat: “Aku cek dulu jadwalku, nanti kukabari.” Jeda itu memberi ruang untuk memilih.", practice: "refleksi" },
  cemburu: { high: "Kamu sering merasa cemburu dan tidak aman, dalam hubungan atau di tempat kerja.", tip: "Perhatikan kapan rasa itu muncul dan apa yang kamu takutkan di baliknya.", practice: "ekspresif" },
  perfeksionis: { high: "Kamu sering sulit menyelesaikan pekerjaan karena merasa hasilnya belum sempurna.", tip: "Tentukan batas “cukup baik” sebelum mulai, lalu serahkan saat batas itu tercapai.", practice: "fokus" },
  fomo: { high: "Kamu sering takut tertinggal dari pengalaman atau pencapaian orang lain.", tip: "Batasi waktu media sosial dan ganti dengan menulis satu hal baik yang kamu alami hari ini.", practice: "syukur" },
  gadget: { high: "Penggunaan ponsel atau media sosial sering mengganggu tidur, kerja, atau hubunganmu.", tip: "Matikan notifikasi yang tidak penting dan simpan ponsel di luar kamar saat tidur.", practice: "mata" },
  prokrastinasi: { high: "Kamu sering menunda pekerjaan penting walau tahu dampaknya.", tip: "Mulai dengan 5 menit saja. Langkah pertama yang kecil lebih mudah daripada menunggu siap.", practice: "fokus" },
  makan: { high: "Kamu sering makan berlebihan, atau justru tidak makan, karena emosi.", tip: "Sebelum makan, tanya: aku lapar atau sedang merasa sesuatu? Jeda napas satu menit membantu memilih.", practice: "hadir" },
  egois: { high: "Kamu sering sulit melihat sudut pandang orang lain.", tip: "Dalam diskusi berikutnya, ulangi pendapat orang lain dengan kata-katamu sebelum menjawab.", practice: "refleksi" },
  sombong: { high: "Kamu sering sulit menerima masukan dari orang lain.", tip: "Saat menerima masukan, ucapkan terima kasih dulu dan tunda menilai sampai keesokan harinya.", practice: "refleksi" },
  keras: { high: "Kamu sering bertahan pada pendapatmu walau ada alasan kuat untuk berubah.", tip: "Tanya dirimu: bukti apa yang bisa membuatku berubah pikiran? Bila tidak ada, itu tanda perlu membuka diri.", practice: "refleksi" },
  ambisius: { high: "Dorongan berprestasi sering membuatmu menekan diri sendiri atau orang lain. Skor tinggi berarti tekanannya berlebihan, bukan berarti ambisi itu buruk.", tip: "Rayakan kemajuan, bukan hanya hasil akhir, dan sisakan waktu istirahat di jadwalmu.", practice: "jeda" },
  depresi: { high: "Kamu sering kehilangan minat pada hal yang biasanya kamu nikmati. Ini sinyal skrining, bukan diagnosis.", tip: "Jaga rutinitas dasar: bangun di jam yang sama, bergerak ringan, dan lakukan satu hal kecil yang menyenangkan.", practice: "jalan" },
  bipolar: { high: "Kamu sering mengalami masa sangat bersemangat yang berganti menjadi sangat terpuruk. Ini sinyal skrining, bukan diagnosis.", tip: "Jaga jam tidur tetap teratur dan catat mood harian untuk melihat polanya.", practice: "tidur" },
  adhd: { high: "Kamu sering sulit fokus, gelisah, atau bertindak tanpa berpikir panjang. Ini sinyal skrining, bukan diagnosis.", tip: "Pecah pekerjaan menjadi bagian 25 menit dan singkirkan gangguan di meja sebelum mulai.", practice: "fokus" },
  skizofrenia: { high: "Kamu sering mendengar atau melihat hal yang tampaknya tidak dialami orang lain. Ini sinyal skrining, bukan diagnosis.", tip: "Ceritakan pengalaman ini ke orang yang kamu percaya, dan jaga tidur serta makan tetap teratur.", practice: "hadir" },
  narsistik: { high: "Kamu sering merasa sangat butuh pujian atau pengakuan. Ini sinyal skrining, bukan diagnosis.", tip: "Catat pencapaian yang kamu hargai sendiri, tanpa menunggu pengakuan orang lain.", practice: "refleksi" },
  psikopat: { high: "Kamu sering tidak merasa bersalah setelah tindakanmu menyakiti orang lain. Ini sinyal skrining, bukan diagnosis.", tip: "Setelah konflik, tulis bagaimana kejadian itu terasa dari sisi orang lain.", practice: "refleksi" },
};

export const guideOf = (area: string): AreaGuide => AREA_GUIDE[area] ?? { high: "Kamu sering mengalami ini.", tip: "Bahas dengan Asisten untuk mencari langkah kecil yang cocok.", practice: "napas" };
