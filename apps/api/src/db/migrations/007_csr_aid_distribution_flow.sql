SET @db_name = DATABASE();

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD COLUMN final_school_id INT DEFAULT NULL AFTER target_region_id',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND COLUMN_NAME = 'final_school_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD COLUMN recommended_school_id INT DEFAULT NULL AFTER final_school_id',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND COLUMN_NAME = 'recommended_school_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD COLUMN recommendation_status ENUM(''Tidak Ada'', ''Direkomendasikan'', ''Diterima CSR'', ''Ditolak CSR'') DEFAULT ''Tidak Ada'' AFTER recommended_school_id',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND COLUMN_NAME = 'recommendation_status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD COLUMN recommendation_note TEXT AFTER recommendation_status',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND COLUMN_NAME = 'recommendation_note'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD COLUMN distributed_by INT DEFAULT NULL AFTER review_note',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND COLUMN_NAME = 'distributed_by'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD COLUMN distributed_at DATETIME DEFAULT NULL AFTER distributed_by',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND COLUMN_NAME = 'distributed_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD INDEX idx_csr_aid_final_school_id (final_school_id)',
    'SELECT 1'
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND INDEX_NAME = 'idx_csr_aid_final_school_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD INDEX idx_csr_aid_recommended_school_id (recommended_school_id)',
    'SELECT 1'
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND INDEX_NAME = 'idx_csr_aid_recommended_school_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD INDEX idx_csr_aid_distributed_by (distributed_by)',
    'SELECT 1'
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND INDEX_NAME = 'idx_csr_aid_distributed_by'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD CONSTRAINT fk_csr_aid_final_school FOREIGN KEY (final_school_id) REFERENCES schools(id)',
    'SELECT 1'
  )
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND CONSTRAINT_NAME = 'fk_csr_aid_final_school'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD CONSTRAINT fk_csr_aid_recommended_school FOREIGN KEY (recommended_school_id) REFERENCES schools(id)',
    'SELECT 1'
  )
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND CONSTRAINT_NAME = 'fk_csr_aid_recommended_school'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE csr_aid_proposals ADD CONSTRAINT fk_csr_aid_distributed_by FOREIGN KEY (distributed_by) REFERENCES users(id)',
    'SELECT 1'
  )
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'csr_aid_proposals'
    AND CONSTRAINT_NAME = 'fk_csr_aid_distributed_by'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DELETE FROM school_need_requests
WHERE request_code LIKE 'REQ-SCH-%'
  AND evidence_note = 'Dummy evidence: data pendukung akan diganti dengan dokumen asli.';

DELETE FROM csr_aid_proposals
WHERE proposal_code IN ('CSR-AID-0001', 'CSR-AID-0002', 'CSR-AID-0003');
