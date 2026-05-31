export const dashboardRoleRoutes = {
  admin: "/dashboard/admin",
  officer: "/dashboard/officer",
  analyst: "/dashboard/analyst",
  csr_partner: "/dashboard/csr",
  school_operator: "/dashboard/school",
  viewer: "/dashboard/viewer",
};

export const getDashboardPathByRole = (role) => {
  return dashboardRoleRoutes[role] || dashboardRoleRoutes.viewer;
};