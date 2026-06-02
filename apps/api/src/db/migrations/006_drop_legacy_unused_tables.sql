-- Legacy tables removed from the active PINTARIN data model.
-- Runtime features use education_indicators, predictions, analytics_snapshots,
-- school_need_requests, csr_aid_proposals, csr_match_logs, and audit_logs.

DROP TABLE IF EXISTS population_education_records;
DROP TABLE IF EXISTS risk_records;
DROP TABLE IF EXISTS csr_programs;
