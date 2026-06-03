# PINTARIN

PINTARIN adalah platform full stack untuk membantu distribusi bantuan pendidikan di Kota Bandung agar lebih tepat sasaran, transparan, dan mudah divalidasi. Sistem ini menggabungkan dashboard role-based, peta risiko wilayah, AI risk scoring, human-in-the-loop validation, CSR matching, pengajuan bantuan sekolah, dan asisten Gen AI berbasis Gemini.

Project ini dibuat untuk capstone CC26-PSU211 dengan fokus pada masalah distribusi bantuan pendidikan: wilayah prioritas sering sulit dibandingkan secara cepat, data bantuan tersebar, dan keputusan akhir tetap membutuhkan validasi manusia.

## Ringkasan Produk

PINTARIN membantu tiga kelompok utama:

- Dinas Pendidikan melihat wilayah prioritas, memvalidasi rekomendasi AI, dan meninjau bantuan dari sekolah/CSR.
- Sekolah mengajukan kebutuhan bantuan dan memantau status ajuan.
- Mitra CSR menemukan wilayah atau sekolah yang paling relevan untuk program bantuan.

AI di PINTARIN tidak menggantikan keputusan manusia. AI memberi prediksi, confidence score, rekomendasi, dan explainable context; keputusan final tetap divalidasi oleh admin atau petugas dinas.

## Stack Teknologi

- `apps/web`: React, Vite, Tailwind CSS, React Router, Leaflet, Recharts.
- `apps/api`: Express.js, MySQL, JWT auth, role-based access control, rate limiter, Gemini integration.
- `apps/ai`: FastAPI, TensorFlow/Keras, scikit-learn scaler/encoder, custom Keras layers.
- `data/raw`: dataset pendukung untuk seed awal.
- `docs`: checklist deploy dan dokumentasi operasional.

## Struktur Project

```text
Pintarin/
  apps/
    web/                 Frontend React
    api/                 Backend Express REST API
    ai/                  FastAPI inference service
  data/
    raw/                 Dataset seed awal
  docs/                  Dokumentasi deploy dan operasional
  README.MD              Dokumentasi utama project
```

## Fitur Utama

- Landing page publik dengan ringkasan produk, alur sistem, tim, dan peta risiko.
- Login dan proteksi route berbasis role.
- Dashboard role-based untuk admin, dinas, sekolah, CSR, analyst, dan viewer.
- Peta choropleth risiko Kota Bandung.
- AI prediction bridge dari Express API ke FastAPI model service.
- Confidence score dan status `needs_human_review`.
- Human-in-the-loop validation untuk prediksi yang perlu ditinjau.
- CSR matching untuk rekomendasi wilayah bantuan.
- Pengajuan kebutuhan bantuan dari sekolah.
- Pengajuan dan riwayat bantuan CSR.
- Gen AI assistant berbasis Gemini untuk membantu membaca konteks dashboard.
- Manage Database khusus admin untuk melihat, menambah, mengedit, dan menghapus data aktif yang diizinkan.
- Audit log untuk jejak aktivitas penting.

## Role dan Akses

### Admin

Admin adalah role pusat kendali. Admin dapat:

- Mengakses Pusat Kendali.
- Mengelola data melalui Manage Database.
- Melihat fitur Dinas, CSR, Sekolah, Analyst, dan Viewer.
- Mengelola user dan data master.
- Melihat log, prediksi, indikator pendidikan, pengajuan sekolah, dan proposal CSR.

Catatan keamanan: tabel log seperti `audit_logs`, `csr_match_logs`, dan `prediction_validations` dibuat read-only di Manage Database agar integritas riwayat tetap terjaga.

### Dinas atau Officer

Dinas bertugas membaca risiko dan mengambil keputusan validasi. Menu utama:

- Overview.
- Map Risk.
- Analitik.
- Validasi CSR.
- Validasi Sekolah.
- Review prediksi AI.
- Gen AI.
- Tentang Produk.

Dinas dapat meninjau ajuan, menyetujui, menolak, menandai salur, atau menyelesaikan bantuan sesuai status proses.

### Sekolah

Sekolah berperan sebagai pengaju kebutuhan. Menu utama:

- Overview.
- Pengajuan.
- Riwayat Pengajuan.
- Gen AI.
- Tentang Produk.

Sekolah dapat membuat ajuan bantuan, memantau status, dan mengedit atau menghapus ajuan yang masih belum final sesuai aturan UI dan API.

### CSR Partner

CSR berperan sebagai mitra bantuan. Menu utama:

- Overview.
- Map Risk.
- AI Matching.
- Analitik.
- Pengajuan.
- Riwayat Pengajuan.
- Gen AI.
- Tentang Produk.

CSR dapat melihat wilayah prioritas, mencocokkan fokus bantuan dengan data risiko, lalu mengajukan bantuan yang lebih tepat sasaran.

