import { useState } from "react";
import {
  BarChart3,
  Building2,
  Eye,
  GraduationCap,
  HandHeart,
  Home,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  ShieldCheck,
  UserRoundCog,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import BrandLogo from "../../../components/brand/BrandLogo";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../auth/useAuth";
import { getDashboardPathByRole } from "../dashboardRoutes";

const roleLabels = {
  admin: "Administrator",
  officer: "Petugas Dinas",
  analyst: "Data Analyst",
  csr_partner: "Mitra CSR",
  school_operator: "Operator Sekolah",
  viewer: "Viewer",
};

const dashboardNavByRole = {
  admin: [
    {
      label: "Admin Overview",
      path: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Human Review",
      path: "/dashboard/officer",
      icon: ShieldCheck,
    },
    {
      label: "Analytics",
      path: "/dashboard/analyst",
      icon: BarChart3,
    },
    {
      label: "CSR Matching",
      path: "/dashboard/csr",
      icon: HandHeart,
    },
    {
      label: "School Context",
      path: "/dashboard/school",
      icon: GraduationCap,
    },
    {
      label: "Viewer Mode",
      path: "/dashboard/viewer",
      icon: Eye,
    },
  ],
  officer: [
    {
      label: "Review Queue",
      path: "/dashboard/officer",
      icon: ShieldCheck,
    },
  ],
  analyst: [
    {
      label: "Analytics Overview",
      path: "/dashboard/analyst",
      icon: BarChart3,
    },
  ],
  csr_partner: [
    {
      label: "CSR Matching",
      path: "/dashboard/csr",
      icon: HandHeart,
    },
  ],
  school_operator: [
    {
      label: "School Context",
      path: "/dashboard/school",
      icon: GraduationCap,
    },
  ],
  viewer: [
    {
      label: "Read-only Summary",
      path: "/dashboard/viewer",
      icon: Eye,
    },
  ],
};

const utilityNavItems = [
  {
    label: "Landing Page",
    path: "/",
    icon: Home,
  },
  {
    label: "Peta Risiko",
    path: "/#risk-map",
    icon: MapPinned,
    isAnchor: true,
  },
];

const getRoleLabel = (role) => roleLabels[role] || roleLabels.viewer;

const getDashboardNavItems = (role) => {
  return dashboardNavByRole[role] || dashboardNavByRole.viewer;
};

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || "viewer";
  const dashboardPath = getDashboardPathByRole(role);
  const roleNavItems = getDashboardNavItems(role);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-5">
        <Link
          to={dashboardPath}
          onClick={onNavigate}
          aria-label="Dashboard PINTARIN"
        >
          <BrandLogo />
        </Link>
      </div>

      <div className="px-4">
        <div className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 shadow-sm shadow-slate-200/20 ring-1 ring-white/40 backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
              <UserRoundCog size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#102A43]">
                {user?.full_name || user?.username || "PINTARIN User"}
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-[#64748B]">
                {getRoleLabel(role)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-7 overflow-y-auto px-4 pb-4">
        <div>
          <p className="mb-2 px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8]">
            Workspace
          </p>

          <div className="space-y-1.5">
            {roleNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition",
                      isActive
                        ? "bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/18"
                        : "text-[#475569] hover:bg-white/55 hover:text-[#0F766E]",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8]">
            Navigation
          </p>

          <div className="space-y-1.5">
            {utilityNavItems.map((item) => {
              const Icon = item.icon;

              if (item.isAnchor) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-[#475569] transition hover:bg-white/55 hover:text-[#0F766E]"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-[#475569] transition hover:bg-white/55 hover:text-[#0F766E]"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/60 p-4">
        <Button
          variant="secondary"
          className="w-full justify-center"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function DashboardAppLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(94,234,212,0.24),transparent_32%),radial-gradient(circle_at_85%_14%,rgba(15,118,110,0.10),transparent_28%),linear-gradient(135deg,rgba(248,250,252,0.98)_0%,rgba(236,254,255,0.76)_42%,rgba(255,255,255,0.96)_100%)]" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] border-r border-white/65 bg-white/42 shadow-xl shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl lg:block">
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu dashboard"
            className="absolute inset-0 bg-[#0B172A]/35 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 w-[19rem] max-w-[86vw] border-r border-white/65 bg-white/86 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl">
            <div className="absolute right-3 top-3">
              <button
                type="button"
                aria-label="Tutup sidebar"
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[#102A43] ring-1 ring-white/50 transition hover:bg-white"
              >
                <X size={19} />
              </button>
            </div>

            <SidebarContent onNavigate={() => setIsSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/42 shadow-sm shadow-slate-200/25 ring-1 ring-white/35 backdrop-blur-2xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/65 text-[#102A43] ring-1 ring-white/50 transition hover:bg-white lg:hidden"
                aria-label="Buka menu dashboard"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#94A3B8]">
                  PINTARIN Workspace
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-[#102A43]">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                <Building2 size={18} />
              </div>

              <div className="max-w-[15rem] text-right">
                <p className="truncate text-sm font-extrabold text-[#102A43]">
                  {user?.full_name || user?.username || "PINTARIN User"}
                </p>
                <p className="truncate text-xs font-semibold text-[#64748B]">
                  {user?.institution || "PINTARIN Workspace"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
