SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS prediction_validations;
DROP TABLE IF EXISTS csr_match_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS analytics_snapshots;
DROP TABLE IF EXISTS csr_programs;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS risk_records;
DROP TABLE IF EXISTS population_education_records;
DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS regions;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  region_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL UNIQUE,
  city VARCHAR(120) DEFAULT 'Kota Bandung',
  province VARCHAR(120) DEFAULT 'Jawa Barat',
  postal_code VARCHAR(20),
  village_count INT DEFAULT 0,
  village_list TEXT,
  area_km2 DECIMAL(10, 2),
  center_latitude DECIMAL(11, 8),
  center_longitude DECIMAL(11, 8),
  avg_population INT DEFAULT 0,
  avg_vulnerable_population DECIMAL(12, 2) DEFAULT 0,
  avg_vulnerable_ratio DECIMAL(8, 4) DEFAULT 0,
  dominant_risk_status ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_regions_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_code VARCHAR(30) NOT NULL UNIQUE,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  full_name VARCHAR(180) NOT NULL,
  role ENUM('admin', 'officer', 'school_operator', 'csr_partner', 'viewer', 'analyst') NOT NULL DEFAULT 'viewer',
  source_role VARCHAR(80),
  institution VARCHAR(180),
  region_id INT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_users_role (role),
  INDEX idx_users_region_id (region_id),
  INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_code VARCHAR(30) NOT NULL UNIQUE,
  region_id INT NOT NULL,
  name VARCHAR(220) NOT NULL,
  level ENUM('SD', 'SMP', 'SMA', 'SMK') NOT NULL,
  city VARCHAR(120) DEFAULT 'Kota Bandung',
  ownership_status ENUM('Negeri', 'Swasta') DEFAULT NULL,
  accreditation VARCHAR(40),
  student_count INT DEFAULT 0,
  teacher_count INT DEFAULT 0,
  classroom_count INT DEFAULT 0,
  latitude DECIMAL(11, 8),
  longitude DECIMAL(11, 8),
  established_year SMALLINT,
  npsn VARCHAR(40),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  INDEX idx_schools_region_id (region_id),
  INDEX idx_schools_level (level),
  INDEX idx_schools_accreditation (accreditation),
  INDEX idx_schools_npsn (npsn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE population_education_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_id BIGINT DEFAULT NULL,
  region_id INT DEFAULT NULL,

  province_code VARCHAR(30),
  province_name VARCHAR(120),

  bps_city_code VARCHAR(30),
  bps_city_name VARCHAR(120),
  bps_district_code VARCHAR(30),
  bps_district_name VARCHAR(120),
  bps_village_code VARCHAR(30),
  bps_village_name VARCHAR(120),

  kemendagri_district_code VARCHAR(30),
  kemendagri_district_name VARCHAR(120),
  kemendagri_village_code VARCHAR(30),
  kemendagri_village_name VARCHAR(120),

  education_type VARCHAR(120) NOT NULL,
  population_count INT DEFAULT 0,
  unit VARCHAR(50),
  semester VARCHAR(30),
  year SMALLINT NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_population_region_id (region_id),
  INDEX idx_population_year (year),
  INDEX idx_population_education_type (education_type),
  INDEX idx_population_district_name (kemendagri_district_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE risk_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  risk_code VARCHAR(30) NOT NULL UNIQUE,
  region_id INT NOT NULL,
  year SMALLINT NOT NULL,

  total_population INT DEFAULT 0,
  total_vulnerable_population DECIMAL(12, 2) DEFAULT 0,
  total_pip_aid DECIMAL(12, 2) DEFAULT 0,
  total_pre_school DECIMAL(12, 2) DEFAULT 0,
  sd_count DECIMAL(10, 2) DEFAULT 0,

  vulnerable_ratio DECIMAL(8, 4) DEFAULT 0,
  risk_status ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL,
  risk_score DECIMAL(8, 4) DEFAULT 0,
  risk_trend ENUM('Meningkat', 'Menurun', 'Stabil') DEFAULT NULL,
  notes TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  INDEX idx_risk_region_id (region_id),
  INDEX idx_risk_year (year),
  INDEX idx_risk_status (risk_status),
  INDEX idx_risk_score (risk_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prediction_code VARCHAR(30) NOT NULL UNIQUE,
  region_id INT NOT NULL,

  data_year SMALLINT NOT NULL,
  prediction_year SMALLINT NOT NULL,

  model_version VARCHAR(80),
  algorithm VARCHAR(80),
  input_features JSON,

  actual_score DECIMAL(8, 4) DEFAULT NULL,
  predicted_score DECIMAL(8, 4) NOT NULL,

  actual_label ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT NULL,
  predicted_label ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL,
  final_label ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT NULL,

  model_accuracy DECIMAL(8, 4) DEFAULT NULL,
  confidence_score DECIMAL(8, 4) DEFAULT NULL,
  confidence_level ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT NULL,

  mae DECIMAL(8, 4) DEFAULT NULL,
  rmse DECIMAL(8, 4) DEFAULT NULL,
  is_correct BOOLEAN DEFAULT NULL,

  needs_human_review BOOLEAN DEFAULT FALSE,
  is_human_validated BOOLEAN DEFAULT FALSE,
  validation_note TEXT DEFAULT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  INDEX idx_predictions_region_id (region_id),
  INDEX idx_predictions_data_year (data_year),
  INDEX idx_predictions_prediction_year (prediction_year),
  INDEX idx_predictions_predicted_label (predicted_label),
  INDEX idx_predictions_final_label (final_label),
  INDEX idx_predictions_confidence (confidence_score),
  INDEX idx_predictions_human_review (needs_human_review, is_human_validated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prediction_validations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prediction_id INT NOT NULL,
  officer_id INT NOT NULL,
  action ENUM('approve', 'override', 'flag_for_review') NOT NULL,
  reason TEXT,
  corrected_label ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT NULL,
  validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (prediction_id) REFERENCES predictions(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  FOREIGN KEY (officer_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  INDEX idx_prediction_validations_prediction_id (prediction_id),
  INDEX idx_prediction_validations_officer_id (officer_id),
  INDEX idx_prediction_validations_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE csr_programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  csr_code VARCHAR(30) NOT NULL UNIQUE,
  company_name VARCHAR(180) NOT NULL,
  region_id INT NOT NULL,
  school_id INT DEFAULT NULL,

  aid_type VARCHAR(120) NOT NULL,
  aid_value DECIMAL(16, 2) DEFAULT 0,
  recipient_count INT DEFAULT 0,
  program_year SMALLINT NOT NULL,

  submission_date DATE DEFAULT NULL,
  realization_date DATE DEFAULT NULL,

  status ENUM('Diajukan', 'Disetujui', 'Disalurkan', 'Selesai', 'Ditolak') NOT NULL DEFAULT 'Diajukan',
  description TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_csr_region_id (region_id),
  INDEX idx_csr_school_id (school_id),
  INDEX idx_csr_company_name (company_name),
  INDEX idx_csr_year (program_year),
  INDEX idx_csr_status (status),
  INDEX idx_csr_aid_type (aid_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE csr_match_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  focus_area ENUM('umum', 'infrastruktur_sd', 'beasiswa', 'angka_putus_sekolah') DEFAULT 'umum',
  budget_range ENUM('semua', 'kecil', 'sedang', 'besar') DEFAULT 'semua',
  results_json JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_csr_match_user_id (user_id),
  INDEX idx_csr_match_focus_area (focus_area),
  INDEX idx_csr_match_budget_range (budget_range)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  log_code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT DEFAULT NULL,
  user_code VARCHAR(30),
  username VARCHAR(80),
  source_role VARCHAR(80),

  action VARCHAR(120) NOT NULL,
  target_table VARCHAR(120),
  target_code VARCHAR(60),
  region_filter VARCHAR(120),

  ip_address VARCHAR(60),
  user_agent TEXT,
  status ENUM('SUCCESS', 'FAILED', 'UNAUTHORIZED') DEFAULT NULL,
  duration_ms INT DEFAULT NULL,
  occurred_at DATETIME NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_status (status),
  INDEX idx_audit_occurred_at (occurred_at),
  INDEX idx_audit_target_table (target_table)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE analytics_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analytics_code VARCHAR(30) NOT NULL UNIQUE,
  region_id INT NOT NULL,
  year SMALLINT NOT NULL,

  total_population INT DEFAULT 0,
  total_vulnerable_population DECIMAL(12, 2) DEFAULT 0,
  vulnerable_ratio DECIMAL(8, 4) DEFAULT 0,

  total_pip_aid DECIMAL(12, 2) DEFAULT 0,
  pip_coverage_pct DECIMAL(8, 4) DEFAULT 0,

  total_pre_school DECIMAL(12, 2) DEFAULT 0,
  sd_count DECIMAL(10, 2) DEFAULT 0,

  risk_status ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT NULL,

  total_schools_in_region INT DEFAULT 0,
  total_csr_programs INT DEFAULT 0,
  total_csr_value DECIMAL(18, 2) DEFAULT 0,

  vulnerability_index DECIMAL(8, 4) DEFAULT 0,
  pip_gap DECIMAL(12, 2) DEFAULT 0,
  risk_ranking INT DEFAULT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  UNIQUE KEY uq_analytics_region_year (region_id, year),
  INDEX idx_analytics_region_id (region_id),
  INDEX idx_analytics_year (year),
  INDEX idx_analytics_risk_status (risk_status),
  INDEX idx_analytics_ranking (risk_ranking)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;