### Analyst

Analyst berfokus membaca data dan kualitas prediksi. Menu utama:

- Ruang Analitik.
- Tentang Produk.

Role ini cocok untuk evaluasi model, pembacaan tren, dan analisis confidence score.

### Viewer

Viewer memiliki akses pantau. Menu utama:

- Ruang Pantau.
- Tentang Produk.

Role ini ditujukan untuk melihat ringkasan tanpa aksi operasional.

## User Guide

### Akun Demo

Gunakan akun berikut untuk testing lokal:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `pintarin` |
| Dinas | `dinas` | `pintarindinas` |
| CSR | `csr` | `pintarincsr` |
| Sekolah | `school` | `pintarinschool` |

### Login

1. Buka halaman `/login`.
2. Masukkan kredensial yang tersedia dari seed atau akun yang dibuat admin.
3. Setelah login, sistem mengarahkan user ke dashboard sesuai role.
4. Profil dan logout tersedia dari menu user di header dashboard.

### Navigasi Dashboard

1. Gunakan sidebar untuk berpindah fitur sesuai role.
2. Gunakan tombol refresh pada halaman data untuk memuat ulang data terbaru.
3. Gunakan dropdown modern pada form untuk memilih kategori, wilayah, atau status.
4. Pada kartu ringkasan yang teksnya panjang, klik kartu untuk membaca detail penuh.

### Membaca Map Risk

1. Buka menu Map Risk.
2. Warna wilayah menunjukkan prioritas risiko.
3. Klik wilayah pada peta untuk melihat detail indikator di panel kanan.
4. Gunakan data tersebut sebagai dasar awal, lalu validasi dengan konteks lapangan.

### Mengajukan Bantuan Sekolah

1. Login sebagai Sekolah.
2. Buka menu Pengajuan.
3. Isi jenis bantuan, nilai kebutuhan, deskripsi, dan bukti jika tersedia.
4. Kirim ajuan.
5. Pantau status di Riwayat Pengajuan.
6. Edit atau hapus hanya jika status masih memungkinkan.

### Mengajukan Bantuan CSR

1. Login sebagai CSR.
2. Buka Map Risk atau AI Matching untuk melihat prioritas wilayah.
3. Buka Pengajuan.
4. Isi target wilayah/sekolah, jenis bantuan, nilai bantuan, dan deskripsi.
5. Kirim proposal dan pantau status di Riwayat Pengajuan.

### Validasi Dinas

1. Login sebagai Dinas.
2. Buka Validasi CSR atau Validasi Sekolah.
3. Baca detail ajuan, nilai bantuan, target, dokumen, dan status.
4. Pilih aksi sesuai proses: tinjau, setujui, tolak, salurkan, atau selesai.
5. Gunakan menu Review untuk memvalidasi prediksi AI yang butuh human review.

### Manage Database

1. Login sebagai Admin.
2. Buka Manage Database.
3. Pilih tabel dari daftar.
4. Gunakan search dan pagination untuk mencari data.
5. Tambah, edit, atau hapus data hanya pada tabel yang mendukung aksi tersebut.
6. Hindari mengubah data prediksi atau indikator tanpa alasan yang jelas karena dapat memengaruhi dashboard.

## User Flow

### Flow Publik

```text
Landing Page -> Login -> Dashboard sesuai role
```

### Flow Sekolah

```text
Sekolah login
  -> membaca overview
  -> membuat pengajuan bantuan
  -> memantau riwayat
  -> menerima hasil validasi dinas/admin
```

### Flow CSR

```text
CSR login
  -> membaca peta risiko
  -> menjalankan AI Matching
  -> memilih target bantuan
  -> mengirim proposal CSR
  -> memantau status proposal
```

### Flow Dinas

```text
Dinas login
  -> membaca overview dan analitik
  -> meninjau peta risiko
  -> memvalidasi ajuan sekolah/CSR
  -> mereview prediksi AI low-confidence
  -> menetapkan keputusan akhir
```

### Flow Admin

```text
Admin login
  -> memantau pusat kendali
  -> mengelola database
  -> melihat semua workspace role
  -> menjaga konsistensi data dan akses
```

### Flow AI Prediction

```text
CSV dataset
  -> import ke education_indicators
  -> agregasi indikator per wilayah dan tahun
  -> Express API mengirim payload ke FastAPI
  -> model Keras menghasilkan prediksi risiko
  -> prediksi disimpan ke tabel predictions
  -> Dinas/Admin melakukan human review jika confidence rendah
```

## Data dan AI

Dataset indikator AI aktif:

