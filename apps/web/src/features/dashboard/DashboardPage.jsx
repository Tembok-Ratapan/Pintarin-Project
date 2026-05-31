import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  HandHeart,
  Layers3,
  LineChart,
  LogOut,
  MapPinned,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import LoadingState from "../../components/feedback/LoadingState";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getRiskBadgeClass,
} from "../../lib/utils";
import { useAuth } from "../auth/useAuth";
import { dashboardService } from "./dashboardService";

const roleProfiles = {
  admin: {
    label: "Administrator",
    badge: "Full Access",
    description:
      "Memantau seluruh data, validasi AI, prioritas wilayah, dan rekomendasi CSR.",
  },
  officer: {
    label: "Petugas Dinas",
    badge: "Validation Control",
    description:
      "Fokus pada review prediksi AI dan keputusan wilayah prioritas.",
  },
  analyst: {
    label: "Data Analyst",
    badge: "Analytics View",
    description:
      "Membaca tren risiko, confidence score, dan prioritas berbasis data.",
  },
  csr_partner: {
    label: "Mitra CSR",
    badge: "CSR Matching",
    description: "Mencari wilayah paling relevan untuk program CSR pendidikan.",
  },
  school_operator: {
    label: "Operator Sekolah",
    badge: "School Context",
    description:
      "Melihat konteks wilayah dan data prioritas yang berkaitan dengan sekolah.",
  },
  viewer: {
    label: "Viewer",
    badge: "Read Only",
    description:
      "Melihat ringkasan dashboard dan insight utama secara terbatas.",
  },
};

const rolePermissions = {
  admin: ["analytics", "review", "csr", "predictions", "regions"],
  officer: ["analytics", "review", "predictions", "regions"],
  analyst: ["analytics", "predictions", "regions"],
  csr_partner: ["analytics", "csr", "regions"],
  school_operator: ["analytics", "regions"],
  viewer: ["analytics"],
};

const focusOptions = [
  { value: "umum", label: "Umum" },
  { value: "infrastruktur_sd", label: "Infrastruktur SD" },
  { value: "beasiswa", label: "Beasiswa" },
  { value: "angka_putus_sekolah", label: "Risiko Putus Sekolah" },
];

const budgetOptions = [
  { value: "semua", label: "Semua Budget" },
  { value: "kecil", label: "Kecil" },
  { value: "sedang", label: "Sedang" },
  { value: "besar", label: "Besar" },
];

const riskTheme = {
  Tinggi: {
    dot: "bg-red-600",
    bar: "bg-red-600",
    soft: "bg-red-50 text-red-700 border-red-200",
  },
  Sedang: {
    dot: "bg-yellow-400",
    bar: "bg-yellow-400",
    soft: "bg-yellow-50 text-yellow-800 border-yellow-200",
  },
  Rendah: {
    dot: "bg-green-600",
    bar: "bg-green-600",
    soft: "bg-green-50 text-green-700 border-green-200",
  },
};

const hasAccess = (role, permission) => {
  return rolePermissions[role]?.includes(permission);
};

const getRoleProfile = (role) => {
  return roleProfiles[role] || roleProfiles.viewer;
};

const getRiskTheme = (riskStatus) => {
  return riskTheme[riskStatus] || riskTheme.Sedang;
};

const getSafeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getRegionRiskStatus = (region) => {
  return (
    region?.risk_status ||
    region?.dominant_risk_status ||
    region?.final_label ||
    "Sedang"
  );
};

const getPredictionStatus = (prediction) => {
  return prediction?.final_label || prediction?.predicted_label || "Sedang";
};

const getPriorityWidth = (rank) => {
  const number = Number(rank || 10);
  return `${Math.max(38, 100 - (number - 1) * 6)}%`;
};

