import { Suspense } from "react";

import DashboardRouteFallback from "../features/dashboard/components/DashboardRouteFallback";

export default function RouteSuspense({
  children,
  label = "Menyiapkan halaman...",
}) {
  return (
    <Suspense fallback={<DashboardRouteFallback label={label} />}>
      {children}
    </Suspense>
  );
}