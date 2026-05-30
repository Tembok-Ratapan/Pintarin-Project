const ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  SCHOOL_OPERATOR: 'school_operator',
  CSR_PARTNER: 'csr_partner',
  VIEWER: 'viewer',
  ANALYST: 'analyst',
}

const ALL_ROLES = Object.values(ROLES)

module.exports = {
  ROLES,
  ALL_ROLES,
}