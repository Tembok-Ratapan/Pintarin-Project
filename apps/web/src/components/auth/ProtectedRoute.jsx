import { Link, Navigate, useLocation } from "react-router-dom";

import LoadingState from "../feedback/LoadingState";
import { useAuth } from "../../features/auth/useAuth";
import {
  getDashboardPathByRole,
  normalizeDashboardRole,
} from "../../features/dashboard/dashboardRoutes";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const normalizedRole = normalizeDashboardRole(user?.role);

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
    allowedRoles.length === 0 || allowedRoles.includes(normalizedRole);

  if (!hasRoleAccess) {
    const fallbackPath = getDashboardPathByRole(normalizedRole);

    if (location.pathname !== fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }

    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-[1.75rem] border border-white/70 bg-white/58 p-6 shadow-xl shadow-slate-200/35 ring-1 ring-white/40 backdrop-blur-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0F766E]">
            Akses dashboard
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-[#102A43]">
            Role akun belum cocok dengan halaman ini.
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-[#64748B]">
            Role saat ini: {user?.role || "tidak tersedia"}. Gunakan akun
            dengan role yang sesuai atau kembali ke dashboard utama.
          </p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#0F766E] px-5 text-sm font-extrabold text-white shadow-lg shadow-[#0F766E]/18 transition hover:bg-[#115E59]"
          >
            Kembali ke dashboard
          </Link>
        </div>
      </main>
    );
  }

  return children;
}
