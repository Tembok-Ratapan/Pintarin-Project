import { Bot, Sparkles } from "lucide-react";

import DashboardSection from "./DashboardSection";

export default function ComingSoonPanel({
  title = "Gen AI",
  description = "Coming soon. Fitur AI generatif akan ditambahkan setelah modul utama stabil.",
}) {
  return (
    <DashboardSection badge="Gen AI" title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-[#5EEAD4]/35 bg-[#ECFEFF]/58 ring-1 ring-white/45 backdrop-blur-2xl">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.65rem] bg-white/70 text-[#0F766E] shadow-lg shadow-teal-100/50 ring-1 ring-white/70">
            <Bot size={34} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5EEAD4]/45 bg-[#5EEAD4]/16 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0F766E]">
            <Sparkles size={14} />
            Coming soon
          </div>

          <p className="max-w-xl text-sm font-medium leading-6 text-[#64748B]">
            Area ini disiapkan sebagai tempat integrasi Gen AI. Untuk saat ini
            belum ada aksi yang dibuka agar flow produksi tetap aman dan mudah
            diuji.
          </p>
        </div>
      </div>
    </DashboardSection>
  );
}
