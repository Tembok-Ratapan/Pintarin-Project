import { useState } from "react";
import { Building2, LogOut, Menu, UserRoundCog, X } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import BrandLogo from "../../../components/brand/BrandLogo";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../auth/useAuth";
import {
  dashboardUtilityNav,
  getDashboardNavItems,
  getDashboardRoleMeta,
} from "../dashboardNavigation";
import { getDashboardPathByRole } from "../dashboardRoutes";

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;

  if (item.isAnchor) {
    return (
      <a
        href={item.path}
        onClick={onNavigate}
        className="flex min-w-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold text-[#475569] transition hover:bg-white/58 hover:text-[#0F766E]"
      >
        <Icon size={18} className="shrink-0" />
        <span className="truncate">{item.label}</span>
      </a>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex min-w-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold transition",
          isActive
            ? "bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/18"
            : "text-[#475569] hover:bg-white/58 hover:text-[#0F766E]",
        ].join(" ")
      }
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || "viewer";
  const roleMeta = getDashboardRoleMeta(role);
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
        <div className="rounded-[1.5rem] border border-white/70 bg-white/48 p-4 shadow-sm shadow-slate-200/20 ring-1 ring-white/40 backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
              <UserRoundCog size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#102A43]">
                {user?.full_name || user?.username || "PINTARIN User"}
              </p>

              <p className="mt-1 truncate text-xs font-bold text-[#0F766E]">
                {roleMeta.workspace}
              </p>

              <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-[#64748B]">
                {roleMeta.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-7 overflow-y-auto px-4 pb-4">
        <div>
          <p className="mb-2 px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8]">
            Menu
          </p>

          <div className="space-y-1.5">
            {roleNavItems.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        {dashboardUtilityNav.length > 0 && (
          <div>
            <p className="mb-2 px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8]">
              Umum
            </p>

            <div className="space-y-1.5">
              {dashboardUtilityNav.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-white/60 p-4">
        <Button
          variant="secondary"
          className="w-full justify-center"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Keluar
        </Button>
      </div>
    </div>
  );
}

export default function DashboardAppLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const roleMeta = getDashboardRoleMeta(user?.role);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="pintarin-page-bg pointer-events-none fixed inset-0 -z-10" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[18rem] border-r border-white/65 bg-white/42 shadow-xl shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl lg:block">
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

      <div className="lg:pl-[18rem]">
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
                  {roleMeta.label}
                </p>

                <p className="mt-0.5 text-sm font-extrabold text-[#102A43]">
                  {roleMeta.workspace}
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
