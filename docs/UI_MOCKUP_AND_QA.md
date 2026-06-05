# UI Mockup and QA

Tanggal: 2026-06-04

Mockup ini menjadi representasi visual repo-native untuk alur utama PINTARIN. Implementasi final berada di React dashboard, tetapi dokumen ini membantu reviewer melihat struktur layar dan tujuan UI tanpa harus membuka Figma.

## Landing Page

```text
+--------------------------------------------------------------+
| Navbar: Logo, Produk, Cara Kerja, Tim, Login                 |
+--------------------------------------------------------------+
| Hero: PINTARIN, value proposition, CTA Login, risk preview   |
+--------------------------------------------------------------+
| Ringkasan solusi: prioritas wilayah, CSR, human validation   |
+--------------------------------------------------------------+
| Footer: info tim dan identitas capstone                      |
+--------------------------------------------------------------+
```

## Dashboard Umum

```text
+-------------------+------------------------------------------+
| Sidebar role menu | Header: role, profile, logout            |
|                   +------------------------------------------+
| Overview          | KPI cards, chart, map/table, action list |
| Map Risk          |                                          |
| Pengajuan         | Content changes by selected menu          |
| Gen AI            |                                          |
+-------------------+------------------------------------------+
```

## Flow Sekolah

```text
Login Sekolah
  -> Overview
  -> Pengajuan Bantuan
  -> Isi kategori, nilai, deskripsi, bukti
  -> Submit ke REST API
  -> Riwayat Pengajuan
  -> Edit/hapus selama status masih editable
```

## Flow Dinas/Admin

```text
Login Dinas/Admin
  -> Map Risk dan Analitik
  -> Validasi Sekolah/CSR
  -> Review AI low-confidence
  -> Approve, override, flag for review
  -> Audit trail tersimpan
```

## Flow CSR

```text
Login CSR
  -> Map Risk
  -> AI Matching
  -> Pilih fokus dan budget
  -> Buat proposal bantuan
  -> Pantau status proposal
```

## Responsive QA

| Area | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Landing | Section menumpuk vertikal, CTA tetap terlihat | Grid mulai membagi konten penting | Hero dan section informasi terbaca lebar |
| Dashboard shell | Sidebar/menu tetap dapat diakses | Konten memakai grid sedang | Sidebar + content bekerja sebagai layout utama |
| Form pengajuan | Field menumpuk dan tombol tidak overflow | Field mulai berkelompok | Field dan ringkasan nyaman dipindai |
| Card/FAQ | Teks wrap, tidak memaksa overflow | Card 2 kolom bila cukup | Card 3 kolom untuk scanning |
| Map/analytics | Panel tetap dapat discroll | Peta dan detail berdekatan | Peta, chart, dan insight tampil berdampingan |

## QA Checklist

- Tidak ada teks penting yang bergantung pada warna saja.
- Tombol aksi utama memiliki label jelas.
- Data operasional tidak diubah langsung dari frontend tanpa API.
- Role menu tidak menampilkan aksi di luar izin user.
- Tabel AI/generated/log dibuat read-only di Manage Database.
- Asset hero produk memakai versi optimized untuk mengurangi beban build dan page load.
