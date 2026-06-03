import { lazy } from "react";

export const PublicLayout = lazy(
  () => import("../components/layout/PublicLayout"),
);

export const LoginPage = lazy(() => import("../features/auth/LoginPage"));

export const LandingPage = lazy(
  () => import("../features/landing/LandingPage"),
);

export const DashboardAppLayout = lazy(
  () => import("../features/dashboard/components/DashboardAppLayout"),
);

export const DashboardRedirect = lazy(
  () => import("../features/dashboard/DashboardRedirect"),
);

export const AdminDashboardPage = lazy(
  () => import("../features/dashboard/pages/AdminDashboardPage"),
);

export const AdminControlCenterPage = lazy(
  () => import("../features/dashboard/pages/AdminControlCenterPage"),
);

export const OfficerDashboardPage = lazy(
  () => import("../features/dashboard/pages/OfficerDashboardPage"),
);

export const AnalystDashboardPage = lazy(
  () => import("../features/dashboard/pages/AnalystDashboardPage"),
);

export const CsrDashboardPage = lazy(
  () => import("../features/dashboard/pages/CsrDashboardPage"),
);

export const SchoolDashboardPage = lazy(
  () => import("../features/dashboard/pages/SchoolDashboardPage"),
);

export const ViewerDashboardPage = lazy(
  () => import("../features/dashboard/pages/ViewerDashboardPage"),
);

export const ProfilePage = lazy(
  () => import("../features/dashboard/pages/ProfilePage"),
);

export const ProductAboutPage = lazy(
  () => import("../features/dashboard/pages/ProductAboutPage"),
);

export const ManageDatabasePage = lazy(
  () => import("../features/dashboard/pages/ManageDatabasePage"),
);