function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "teal",
}) {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-700"
      : tone === "amber"
        ? "bg-yellow-50 text-yellow-800"
        : "bg-[#5EEAD4]/18 text-[#0F766E]";

  return (
    <Card className="transition duration-200 hover:-translate-y-0.5 hover:bg-white/48">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
              {label}
            </p>
            <p className="font-heading mt-3 truncate text-2xl font-extrabold tracking-[-0.035em] text-[#102A43]">
              {value}
            </p>
            {helper && (
              <p className="mt-2 text-xs leading-5 text-[#64748B]">{helper}</p>
            )}
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}
          >
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ badge, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {badge && <Badge variant="green">{badge}</Badge>}
        <h2 className="font-heading mt-3 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[#102A43] sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748B]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-[#64748B]">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [regions, setRegions] = useState([]);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [focusArea, setFocusArea] = useState("umum");
  const [budgetRange, setBudgetRange] = useState("semua");
  const [csrResult, setCsrResult] = useState(null);
  const [csrLoading, setCsrLoading] = useState(false);
  const [csrError, setCsrError] = useState("");

  const role = user?.role || "viewer";
  const profile = getRoleProfile(role);
  const canReview = hasAccess(role, "review");
  const canUseCsr = hasAccess(role, "csr");

  const dashboardSummary = summary?.summary || {};
  const topRiskRegions = getSafeArray(summary?.top_risk_regions);
  const highRiskRegions = regions.filter(
    (region) => getRegionRiskStatus(region) === "Tinggi",
  );

  const userRegion = user?.region_id
    ? regions.find((region) => Number(region.id) === Number(user.region_id))
    : null;

  const roleActions = [
    {
      permission: "analytics",
      title: "Analytics Summary",
      description: "Ringkasan kondisi wilayah, sekolah, prediksi, dan bantuan.",
      icon: BarChart3,
    },
    {
      permission: "review",
      title: "Human Review Queue",
      description: "Validasi prediksi yang membutuhkan keputusan petugas.",
      icon: ShieldCheck,
    },
    {
      permission: "csr",
      title: "CSR Matching",
      description: "Rekomendasi wilayah sesuai fokus program dan budget.",
      icon: HandHeart,
    },
    {
      permission: "regions",
      title: "Regional Priority",
      description: "Prioritas kecamatan berdasarkan risiko pendidikan.",
      icon: MapPinned,
    },
  ].filter((action) => hasAccess(role, action.permission));

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const requests = [
          dashboardService.getAnalyticsSummary(controller.signal),
          dashboardService.getRegions(controller.signal),
          dashboardService.getLatestPredictions({
            limit: 8,
            signal: controller.signal,
          }),
        ];

        if (canReview) {
          requests.push(
            dashboardService.getPendingReviews({
              limit: 6,
              signal: controller.signal,
            }),
          );
        }

        const results = await Promise.allSettled(requests);

        const summaryResult = results[0];
        const regionsResult = results[1];
        const predictionsResult = results[2];
        const pendingResult = results[3];

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value);
        }

        if (regionsResult.status === "fulfilled") {
          setRegions(getSafeArray(regionsResult.value));
        }

        if (predictionsResult.status === "fulfilled") {
          setLatestPredictions(
            getSafeArray(predictionsResult.value?.predictions),
          );
        }

        if (canReview && pendingResult?.status === "fulfilled") {
          setPendingReviews(getSafeArray(pendingResult.value?.predictions));
        }

        const hasCriticalError =
          summaryResult.status === "rejected" ||
          regionsResult.status === "rejected";

        if (hasCriticalError) {
          setErrorMessage(
            "Sebagian data dashboard belum bisa diambil dari backend.",
          );
        }
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          setErrorMessage("Dashboard belum bisa terhubung ke backend.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => controller.abort();
  }, [canReview]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleCsrMatch = async () => {
    setCsrLoading(true);
    setCsrError("");

    try {
      const result = await dashboardService.matchCsrRegions({
        focusArea,
        budgetRange,
      });

      setCsrResult(result);
    } catch (error) {
      setCsrError(
        error.response?.data?.message ||
          error.message ||
          "CSR matching belum bisa dijalankan.",
      );
    } finally {
      setCsrLoading(false);
    }
  };

  const metrics = [
    {
      label: "Kecamatan",
      value: formatNumber(dashboardSummary.total_regions || regions.length),
      helper: "Wilayah aktif dalam database",
      icon: MapPinned,
    },
    {
      label: "Risiko Tinggi",
      value: formatNumber(
        dashboardSummary.high_risk_regions || highRiskRegions.length,
      ),
      helper: "Wilayah butuh prioritas",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "Sekolah",
      value: formatNumber(dashboardSummary.total_schools),
      helper: "Data sekolah terhubung",
      icon: School,
    },
    {
      label: "Pending Review",
      value: formatNumber(
        dashboardSummary.pending_reviews || pendingReviews.length,
      ),
      helper: "Prediksi menunggu validasi",
      icon: Clock3,
      tone: "amber",
    },
  ];

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(94,234,212,0.34),transparent_34%),linear-gradient(135deg,rgba(204,251,241,0.74)_0%,rgba(248,250,252,0.96)_44%,rgba(255,255,255,0.95)_100%)]" />

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <Badge variant="green">{profile.badge}</Badge>

            <h1 className="font-heading mt-4 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-[-0.05em] text-[#102A43] sm:text-4xl lg:text-5xl">
              Dashboard kerja untuk {profile.label}.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-[#475569] sm:text-base">
              {profile.description}
            </p>
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
                    Signed in as
                  </p>
                  <p className="mt-2 truncate text-lg font-extrabold text-[#102A43]">
                    {user?.full_name || user?.username || "-"}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-[#64748B]">
                    {user?.institution || "PINTARIN Workspace"}
                  </p>
                </div>

                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <LoadingState label="Mengambil data dashboard dari backend..." />
        ) : (
          <div className="space-y-8">
            {errorMessage && (
              <Card className="border-red-200 bg-red-50/60">
                <CardContent className="p-5">
                  <p className="text-sm font-bold text-red-700">
                    {errorMessage}
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    Pastikan backend berjalan di http://localhost:5000.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <DashboardMetricCard key={metric.label} {...metric} />
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roleActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Card
                    key={action.title}
                    className="transition hover:bg-white/48"
                  >
                    <CardContent className="p-5">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-base font-extrabold text-[#102A43]">
                        {action.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[#64748B]">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <SectionHeader
                    badge="Analytics"
                    title="Kesehatan bantuan pendidikan"
                    description="Ringkasan data utama yang membantu menentukan prioritas wilayah."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      [
                        "Total populasi",
                        formatNumber(dashboardSummary.total_population),
                        UsersRound,
                      ],
                      [
                        "Warga rentan",
                        formatNumber(
                          dashboardSummary.total_vulnerable_population,
                        ),
                        Activity,
                      ],
                      [
                        "Rata-rata rasio rentan",
                        formatPercent(dashboardSummary.avg_vulnerable_ratio),
                        LineChart,
                      ],
                      [
                        "Total nilai CSR",
                        formatCurrency(dashboardSummary.total_csr_value),
                        HandHeart,
                      ],
                      [
                        "Prediksi AI",
                        formatNumber(dashboardSummary.total_predictions),
                        Sparkles,
                      ],
                      [
                        "Avg confidence",
                        formatPercent(
                          Number(dashboardSummary.avg_confidence_score || 0) *
                            100,
                        ),
                        Layers3,
                      ],
                    ].map(([label, value, Icon]) => (
                      <div
                        key={label}
                        className="rounded-[1.35rem] border border-white/60 bg-white/38 p-4 ring-1 ring-white/35 backdrop-blur-2xl"
                      >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                          <Icon size={17} />
                        </div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                          {label}
                        </p>
                        <p className="mt-2 text-lg font-extrabold text-[#102A43]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 sm:p-6">
                  <SectionHeader
                    badge="Priority"
                    title="Wilayah prioritas"
                    description="Ranking tertinggi dari analytics snapshot terbaru."
                  />

                  {topRiskRegions.length === 0 ? (
                    <EmptyState label="Belum ada data wilayah prioritas." />
                  ) : (
                    <div className="space-y-3">
                      {topRiskRegions.map((region) => {
                        const theme = getRiskTheme(region.risk_status);

                        return (
                          <div
                            key={region.id}
                            className="rounded-[1.25rem] border border-white/60 bg-white/38 p-4 ring-1 ring-white/30 backdrop-blur-2xl"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`h-2.5 w-2.5 rounded-full ${theme.dot}`}
                                  />
                                  <p className="truncate text-sm font-extrabold text-[#102A43]">
                                    {region.name}
                                  </p>
                                </div>
                                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                                  Warga rentan{" "}
                                  {formatNumber(
                                    region.total_vulnerable_population,
                                  )}{" "}
                                  · Gap PIP {formatNumber(region.pip_gap)}
                                </p>
                              </div>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${theme.soft}`}
                              >
                                #{region.risk_ranking}
                              </span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/60">
                              <div
                                className={`h-full rounded-full ${theme.bar}`}
                                style={{
                                  width: getPriorityWidth(region.risk_ranking),
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {userRegion && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <SectionHeader
                    badge="Your Region"
                    title={`Konteks wilayah: ${userRegion.name}`}
                    description="Bagian ini muncul untuk user yang memiliki region_id pada akun."
                  />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ["Populasi", formatNumber(userRegion.avg_population)],
                      [
                        "Warga rentan",
                        formatNumber(userRegion.avg_vulnerable_population),
                      ],
                      [
                        "Rasio rentan",
                        formatPercent(userRegion.avg_vulnerable_ratio),
                      ],
                      ["Sekolah", formatNumber(userRegion.total_schools)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[1.25rem] border border-white/60 bg-white/38 p-4 ring-1 ring-white/35"
                      >
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                          {label}
                        </p>
                        <p className="mt-2 text-lg font-extrabold text-[#102A43]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              {hasAccess(role, "predictions") && (
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <SectionHeader
                      badge="AI Prediction"
                      title="Prediksi terbaru"
                      description="Skor tertinggi dari model AI pada tahun prediksi terbaru."
                    />

                    {latestPredictions.length === 0 ? (
                      <EmptyState label="Belum ada data prediksi terbaru." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left">
                          <thead>
                            <tr className="border-b border-white/60 text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                              <th className="pb-3 pr-4">Wilayah</th>
                              <th className="pb-3 pr-4">Algoritma</th>
                              <th className="pb-3 pr-4">Skor</th>
                              <th className="pb-3 pr-4">Label</th>
                              <th className="pb-3">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latestPredictions.map((prediction) => {
                              const status = getPredictionStatus(prediction);

                              return (
                                <tr
                                  key={prediction.id}
                                  className="border-b border-white/45 text-sm last:border-0"
                                >
                                  <td className="py-3 pr-4 font-bold text-[#102A43]">
                                    {prediction.region_name}
                                  </td>
                                  <td className="py-3 pr-4 text-[#64748B]">
                                    {prediction.algorithm}
                                  </td>
                                  <td className="py-3 pr-4 font-bold text-[#102A43]">
                                    {Number(
                                      prediction.predicted_score || 0,
                                    ).toFixed(1)}
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span
                                      className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getRiskBadgeClass(
                                        status,
                                      )}`}
                                    >
                                      {status}
                                    </span>
                                  </td>
                                  <td className="py-3 font-bold text-[#0F766E]">
                                    {formatPercent(
                                      Number(prediction.confidence_score || 0) *
                                        100,
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {canReview && (
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <SectionHeader
                      badge="Human-in-the-Loop"
                      title="Antrian validasi"
                      description="Prediksi yang membutuhkan review manusia."
                    />

                    {pendingReviews.length === 0 ? (
                      <div className="rounded-[1.35rem] border border-white/60 bg-white/38 p-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                          <CheckCircle2 size={19} />
                        </div>
                        <p className="font-bold text-[#102A43]">
                          Tidak ada pending review.
                        </p>
                        <p className="mt-1 text-sm text-[#64748B]">
                          Semua prediksi prioritas sudah aman untuk saat ini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingReviews.map((prediction) => (
                          <div
                            key={prediction.id}
                            className="rounded-[1.25rem] border border-white/60 bg-white/38 p-4 ring-1 ring-white/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-[#102A43]">
                                  {prediction.region_name}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                                  {prediction.prediction_code} ·{" "}
                                  {prediction.algorithm} · Confidence{" "}
                                  {formatPercent(
                                    Number(prediction.confidence_score || 0) *
                                      100,
                                  )}
                                </p>
                              </div>

                              <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-extrabold text-yellow-800">
                                Review
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {canUseCsr && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <SectionHeader
                    badge="CSR Matching"
                    title="Rekomendasi wilayah untuk program CSR"
                    description="Pilih fokus program dan skala budget, lalu sistem akan menghitung kecocokan wilayah."
                    action={
                      <Button onClick={handleCsrMatch} disabled={csrLoading}>
                        {csrLoading ? "Menghitung..." : "Cari Rekomendasi"}
                        {!csrLoading && <ArrowUpRight size={17} />}
                      </Button>
                    }
                  />

                  <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-[#102A43]">
                          Fokus Program
                        </label>
                        <select
                          value={focusArea}
                          onChange={(event) => setFocusArea(event.target.value)}
                          className="mt-2 h-12 w-full rounded-2xl border border-white/65 bg-white/55 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl focus:border-[#5EEAD4] focus:ring-[#5EEAD4]/70"
                        >
                          {focusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-[#102A43]">
                          Skala Budget
                        </label>
                        <select
                          value={budgetRange}
                          onChange={(event) =>
                            setBudgetRange(event.target.value)
                          }
                          className="mt-2 h-12 w-full rounded-2xl border border-white/65 bg-white/55 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl focus:border-[#5EEAD4] focus:ring-[#5EEAD4]/70"
                        >
                          {budgetOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {csrError && (
                        <p className="rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm font-semibold text-red-700">
                          {csrError}
                        </p>
                      )}
                    </div>

                    <div>
                      {!csrResult ? (
                        <EmptyState label="Klik Cari Rekomendasi untuk menjalankan CSR Matching Engine." />
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {getSafeArray(csrResult.recommended).map((item) => {
                            const theme = getRiskTheme(item.risk_status);

                            return (
                              <div
                                key={item.region_id}
                                className="rounded-[1.25rem] border border-white/60 bg-white/38 p-4 ring-1 ring-white/30"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-extrabold text-[#102A43]">
                                      {item.region_name}
                                    </p>
                                    <p className="mt-1 text-xs text-[#64748B]">
                                      Match score
                                    </p>
                                  </div>

                                  <span className="text-xl font-extrabold text-[#0F766E]">
                                    {item.match_score}
                                  </span>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/60">
                                  <div
                                    className={`h-full rounded-full ${theme.bar}`}
                                    style={{
                                      width: `${Math.max(
                                        10,
                                        Number(item.match_score || 0),
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <ul className="mt-3 space-y-1.5">
                                  {getSafeArray(item.reasons)
                                    .slice(0, 2)
                                    .map((reason) => (
                                      <li
                                        key={reason}
                                        className="text-xs leading-5 text-[#64748B]"
                                      >
                                        • {reason}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
