# Genius Assessment — AI for Teachers

Aplikasi asesmen digital Pendidikan Agama Islam dan Budi Pekerti kelas X, SMKN 1 Singkawang.
Dibuat dengan HTML, CSS, JavaScript, dan Bootstrap.

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Tampilan aplikasi |
| `css/bootstrap.min.css` | Bootstrap 5.3.3 |
| `css/style.css` | Gaya tampilan (biru, kuning, putih) |
| `js/questions.js` | Data 25 soal, kunci jawaban, dan pembahasan |
| `js/app.js` | Logika aplikasi (timer, acak soal, penilaian) |
| `bank_soal.html` | Bank soal dalam bentuk tabel untuk diperiksa atau dicetak |
| `LICENSE` | Hak cipta |

## Mengubah soal

Buka `js/questions.js`. Setiap soal berisi `question`, `options` (A–D), `correct_answer`,
`explanation`, `topic`, dan `difficulty`. Jumlah soal harus tetap 25.

## Publikasi ke GitHub Pages

1. Masuk ke https://github.com, klik **New repository**.
2. Isi nama, misalnya `genius-assessment-pai`, pilih **Public**, klik **Create repository**.
3. Klik **uploading an existing file**, seret seluruh isi folder ini (bukan foldernya), lalu klik **Commit changes**.
4. Buka **Settings → Pages**. Pada **Branch**, pilih `main` dan folder `/ (root)`, lalu klik **Save**.
5. Tunggu 1–2 menit. Aplikasi dapat dibuka di `https://NAMA-AKUN.github.io/genius-assessment-pai/`.
6. Bagikan tautan tersebut kepada siswa.

## Hak cipta

© 2026 Muchlis Wahyudi. Lihat file `LICENSE`.
