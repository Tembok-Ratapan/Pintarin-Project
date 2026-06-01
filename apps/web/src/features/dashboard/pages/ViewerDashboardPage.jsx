import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Eye,
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
import PredictionConfidenceBadge from "../components/PredictionConfidenceBadge";

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getRegionName = (region) => {
  return region?.name || region?.region_name || region?.nama_kecamatan || "-";
};

const getRiskStatus = (item) => {
  return (
    item?.risk_status ||
    item?.dominant_risk_status ||
    item?.final_label ||
    item?.predicted_label ||
    "Sedang"
  );
};

const getRiskBarClass = (riskStatus) => {
  if (riskStatus === "Tinggi") return "bg-red-600";
  if (riskStatus === "Sedang") return "bg-yellow-400";
  return "bg-green-600";
};

const getPredictionScore = (prediction) => {
  return Number(prediction?.predicted_score || prediction?.risk_score || 0);
};

const getPriorityWidth = (ranking) => {
  const rank = Number(ranking || 10);
  return `${Math.max(34, 100 - (rank - 1) * 6)}%`;
};

function ReadOnlyNotice() {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/50 p-5 shadow-lg shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
          <Eye size={20} />
        </div>

        <div>
          <p className="font-extrabold text-[#102A43]">Mode read-only aktif</p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#64748B]">
            Viewer hanya dapat membaca insight umum. Aksi sensitif seperti
            validasi prediksi, override keputusan, CSR matching, dan pengelolaan
            user hanya tersedia untuk role yang berwenang.
          </p>
        </div>
      </div>
    </div>
  );
}

function PriorityRegionList({ regions = [] }) {
  if (regions.length === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada wilayah prioritas."
        description="Daftar wilayah prioritas akan tampil setelah data analytics tersedia."
      />
    );
  }

  return (
    <div className="space-y-3">
      {regions.slice(0, 8).map((region) => {
        const riskStatus = getRiskStatus(region);

        return (
          <div
            key={region.id || region.region_id || getRegionName(region)}
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
                    {getRegionName(region)}
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
                #{region.risk_ranking || "-"}
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

function PublicInsightGrid({ summary = {} }) {
  const insights = [
    {
      label: "Total Populasi",
      value: formatNumber(summary.total_population),
      icon: UsersRound,
    },
    {
      label: "Warga Rentan",
      value: formatNumber(summary.total_vulnerable_population),
      icon: AlertTriangle,
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
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {insights.map((item) => {
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

function ReadOnlyScopeGrid() {
  const scopes = [
    {
      title: "Melihat ringkasan",
      description:
        "Viewer dapat membaca statistik umum untuk memahami kondisi bantuan pendidikan.",
      icon: BarChart3,
    },
    {
      title: "Melihat prioritas wilayah",
      description:
        "Viewer dapat melihat wilayah prioritas tanpa melakukan perubahan data.",
      icon: MapPinned,
    },
    {
      title: "Melihat sinyal AI",
      description:
        "Viewer dapat membaca hasil prediksi dalam konteks insight, bukan validasi.",
      icon: Layers3,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {scopes.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
              <Icon size={18} />
            </div>

            <p className="font-extrabold text-[#102A43]">{item.title}</p>

            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function ViewerDashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const summary = summaryData?.summary || {};
  const topRiskRegions = getArray(summaryData?.top_risk_regions);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [summaryResult, predictionsResult] = await Promise.allSettled([
          dashboardService.getAnalyticsSummary(controller.signal),
          dashboardService.getLatestPredictions({
            limit: 8,
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        if (summaryResult.status === "fulfilled") {
          setSummaryData(summaryResult.value);
        }

        if (predictionsResult.status === "fulfilled") {
          setLatestPredictions(getArray(predictionsResult.value?.predictions));
        }

        if (summaryResult.status === "rejected") {
          setErrorMessage(
            "Data ringkasan viewer belum bisa diambil dari backend.",
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.message || "Viewer dashboard belum bisa terhubung.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const metricCards = [
    {
      label: "Kecamatan",
      value: formatNumber(summary.total_regions),
      helper: "Wilayah aktif dalam ringkasan",
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
      label: "Risiko Tinggi",
      value: formatNumber(summary.high_risk_regions),
      helper: "Wilayah prioritas utama",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "Prediksi AI",
      value: formatNumber(summary.total_predictions),
      helper: "Sinyal analitik tersedia",
      icon: Sparkles,
      tone: "blue",
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
      key: "score",
      header: "Risk Score",
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
        const riskStatus = getRiskStatus(prediction);

        return (
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getRiskBadgeClass(
              riskStatus,
            )}`}
          >
            {riskStatus}
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
      badge="Ruang Pantau"
      title="Ruang Pantau"
      description="Lihat ringkasan tanpa mengubah data."
    >
      {isLoading ? (
        <LoadingState label="Mengambil ringkasan viewer dari backend..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Ringkasan viewer belum bisa dimuat."
              description={`${errorMessage} Pastikan backend berjalan di http://localhost:5000.`}
            />
          )}

          <ReadOnlyNotice />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <DashboardSection
              badge="Public Summary"
              title="Ringkasan kondisi pendidikan"
              description="Statistik umum yang dapat dibaca tanpa akses aksi operasional."
            >
              <PublicInsightGrid summary={summary} />
            </DashboardSection>

            <DashboardSection
              badge="Priority Regions"
              title="Wilayah prioritas"
              description="Daftar wilayah dengan kebutuhan bantuan tertinggi."
            >
              <PriorityRegionList regions={topRiskRegions} />
            </DashboardSection>
          </div>

          <DashboardSection
            badge="AI Signal"
            title="Sinyal prediksi terbaru"
            description="Viewer dapat membaca hasil prediksi sebagai insight umum, tanpa melakukan validasi."
          >
            <DashboardTable
              columns={predictionColumns}
              rows={latestPredictions}
              getRowKey={(prediction) => prediction.id}
              emptyTitle="Belum ada prediksi terbaru."
              emptyDescription="Data prediksi akan tampil setelah endpoint predictions/latest tersedia."
            />
          </DashboardSection>

          <DashboardSection
            badge="Access Scope"
            title="Batas akses viewer"
            description="Role viewer menjaga informasi tetap terbuka untuk monitoring, namun tidak mengizinkan aksi yang mengubah keputusan."
          >
            <ReadOnlyScopeGrid />
          </DashboardSection>
        </>
      )}
    </DashboardShell>
  );
}
