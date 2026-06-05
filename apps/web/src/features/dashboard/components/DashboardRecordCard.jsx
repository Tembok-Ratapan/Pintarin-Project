import { ExternalLink } from "lucide-react";

import { cn } from "../../../lib/utils";

const getSubmissionStatusClass = (status) => {
  if (status === "Disetujui" || status === "Disalurkan" || status === "Selesai") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "Ditolak") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "Ditinjau") {
    return "border-yellow-200 bg-yellow-50 text-yellow-800";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
};

export function StatusPill({ status, className = "" }) {
  if (!status) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-extrabold",
        getSubmissionStatusClass(status),
        className,
      )}
    >
      {status}
    </span>
  );
}

export function DetailList({ items = [], className = "" }) {
  const visibleItems = items.filter(
    (item) => item && (item.value || item.href || item.children),
  );

  if (visibleItems.length === 0) return null;

  return (
    <dl
      className={cn(
        "mt-4 grid gap-x-6 gap-y-3 border-t border-slate-200/70 pt-4 text-sm leading-6 text-[#64748B] sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {visibleItems.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">
            {item.label}
          </dt>
          <dd className="mt-1 min-w-0 font-extrabold text-[#102A43]">
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 text-[#0F766E] hover:text-[#115E59]"
              >
                <span className="truncate">{item.value || "Lihat dokumen"}</span>
                <ExternalLink size={14} className="shrink-0" />
              </a>
            ) : (
              item.children || item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function DashboardRecordCard({
  title,
  status,
  meta,
  description,
  valueLabel,
  value,
  details = [],
  children,
  footer,
  className = "",
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white/78 p-4 shadow-sm ring-1 ring-white/45 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-base font-extrabold leading-6 text-[#102A43]">
              {title}
            </h3>
            <StatusPill status={status} />
          </div>

          {meta && (
            <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">
              {meta}
            </p>
          )}

          {description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">
              {description}
            </p>
          )}
        </div>

        {(valueLabel || value) && (
          <div className="shrink-0 text-left sm:text-right">
            {valueLabel && (
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">
                {valueLabel}
              </p>
            )}
            {value && (
              <p className="mt-1 text-base font-extrabold text-[#0F766E]">
                {value}
              </p>
            )}
          </div>
        )}
      </div>

      <DetailList items={details} />

      {children}

      {footer && (
        <div className="mt-4 border-t border-slate-200/70 pt-4">{footer}</div>
      )}
    </article>
  );
}
