import { AlertTriangle } from "lucide-react";

export default function DashboardErrorBanner({
  title = "Sebagian data belum bisa dimuat.",
  description = "Pastikan backend berjalan dan endpoint dapat diakses.",
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-red-200 bg-red-50/76 p-5 text-red-700 ring-1 ring-red-100 sm:flex-row sm:items-start">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
        <AlertTriangle size={20} />
      </div>

      <div>
        <p className="font-extrabold">{title}</p>
        <p className="mt-1 text-sm leading-7 text-red-600">{description}</p>
      </div>
    </div>
  );
}