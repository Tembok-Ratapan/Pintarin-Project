const roles = {
  ADMIN: "admin",
  OFFICER: "officer",
  ANALYST: "analyst",
  CSR: "csr_partner",
  SCHOOL: "school_operator",
  VIEWER: "viewer",
};

const roleGroups = {
  ALL_AUTHENTICATED: [
    roles.ADMIN,
    roles.OFFICER,
    roles.ANALYST,
    roles.CSR,
    roles.SCHOOL,
    roles.VIEWER,
  ],

  DATA_READERS: [
    roles.ADMIN,
    roles.OFFICER,
    roles.ANALYST,
    roles.CSR,
    roles.SCHOOL,
    roles.VIEWER,
  ],

  DECISION_MAKERS: [roles.ADMIN, roles.OFFICER],

  CSR_WORKERS: [roles.ADMIN, roles.OFFICER, roles.CSR],

  SCHOOL_WORKERS: [roles.ADMIN, roles.OFFICER, roles.SCHOOL],

  ADMIN_ONLY: [roles.ADMIN],
};

module.exports = {
  roles,
  roleGroups,
};