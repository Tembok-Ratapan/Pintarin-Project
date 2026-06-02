import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetail = Boolean(helper || trend);

  const toggleDetail = () => {
    if (hasDetail) {
      setIsExpanded((current) => !current);
    }
  };

  const handleKeyDown = (event) => {
    if (!hasDetail) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDetail();
    }
  };

  return (
    <Card
      role={hasDetail ? "button" : undefined}
      tabIndex={hasDetail ? 0 : undefined}
      aria-expanded={hasDetail ? isExpanded : undefined}
      onClick={toggleDetail}
      onKeyDown={handleKeyDown}
      className={`group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:bg-white/64 ${
        hasDetail ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]" : ""
      }`}
    >
      <CardContent className="relative p-5">
        <div className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
              {label}
            </p>

            <p
              title={String(value ?? "")}
              className="font-heading mt-3 break-words text-2xl font-extrabold leading-tight text-[#102A43] sm:text-[1.55rem]"
            >
              {value}
            </p>

            {helper && (
              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                {helper}
              </p>
            )}

            {trend && (
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E]">
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

        {hasDetail && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E] transition group-hover:translate-x-0.5">
            {isExpanded ? "Tutup detail" : "Klik untuk detail"}
            <ChevronDown
              size={14}
              className={`transition ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        )}

        {hasDetail && isExpanded && (
          <div className="mt-3 rounded-[1rem] bg-white/38 p-3 text-xs font-semibold leading-5 text-[#64748B] shadow-inner shadow-white/40">
            <p>
              <span className="font-extrabold text-[#102A43]">{label}:</span>{" "}
              {value}
            </p>
            {helper && <p className="mt-1">{helper}</p>}
            {trend && <p className="mt-1 text-[#0F766E]">{trend}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
