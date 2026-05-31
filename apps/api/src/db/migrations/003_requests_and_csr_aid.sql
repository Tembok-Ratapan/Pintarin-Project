CREATE TABLE IF NOT EXISTS school_need_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_code VARCHAR(40) NOT NULL UNIQUE,

  school_id INT DEFAULT NULL,
  region_id INT DEFAULT NULL,
  submitted_by INT NOT NULL,

  category VARCHAR(80) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  urgency ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT 'Sedang',
  requested_value DECIMAL(16, 2) DEFAULT 0,

  evidence_url VARCHAR(500),
  evidence_note TEXT,

  status ENUM('Diajukan', 'Ditinjau', 'Disetujui', 'Ditolak', 'Disalurkan') DEFAULT 'Diajukan',
  reviewed_by INT DEFAULT NULL,
  review_note TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  FOREIGN KEY (submitted_by) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_school_requests_status (status),
  INDEX idx_school_requests_school_id (school_id),
  INDEX idx_school_requests_region_id (region_id),
  INDEX idx_school_requests_submitted_by (submitted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS csr_aid_proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_code VARCHAR(40) NOT NULL UNIQUE,

  submitted_by INT NOT NULL,

  allocation_type ENUM('sekolah_tertentu', 'fleksibel') NOT NULL DEFAULT 'fleksibel',
  target_school_id INT DEFAULT NULL,
  target_region_id INT DEFAULT NULL,

  aid_name VARCHAR(180) NOT NULL,
  aid_type VARCHAR(80) NOT NULL,
  aid_value DECIMAL(16, 2) DEFAULT 0,
  description TEXT,
  evidence_url VARCHAR(500),

  status ENUM('Diajukan', 'Ditinjau', 'Disetujui', 'Ditolak', 'Disalurkan', 'Selesai') DEFAULT 'Diajukan',
  reviewed_by INT DEFAULT NULL,
  review_note TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (submitted_by) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  FOREIGN KEY (target_school_id) REFERENCES schools(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  FOREIGN KEY (target_region_id) REFERENCES regions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_csr_aid_status (status),
  INDEX idx_csr_aid_allocation_type (allocation_type),
  INDEX idx_csr_aid_target_school_id (target_school_id),
  INDEX idx_csr_aid_target_region_id (target_region_id),
  INDEX idx_csr_aid_submitted_by (submitted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT IGNORE INTO school_need_requests (
  request_code,
  school_id,
  region_id,
  submitted_by,
  category,
  title,
  description,
  urgency,
  requested_value,
  evidence_url,
  evidence_note,
  status
)
SELECT
  CONCAT('REQ-SCH-', LPAD(s.id, 4, '0')),
  s.id,
  s.region_id,
  u.id,
  CASE
    WHEN MOD(s.id, 4) = 0 THEN 'Internet'
    WHEN MOD(s.id, 4) = 1 THEN 'Laptop'
    WHEN MOD(s.id, 4) = 2 THEN 'Renovasi'
    ELSE 'Beasiswa'
  END,
  CASE
    WHEN MOD(s.id, 4) = 0 THEN 'Bantuan internet belajar'
    WHEN MOD(s.id, 4) = 1 THEN 'Bantuan perangkat laptop'
    WHEN MOD(s.id, 4) = 2 THEN 'Perbaikan ruang belajar'
    ELSE 'Beasiswa siswa rentan'
  END,
  CASE
    WHEN MOD(s.id, 4) = 0 THEN 'Sekolah membutuhkan akses internet yang lebih stabil untuk kegiatan pembelajaran digital.'
    WHEN MOD(s.id, 4) = 1 THEN 'Sekolah membutuhkan perangkat laptop untuk mendukung kegiatan belajar dan administrasi.'
    WHEN MOD(s.id, 4) = 2 THEN 'Beberapa ruang belajar membutuhkan perbaikan agar kegiatan belajar lebih nyaman.'
    ELSE 'Sebagian siswa membutuhkan dukungan biaya agar tetap dapat mengikuti pembelajaran.'
  END,
  CASE
    WHEN MOD(s.id, 3) = 0 THEN 'Tinggi'
    WHEN MOD(s.id, 3) = 1 THEN 'Sedang'
    ELSE 'Rendah'
  END,
  CASE
    WHEN MOD(s.id, 4) = 0 THEN 15000000
    WHEN MOD(s.id, 4) = 1 THEN 35000000
    WHEN MOD(s.id, 4) = 2 THEN 50000000
    ELSE 25000000
  END,
  NULL,
  'Dummy evidence: data pendukung akan diganti dengan dokumen asli.',
  CASE
    WHEN MOD(s.id, 5) = 0 THEN 'Ditinjau'
    ELSE 'Diajukan'
  END
FROM schools s
CROSS JOIN (
  SELECT id
  FROM users
  WHERE role IN ('school_operator', 'admin')
  ORDER BY role = 'school_operator' DESC
  LIMIT 1
) u
LIMIT 8;


INSERT IGNORE INTO csr_aid_proposals (
  proposal_code,
  submitted_by,
  allocation_type,
  target_school_id,
  target_region_id,
  aid_name,
  aid_type,
  aid_value,
  description,
  evidence_url,
  status
)
SELECT
  'CSR-AID-0001',
  u.id,
  'fleksibel',
  NULL,
  NULL,
  'Paket Internet Belajar',
  'Internet',
  75000000,
  'Bantuan fleksibel untuk sekolah yang membutuhkan akses internet pembelajaran.',
  NULL,
  'Diajukan'
FROM (
  SELECT id
  FROM users
  WHERE role IN ('csr_partner', 'admin')
  ORDER BY role = 'csr_partner' DESC
  LIMIT 1
) u;


INSERT IGNORE INTO csr_aid_proposals (
  proposal_code,
  submitted_by,
  allocation_type,
  target_school_id,
  target_region_id,
  aid_name,
  aid_type,
  aid_value,
  description,
  evidence_url,
  status
)
SELECT
  'CSR-AID-0002',
  u.id,
  'sekolah_tertentu',
  s.id,
  s.region_id,
  'Bantuan Laptop Sekolah',
  'Laptop',
  120000000,
  'Bantuan perangkat laptop untuk sekolah tertentu.',
  NULL,
  'Ditinjau'
FROM (
  SELECT id
  FROM users
  WHERE role IN ('csr_partner', 'admin')
  ORDER BY role = 'csr_partner' DESC
  LIMIT 1
) u
CROSS JOIN (
  SELECT id, region_id
  FROM schools
  ORDER BY id ASC
  LIMIT 1
) s;


INSERT IGNORE INTO csr_aid_proposals (
  proposal_code,
  submitted_by,
  allocation_type,
  target_school_id,
  target_region_id,
  aid_name,
  aid_type,
  aid_value,
  description,
  evidence_url,
  status
)
SELECT
  'CSR-AID-0003',
  u.id,
  'fleksibel',
  NULL,
  r.id,
  'Dana Beasiswa Wilayah',
  'Beasiswa',
  200000000,
  'Bantuan fleksibel untuk siswa rentan pada wilayah prioritas.',
  NULL,
  'Diajukan'
FROM (
  SELECT id
  FROM users
  WHERE role IN ('csr_partner', 'admin')
  ORDER BY role = 'csr_partner' DESC
  LIMIT 1
) u
CROSS JOIN (
  SELECT id
  FROM regions
  ORDER BY id ASC
  LIMIT 1
) r;