import { useState } from "react";
import {
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  UserRoundCog,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import BrandLogo from "../../../components/brand/BrandLogo";
import Grainient from "../../../components/ui/Grainient";
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

const groupNavItems = (items) => {
  const groups = [];
  const groupByLabel = new Map();

  items.forEach((item) => {
    const label = item.group || "Menu";

    if (!groupByLabel.has(label)) {
      const group = {
        label,
        items: [],
      };

      groups.push(group);
      groupByLabel.set(label, group);
    }

    groupByLabel.get(label).items.push(item);
  });

  return groups;
};

function SidebarContent({ onNavigate }) {
  const { user } = useAuth();

  const role = user?.role || "viewer";
  const dashboardPath = getDashboardPathByRole(role);
  const roleNavItems = getDashboardNavItems(role);
  const navGroups = groupNavItems(roleNavItems);

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

      <nav className="mt-2 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[#94A3B8]">
              {group.label}
            </p>

            <div className="space-y-1.5">
              {group.items.map((item) => (
                <SidebarLink
                  key={`${group.label}-${item.path}`}
                  item={item}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}

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
    </div>
  );
}

function HeaderUserMenu({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.full_name || user?.username || "PINTARIN User";
  const institution = user?.institution || "PINTARIN Workspace";

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="relative">
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu akun"
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative z-40 flex max-w-[13rem] items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition hover:bg-white/52 sm:max-w-[18rem]"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
          <Building2 size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-[#102A43]">
            {displayName}
          </span>
          <span className="mt-0.5 block truncate text-xs font-semibold text-[#64748B]">
            {institution}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#64748B] transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.55rem)] z-50 w-56 overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/90 p-2 shadow-2xl shadow-slate-900/12 ring-1 ring-white/50 backdrop-blur-2xl"
        >
          <Link
            to="/dashboard/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold text-[#475569] transition hover:bg-[#5EEAD4]/14 hover:text-[#0F766E]"
          >
            <UserRoundCog size={17} />
            Profile
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold text-red-700 transition hover:bg-red-50"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardAppLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const roleMeta = getDashboardRoleMeta(user?.role);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-transparent">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grainient
          color1="#5EEAD4"
          color2="#CCFBF1"
          color3="#F8FAFC"
          timeSpeed={0.16}
          colorBalance={-0.05}
          warpStrength={0.7}
          warpFrequency={4.2}
          warpSpeed={1.25}
          warpAmplitude={58}
          blendAngle={-16}
          blendSoftness={0.14}
          rotationAmount={300}
          noiseScale={1.8}
          grainAmount={0.038}
          grainScale={1.7}
          grainAnimated={false}
          contrast={1.06}
          gamma={1}
          saturation={1.04}
          centerX={0.02}
          centerY={-0.06}
          zoom={0.92}
          className="h-full w-full opacity-95"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,250,252,0.90)_0%,rgba(204,251,241,0.58)_42%,rgba(248,250,252,0.84)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(94,234,212,0.30),transparent_28rem),radial-gradient(circle_at_88%_30%,rgba(204,251,241,0.40),transparent_30rem)]" />
      </div>

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

      <div className="relative z-10 lg:pl-[18rem]">
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

            <HeaderUserMenu user={user} />
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
