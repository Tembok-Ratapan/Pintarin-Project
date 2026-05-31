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
import {
  formatNumber,
  formatPercent,
  getRiskBadgeClass,
} from "../../../lib/utils";
import DashboardEmptyState from "../components/DashboardEmptyState";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import { dashboardService } from "../dashboardService";
import SchoolRequestReviewPanel from "../components/SchoolRequestReviewPanel";
import CsrAidReviewPanel from "../components/CsrAidReviewPanel";
import DashboardChoroplethPanel from "../components/DashboardChoroplethPanel";

const riskOptions = ["Rendah", "Sedang", "Tinggi"];

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getRegionName = (prediction) => {
  return prediction.region_name || prediction.nama_kecamatan || "-";
};

const getPredictionLabel = (prediction) => {
  return prediction.final_label || prediction.predicted_label || "Sedang";
};

const getPredictionScore = (prediction) => {
  return Number(prediction.predicted_score || prediction.risk_score || 0);
};

const getConfidencePercent = (prediction) => {
  const score = Number(prediction.confidence_score || 0);

  return score <= 1 ? score * 100 : score;
};

function ConfidenceBar({ value }) {
  const percent = Math.max(0, Math.min(100, Number(value || 0)));
  const barClass =
    percent < 70
      ? "bg-red-600"
      : percent < 85
        ? "bg-yellow-400"
        : "bg-[#0F766E]";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#64748B]">
        <span>AI Confidence</span>
        <span>{formatPercent(percent)}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ReviewCard({
  prediction,
  isProcessing,
  onApprove,
  onFlag,
  onOverride,
}) {
  const label = getPredictionLabel(prediction);
  const confidence = getConfidencePercent(prediction);
  const score = getPredictionScore(prediction);

  return (
    <div className="rounded-[1.55rem] border border-white/70 bg-white/50 p-5 shadow-lg shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold uppercase tracking-[-0.02em] text-[#102A43]">
              {getRegionName(prediction)}
            </h3>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getRiskBadgeClass(
                label,
              )}`}
            >
              Risiko {label}
            </span>
          </div>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            {prediction.prediction_code || `PRED-${prediction.id}`} ·{" "}
            {prediction.algorithm || "AI Model"} · Tahun{" "}
            {prediction.year || prediction.tahun || "-"}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(prediction)}
            disabled={isProcessing}
          >
            <CheckCircle2 size={16} />
            Approve
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onOverride(prediction)}
            disabled={isProcessing}
          >
            <SlidersHorizontal size={16} />
            Override
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onFlag(prediction)}
            disabled={isProcessing}
          >
            <AlertTriangle size={16} />
            Flag
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Risk Score
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#102A43]">
            {score.toFixed(1)}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <ConfidenceBar value={confidence} />
        </div>
      </div>
    </div>
  );
}

function OverrideModal({ prediction, isSubmitting, onClose, onConfirm }) {
  const [correctedLabel, setCorrectedLabel] = useState("Sedang");
  const [reason, setReason] = useState("");

  if (!prediction) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0B172A]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/86 p-6 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl">
        <div className="mb-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
            Override Prediksi
          </p>

          <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#102A43]">
            {getRegionName(prediction)}
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            Label AI saat ini:{" "}
            <span className="font-extrabold text-[#102A43]">
              {getPredictionLabel(prediction)}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-extrabold text-[#102A43]">
              Label koreksi
            </label>

            <select
              value={correctedLabel}
              onChange={(event) => setCorrectedLabel(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
            >
              {riskOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-extrabold text-[#102A43]">
              Catatan validasi
            </label>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-medium leading-7 text-[#102A43] outline-none ring-1 ring-white/40 placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
              placeholder="Contoh: data lapangan menunjukkan kondisi wilayah berbeda dari prediksi AI..."
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>

          <Button
            onClick={() =>
              onConfirm({
                correctedLabel,
                reason,
              })
            }
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Konfirmasi Override"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OfficerDashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [pendingPayload, setPendingPayload] = useState({
    count: 0,
    predictions: [],
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [activeAction, setActiveAction] = useState("");
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
            limit: 12,
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

  const handleValidate = async ({
    prediction,
    action,
    correctedLabel,
    reason,
  }) => {
    const actionKey = `${prediction.id}-${action}`;
    setActiveAction(actionKey);
    setErrorMessage("");

    try {
      await dashboardService.validatePrediction({
        predictionId: prediction.id,
        action,
        correctedLabel,
        reason,
      });

      setSelectedPrediction(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Validasi prediksi gagal diproses.",
      );
    } finally {
      setActiveAction("");
    }
  };

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
      description="Validasi ajuan dan penyaluran."
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
              {pendingReviews.length === 0 ? (
                <DashboardEmptyState
                  title="Tidak ada pending review."
                  description="Semua prediksi yang butuh validasi sudah diproses."
                />
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((prediction) => (
                    <ReviewCard
                      key={prediction.id}
                      prediction={prediction}
                      isProcessing={activeAction.startsWith(
                        `${prediction.id}-`,
                      )}
                      onApprove={(item) =>
                        handleValidate({
                          prediction: item,
                          action: "approve",
                          reason: "Approved by officer.",
                        })
                      }
                      onFlag={(item) =>
                        handleValidate({
                          prediction: item,
                          action: "flag_for_review",
                          reason: "Flagged for further review.",
                        })
                      }
                      onOverride={setSelectedPrediction}
                    />
                  ))}
                </div>
              )}
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
                    title: "Flag",
                    description:
                      "Gunakan saat prediksi perlu diskusi lanjutan atau data pendukung belum cukup.",
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

      <OverrideModal
        prediction={selectedPrediction}
        isSubmitting={Boolean(activeAction)}
        onClose={() => setSelectedPrediction(null)}
        onConfirm={({ correctedLabel, reason }) =>
          handleValidate({
            prediction: selectedPrediction,
            action: "override",
            correctedLabel,
            reason,
          })
        }
      />
    </DashboardShell>
  );
}
