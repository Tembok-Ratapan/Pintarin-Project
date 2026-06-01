import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  LineChart,
  MapPinned,
  Percent,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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

const riskOrder = ["Tinggi", "Sedang", "Rendah"];

const getArray = (value) => {
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

const getPredictionLabel = (prediction) => {
  return prediction?.final_label || prediction?.predicted_label || "Sedang";
};

const getPredictionScore = (prediction) => {
  return Number(prediction?.predicted_score || prediction?.risk_score || 0);
};

const getConfidencePercent = (prediction) => {
  const confidence = Number(prediction?.confidence_score || 0);
  return confidence <= 1 ? confidence * 100 : confidence;
};

const getRiskBarClass = (riskStatus) => {
  if (riskStatus === "Tinggi") return "bg-red-600";
  if (riskStatus === "Sedang") return "bg-yellow-400";
  return "bg-green-600";
};

const getRiskSoftClass = (riskStatus) => {
  if (riskStatus === "Tinggi") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (riskStatus === "Sedang") {
    return "border-yellow-200 bg-yellow-50 text-yellow-800";
  }

  return "border-green-200 bg-green-50 text-green-700";
};

const getRiskDistribution = (regions) => {
  const total = regions.length || 1;

  return riskOrder.map((riskStatus) => {
    const count = regions.filter(
      (region) => getRegionRiskStatus(region) === riskStatus,
    ).length;

    return {
      riskStatus,
      count,
      percentage: (count / total) * 100,
    };
  });
};

const getConfidenceBuckets = (predictions) => {
  const total = predictions.length || 1;

  const buckets = [
    {
      label: "Tinggi",
      description: "≥ 85%",
      count: predictions.filter(
        (prediction) => getConfidencePercent(prediction) >= 85,
      ).length,
      className: "bg-[#0F766E]",
    },
    {
      label: "Sedang",
      description: "70% - 84%",
      count: predictions.filter((prediction) => {
        const confidence = getConfidencePercent(prediction);
        return confidence >= 70 && confidence < 85;
      }).length,
      className: "bg-yellow-400",
    },
    {
      label: "Rendah",
      description: "< 70%",
      count: predictions.filter(
        (prediction) => getConfidencePercent(prediction) < 70,
      ).length,
      className: "bg-red-600",
    },
  ];

  return buckets.map((bucket) => ({
    ...bucket,
    percentage: (bucket.count / total) * 100,
  }));
};

const getTopRegionRows = (summaryData, regions) => {
  const topRiskRegions = getArray(summaryData?.top_risk_regions);

  if (topRiskRegions.length > 0) {
    return topRiskRegions.slice(0, 10);
  }

  return regions.slice(0, 10);
};

function RiskDistributionPanel({ regions = [] }) {
  const distribution = getRiskDistribution(regions);
  const totalRegions = regions.length;

  if (totalRegions === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada data distribusi risiko."
        description="Distribusi risiko akan tampil setelah data wilayah tersedia."
      />
    );
  }

  return (
    <div className="space-y-4">
      {distribution.map((item) => (
        <div
          key={item.riskStatus}
          className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-[#102A43]">
                Risiko {item.riskStatus}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#64748B]">
                {formatNumber(item.count)} wilayah
              </p>
            </div>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getRiskSoftClass(
                item.riskStatus,
              )}`}
            >
              {formatPercent(item.percentage)}
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full ${getRiskBarClass(item.riskStatus)}`}
              style={{ width: `${Math.max(3, item.percentage)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfidenceOverview({ predictions = [] }) {
  const buckets = getConfidenceBuckets(predictions);

  if (predictions.length === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada data confidence."
        description="Confidence overview akan tampil setelah data prediksi tersedia."
      />
    );
  }

  return (
    <div className="space-y-4">
      {buckets.map((bucket) => (
        <div
          key={bucket.label}
          className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-[#102A43]">
                Confidence {bucket.label}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#64748B]">
                {bucket.description} · {formatNumber(bucket.count)} prediksi
              </p>
            </div>

            <span className="rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-xs font-extrabold text-[#0F766E] ring-1 ring-white/40">
              {formatPercent(bucket.percentage)}
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full ${bucket.className}`}
              style={{ width: `${Math.max(3, bucket.percentage)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DataSignalGrid({ summary = {} }) {
  const items = [
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
      icon: Percent,
    },
    {
      label: "Nilai CSR",
      value: formatCurrency(summary.total_csr_value),
      icon: Database,
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
      {items.map((item) => {
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

export default function AnalystDashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const summary = summaryData?.summary || {};
  const regionRows = getTopRegionRows(summaryData, regions);

  const highRiskCount = regions.filter(
    (region) => getRegionRiskStatus(region) === "Tinggi",
  ).length;

  const lowConfidenceCount = latestPredictions.filter(
    (prediction) => getConfidencePercent(prediction) < 70,
  ).length;

  const avgPredictionScore =
    latestPredictions.length === 0
      ? 0
      : latestPredictions.reduce(
          (total, prediction) => total + getPredictionScore(prediction),
          0,
        ) / latestPredictions.length;

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [summaryResult, regionsResult, predictionsResult] =
          await Promise.allSettled([
            dashboardService.getAnalyticsSummary(controller.signal),
            dashboardService.getRegions(controller.signal),
            dashboardService.getLatestPredictions({
              limit: 12,
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

        if (summaryResult.status === "rejected") {
          setErrorMessage(
            "Data analytics utama belum bisa diambil dari backend.",
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.message || "Dashboard analyst belum bisa terhubung.",
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
      value: formatNumber(summary.total_regions || regions.length),
      helper: "Wilayah aktif dalam analisis",
      icon: MapPinned,
      tone: "teal",
    },
    {
      label: "Risiko Tinggi",
      value: formatNumber(summary.high_risk_regions || highRiskCount),
      helper: "Wilayah dengan prioritas tinggi",
      icon: TrendingUp,
      tone: "red",
    },
    {
      label: "Avg Risk Score",
      value: avgPredictionScore.toFixed(1),
      helper: "Rata-rata skor dari prediksi terbaru",
      icon: LineChart,
      tone: "blue",
    },
    {
      label: "Low Confidence",
      value: formatNumber(lowConfidenceCount),
      helper: "Prediksi yang perlu dicermati",
      icon: ShieldCheck,
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

  const regionColumns = [
    {
      key: "name",
      header: "Wilayah",
      render: (region) => (
        <span className="font-extrabold uppercase text-[#102A43]">
          {region.name || region.region_name || "-"}
        </span>
      ),
    },
    {
      key: "risk",
      header: "Risk",
      render: (region) => {
        const riskStatus = getRegionRiskStatus(region);

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
      key: "vulnerable",
      header: "Warga Rentan",
      render: (region) =>
        formatNumber(
          region.total_vulnerable_population ||
            region.avg_vulnerable_population,
        ),
    },
    {
      key: "pip_gap",
      header: "Gap PIP",
      render: (region) => formatNumber(region.pip_gap),
    },
  ];

  return (
    <DashboardShell
      badge="Ruang Analitik"
      title="Ruang Analitik"
      description="Baca pola, risiko, dan kualitas data."
    >
      {isLoading ? (
        <LoadingState label="Mengambil insight analytics dari backend..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Data analytics belum bisa dimuat."
              description={`${errorMessage} Pastikan backend berjalan di http://localhost:5000.`}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <DashboardSection
              badge="Data Signals"
              title="Sinyal utama bantuan pendidikan"
              description="Ringkasan indikator inti untuk membaca kondisi pendidikan dan bantuan."
            >
              <DataSignalGrid summary={summary} />
            </DashboardSection>

            <DashboardSection
              badge="Risk Distribution"
              title="Distribusi risiko wilayah"
              description="Komposisi status risiko pada wilayah yang tersedia di database."
            >
              <RiskDistributionPanel regions={regions} />
            </DashboardSection>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <DashboardSection
              badge="Confidence"
              title="Overview confidence model"
              description="Membaca seberapa kuat prediksi AI pada data terbaru."
            >
              <ConfidenceOverview predictions={latestPredictions} />
            </DashboardSection>

            <DashboardSection
              badge="Prediction Insight"
              title="Prediksi terbaru"
              description="Daftar skor risiko terbaru dari model AI untuk kebutuhan analisis."
            >
              <DashboardTable
                columns={predictionColumns}
                rows={latestPredictions}
                getRowKey={(prediction) => prediction.id}
                emptyTitle="Belum ada prediksi terbaru."
                emptyDescription="Data prediksi akan tampil setelah endpoint predictions/latest mengirimkan response."
              />
            </DashboardSection>
          </div>

          <DashboardSection
            badge="Region Comparison"
            title="Perbandingan wilayah prioritas"
            description="Tabel ringkas untuk membandingkan wilayah berdasarkan risiko, warga rentan, dan gap bantuan."
          >
            <DashboardTable
              columns={regionColumns}
              rows={regionRows}
              getRowKey={(region, index) =>
                region.id || region.region_id || index
              }
              emptyTitle="Belum ada data wilayah."
              emptyDescription="Data wilayah akan tampil setelah endpoint regions atau analytics summary tersedia."
            />
          </DashboardSection>
        </>
      )}
    </DashboardShell>
  );
}
