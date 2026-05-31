import {
  BarChart3,
  Building2,
  Eye,
  GraduationCap,
  HandHeart,
  Home,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

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
  label: "Profil",
  path: "/dashboard/profile",
  icon: UserRoundCog,
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
      path: "/dashboard/officer",
      icon: ShieldCheck,
    },
    {
      label: "Ruang Analitik",
      path: "/dashboard/analyst",
      icon: BarChart3,
    },
    {
      label: "Ruang Bantuan",
      path: "/dashboard/csr",
      icon: HandHeart,
    },
    {
      label: "Ruang Sekolah",
      path: "/dashboard/school",
      icon: GraduationCap,
    },
    {
      label: "Ruang Pantau",
      path: "/dashboard/viewer",
      icon: Eye,
    },
    profileNavItem,
  ],

  officer: [
    {
      label: "Ruang Dinas",
      path: "/dashboard/officer",
      icon: ShieldCheck,
    },
    profileNavItem,
  ],

  analyst: [
    {
      label: "Ruang Analitik",
      path: "/dashboard/analyst",
      icon: BarChart3,
    },
    profileNavItem,
  ],

  csr_partner: [
    {
      label: "Ruang Bantuan",
      path: "/dashboard/csr",
      icon: HandHeart,
    },
    profileNavItem,
  ],

  school_operator: [
    {
      label: "Ruang Sekolah",
      path: "/dashboard/school",
      icon: GraduationCap,
    },
    profileNavItem,
  ],

  viewer: [
    {
      label: "Ruang Pantau",
      path: "/dashboard/viewer",
      icon: Eye,
    },
    profileNavItem,
  ],
};

export const dashboardUtilityNav = [
  {
    label: "Landing",
    path: "/",
    icon: Home,
  },
  {
    label: "Peta Publik",
    path: "/#risk-map",
    icon: MapPinned,
    isAnchor: true,
  },
  {
    label: "Tentang Produk",
    path: "/#product",
    icon: Building2,
    isAnchor: true,
  },
];

export const getDashboardRoleMeta = (role) => {
  return dashboardRoleMeta[role] || dashboardRoleMeta.viewer;
};

export const getDashboardNavItems = (role) => {
  return dashboardNavByRole[role] || dashboardNavByRole.viewer;
};
