import { Inbox } from "lucide-react";

export default function DashboardEmptyState({
  title = "Belum ada data.",
  description = "Data akan tampil setelah backend mengirim response.",
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#CBD5E1] bg-white/42 p-6 text-center ring-1 ring-white/35 backdrop-blur-xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
        <Inbox size={22} />
      </div>

      <p className="mt-4 font-extrabold text-[#102A43]">{title}</p>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-7 text-[#64748B]">
        {description}
      </p>
    </div>
  );
}
