CREATE TABLE IF NOT EXISTS education_indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,

  source_dataset VARCHAR(120) NOT NULL DEFAULT 'PINTARIN_MASTER_FINAL_5000_TERBARU',
  source_row_number INT NOT NULL,

  region_id INT DEFAULT NULL,
  kecamatan VARCHAR(120) NOT NULL,
  year SMALLINT NOT NULL,

  total_population INT DEFAULT 0,
  total_vulnerable_population DECIMAL(14, 2) DEFAULT 0,
  total_pip_aid DECIMAL(14, 2) DEFAULT 0,
  total_pre_school DECIMAL(14, 2) DEFAULT 0,
  sd_count DECIMAL(10, 2) DEFAULT 0,
  vulnerable_ratio DECIMAL(10, 6) DEFAULT 0,

  historical_risk_label ENUM('Rendah', 'Sedang', 'Tinggi') DEFAULT NULL,

  rasio_pip_per_rentan DECIMAL(14, 6) DEFAULT 0,
  rasio_sd_per_populasi DECIMAL(14, 6) DEFAULT 0,
  gap_bantuan DECIMAL(16, 4) DEFAULT 0,
  urgency_score DECIMAL(14, 6) DEFAULT 0,
  tahun_norm DECIMAL(10, 6) DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  UNIQUE KEY uq_education_source_row (source_dataset, source_row_number),
  INDEX idx_education_region_id (region_id),
  INDEX idx_education_kecamatan (kecamatan),
  INDEX idx_education_year (year),
  INDEX idx_education_risk_label (historical_risk_label),
  INDEX idx_education_region_year (region_id, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;