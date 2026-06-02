const dashboardRoleAliases = {
  admin: "admin",
  analyst: "analyst",
  analitik: "analyst",
  csr: "csr_partner",
  csr_partner: "csr_partner",
  dinas: "officer",
  officer: "officer",
  school: "school_operator",
  school_operator: "school_operator",
  sekolah: "school_operator",
  viewer: "viewer",
};

export const dashboardRoleRoutes = {
  admin: "/dashboard/admin",
  officer: "/dashboard/officer/overview",
  analyst: "/dashboard/analyst",
  csr_partner: "/dashboard/csr/overview",
  school_operator: "/dashboard/school/overview",
  viewer: "/dashboard/viewer",
};

export const normalizeDashboardRole = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  return dashboardRoleAliases[normalizedRole] || normalizedRole;
};

export const getDashboardPathByRole = (role) => {
  return (
    dashboardRoleRoutes[normalizeDashboardRole(role)] || dashboardRoleRoutes.viewer
  );
};
