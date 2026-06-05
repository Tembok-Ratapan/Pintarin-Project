import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";
import { getDashboardPathByRole } from "../../features/dashboard/dashboardRoutes";
import BrandLogo from "../brand/BrandLogo";
import Button from "../ui/Button";

const navItems = [
  { label: "Peta Risiko", href: "/#risk-map" },
  { label: "Produk", href: "/#product" },
  { label: "Alur Sistem", href: "/#workflow" },
  { label: "Tim", href: "/#team" },
];

export default function PublicLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const dashboardPath = getDashboardPathByRole(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-50 border-b border-white/55 bg-white/40 shadow-sm shadow-slate-200/25 ring-1 ring-white/35 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/34">
        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 xl:px-12">
          <Link
            to="/"
            className="min-w-0 shrink-0"
            aria-label="Kembali ke halaman utama PINTARIN"
          >
            <BrandLogo />
          </Link>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-8 text-sm font-semibold text-[#475569] md:flex"
            aria-label="Navigasi utama"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-[#0F766E]"
              >
                {item.label}
              </a>
            ))}

            {isAuthenticated && (
              <Link
                to={dashboardPath}
                className="transition hover:text-[#0F766E]"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {isAuthenticated ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to={dashboardPath}
                className="hidden max-w-[9rem] truncate text-sm font-bold text-[#102A43] sm:block"
                title={user?.full_name || user?.username || "Dashboard"}
              >
                {user?.full_name || user?.username || "Dashboard"}
              </Link>

              <Button size="sm" variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login" className="shrink-0">
              <Button size="sm">Masuk</Button>
            </Link>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  );
}
