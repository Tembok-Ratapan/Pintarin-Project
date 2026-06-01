import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardErrorBanner from "./DashboardErrorBanner";
import PredictionConfidenceBadge from "./PredictionConfidenceBadge";
import { cn, formatPercent, getRiskBadgeClass } from "../../../lib/utils";
import { dashboardService } from "../dashboardService";

const riskOptions = ["Rendah", "Sedang", "Tinggi"];

const getRegionName = (prediction) => {
  return prediction?.region_name || prediction?.nama_kecamatan || "-";
};

const getPredictionLabel = (prediction) => {
  return prediction?.final_label || prediction?.predicted_label || "Sedang";
};

const getPredictionScore = (prediction) => {
  return Number(prediction?.predicted_score || prediction?.risk_score || 0);
};

const normalizeConfidencePercent = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return number <= 1 ? number * 100 : number;
};

function ReviewCard({ prediction, isProcessing, onApprove, onOverride }) {
  const label = getPredictionLabel(prediction);
  const score = getPredictionScore(prediction);
  const confidencePercent = normalizeConfidencePercent(
    prediction.confidence_score,
  );

  return (
    <article className="rounded-[1.55rem] border border-white/70 bg-white/50 p-5 shadow-lg shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold uppercase tracking-[-0.02em] text-[#102A43]">
              {getRegionName(prediction)}
            </h3>

            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-extrabold",
                getRiskBadgeClass(label),
              )}
            >
              Risiko {label}
            </span>
          </div>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            {prediction.prediction_code || `PRED-${prediction.id}`} ·{" "}
            {prediction.algorithm || "AI Model"} · Data{" "}
            {prediction.data_year || "-"} → Prediksi{" "}
            {prediction.prediction_year || "-"}
          </p>

          <div className="mt-3">
            <PredictionConfidenceBadge
              compact
              confidenceScore={prediction.confidence_score}
              confidenceLevel={prediction.confidence_level}
              needsHumanReview={prediction.needs_human_review}
            />
          </div>
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
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Risk Score
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#102A43]">
            {score.toFixed(1)}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Priority Score
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#102A43]">
            {Number(prediction.priority_score || 0).toFixed(1)}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Confidence
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#102A43]">
            {formatPercent(confidencePercent)}
          </p>
        </div>
      </div>

      {prediction.recommendation_text && (
        <div className="mt-4 rounded-[1.25rem] border border-[#5EEAD4]/35 bg-[#5EEAD4]/10 p-4 text-sm font-semibold leading-7 text-[#475569]">
          {prediction.recommendation_text}
        </div>
      )}
    </article>
  );
}

function OverrideModal({ prediction, isSubmitting, onClose, onConfirm }) {
  const [correctedLabel, setCorrectedLabel] = useState("");
  const [reason, setReason] = useState("");

  if (!prediction) return null;

  const canSubmit = correctedLabel && reason.trim().length >= 8;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0B172A]/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
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

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl border border-white/70 bg-white/60 p-2 text-[#64748B] transition hover:bg-white disabled:pointer-events-none disabled:opacity-50"
            aria-label="Tutup modal override"
          >
            <X size={18} />
          </button>
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
              <option value="">Pilih label final</option>
              {riskOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-extrabold text-[#102A43]">
              Alasan koreksi
            </label>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold leading-7 text-[#102A43] outline-none ring-1 ring-white/40 placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
              placeholder="Contoh: data lapangan menunjukkan kondisi wilayah berbeda dari prediksi AI."
            />

            <p className="mt-2 text-xs font-semibold text-[#64748B]">
              Minimal 8 karakter agar keputusan manual punya catatan audit.
            </p>
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
                reason: reason.trim(),
              })
            }
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Konfirmasi Override"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PredictionReviewQueuePanel({
  limit = 30,
  compact = false,
  onValidated,
}) {
  const [payload, setPayload] = useState({ count: 0, predictions: [] });
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [activeAction, setActiveAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const predictions = Array.isArray(payload.predictions)
    ? payload.predictions
    : [];

  const fetchPendingReviews = useCallback(
    async (signal) => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await dashboardService.getPendingReviews({
          limit,
          signal,
        });

        setPayload({
          count: result.count || result.predictions?.length || 0,
          predictions: Array.isArray(result.predictions)
            ? result.predictions
            : [],
        });
      } catch (error) {
        if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Antrian review prediksi gagal dimuat.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchPendingReviews(controller.signal);

    return () => controller.abort();
  }, [fetchPendingReviews]);

  const handleValidate = async ({
    prediction,
    action,
    correctedLabel = null,
    reason = null,
  }) => {
    const actionKey = `${prediction.id}-${action}`;

    setActiveAction(actionKey);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await dashboardService.validatePrediction({
        predictionId: prediction.id,
        action,
        correctedLabel,
        reason,
      });

      setSuccessMessage(
        action === "approve"
          ? "Prediksi berhasil disetujui."
          : "Prediksi berhasil dioverride.",
      );

      setSelectedPrediction(null);
      await fetchPendingReviews();

      if (onValidated) {
        onValidated();
      }
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

  if (isLoading) {
    return (
      <div className="rounded-[1.5rem] border border-white/70 bg-white/44 p-6 text-sm font-bold text-[#64748B] ring-1 ring-white/40">
        Mengambil antrian review prediksi AI...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <DashboardErrorBanner
          title="Antrian review belum bisa diproses."
          description={errorMessage}
        />
      )}

      {successMessage && (
        <div className="rounded-[1.35rem] border border-[#5EEAD4]/50 bg-[#5EEAD4]/12 p-4 text-sm font-extrabold text-[#0F766E] ring-1 ring-white/40">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 rounded-[1.35rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-extrabold text-[#102A43]">
            {payload.count || predictions.length} prediksi menunggu validasi
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">
            Data ini berasal dari prediksi AI dengan confidence rendah.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchPendingReviews()}
          disabled={Boolean(activeAction)}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {predictions.length === 0 ? (
        <DashboardEmptyState
          title="Tidak ada pending review."
          description="Semua prediksi yang butuh validasi manual sudah diproses."
        />
      ) : (
        <div className={cn("space-y-4", compact && "space-y-3")}>
          {predictions.map((prediction) => (
            <ReviewCard
              key={prediction.id}
              prediction={prediction}
              isProcessing={activeAction.startsWith(`${prediction.id}-`)}
              onApprove={(item) =>
                handleValidate({
                  prediction: item,
                  action: "approve",
                  reason:
                    "Prediksi AI disetujui melalui dashboard officer/admin.",
                })
              }
              onOverride={setSelectedPrediction}
            />
          ))}
        </div>
      )}

      <div className="rounded-[1.35rem] border border-orange-200/70 bg-orange-50/75 p-4 ring-1 ring-white/35">
        <div className="flex gap-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-orange-700"
          />
          <p className="text-sm font-semibold leading-7 text-orange-800">
            Gunakan <span className="font-extrabold">Approve</span> jika label
            AI sesuai. Gunakan <span className="font-extrabold">Override</span>{" "}
            hanya jika ada pertimbangan data atau kondisi lapangan yang lebih
            kuat.
          </p>
        </div>
      </div>

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
    </div>
  );
}
