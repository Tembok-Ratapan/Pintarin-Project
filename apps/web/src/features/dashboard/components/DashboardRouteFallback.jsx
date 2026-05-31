import LoadingState from "../../../components/feedback/LoadingState";

export default function DashboardRouteFallback({
  label = "Menyiapkan dashboard...",
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/52 p-6 shadow-xl shadow-slate-200/35 ring-1 ring-white/40 backdrop-blur-2xl">
        <LoadingState label={label} />
      </div>
    </div>
  );
}