import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/feedback/LoadingState";
import { formatNumber, formatPercent } from "../../../lib/utils";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import { dashboardService } from "../dashboardService";
import SchoolRequestReviewPanel from "../components/SchoolRequestReviewPanel";
import CsrAidReviewPanel from "../components/CsrAidReviewPanel";
import DashboardChoroplethPanel from "../components/DashboardChoroplethPanel";
import PredictionReviewQueuePanel from "../components/PredictionReviewQueuePanel";

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getPredictionLabel = (prediction) => {
  return prediction?.final_label || prediction?.predicted_label || "Sedang";
};

const getConfidencePercent = (prediction) => {
  const score = Number(prediction?.confidence_score || 0);

  return score <= 1 ? score * 100 : score;
};

export default function OfficerDashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [pendingPayload, setPendingPayload] = useState({
    count: 0,
    predictions: [],
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const summary = summaryData?.summary || {};
  const topRiskRegions = getArray(summaryData?.top_risk_regions);
  const pendingReviews = getArray(pendingPayload.predictions);
  const pendingCount = pendingPayload.count || pendingReviews.length;

  const highRiskQueue = pendingReviews.filter(
    (prediction) => getPredictionLabel(prediction) === "Tinggi",
  );

  const lowConfidenceQueue = pendingReviews.filter(
    (prediction) => getConfidencePercent(prediction) < 70,
  );

  const avgConfidence =
    pendingReviews.length === 0
      ? 0
      : pendingReviews.reduce(
          (total, prediction) => total + getConfidencePercent(prediction),
          0,
        ) / pendingReviews.length;

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [summaryResult, pendingResult] = await Promise.allSettled([
          dashboardService.getAnalyticsSummary(controller.signal),
          dashboardService.getPendingReviews({
            limit: 30,
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        if (summaryResult.status === "fulfilled") {
          setSummaryData(summaryResult.value);
        }

        if (pendingResult.status === "fulfilled") {
          setPendingPayload(pendingResult.value);
        }

        if (pendingResult.status === "rejected") {
          setErrorMessage("Antrian review belum bisa diambil dari backend.");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.message || "Dashboard petugas belum bisa terhubung.",
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
  }, [reloadKey]);

  const metricCards = [
    {
      label: "Pending Review",
      value: formatNumber(pendingCount),
      helper: "Prediksi menunggu validasi",
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Risiko Tinggi",
      value: formatNumber(highRiskQueue.length),
      helper: "Perlu prioritas keputusan",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "Confidence Rendah",
      value: formatNumber(lowConfidenceQueue.length),
      helper: "Butuh pemeriksaan manual",
      icon: ShieldCheck,
      tone: "red",
    },
    {
      label: "Avg Confidence",
      value: formatPercent(avgConfidence),
      helper: `Total prediksi AI ${formatNumber(summary.total_predictions)}`,
      icon: ClipboardCheck,
      tone: "teal",
    },
  ];

  return (
    <DashboardShell
      badge="Ruang Dinas"
      title="Ruang Dinas"
      description="Validasi ajuan, bantuan CSR, dan prediksi AI yang membutuhkan review manual."
      actions={
        <Button
          variant="secondary"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={isLoading}
        >
          <RotateCcw size={16} />
          Refresh Data
        </Button>
      }
    >
      {isLoading ? (
        <LoadingState label="Mengambil antrian review dari backend..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Antrian review belum bisa dimuat."
              description={`${errorMessage} Pastikan backend berjalan dan akun memiliki role officer atau admin.`}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <DashboardChoroplethPanel
            badge="Peta Risiko"
            title="Peta Risiko"
            description="Wilayah yang perlu divalidasi dan diprioritaskan."
            topRegions={topRiskRegions}
          />

          <SchoolRequestReviewPanel />

          <CsrAidReviewPanel />

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <DashboardSection
              badge="Human-in-the-Loop"
              title="Antrian review prediksi"
              description="Prediksi confidence rendah perlu diperiksa sebelum dipakai sebagai keputusan final."
            >
              <PredictionReviewQueuePanel
                limit={30}
                onValidated={() => setReloadKey((current) => current + 1)}
              />
            </DashboardSection>

            <DashboardSection
              badge="Decision Guide"
              title="Prinsip validasi"
              description="Gunakan AI sebagai bantuan analisis, bukan sebagai keputusan tunggal."
            >
              <div className="space-y-4">
                {[
                  {
                    title: "Approve",
                    description:
                      "Gunakan saat label AI sesuai dengan konteks data dan kondisi wilayah.",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Override",
                    description:
                      "Gunakan saat petugas memiliki bukti lapangan yang lebih kuat dari prediksi AI.",
                    icon: SlidersHorizontal,
                  },
                  {
                    title: "Audit Trail",
                    description:
                      "Setiap keputusan validasi akan dicatat sebagai history untuk transparansi dan evaluasi.",
                    icon: AlertTriangle,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/35"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                        <Icon size={18} />
                      </div>

                      <p className="font-extrabold text-[#102A43]">
                        {item.title}
                      </p>

                      <p className="mt-2 text-sm leading-7 text-[#64748B]">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </DashboardSection>
          </div>
        </>
      )}
    </DashboardShell>
  );
}