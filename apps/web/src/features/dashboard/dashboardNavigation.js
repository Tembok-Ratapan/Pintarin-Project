import {
  BarChart3,
  Bot,
  Building2,
  ClipboardCheck,
  Eye,
  FileClock,
  FilePlus2,
  GraduationCap,
  HandHeart,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  UserRoundCog,
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

const profileNavItem = {
  label: "Profile",
  path: "/dashboard/profile",
  icon: UserRoundCog,
};

const productNavItem = {
  label: "Tentang Produk",
  path: "/#product",
  icon: Building2,
  isAnchor: true,
};

export const dashboardNavByRole = {
  admin: [
    {
      label: "Pusat Kendali",
      path: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Ruang Dinas",
      path: "/dashboard/officer/overview",
      icon: ShieldCheck,
    },
    {
      label: "Ruang Analitik",
      path: "/dashboard/analyst",
      icon: BarChart3,
    },
    {
      label: "Ruang Bantuan",
      path: "/dashboard/csr/map-risk",
      icon: HandHeart,
    },
    {
      label: "Ruang Sekolah",
      path: "/dashboard/school/overview",
      icon: GraduationCap,
    },
    {
      label: "Ruang Pantau",
      path: "/dashboard/viewer",
      icon: Eye,
    },
    profileNavItem,
    productNavItem,
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
    profileNavItem,
    productNavItem,
  ],

  analyst: [
    {
      label: "Ruang Analitik",
      path: "/dashboard/analyst",
      icon: BarChart3,
    },
    profileNavItem,
    productNavItem,
  ],

  csr_partner: [
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
    profileNavItem,
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
    profileNavItem,
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
    profileNavItem,
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
