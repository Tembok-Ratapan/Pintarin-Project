# PINTARIN

PINTARIN adalah platform fullstack untuk memprioritaskan bantuan pendidikan Kota Bandung berbasis data, AI risk scoring, validasi manusia, dan CSR matching.

## Stack

- `apps/web`: React, Vite, Tailwind CSS, React Router, Leaflet, Recharts
- `apps/api`: Express.js, MySQL, JWT auth, role-based access control
- `apps/ai`: FastAPI, TensorFlow/Keras inference service
- Gemini API: Gen AI assistant untuk dashboard role-based
- `data/raw`: dataset pendukung untuk seed/import

## Fitur Utama

- Dashboard publik dan dashboard role-based untuk `admin`, `officer`, `analyst`, `csr_partner`, `school_operator`, dan `viewer`
- AI prediction bridge dari FastAPI ke Express API
- Confidence score dan flag `needs_human_review`
- Human-in-the-loop validation untuk prediksi confidence rendah
- CSR matching engine untuk rekomendasi wilayah bantuan
- Gen AI assistant berbasis Gemini untuk Sekolah, CSR, dan Dinas
- Ajuan kebutuhan sekolah dan proposal bantuan CSR
- Peta choropleth wilayah Kota Bandung

## Setup Lokal

1. Install dependency Node:

```bash
npm install
```

2. Salin konfigurasi env:

```bash
copy .env.example apps\api\.env
```

Isi `GEMINI_API_KEY` jika fitur Gen AI ingin digunakan.

3. Jalankan migration SQL di `apps/api/src/db/migrations` secara berurutan dari `001` sampai `005`.

4. Import seed data:

```bash
npm --workspace apps/api run seed
npm --workspace apps/api run seed:ai-data
```

5. Jalankan service:

```bash
npm run dev:api
npm run dev:web
```

6. Jalankan AI service dari `apps/ai` setelah model artifact tersedia:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Verifikasi

```bash
npm run lint:web
npm run build:web
npm run test:api
```

## Catatan Deploy

Baca [Deployment Readiness](docs/DEPLOYMENT_READINESS.md) sebelum deploy publik. Jangan deploy dengan `JWT_SECRET` default, credential demo terbuka, tanpa model artifact AI, atau tanpa `GEMINI_API_KEY` jika Gen AI diaktifkan.
