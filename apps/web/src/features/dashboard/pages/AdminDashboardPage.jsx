import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Database,
  HandHeart,
  Layers3,
  LineChart,
  MapPinned,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import LoadingState from "../../../components/feedback/LoadingState";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getRiskBadgeClass,
} from "../../../lib/utils";
import DashboardEmptyState from "../components/DashboardEmptyState";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import DashboardTable from "../components/DashboardTable";
import { dashboardService } from "../dashboardService";
import SchoolRequestReviewPanel from "../components/SchoolRequestReviewPanel";
import CsrAidReviewPanel from "../components/CsrAidReviewPanel";
import DashboardChoroplethPanel from "../components/DashboardChoroplethPanel";
import PredictionConfidenceBadge from "../components/PredictionConfidenceBadge";
import PredictionReviewQueuePanel from "../components/PredictionReviewQueuePanel";

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getRiskBarClass = (riskStatus) => {
  if (riskStatus === "Tinggi") return "bg-red-600";
  if (riskStatus === "Sedang") return "bg-yellow-400";
  return "bg-green-600";
};

const getPriorityWidth = (ranking) => {
  const rank = Number(ranking || 10);
  return `${Math.max(34, 100 - (rank - 1) * 6)}%`;
};

const getPredictionLabel = (prediction) => {
  return prediction?.final_label || prediction?.predicted_label || "Sedang";
};

const getPredictionScore = (prediction) => {
  return Number(prediction?.predicted_score || prediction?.risk_score || 0);
};