- Nama file: `PINTARIN_MASTER_FINAL_5000_TERBARU.csv`.
- Salinan repo: `apps/api/src/db/seeds/data/PINTARIN_MASTER_FINAL_5000_TERBARU.csv`.
- Jumlah baris: 5.000.
- Jumlah kecamatan: 30.
- Rentang tahun: 2015 sampai 2025.
- Kolom utama: `Kecamatan`, `Tahun`, `Total_Populasi`, `Total_Warga_Rentan`, `Total_Bantuan_PIP`, `Total_Pra_Sekolah`, `SD`, `Rasio_Warga_Rentan`, `Status_Resiko`.
- SHA256 file yang dicek: `03B74A1511729C0C3DDDB545F6C9E0BAF94847D083C9785B142D7A1796F5AB54`.

Hasil audit lokal:

- File CSV di `Downloads` identik dengan salinan di repo.
- Tabel `education_indicators` sudah berisi 5.000 baris dari dataset `PINTARIN_MASTER_FINAL_5000_TERBARU`.
- Semua 30 kecamatan berhasil match ke tabel `regions`.
- Prediksi runtime terbaru model versi `1.0.0` menyimpan `input_features.source = education_indicators`.
- Prediksi tersebut memakai algoritma `FastAPI-Keras-Risk-Hybrid`.
- Database demo juga dapat berisi prediksi seed lama dari Excel dengan algoritma seperti `Gradient Boosting`, `LSTM`, `Random Forest`, `SVM`, dan `XGBoost`; repository dashboard memprioritaskan prediksi runtime `FastAPI-Keras-Risk-Hybrid` jika data tersebut tersedia.

Catatan penting tentang training provenance:

- Runtime inference sudah memakai indikator dari CSV ini melalui tabel `education_indicators`.
- Artifact model di `apps/ai/models` memuat metadata fitur, daftar kecamatan, rentang tahun, file model, scaler, dan encoder.
- Metadata model saat ini belum menyimpan dataset hash atau catatan eksplisit bahwa training dilakukan dari CSV ini.
- Karena itu, dari artifact yang ada kita bisa membuktikan pipeline inference memakai dataset ini, tetapi belum bisa membuktikan secara forensik bahwa proses training model awal memakai file CSV yang sama.

Untuk standar production, tambahkan provenance training ke `pintarin_metadata.json`, misalnya:

- `training_dataset_name`.
- `training_dataset_sha256`.
- `training_started_at`.
- `training_completed_at`.
- `training_notebook`.
- `metrics`.

## Database Aktif

Tabel aktif yang saat ini dipakai:

- `users`.
- `stakeholder_profiles`.
- `regions`.
- `schools`.
- `education_indicators`.
- `predictions`.
- `prediction_validations`.
- `analytics_snapshots`.
- `school_need_requests`.
- `csr_aid_proposals`.
- `csr_match_logs`.
- `audit_logs`.

Tabel legacy yang sudah dihapus dari model aktif:

- `population_education_records`.
- `risk_records`.
- `csr_programs`.

## API Utama

- `/api/health`: health check API.
- `/api/auth`: login dan auth.
- `/api/profiles`: profil user.
- `/api/analytics`: ringkasan analitik.
- `/api/regions`: data wilayah.
- `/api/predictions`: data prediksi AI.
- `/api/csr`: CSR matching.
- `/api/schools`: data sekolah.
- `/api/school-requests`: pengajuan bantuan sekolah.
- `/api/csr-aid`: proposal bantuan CSR.
- `/api/ai`: bridge prediksi ke FastAPI.
- `/api/gen-ai`: chat Gemini role-based.
- `/api/admin/database`: Manage Database khusus admin.

## Prasyarat Lokal

- Node.js LTS.
- npm.
- MySQL 8 atau kompatibel.
- Python 3.10+ untuk AI service.
- Model artifact AI di `apps/ai/models`.

## Setup Lokal

1. Install dependency Node:

```bash
npm install
```

2. Salin konfigurasi environment:

```bash
copy .env.example .env
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env
```

3. Isi env API minimal:

```env
NODE_ENV=development
PORT=5000
CLIENT_URLS=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=pintarin_db
JWT_SECRET=change_this_secret
AI_SERVICE_URL=http://127.0.0.1:8000
GEMINI_API_KEY=
```

4. Jalankan migration SQL di `apps/api/src/db/migrations` secara berurutan:

```text
001_init_schema.sql
002_stakeholder_profiles.sql
003_requests_and_csr_aid.sql
004_education_indicators.sql
005_ai_prediction_bridge.sql
006_drop_legacy_unused_tables.sql
```

5. Import seed utama:

```bash
npm --workspace apps/api run seed
```

6. Import dataset indikator AI:

```bash
npm --workspace apps/api run seed:ai-data
```

Perintah ini memakai default file:

```text
apps/api/src/db/seeds/data/PINTARIN_MASTER_FINAL_5000_TERBARU.csv
```

Jika ingin memakai file lain:

