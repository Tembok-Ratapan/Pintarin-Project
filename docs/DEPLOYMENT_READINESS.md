# Deployment Readiness

Dokumen ini adalah checklist minimum sebelum PINTARIN dibuka untuk user publik.

## Status Saat Ini

PINTARIN sudah memiliki fondasi deploy yang baik untuk capstone: frontend buildable, backend modular, role-based access control, human-in-the-loop validation, CSR matching, dan AI service terpisah.

Namun deploy publik baru layak dilakukan setelah item wajib di bawah selesai.

## Wajib Sebelum Deploy

- Gunakan `NODE_ENV=production` di API.
- Set `JWT_SECRET` dengan nilai acak panjang, minimal 64 karakter.
- Set `CLIENT_URLS` sesuai domain frontend Vercel/production.
- Set `TRUST_PROXY=true` ketika API berjalan di Railway/Render/Fly.io di belakang reverse proxy.
- Pastikan MySQL production memakai user non-root dan password kuat.
- Jalankan migration SQL berurutan dari `001_init_schema.sql` sampai `006_drop_legacy_unused_tables.sql`.
- Jalankan seed/import sesuai kebutuhan demo production.
- Pastikan file model AI `.keras` dan `.pkl` tersedia di runtime AI service.
- Set `AI_SERVICE_URL` pada API ke URL internal/public service AI.
- Set `GEMINI_API_KEY` jika menu Gen AI diaktifkan.
- Jalankan `npm run lint:web`, `npm run build:web`, dan `npm run test:api`.
- Jalankan `npm audit --workspaces --omit=dev --audit-level=high`.

## Strategi Deploy yang Direkomendasikan

### Frontend

- Platform: Vercel
- Build command: `npm --workspace apps/web run build`
- Output directory: `apps/web/dist`
- Env:

```env
VITE_API_BASE_URL=https://api-domain.example.com/api
```

### API

- Platform: Railway, Render, Fly.io, atau VPS
- Start command: `npm --workspace apps/api run start`
- Env:

```env
NODE_ENV=production
PORT=5000
CLIENT_URLS=https://frontend-domain.example.com
TRUST_PROXY=true
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
JWT_EXPIRES_IN=1d
AI_SERVICE_URL=https://ai-service-domain.example.com
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
RATE_LIMIT_ENABLED=true
```

### AI Service

- Platform: container/VPS yang mendukung TensorFlow.
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Env:

```env
PINTARIN_AI_MODEL_DIR=/app/models
```

File berikut wajib tersedia di `PINTARIN_AI_MODEL_DIR`:

- `pintarin_metadata.json`
- `pintarin_risk_scoring.keras`
- `pintarin_hybrid_recommendation.keras`
- `pintarin_scaler.pkl`
- `pintarin_le_kecamatan.pkl`

Karena `.keras` dan `.pkl` di-ignore oleh git, simpan model sebagai release artifact, object storage, atau build ke container image yang private.

## Security Notes

- Login API sudah dilindungi rate limiter in-memory. Untuk multi-instance production, pindahkan limiter ke Redis agar counter konsisten antar instance.
- Token frontend saat ini disimpan di `sessionStorage`, bukan `localStorage`, untuk mengurangi risiko token bertahan permanen. Untuk production skala serius, pertimbangkan migrasi ke HttpOnly Secure cookie dengan CSRF protection.
- Hindari menampilkan credential demo pada UI production.
- Pastikan CORS hanya mengizinkan domain frontend resmi.
- Jangan mengekspos service AI langsung ke publik jika tidak perlu; idealnya akses hanya dari API.
- Jangan pernah menaruh `GEMINI_API_KEY` di frontend; key hanya boleh berada di API environment.

## Operational Monitoring

Minimum monitoring yang disarankan:

- API health endpoint: `/api/health`
- AI health endpoint: `/health`
- Log error 5xx API
- Log gagal login berulang
- DB connection utilization
- Latency endpoint AI batch prediction
- Latency dan error rate endpoint Gen AI `/api/gen-ai/chat`
- Jumlah pending human review

## Keputusan Deploy

Deploy untuk demo capstone: layak setelah checklist wajib selesai.

Deploy untuk banyak user production: butuh tambahan Redis-backed rate limit/session strategy, backup database, observability, dan pengujian load sederhana.
