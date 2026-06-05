import LoadingState from "../../../components/feedback/LoadingState";

export default function DashboardRouteFallback({
  label = "Menyiapkan dashboard...",
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <LoadingState label={label} />
    </div>
  );
}
