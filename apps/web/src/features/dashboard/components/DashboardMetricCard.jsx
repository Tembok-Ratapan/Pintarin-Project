import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "../../../components/ui/Card";

const toneClass = {
  teal: {
    icon: "bg-[#5EEAD4]/18 text-[#0F766E]",
    accent: "bg-[#0F766E]",
  },
  red: {
    icon: "bg-red-50 text-red-700",
    accent: "bg-red-600",
  },
  amber: {
    icon: "bg-yellow-50 text-yellow-800",
    accent: "bg-yellow-400",
  },
  blue: {
    icon: "bg-sky-50 text-sky-700",
    accent: "bg-sky-600",
  },
};

export default function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "teal",
  trend,
}) {
  const theme = toneClass[tone] || toneClass.teal;

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:bg-white/64">
      <CardContent className="relative p-5">
        <div className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
              {label}
            </p>

            <p className="font-heading mt-3 truncate text-3xl font-extrabold tracking-[-0.045em] text-[#102A43]">
              {value}
            </p>

            {helper && (
              <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-[#64748B]">
                {helper}
              </p>
            )}

            {trend && (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-xs font-extrabold text-[#0F766E] ring-1 ring-white/40">
                <ArrowUpRight size={14} />
                {trend}
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.icon}`}
            >
              <Icon size={20} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
