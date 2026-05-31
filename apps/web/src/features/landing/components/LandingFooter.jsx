import { ArrowUpRight, Mail } from "lucide-react";

import BrandLogo from "../../../components/brand/BrandLogo";
import { teamMembers } from "../data/teamMembers";

const footerLinks = [
  { label: "Peta Risiko", href: "#risk-map" },
  { label: "Produk", href: "#product" },
  { label: "Alur Sistem", href: "#workflow" },
  { label: "Tim", href: "#team" },
];

export default function LandingFooter() {
  return (
    <footer
      id="team"
      className="relative overflow-hidden border-t border-white/60 bg-white/35 px-4 pb-8 pt-16 shadow-sm ring-1 ring-white/30 backdrop-blur-2xl sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#5EEAD4]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#0F766E]/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
              Tim Pengembang
            </p>

            <h2 className="font-heading mt-3 text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] text-[#102A43] sm:text-4xl">
              Orang di balik PINTARIN.
            </h2>
          </div>

          <p className="max-w-md text-sm font-medium leading-7 text-[#64748B]">
            Tim yang membangun sistem data, dashboard, AI, dan alur bantuan
            pendidikan PINTARIN.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {teamMembers.map((member) => (
            <article
              key={member.name}
              className="rounded-[1.5rem] border border-white/70 bg-white/48 p-4 shadow-lg shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E] text-sm font-extrabold text-white shadow-lg shadow-[#0F766E]/18">
                {member.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </div>

              <h3 className="mt-4 font-extrabold leading-tight text-[#102A43]">
                {member.name}
              </h3>

              <p className="mt-1 text-sm font-extrabold text-[#0F766E]">
                {member.role}
              </p>

              <p className="mt-3 text-sm leading-6 text-[#64748B]">
                {member.focus}
              </p>

              {(member.email || member.portfolio) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-extrabold text-[#0F766E] ring-1 ring-white/40 transition hover:bg-white"
                    >
                      <Mail size={13} />
                      Email
                    </a>
                  )}

                  {member.portfolio && (
                    <a
                      href={member.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-extrabold text-[#0F766E] ring-1 ring-white/40 transition hover:bg-white"
                    >
                      Link
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-white/65 pt-6 md:flex-row md:items-center">
          <div>
            <BrandLogo />
            <p className="mt-3 text-sm font-semibold text-[#64748B]">
              © {new Date().getFullYear()} PINTARIN. Education Aid
              Intelligence.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm font-extrabold text-[#475569]">
            {footerLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-white/55 hover:text-[#0F766E]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}