```bash
npm --workspace apps/api run seed:ai-data -- C:\path\to\dataset.csv
```

7. Jalankan API:

```bash
npm run dev:api
```

8. Jalankan frontend:

```bash
npm run dev:web
```

9. Jalankan AI service dari folder `apps/ai`:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Menjalankan AI Prediction

1. Pastikan AI service hidup dan endpoint `/health` berstatus ready.
2. Pastikan `education_indicators` sudah terisi dari CSV.
3. Jalankan batch prediction dari endpoint/API UI yang tersedia.
4. Hasil prediksi akan tersimpan di tabel `predictions`.
5. Data dengan confidence rendah akan ditandai untuk review manusia.

## Verifikasi

```bash
npm run lint:web
npm run build:web
npm run test:api
```

Audit data AI yang direkomendasikan:

```sql
SELECT source_dataset, COUNT(*) total_rows, COUNT(DISTINCT kecamatan) total_kecamatan,
       MIN(year) min_year, MAX(year) max_year
FROM education_indicators
GROUP BY source_dataset;
```

## Security

PINTARIN sudah memiliki beberapa fondasi keamanan:

- JWT authentication.
- Role-based access control.
- Protected routes di frontend.
- Helmet untuk HTTP security headers.
- CORS allowlist via `CLIENT_URLS`.
- Rate limiter global dan login limiter.
- Password hashing dengan bcrypt.
- Admin database registry agar tabel/field yang boleh diedit tetap whitelisted.
- Password hash tidak diekspos di Manage Database.
- Audit log untuk aksi penting.

Checklist sebelum deploy publik:

- Ganti `JWT_SECRET` dengan nilai acak panjang.
- Jangan gunakan credential demo untuk production.
- Jangan menaruh `GEMINI_API_KEY` di frontend.
- Pastikan `CLIENT_URLS` hanya berisi domain resmi.
- Gunakan DB user non-root dengan password kuat.
- Aktifkan `TRUST_PROXY=true` jika API ada di belakang reverse proxy.
- Gunakan Redis untuk rate limiter jika API berjalan multi-instance.
- Backup database secara berkala.
- Jangan expose AI service langsung ke publik jika tidak perlu.

## Deploy

Baca [Deployment Readiness](docs/DEPLOYMENT_READINESS.md) sebelum deploy publik.

Ringkasan target deploy:

- Frontend: Vercel atau static hosting lain.
- API: Railway, Render, Fly.io, VPS, atau container platform.
- AI Service: container/VPS yang mendukung TensorFlow.
- Database: MySQL production managed service atau VPS yang diamankan.

Deploy demo capstone layak setelah checklist wajib selesai. Deploy untuk banyak user production membutuhkan tambahan observability, Redis-backed rate limit, backup, dan load test sederhana.

## Troubleshooting

### Gen AI tidak menjawab

- Pastikan `GEMINI_API_KEY` tersedia di env API.
- Pastikan API dapat mengakses endpoint Gemini.
- Cek rate limit Gen AI.
- Cek log endpoint `/api/gen-ai/chat`.

### AI service tidak ready

- Pastikan file berikut ada di `apps/ai/models` atau `PINTARIN_AI_MODEL_DIR`:
  - `pintarin_metadata.json`.
  - `pintarin_risk_scoring.keras`.
  - `pintarin_hybrid_recommendation.keras`.
  - `pintarin_scaler.pkl`.
  - `pintarin_le_kecamatan.pkl`.
- Pastikan dependency Python sudah terpasang.
- Cek endpoint `/health` pada AI service.

### Data peta atau dashboard kosong

- Pastikan migration sudah dijalankan.
- Pastikan seed utama sudah dijalankan.
- Pastikan `seed:ai-data` sudah dijalankan.
- Pastikan batch prediction sudah menghasilkan data di `predictions`.

### Login gagal atau redirect salah

- Pastikan user aktif di tabel `users`.
- Pastikan role user sesuai route dashboard.
- Bersihkan session browser lalu login ulang.
- Pastikan `CLIENT_URLS` sesuai origin frontend.

## Standar Pengembangan

- Ikuti struktur module per domain di `apps/api/src/modules`.
- Jangan akses tabel langsung dari frontend.
- Gunakan service dan repository layer untuk perubahan backend.
- Gunakan registry Manage Database untuk whitelist tabel dan field admin.
- Jangan expose secret di repo.
- Tambahkan test untuk perubahan logic penting.
- Jalankan build dan test sebelum deploy.

## Status Audit Terakhir

- Database aktif sinkron dengan registry Manage Database.
- Tabel legacy yang tidak dipakai sudah dihapus dari schema aktif.
- Dataset AI runtime sudah sesuai dengan `PINTARIN_MASTER_FINAL_5000_TERBARU.csv`.
- Test API lulus pada audit terakhir: `7/7`.
