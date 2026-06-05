# Capstone Checklist Evidence

Tanggal audit: 2026-06-05

Dokumen ini mencatat bukti implementasi checklist capstone PINTARIN. Status `PASS` berarti sudah ada di project dan sudah diverifikasi secara lokal. Status `READY` berarti implementasi siap, tetapi bukti eksternal seperti URL deploy masih harus diisi setelah hosting dilakukan.

## Checklist Utama

| Checklist | Status | Bukti di project |
| --- | --- | --- |
| Menggunakan networking calls untuk berinteraksi dengan API | PASS | Frontend memakai service layer berbasis Axios, misalnya `apps/web/src/features/dashboard/schoolRequestService.js` dan service dashboard lain. |
| Menggunakan module bundler seperti Webpack/Vite | PASS | `apps/web/package.json` memakai Vite dengan script `build`, `dev`, dan `preview`. |
| Membangun RESTful API untuk mendukung Front-End | PASS | API Express berada di `apps/api/src/app.js` dengan route `/api/auth`, `/api/regions`, `/api/predictions`, `/api/school-requests`, `/api/csr-aid`, dan lainnya. |
| RESTful API dapat menyimpan data | PASS | Modul `schoolRequests`, `csrAid`, `profiles`, dan `adminDatabase` menyimpan data melalui repository MySQL. |
| RESTful API memakai URL sesuai konvensi RESTful | PASS | Contoh: `GET /api/school-requests`, `POST /api/school-requests`, `PUT /api/school-requests/:id`, `DELETE /api/school-requests/:id`, `PATCH /api/school-requests/:id/review`. |
| Mengintegrasikan AI/ML sebagai fitur utama | PASS | `apps/ai` menyediakan FastAPI inference service; API Express memiliki bridge `/api/ai` dan modul `predictions`; dashboard menampilkan risk scoring, confidence, dan human review. |
| Fitur utama berjalan tanpa crash | PASS | Verifikasi lokal: `npm run test:api` lulus 20/20, `npm run lint:web` lulus, dan `npm run build:web` lulus. |
| Membuat mockup aplikasi sebagai representasi UI | PASS | Mockup repo-native tersedia di `docs/UI_MOCKUP_AND_QA.md`. |
| Membangun layout responsif | PASS | Frontend memakai Tailwind responsive utilities (`sm`, `md`, `lg`, `xl`) pada landing dan dashboard. |
| RESTful API dapat menyimpan data ke database | PASS | Database MySQL dipakai melalui `mysql2`; migration dan repository layer tersedia di `apps/api/src/db` dan `apps/api/src/modules`. |
| RESTful API dibangun menggunakan Express | PASS | `apps/api/package.json` memakai `express`; entry API ada di `apps/api/src/app.js` dan `apps/api/src/server.js`. |
| Tools rekomendasi: Bootstrap/Tailwind CSS/Axios | PASS | Project memakai Tailwind CSS dan Axios. Bootstrap tidak dipakai karena Tailwind sudah menjadi design utility utama. |
| Melakukan deployment aplikasi web ke server | READY | Konfigurasi deploy tersedia di `docs/DEPLOYMENT_READINESS.md`; URL live belum diisi karena membutuhkan akun/credential hosting. |
| Rekomendasi hosting GitHub Pages/Netlify/Vercel | PASS | Frontend direkomendasikan ke Vercel/static hosting pada `docs/DEPLOYMENT_READINESS.md`. |

## Verifikasi Lokal

Command yang digunakan sebagai gerbang minimum:

```bash
npm run test:api
npm run lint:web
npm run build:web
npm --prefix apps/api ci --dry-run --ignore-scripts --no-audit --no-fund
npm --prefix apps/web ci --dry-run --ignore-scripts --no-audit --no-fund
npm audit --workspaces --omit=dev --audit-level=high
```

Status terbaru:

| Command | Status | Catatan |
| --- | --- | --- |
| `npm run test:api` | PASS | 20 test lulus. |
| `npm --prefix apps/api ci --dry-run --ignore-scripts --no-audit --no-fund` | PASS | Lockfile subproject API sudah sinkron. |
| `npm --prefix apps/web ci --dry-run --ignore-scripts --no-audit --no-fund` | PASS | Lockfile subproject web sudah sinkron. |
| `npm run lint:web` | PASS | Diverifikasi pada audit lokal. |
| `npm run build:web` | PASS | Diverifikasi pada audit lokal. |
| `npm audit --workspaces --omit=dev --audit-level=high` | PASS | Tidak ada vulnerability high pada audit lokal. |

Catatan: AI service belum diverifikasi live pada environment audit karena dependency Python FastAPI/TensorFlow belum terpasang di runtime pemeriksaan. Untuk deploy, jalankan `pip install -r apps/ai/requirements.txt` dan pastikan artifact model `.keras`/`.pkl` tersedia.

## Catatan Deploy

- Untuk hosting frontend, gunakan Vercel atau static hosting setara dengan build command `npm --workspace apps/web run build` dan output `apps/web/dist`.
- Untuk API, gunakan Railway/Render/Fly.io/VPS dengan start command `npm --workspace apps/api run start`.
- Untuk AI service, gunakan container/VPS yang menyertakan artifact model `.keras` dan `.pkl`.
- URL live production/demo harus ditambahkan setelah deployment selesai.

## Kandidat File Tidak Terpakai

File berikut belum dihapus karena membutuhkan konfirmasi:

| File | Alasan |
| --- | --- |
| `apps/web/src/assets/images/fotosiswa.png` | Halaman produk sekarang memakai `fotosiswa-optimized.jpg` yang jauh lebih ringan. PNG asli bisa dihapus setelah disetujui. |
