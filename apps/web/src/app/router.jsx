import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import {
  AdminDashboardPage,
  AnalystDashboardPage,
  CsrDashboardPage,
  DashboardAppLayout,
  DashboardRedirect,
  LandingPage,
  LoginPage,
  OfficerDashboardPage,
  PublicLayout,
  SchoolDashboardPage,
  ViewerDashboardPage,
  ProfilePage,
} from "./lazyRouteComponents";
import RouteSuspense from "./RouteSuspense";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RouteSuspense label="Menyiapkan halaman login...">
        <LoginPage />
      </RouteSuspense>
    ),
  },
  {
    path: "/",
    element: (
      <RouteSuspense label="Menyiapkan halaman utama...">
        <PublicLayout />
      </RouteSuspense>
    ),
    children: [
      {
        index: true,
        element: (
          <RouteSuspense label="Menyiapkan landing page...">
            <LandingPage />
          </RouteSuspense>
        ),
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <RouteSuspense label="Menyiapkan workspace PINTARIN...">
        <ProtectedRoute>
          <DashboardAppLayout />
        </ProtectedRoute>
      </RouteSuspense>
    ),
    children: [
      {
        index: true,
        element: (
          <RouteSuspense label="Mengarahkan dashboard sesuai role...">
            <DashboardRedirect />
          </RouteSuspense>
        ),
      },
      {
        path: "profile",
        element: (
          <RouteSuspense label="Menyiapkan profil...">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "admin",
        element: (
          <RouteSuspense label="Menyiapkan dashboard administrator...">
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "officer",
        element: (
          <RouteSuspense label="Menyiapkan dashboard petugas dinas...">
            <ProtectedRoute allowedRoles={["officer", "admin"]}>
              <OfficerDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "officer/:section",
        element: (
          <RouteSuspense label="Menyiapkan dashboard petugas dinas...">
            <ProtectedRoute allowedRoles={["officer", "admin"]}>
              <OfficerDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "analyst",
        element: (
          <RouteSuspense label="Menyiapkan dashboard analyst...">
            <ProtectedRoute allowedRoles={["analyst", "admin"]}>
              <AnalystDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "csr",
        element: (
          <RouteSuspense label="Menyiapkan dashboard mitra CSR...">
            <ProtectedRoute allowedRoles={["csr_partner", "admin"]}>
              <CsrDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "csr/:section",
        element: (
          <RouteSuspense label="Menyiapkan dashboard mitra CSR...">
            <ProtectedRoute allowedRoles={["csr_partner", "admin"]}>
              <CsrDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "school",
        element: (
          <RouteSuspense label="Menyiapkan dashboard operator sekolah...">
            <ProtectedRoute allowedRoles={["school_operator", "admin"]}>
              <SchoolDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "school/:section",
        element: (
          <RouteSuspense label="Menyiapkan dashboard operator sekolah...">
            <ProtectedRoute allowedRoles={["school_operator", "admin"]}>
              <SchoolDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
      {
        path: "viewer",
        element: (
          <RouteSuspense label="Menyiapkan dashboard viewer...">
            <ProtectedRoute allowedRoles={["viewer", "admin"]}>
              <ViewerDashboardPage />
            </ProtectedRoute>
          </RouteSuspense>
        ),
      },
    ],
  },
]);

export default router;
