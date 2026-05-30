export default function LoadingState({ label = "Memuat data..." }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/38 p-4 text-sm font-medium text-[#64748B] shadow-lg shadow-slate-300/15 ring-1 ring-white/35 backdrop-blur-2xl">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0F766E]" />
      <span>{label}</span>
    </div>
  );
}
