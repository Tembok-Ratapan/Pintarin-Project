import { Link, Outlet } from "react-router-dom";

import BrandLogo from "../brand/BrandLogo";
import Button from "../ui/Button";

const navItems = [
  { label: "Peta Risiko", href: "#risk-map" },
  { label: "Produk", href: "#product" },
  { label: "Alur Sistem", href: "#workflow" },
];

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-50 border-b border-white/55 bg-white/40 shadow-sm shadow-slate-200/25 ring-1 ring-white/35 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/34">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="min-w-0 shrink-0"
            aria-label="Kembali ke halaman utama PINTARIN"
          >
            <BrandLogo />
          </Link>

          <nav
            className="hidden items-center gap-2 rounded-full border border-white/55 bg-white/28 px-2 py-1 text-sm font-semibold text-[#475569] ring-1 ring-white/30 backdrop-blur-xl md:flex"
            aria-label="Navigasi utama"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 transition hover:bg-white/50 hover:text-[#0F766E]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button size="sm" className="shrink-0">
            Masuk
          </Button>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
