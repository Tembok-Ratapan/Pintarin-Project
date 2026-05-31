import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  HandHeart,
  Layers3,
  LineChart,
  MapPinned,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

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
                  <p className="truncate text-sm font-extrabold uppercase tracking-[-0.01em] text-[#102A43]">
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

function PendingReviewList({ predictions = [] }) {
  if (predictions.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-white/70 bg-white/44 p-5 ring-1 ring-white/40">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
          <CheckCircle2 size={20} />
        </div>

        <p className="font-extrabold text-[#102A43]">
          Tidak ada pending review.
        </p>

        <p className="mt-2 text-sm leading-7 text-[#64748B]">
          Semua prediksi prioritas sudah aman untuk saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {predictions.slice(0, 6).map((prediction) => (
        <div
          key={prediction.id}
          className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-extrabold uppercase tracking-[-0.01em] text-[#102A43]">
                {prediction.region_name || prediction.nama_kecamatan || "-"}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                {prediction.prediction_code || `PRED-${prediction.id}`} ·{" "}
                {prediction.algorithm || "AI Model"} · Confidence{" "}
                {formatPercent(Number(prediction.confidence_score || 0) * 100)}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-extrabold text-yellow-800">
              Review
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsGrid({ summary = {} }) {
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
      value: formatCurrency(summary.total_csr_value),
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

            <p className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[#102A43]">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const summary = summaryData?.summary || {};
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
              limit: 6,
              signal: controller.signal,
            }),
          ]);

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
          setPendingReviews(getArray(pendingResult.value?.predictions));
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
        setIsLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

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
      value: formatNumber(summary.pending_reviews || pendingReviews.length),
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
        <span className="font-extrabold text-[#0F766E]">
          {formatPercent(Number(prediction.confidence_score || 0) * 100)}
        </span>
      ),
    },
  ];

  return (
    <DashboardShell
      badge="Pusat Kendali"
      title="Pusat Kendali"
      description="Pantau data, ajuan, dan bantuan."
    >
      {isLoading ? (
        <LoadingState label="Mengambil data dashboard dari backend..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Sebagian data dashboard belum bisa dimuat."
              description={`${errorMessage} Pastikan backend berjalan di http://localhost:5000.`}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <DashboardChoroplethPanel
            badge="Peta Bantuan"
            title="Peta Bantuan"
            description="Wilayah prioritas untuk keputusan bantuan."
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
              <PendingReviewList predictions={pendingReviews} />
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
                value: formatNumber(summary.pending_reviews),
              },
              {
                title: "CSR Alignment",
                description:
                  "Mitra CSR diarahkan ke wilayah dengan kebutuhan relevan.",
                icon: HandHeart,
                value: formatCurrency(summary.total_csr_value),
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

                    <p className="mt-6 text-xl font-extrabold tracking-[-0.03em] text-[#0F766E]">
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
