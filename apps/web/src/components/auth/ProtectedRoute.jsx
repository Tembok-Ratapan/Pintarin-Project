import { Navigate, useLocation } from "react-router-dom";

import LoadingState from "../feedback/LoadingState";
import { useAuth } from "../../features/auth/useAuth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <LoadingState label="Memeriksa sesi pengguna..." />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasRoleAccess =
    allowedRoles.length === 0 || allowedRoles.includes(user?.role);

  if (!hasRoleAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
}