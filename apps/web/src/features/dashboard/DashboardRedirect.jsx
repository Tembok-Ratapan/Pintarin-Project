import { Navigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { getDashboardPathByRole } from "./dashboardRoutes";

export default function DashboardRedirect() {
  const { user } = useAuth();

  return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
}