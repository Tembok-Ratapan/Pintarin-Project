import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "../../../components/ui/Card";
import { cn } from "../../../lib/utils";

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
  green: {
    icon: "bg-emerald-50 text-emerald-700",
    accent: "bg-emerald-600",
  },
};

export default function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  displayValue,
  detailValue,
  helper,
  tone = "teal",
  trend,
  showDetail = false,
  compact = false,
  className = "",
}) {
  const theme = toneClass[tone] || toneClass.teal;
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetail = showDetail && Boolean(helper || trend);

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
      className={cn(
        "group h-full overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:bg-white/64",
        compact && "rounded-[1.35rem] shadow-lg shadow-slate-200/25",
        hasDetail &&
          "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]",
        className,
      )}
    >
      <CardContent className={cn("relative", compact ? "p-4" : "p-5")}>
        <div
          className={`absolute inset-x-0 top-0 ${compact ? "h-0.5" : "h-1"} ${theme.accent}`}
        />

        <div
          className={cn(
            compact
              ? "relative min-h-[8.5rem] pr-12"
              : "flex items-start justify-between gap-4",
          )}
        >
          <div className="min-w-0">
            <p
              className={cn(
                "font-extrabold uppercase text-[#64748B]",
                compact
                  ? "truncate text-[0.68rem] leading-4 tracking-[0.1em]"
                  : "text-xs tracking-[0.16em]",
              )}
            >
              {label}
            </p>

            <p
              title={String(detailValue ?? value ?? "")}
              className={cn(
                "font-heading break-words font-extrabold leading-tight text-[#102A43]",
                compact
                  ? "mt-2 text-[1.65rem] sm:text-[1.7rem]"
                  : "mt-3 text-2xl sm:text-[1.55rem]",
              )}
            >
              {displayValue ?? value}
            </p>

            {helper && (
              <p
                className={cn(
                  "mt-2 font-medium text-[#64748B]",
                  compact ? "text-[0.78rem] leading-5" : "text-xs leading-5",
                )}
              >
                {helper}
              </p>
            )}

            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E]",
                  compact ? "mt-3" : "mt-4",
                )}
              >
                <ArrowUpRight size={14} />
                {trend}
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center",
                compact
                  ? "absolute right-0 top-0 h-10 w-10 rounded-[1rem]"
                  : "h-11 w-11 rounded-2xl",
                theme.icon,
              )}
            >
              <Icon size={compact ? 18 : 20} />
            </div>
          )}
        </div>

        {hasDetail && isExpanded && (
          <div className="mt-3 rounded-[1rem] bg-white/38 p-3 text-xs font-semibold leading-5 text-[#64748B] shadow-inner shadow-white/40">
            <p>
              <span className="font-extrabold text-[#102A43]">{label}:</span>{" "}
              {detailValue ?? value}
            </p>
            {helper && <p className="mt-1">{helper}</p>}
            {trend && <p className="mt-1 text-[#0F766E]">{trend}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
