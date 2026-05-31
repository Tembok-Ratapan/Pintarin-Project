CREATE TABLE IF NOT EXISTS stakeholder_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,

  profile_type ENUM('admin', 'dinas', 'sekolah', 'csr', 'analitik', 'viewer') NOT NULL,
  display_name VARCHAR(180) NOT NULL,
  organization_name VARCHAR(180),
  phone VARCHAR(40),
  contact_email VARCHAR(150),
  address TEXT,
  website VARCHAR(220),
  logo_url VARCHAR(500),
  description TEXT,

  region_id INT DEFAULT NULL,
  school_id INT DEFAULT NULL,
  is_verified BOOLEAN DEFAULT FALSE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_profiles_type (profile_type),
  INDEX idx_profiles_region_id (region_id),
  INDEX idx_profiles_school_id (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO stakeholder_profiles (
  user_id,
  profile_type,
  display_name,
  organization_name,
  contact_email,
  description,
  region_id,
  is_verified
)
SELECT
  u.id,
  CASE
    WHEN u.role = 'officer' THEN 'dinas'
    WHEN u.role = 'school_operator' THEN 'sekolah'
    WHEN u.role = 'csr_partner' THEN 'csr'
    WHEN u.role = 'analyst' THEN 'analitik'
    WHEN u.role = 'admin' THEN 'admin'
    ELSE 'viewer'
  END AS profile_type,
  u.full_name,
  COALESCE(u.institution, 'PINTARIN'),
  u.email,
  CASE
    WHEN u.role = 'admin' THEN 'Mengelola data, validasi, dan penyaluran bantuan.'
    WHEN u.role = 'officer' THEN 'Memvalidasi ajuan dan membantu penyaluran bantuan pendidikan.'
    WHEN u.role = 'school_operator' THEN 'Mengelola data dan kebutuhan sekolah.'
    WHEN u.role = 'csr_partner' THEN 'Menyalurkan bantuan pendidikan melalui PINTARIN.'
    WHEN u.role = 'analyst' THEN 'Menganalisis data dan risiko pendidikan.'
    ELSE 'Melihat ringkasan data PINTARIN.'
  END AS description,
  u.region_id,
  CASE
    WHEN u.role IN ('admin', 'officer') THEN TRUE
    ELSE FALSE
  END AS is_verified
FROM users u
ON DUPLICATE KEY UPDATE
  updated_at = CURRENT_TIMESTAMP;