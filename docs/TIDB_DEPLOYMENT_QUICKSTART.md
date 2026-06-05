# PINTARIN TiDB Deployment Quickstart

Panduan ini dibuat untuk deploy cepat PINTARIN dengan database TiDB Cloud.

## Arsitektur Deploy

| Service | Platform yang Disarankan | Catatan |
| --- | --- | --- |
| Frontend React | Vercel | Root directory `apps/web` |
| API Express | Railway atau Render | Root directory `apps/api` |
| Database | TiDB Cloud | MySQL-compatible, gunakan SSL |
| AI FastAPI | Render/Railway/VPS/container | Wajib membawa artifact `.keras` dan `.pkl` |

## 1. Siapkan TiDB

Ambil credential dari TiDB Cloud:

- Host
- Port, biasanya `4000`
- Username
- Password
- Database name

Pastikan database target sudah dibuat. Untuk demo capstone, gunakan database kosong agar migration fresh aman dijalankan.

## 2. Jalankan Migration ke TiDB

Isi environment API lokal terlebih dahulu di `apps/api/.env` atau shell:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=your-tidb-host
DB_PORT=4000
DB_USER=your-tidb-user
DB_PASSWORD=your-tidb-password
DB_NAME=your-tidb-database
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true

JWT_SECRET=replace_with_64_plus_random_characters
JWT_EXPIRES_IN=1d
AI_SERVICE_URL=http://localhost:8000
TRUST_PROXY=true
RATE_LIMIT_ENABLED=true
```

Jalankan migration fresh:

```bash
npm --workspace apps/api run migrate:fresh
```

Penting: command ini menjalankan `001_init_schema.sql`, yang melakukan reset/drop tabel aktif sebelum membuat schema baru. Gunakan hanya untuk database kosong atau database demo yang boleh di-reset.

Setelah migration berhasil, import data demo:

```bash
npm --workspace apps/api run seed
npm --workspace apps/api run seed:passwords
npm --workspace apps/api run seed:ai-data
```

## 3. Deploy API Express

### Opsi Railway

Gunakan GitHub repo project.

Settings:

```text
Root Directory: apps/api
Build Command: npm ci
Start Command: npm start
```

Environment variables:

```env
NODE_ENV=production
PORT=5000
CLIENT_URLS=https://your-frontend-domain.vercel.app
TRUST_PROXY=true

DB_HOST=your-tidb-host
DB_PORT=4000
DB_USER=your-tidb-user
DB_PASSWORD=your-tidb-password
DB_NAME=your-tidb-database
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true

JWT_SECRET=replace_with_64_plus_random_characters
JWT_EXPIRES_IN=1d

AI_SERVICE_URL=https://your-ai-service-domain
AI_SERVICE_TIMEOUT_MS=30000
AI_REVIEW_THRESHOLD=0.7
AI_BATCH_SIZE=50

GEMINI_API_KEY=optional
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
GEMINI_TIMEOUT_MS=30000
GEMINI_MAX_OUTPUT_TOKENS=1800
GEMINI_TEMPERATURE=0.4

RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX=20
LOGIN_IDENTIFIER_RATE_LIMIT_MAX=8
GEN_AI_RATE_LIMIT_WINDOW_MS=900000
GEN_AI_RATE_LIMIT_MAX=30
```

Jika AI service belum dideploy, isi sementara:

```env
AI_SERVICE_URL=http://127.0.0.1:8000
```

Dashboard tetap bisa membaca data prediksi yang sudah tersimpan di TiDB, tetapi endpoint live AI health/predict akan gagal sampai AI service aktif.

## 4. Deploy Frontend Vercel

Import GitHub repo ke Vercel.

Settings:

```text
Root Directory: apps/web
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

Environment:

```env
VITE_API_BASE_URL=https://your-api-domain/api
```

Setelah frontend URL jadi, kembali ke API environment dan update:

```env
CLIENT_URLS=https://your-frontend-domain.vercel.app
```

Redeploy API setelah env berubah.

## 5. Deploy AI Service

AI service berada di `apps/ai`.

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Environment:

```env
PINTARIN_AI_MODEL_DIR=/app/models
```

File artifact yang wajib tersedia di runtime AI:

- `pintarin_metadata.json`
- `pintarin_risk_scoring.keras`
- `pintarin_hybrid_recommendation.keras`
- `pintarin_scaler.pkl`
- `pintarin_le_kecamatan.pkl`

Catatan cepat untuk capstone: karena file `.keras` dan `.pkl` di-ignore oleh git, deploy AI service baru berhasil kalau artifact tersebut di-upload ke runtime, disimpan di object storage, dimasukkan ke container image, atau di-force-add ke repo private.

## 6. Health Check Setelah Deploy

Cek API:

```text
GET https://your-api-domain/api/health
```

Cek frontend:

```text
https://your-frontend-domain.vercel.app
```

Cek AI service:

```text
GET https://your-ai-service-domain/health
```

Expected API health: response JSON sukses.

Expected AI health:

```json
{
  "success": true,
  "service": "pintarin-ai-service",
  "status": "ready",
  "model_version": "..."
}
```

## 7. Akun Demo

Setelah seed dan reset password:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `pintarin` |
| Dinas | `dinas` | `pintarindinas` |
| CSR | `csr` | `pintarincsr` |
| Sekolah | `school` | `pintarinschool` |

Jangan gunakan credential demo untuk production publik jangka panjang.

## 8. Checklist Singkat Sebelum Submit

- TiDB schema sudah terisi migration 001-007.
- Seed utama, password demo, dan AI data sudah masuk.
- API `/api/health` bisa diakses.
- Frontend bisa login dan membuka dashboard.
- `CLIENT_URLS` API sama dengan domain Vercel.
- `VITE_API_BASE_URL` frontend sama dengan domain API.
- `DB_SSL=true` untuk TiDB.
- `JWT_SECRET` sudah diganti dari placeholder.
- Model AI tersedia jika endpoint AI live ingin didemokan.
