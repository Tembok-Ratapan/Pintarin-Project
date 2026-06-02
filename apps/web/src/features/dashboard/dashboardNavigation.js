import {
  BarChart3,
  Bot,
  Building2,
  ClipboardCheck,
  Database,
  Eye,
  FileClock,
  FilePlus2,
  GraduationCap,
  HandHeart,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

import { normalizeDashboardRole } from "./dashboardRoutes";

export const dashboardRoleMeta = {
  admin: {
    label: "Admin",
    workspace: "Pusat Kendali",
    tagline: "Kelola data, ajuan, dan bantuan.",
  },
  officer: {
    label: "Dinas",
    workspace: "Ruang Dinas",
    tagline: "Validasi dan salurkan bantuan.",
  },
  analyst: {
    label: "Analis",
    workspace: "Ruang Analitik",
    tagline: "Baca pola dan kualitas data.",
  },
  csr_partner: {
    label: "CSR",
    workspace: "Ruang Bantuan",
    tagline: "Beri bantuan yang tepat.",
  },
  school_operator: {
    label: "Sekolah",
    workspace: "Ruang Sekolah",
    tagline: "Kelola data dan kebutuhan sekolah.",
  },
  viewer: {
    label: "Viewer",
    workspace: "Ruang Pantau",
    tagline: "Lihat ringkasan tanpa aksi.",
  },
};

const productNavItem = {
  label: "Tentang Produk",
  path: "/dashboard/about-product",
  icon: Building2,
};

const withGroup = (item, group) => ({
  ...item,
  group,
});

export const dashboardNavByRole = {
  admin: [
    withGroup(
      {
        label: "Pusat Kendali",
        path: "/dashboard/admin",
        icon: LayoutDashboard,
      },
      "Admin",
    ),
    withGroup(
      {
        label: "Manage Database",
        path: "/dashboard/admin/manage-database",
        icon: Database,
      },
      "Admin",
    ),
    withGroup(productNavItem, "Admin"),
    withGroup(
      {
        label: "Overview Dinas",
        path: "/dashboard/admin/dinas/overview",
        icon: ShieldCheck,
      },
      "Dinas",
    ),
    withGroup(
      {
        label: "Map Risk",
        path: "/dashboard/admin/dinas/map-risk",
        icon: MapPinned,
      },
      "Dinas",
    ),
    withGroup(
      {
        label: "Analitik",
        path: "/dashboard/admin/dinas/analytic",
        icon: BarChart3,
      },
      "Dinas",
    ),
    withGroup(
      {
        label: "Validasi CSR",
        path: "/dashboard/admin/dinas/validasi-csr",
        icon: HandHeart,
      },
      "Dinas",
    ),
    withGroup(
      {
        label: "Validasi Sekolah",
        path: "/dashboard/admin/dinas/validasi-sekolah",
        icon: GraduationCap,
      },
      "Dinas",
    ),
    withGroup(
      {
        label: "Review",
        path: "/dashboard/admin/dinas/review",
        icon: ClipboardCheck,
      },
      "Dinas",
    ),
    withGroup(
      {
        label: "Gen AI",
        path: "/dashboard/admin/dinas/gen-ai",
        icon: Bot,
      },
      "Dinas",
    ),
    withGroup(
      {
        label: "Overview CSR",
        path: "/dashboard/csr/overview",
        icon: HandHeart,
      },
      "CSR",
    ),
    withGroup(
      {
        label: "Map Risk",
        path: "/dashboard/csr/map-risk",
        icon: MapPinned,
      },
      "CSR",
    ),
    withGroup(
      {
        label: "AI Matching",
        path: "/dashboard/csr/ai-matching",
        icon: Bot,
      },
      "CSR",
    ),
    withGroup(
      {
        label: "Analitik",
        path: "/dashboard/csr/analytic",
        icon: BarChart3,
      },
      "CSR",
    ),
    withGroup(
      {
        label: "Pengajuan",
        path: "/dashboard/csr/pengajuan",
        icon: FilePlus2,
      },
      "CSR",
    ),
    withGroup(
      {
        label: "Riwayat Pengajuan",
        path: "/dashboard/csr/riwayat",
        icon: FileClock,
      },
      "CSR",
    ),
    withGroup(
      {
        label: "Gen AI",
        path: "/dashboard/csr/gen-ai",
        icon: Bot,
      },
      "CSR",
    ),
    withGroup(
      {
        label: "Overview Sekolah",
        path: "/dashboard/school/overview",
        icon: GraduationCap,
      },
      "Sekolah",
    ),
    withGroup(
      {
        label: "Pengajuan",
        path: "/dashboard/school/pengajuan",
        icon: FilePlus2,
      },
      "Sekolah",
    ),
    withGroup(
      {
        label: "Riwayat Pengajuan",
        path: "/dashboard/school/riwayat",
        icon: FileClock,
      },
      "Sekolah",
    ),
    withGroup(
      {
        label: "Gen AI",
        path: "/dashboard/school/gen-ai",
        icon: Bot,
      },
      "Sekolah",
    ),
    withGroup(
      {
        label: "Ruang Analitik",
        path: "/dashboard/analyst",
        icon: BarChart3,
      },
      "Publik",
    ),
    withGroup(
      {
        label: "Ruang Pantau",
        path: "/dashboard/viewer",
        icon: Eye,
      },
      "Publik",
    ),
  ],

  officer: [
    {
      label: "Overview",
      path: "/dashboard/officer/overview",
      icon: LayoutDashboard,
    },
    {
      label: "Map Risk",
      path: "/dashboard/officer/map-risk",
      icon: MapPinned,
    },
    {
      label: "Analitik",
      path: "/dashboard/officer/analytic",
      icon: BarChart3,
    },
    {
      label: "Validasi CSR",
      path: "/dashboard/officer/validasi-csr",
      icon: HandHeart,
    },
    {
      label: "Validasi Sekolah",
      path: "/dashboard/officer/validasi-sekolah",
      icon: GraduationCap,
    },
    {
      label: "Review",
      path: "/dashboard/officer/review",
      icon: ClipboardCheck,
    },
    {
      label: "Gen AI",
      path: "/dashboard/officer/gen-ai",
      icon: Bot,
    },
    productNavItem,
  ],

  analyst: [
    {
      label: "Ruang Analitik",
      path: "/dashboard/analyst",
      icon: BarChart3,
    },
    productNavItem,
  ],

  csr_partner: [
    {
      label: "Overview",
      path: "/dashboard/csr/overview",
      icon: LayoutDashboard,
    },
    {
      label: "Map Risk",
      path: "/dashboard/csr/map-risk",
      icon: MapPinned,
    },
    {
      label: "AI Matching",
      path: "/dashboard/csr/ai-matching",
      icon: Bot,
    },
    {
      label: "Analitik",
      path: "/dashboard/csr/analytic",
      icon: BarChart3,
    },
    {
      label: "Pengajuan",
      path: "/dashboard/csr/pengajuan",
      icon: FilePlus2,
    },
    {
      label: "Riwayat Pengajuan",
      path: "/dashboard/csr/riwayat",
      icon: FileClock,
    },
    {
      label: "Gen AI",
      path: "/dashboard/csr/gen-ai",
      icon: Bot,
    },
    productNavItem,
  ],

  school_operator: [
    {
      label: "Overview",
      path: "/dashboard/school/overview",
      icon: LayoutDashboard,
    },
    {
      label: "Pengajuan",
      path: "/dashboard/school/pengajuan",
      icon: FilePlus2,
    },
    {
      label: "Riwayat Pengajuan",
      path: "/dashboard/school/riwayat",
      icon: FileClock,
    },
    {
      label: "Gen AI",
      path: "/dashboard/school/gen-ai",
      icon: Bot,
    },
    productNavItem,
  ],

  viewer: [
    {
      label: "Ruang Pantau",
      path: "/dashboard/viewer",
      icon: Eye,
    },
    productNavItem,
  ],
};

export const dashboardUtilityNav = [];

export const getDashboardRoleMeta = (role) => {
  return dashboardRoleMeta[normalizeDashboardRole(role)] || dashboardRoleMeta.viewer;
};

export const getDashboardNavItems = (role) => {
  return dashboardNavByRole[normalizeDashboardRole(role)] || dashboardNavByRole.viewer;
};