function PriorityRegionList({ regions = [] }) {
  if (regions.length === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada wilayah prioritas."
        description="Data ranking prioritas akan tampil setelah endpoint analytics mengirimkan data."
      />
    );
  }

  return (
    <div className="space-y-3">
      {regions.slice(0, 8).map((region) => {
        const riskStatus = region.risk_status || "Sedang";

        return (
          <div
            key={region.id}
            className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${getRiskBarClass(
                      riskStatus,
                    )}`}
                  />
                  <p className="truncate text-sm font-extrabold uppercase text-[#102A43]">
                    {region.name}
                  </p>
                </div>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Warga rentan{" "}
                  {formatNumber(region.total_vulnerable_population)} · Gap PIP{" "}
                  {formatNumber(region.pip_gap)}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-extrabold ${getRiskBadgeClass(
                  riskStatus,
                )}`}
              >
                #{region.risk_ranking}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
              <div
                className={`h-full rounded-full ${getRiskBarClass(riskStatus)}`}
                style={{ width: getPriorityWidth(region.risk_ranking) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsGrid({ summary = {} }) {
  const latestCsrValue = Number(summary.total_csr_value || 0);

  const analyticsItems = [
    {
      label: "Total Populasi",
      value: formatNumber(summary.total_population),
      icon: UsersRound,
    },
    {
      label: "Warga Rentan",
      value: formatNumber(summary.total_vulnerable_population),
      icon: Activity,
    },
    {
      label: "Rasio Rentan",
      value: formatPercent(summary.avg_vulnerable_ratio),
      icon: LineChart,
    },
    {
      label: "Nilai CSR",
      value: formatCurrency(latestCsrValue),
      icon: HandHeart,
    },
    {
      label: "Prediksi AI",
      value: formatNumber(summary.total_predictions),
      icon: Sparkles,
    },
    {
      label: "Avg Confidence",
      value: formatPercent(Number(summary.avg_confidence_score || 0) * 100),
      icon: Layers3,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {analyticsItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
              <Icon size={18} />
            </div>

            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
              {item.label}
            </p>

            <p className="mt-2 text-xl font-extrabold text-[#102A43]">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function AdminControlCenterPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const summary = summaryData?.summary || {};
  const latestCsrValue = Number(summary.total_csr_value || 0);
  const topRiskRegions = getArray(summaryData?.top_risk_regions);

  const highRiskRegions = regions.filter((region) => {
    return (
      region.risk_status === "Tinggi" ||
      region.dominant_risk_status === "Tinggi"
    );
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [summaryResult, regionsResult, predictionsResult, pendingResult] =
          await Promise.allSettled([
            dashboardService.getAnalyticsSummary(controller.signal),
            dashboardService.getRegions(controller.signal),
            dashboardService.getLatestPredictions({
              limit: 8,
              signal: controller.signal,
            }),
            dashboardService.getPendingReviews({
              limit: 8,
              signal: controller.signal,
            }),
          ]);

        if (controller.signal.aborted) return;

        if (summaryResult.status === "fulfilled") {
          setSummaryData(summaryResult.value);
        }

        if (regionsResult.status === "fulfilled") {
          setRegions(getArray(regionsResult.value));
        }

        if (predictionsResult.status === "fulfilled") {
          setLatestPredictions(getArray(predictionsResult.value?.predictions));
        }

        if (pendingResult.status === "fulfilled") {
          setPendingReviewCount(
            pendingResult.value?.count ||
              getArray(pendingResult.value?.predictions).length,
          );
        }

        if (summaryResult.status === "rejected") {
          setErrorMessage(
            "Data utama dashboard belum bisa diambil dari backend.",
          );
        }
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          setErrorMessage("Dashboard belum bisa terhubung ke backend.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [reloadKey]);

  const metricCards = [
    {
      label: "Kecamatan",
      value: formatNumber(summary.total_regions || regions.length),
      helper: "Wilayah aktif dalam database",
      icon: MapPinned,
      tone: "teal",
    },
    {
      label: "Risiko Tinggi",
      value: formatNumber(summary.high_risk_regions || highRiskRegions.length),
      helper: "Wilayah butuh prioritas",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "Sekolah",
      value: formatNumber(summary.total_schools),
      helper: "Data sekolah terhubung",
      icon: School,
      tone: "teal",
    },
    {
      label: "Pending Review",
      value: formatNumber(summary.pending_reviews || pendingReviewCount),
      helper: "Prediksi menunggu validasi",
      icon: Clock3,
      tone: "amber",
    },
  ];

  const predictionColumns = [
    {
      key: "region",
      header: "Wilayah",
      render: (prediction) => (
        <span className="font-extrabold uppercase text-[#102A43]">
          {prediction.region_name || prediction.nama_kecamatan || "-"}
        </span>
      ),
    },
    {
      key: "algorithm",
      header: "Algoritma",
      render: (prediction) => prediction.algorithm || "-",
    },
    {
      key: "score",
      header: "Skor",
      render: (prediction) => (
        <span className="font-extrabold text-[#102A43]">
          {getPredictionScore(prediction).toFixed(1)}
        </span>
      ),
    },
    {
      key: "label",
      header: "Label",
      render: (prediction) => {
        const label = getPredictionLabel(prediction);

        return (
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getRiskBadgeClass(
              label,
            )}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "confidence",
      header: "Confidence",
      render: (prediction) => (
        <PredictionConfidenceBadge
          compact
          confidenceScore={prediction.confidence_score}
          confidenceLevel={prediction.confidence_level}
          needsHumanReview={prediction.needs_human_review}
        />
      ),
    },
    {
      key: "recommendation",
      header: "Rekomendasi",
      render: (prediction) => (
        <span className="block max-w-[360px] text-xs font-semibold leading-5 text-[#64748B]">
          {prediction.recommendation_text || "Belum ada rekomendasi AI."}
        </span>
      ),
    },
  ];

  return (
    <DashboardShell
      badge="Pusat Kendali"
      title="Pusat Kendali"
      description="Pantau data, ajuan, bantuan, dan prediksi AI."
    >
      {isLoading ? (
        <LoadingState label="Mengambil data dashboard dari backend..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Sebagian data dashboard belum bisa dimuat."
              description={`${errorMessage} Pastikan konfigurasi API deployment sudah benar.`}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <DashboardChoroplethPanel
            regions={regions}
            topRegions={topRiskRegions}
          />

          <SchoolRequestReviewPanel />

          <CsrAidReviewPanel />

          <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
            <DashboardSection
              badge="Analytics"
              title="Kesehatan bantuan pendidikan"
              description="Ringkasan indikator utama untuk membaca kondisi wilayah dan bantuan pendidikan."
            >
              <AnalyticsGrid summary={summary} />
            </DashboardSection>

            <DashboardSection
              badge="Priority"
              title="Wilayah prioritas"
              description="Ranking wilayah dengan kebutuhan bantuan tertinggi dari analytics snapshot terbaru."
            >
              <PriorityRegionList regions={topRiskRegions} />
            </DashboardSection>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <DashboardSection
              badge="AI Prediction"
              title="Prediksi terbaru"
              description="Skor tertinggi dari model AI pada tahun prediksi terbaru."
            >
              <DashboardTable
                columns={predictionColumns}
                rows={latestPredictions}
                getRowKey={(prediction) => prediction.id}
                emptyTitle="Belum ada prediksi terbaru."
                emptyDescription="Data prediksi akan tampil setelah endpoint predictions/latest mengirimkan response."
              />
            </DashboardSection>

            <DashboardSection
              badge="Human-in-the-Loop"
              title="Antrian validasi"
              description="Prediksi yang membutuhkan review manusia sebelum menjadi keputusan final."
            >
              <PredictionReviewQueuePanel
                limit={8}
                compact
                onValidated={() => setReloadKey((current) => current + 1)}
              />
            </DashboardSection>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Risk Scoring",
                description:
                  "Model membaca wilayah dengan risiko pendidikan tertinggi.",
                icon: Sparkles,
                value: formatNumber(summary.total_predictions),
              },
              {
                title: "Human Validation",
                description:
                  "Petugas dapat memvalidasi prediksi confidence rendah.",
                icon: ShieldCheck,
                value: formatNumber(summary.pending_reviews || pendingReviewCount),
              },
              {
                title: "CSR Alignment",
                description:
                  "Mitra CSR diarahkan ke wilayah dengan kebutuhan relevan.",
                icon: HandHeart,
                value: formatCurrency(latestCsrValue),
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <DashboardSection
                  key={item.title}
                  className="min-h-full"
                  contentClassName="h-full"
                >
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                        <Icon size={20} />
                      </div>

                      <h3 className="text-lg font-extrabold text-[#102A43]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#64748B]">
                        {item.description}
                      </p>
                    </div>

                    <p className="mt-6 text-xl font-extrabold text-[#0F766E]">
                      {item.value}
                    </p>
                  </div>
                </DashboardSection>
              );
            })}
          </div>
        </>
      )}
    </DashboardShell>
  );
}

const adminQuickLinks = [
  {
    title: "Pusat Kendali",
    description: "Dashboard penuh untuk validasi, peta risiko, prediksi, dan antrian review.",
    path: "/dashboard/admin/control-center",
    icon: ShieldCheck,
  },
  {
    title: "Manage Database",
    description: "Kelola data aktif yang sudah di-whitelist untuk kebutuhan admin.",
    path: "/dashboard/admin/manage-database",
    icon: Database,
  },
  {
    title: "Dinas",
    description: "Masuk ke overview, validasi CSR, validasi sekolah, dan review AI.",
    path: "/dashboard/admin/dinas/overview",
    icon: MapPinned,
  },
  {
    title: "CSR",
    description: "Pantau matching bantuan, pengajuan CSR, dan riwayat proposal.",
    path: "/dashboard/csr/overview",
    icon: HandHeart,
  },
  {
    title: "Sekolah",
    description: "Pantau pengajuan kebutuhan dan riwayat bantuan sekolah.",
    path: "/dashboard/school/overview",
    icon: School,
  },
];

function AdminQuickLinkGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {adminQuickLinks.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className="group flex min-h-[11rem] flex-col justify-between rounded-[1.35rem] border border-white/70 bg-white/44 p-5 shadow-xl shadow-slate-300/18 ring-1 ring-white/40 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:bg-white/58 hover:shadow-2xl hover:shadow-[#5EEAD4]/16"
          >
            <div>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E] ring-1 ring-white/50 transition group-hover:bg-[#0F766E] group-hover:text-white">
                <Icon size={20} />
              </div>

              <h3 className="text-base font-extrabold text-[#102A43]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#64748B]">
                {item.description}
              </p>
            </div>

            <span className="mt-5 text-sm font-extrabold text-[#0F766E]">
              Buka fitur
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const summary = summaryData?.summary || {};
  const latestAnalyticsYear = summaryData?.year || null;
  const latestCsrValue = Number(summary.total_csr_value || 0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOverview = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [summaryResult, regionsResult, pendingResult] =
          await Promise.allSettled([
            dashboardService.getAnalyticsSummary(controller.signal),
            dashboardService.getRegions(controller.signal),
            dashboardService.getPendingReviews({
              limit: 1,
              signal: controller.signal,
            }),
          ]);

        if (controller.signal.aborted) return;

        if (summaryResult.status === "fulfilled") {
          setSummaryData(summaryResult.value);
        }

        if (regionsResult.status === "fulfilled") {
          setRegions(getArray(regionsResult.value));
        }

        if (pendingResult.status === "fulfilled") {
          setPendingReviewCount(
            pendingResult.value?.count ||
              getArray(pendingResult.value?.predictions).length,
          );
        }

        if (summaryResult.status === "rejected") {
          setErrorMessage("Ringkasan admin belum bisa diambil dari backend.");
        }
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          setErrorMessage("Overview admin belum bisa terhubung ke backend.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchOverview();

    return () => controller.abort();
  }, []);

  const metricCards = [
    {
      label: "Wilayah",
      value: formatNumber(summary.total_regions || regions.length),
      helper: "Kecamatan aktif",
      icon: MapPinned,
      tone: "teal",
    },
    {
      label: "Sekolah",
      value: formatNumber(summary.total_schools),
      helper: "Data sekolah terhubung",
      icon: School,
      tone: "teal",
    },
    {
      label: "Pending Review",
      value: formatNumber(summary.pending_reviews || pendingReviewCount),
      helper: "Butuh validasi manusia",
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Nilai CSR",
      value: formatCurrency(latestCsrValue),
      helper: latestAnalyticsYear
        ? `CSR tersalurkan terbaru ${latestAnalyticsYear}`
        : "CSR tersalurkan terbaru",
      icon: HandHeart,
      tone: "teal",
    },
  ];

  return (
    <DashboardShell
      badge="Overview"
      title="Overview Admin"
      description="Pintu masuk untuk memantau sistem dan berpindah ke workspace utama."
    >
      {isLoading ? (
        <LoadingState label="Menyiapkan overview admin..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Sebagian data overview belum bisa dimuat."
              description={`${errorMessage} Pastikan konfigurasi API deployment sudah benar.`}
            />
          )}

          <div className="grid gap-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <DashboardSection
            badge="Workspace"
            title="Pilih area kerja"
            description="Admin dapat membuka fitur lintas role dari satu tempat."
          >
            <AdminQuickLinkGrid />
          </DashboardSection>

          <DashboardSection
            badge="Prioritas"
            title="Langkah admin yang disarankan"
            description="Mulai dari validasi data, lanjutkan ke review, lalu pastikan akses user sudah sesuai."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Cek data inti",
                  text: "Pastikan regions, schools, users, dan indikator pendidikan sudah sinkron.",
                  icon: Database,
                },
                {
                  title: "Review prediksi",
                  text: "Validasi prediksi confidence rendah sebelum dipakai sebagai keputusan final.",
                  icon: Sparkles,
                },
                {
                  title: "Pantau bantuan",
                  text: "Lihat ajuan sekolah dan CSR yang masih menunggu tindak lanjut.",
                  icon: HandHeart,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.35rem] border border-white/70 bg-white/42 p-5 ring-1 ring-white/40 backdrop-blur-xl"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                      <Icon size={18} />
                    </div>

                    <h3 className="text-sm font-extrabold text-[#102A43]">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </DashboardSection>
        </>
      )}
    </DashboardShell>
  );
}
