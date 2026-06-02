import { ArrowUpRight, Mail } from "lucide-react";

import { teamMembers } from "../data/teamMembers";

export default function LandingFooter() {
  return (
    <section
      id="team"
      className="relative overflow-hidden bg-white/18 px-4 pb-10 pt-16 backdrop-blur-2xl sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#5EEAD4]/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#0F766E]/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
              Tim Pengembang
            </p>

            <h2 className="font-heading mt-3 text-3xl font-extrabold leading-[1.08] text-[#102A43] sm:text-4xl">
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
              className="rounded-[1.35rem] bg-white/42 p-4 shadow-lg shadow-slate-200/20 ring-1 ring-white/50 backdrop-blur-2xl"
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
                <div className="mt-4 flex flex-wrap gap-3">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E] transition hover:text-[#115E59]"
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
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E] transition hover:text-[#115E59]"
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
      </div>
    </section>
  );
}
