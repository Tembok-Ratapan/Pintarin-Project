import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  HandHeart,
  Loader2,
  MapPinned,
  PiggyBank,
  Sparkles,
  Target,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercent,
  getRiskBadgeClass,
} from "../../../lib/utils";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardErrorBanner from "./DashboardErrorBanner";
import PredictionConfidenceBadge from "./PredictionConfidenceBadge";
import { dashboardService } from "../dashboardService";

const focusOptions = [
  {
    value: "umum",
    label: "Umum",
    description: "Rekomendasi seimbang untuk semua kebutuhan pendidikan.",
  },
  {
    value: "beasiswa",
    label: "Beasiswa / PIP",
    description: "Prioritaskan wilayah dengan coverage bantuan rendah.",
  },
  {
    value: "infrastruktur_sd",
    label: "Infrastruktur SD",
    description: "Prioritaskan wilayah dengan kebutuhan sekolah dasar.",
  },
  {
    value: "angka_putus_sekolah",
    label: "Pencegahan Putus Sekolah",
    description: "Prioritaskan wilayah dengan risiko pendidikan tinggi.",
  },
];

const budgetOptions = [
  {
    value: "semua",
    label: "Semua skala",
  },
  {
    value: "kecil",
    label: "< Rp100 juta",
  },
  {
    value: "sedang",
    label: "Rp100 juta – Rp500 juta",
  },
  {
    value: "besar",
    label: "> Rp500 juta",
  },
];

const getRegionName = (item) => {
  return item?.region_name || item?.nama_kecamatan || "-";
};

const getRiskLabel = (item) => {
  return (
    item?.final_label ||
    item?.dominant_prediction_label ||
    item?.predicted_label ||
    "Sedang"
  );
};

function SelectField({ label, value, onChange, children }) {
  return (
    <div>
      <label className="text-sm font-extrabold text-[#102A43]">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
      >
        {children}
      </select>
    </div>
  );
}

function MatchScoreBar({ score }) {
  const safeScore = Math.max(0, Math.min(Number(score || 0), 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
          Match Score
        </span>
        <span className="text-sm font-extrabold text-[#0F766E]">
          {safeScore}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#14B8A6] to-[#5EEAD4] transition-all"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ item, rank, onUseRecommendation }) {
  const riskLabel = getRiskLabel(item);
  const reasons = Array.isArray(item.reasons) ? item.reasons : [];

  return (
    <article className="rounded-[1.55rem] border border-white/70 bg-white/50 p-5 shadow-lg shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-sm font-black text-[#0F766E]">
              #{rank}
            </span>

            <h3 className="text-lg font-extrabold uppercase text-[#102A43]">
              {getRegionName(item)}
            </h3>

            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-extrabold",
                getRiskBadgeClass(riskLabel),
              )}
            >
              Risiko {riskLabel}
            </span>
          </div>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            {item.prediction_code || `AI-${item.prediction_id}`} ·{" "}
            {item.algorithm || "AI Matching"} · Prediksi{" "}
            {item.prediction_year || "-"}
          </p>

          <div className="mt-3">
            <PredictionConfidenceBadge
              compact
              confidenceScore={item.confidence_score}
              confidenceLevel={item.confidence_level}
              needsHumanReview={item.needs_human_review}
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-56">
          <MatchScoreBar score={item.match_score} />

          {onUseRecommendation && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => onUseRecommendation(item)}
            >
              <HandHeart size={16} />
              Pakai untuk Proposal
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Risk Score
          </p>
          <p className="mt-2 text-xl font-extrabold text-[#102A43]">
            {Number(item.predicted_score || 0).toFixed(1)}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Priority
          </p>
          <p className="mt-2 text-xl font-extrabold text-[#102A43]">
            {Number(item.priority_score || 0).toFixed(1)}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            PIP Coverage
          </p>
          <p className="mt-2 text-xl font-extrabold text-[#102A43]">
            {formatPercent(Number(item.pip_coverage_pct || 0))}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Warga Rentan
          </p>
          <p className="mt-2 text-xl font-extrabold text-[#102A43]">
            {formatNumber(item.total_vulnerable_population || 0)}
          </p>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="mt-4 rounded-[1.25rem] border border-[#5EEAD4]/35 bg-[#5EEAD4]/10 p-4">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0F766E]">
            Alasan rekomendasi
          </p>

          <ul className="space-y-2 text-sm font-semibold leading-7 text-[#475569]">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-1 shrink-0 text-[#0F766E]"
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.budget_fit && (
        <div className="mt-4 rounded-[1.25rem] border border-white/70 bg-white/38 p-4 text-sm font-semibold leading-7 text-[#64748B] ring-1 ring-white/35">
          <span className="font-extrabold text-[#102A43]">Budget fit:</span>{" "}
          {item.budget_fit}
        </div>
      )}
    </article>
  );
}

export default function CsrMatchingPanel({ onUseRecommendation }) {
  const [form, setForm] = useState({
    focusArea: "umum",
    budgetRange: "semua",
  });
  const [matchResult, setMatchResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const recommendations = Array.isArray(matchResult?.recommended)
    ? matchResult.recommended
    : [];

  const selectedFocus = focusOptions.find(
    (option) => option.value === form.focusArea,
  );

  const handleMatch = async () => {
    setIsMatching(true);
    setErrorMessage("");

    try {
      const result = await dashboardService.matchCsrRegions({
        focusArea: form.focusArea,
        budgetRange: form.budgetRange,
      });

      setMatchResult(result);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Rekomendasi CSR belum bisa diproses.",
      );
    } finally {
      setIsMatching(false);
    }
  };

  const handleUseRecommendation = (item) => {
    if (!onUseRecommendation) return;

    onUseRecommendation(item, {
      focusArea: form.focusArea,
      budgetRange: form.budgetRange,
    });
  };

  return (
    <div className="space-y-5">
      {errorMessage && (
        <DashboardErrorBanner
          title="CSR Matching belum bisa diproses."
          description={errorMessage}
        />
      )}

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[1.55rem] border border-white/70 bg-white/48 p-5 ring-1 ring-white/40 backdrop-blur-2xl">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#5EEAD4]/18 text-[#0F766E]">
              <Brain size={22} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#102A43]">
                AI CSR Matching
              </p>
              <p className="mt-1 text-sm leading-7 text-[#64748B]">
                Sistem akan memilih top 5 kecamatan berdasarkan risk score,
                priority score, confidence, dan kebutuhan wilayah.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <SelectField
              label="Fokus Program"
              value={form.focusArea}
              onChange={(value) =>
                setForm((current) => ({ ...current, focusArea: value }))
              }
            >
              {focusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>

            {selectedFocus && (
              <div className="rounded-2xl border border-white/70 bg-white/42 p-4 text-sm font-semibold leading-7 text-[#64748B] ring-1 ring-white/35">
                {selectedFocus.description}
              </div>
            )}

            <SelectField
              label="Skala Anggaran"
              value={form.budgetRange}
              onChange={(value) =>
                setForm((current) => ({ ...current, budgetRange: value }))
              }
            >
              {budgetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>

            <Button
              type="button"
              size="lg"
              className="w-full justify-center"
              onClick={handleMatch}
              disabled={isMatching}
            >
              {isMatching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {isMatching ? "Mencari rekomendasi..." : "Cari Rekomendasi AI"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.55rem] border border-white/70 bg-white/48 p-5 ring-1 ring-white/40 backdrop-blur-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#5EEAD4]/18 text-[#0F766E]">
              <Target size={20} />
            </div>
            <p className="text-sm font-extrabold text-[#102A43]">Model AI</p>
            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              {matchResult?.model_version
                ? `Menggunakan model versi ${matchResult.model_version}.`
                : "Menunggu proses matching pertama."}
            </p>
          </div>

          <div className="rounded-[1.55rem] border border-white/70 bg-white/48 p-5 ring-1 ring-white/40 backdrop-blur-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#5EEAD4]/18 text-[#0F766E]">
              <MapPinned size={20} />
            </div>
            <p className="text-sm font-extrabold text-[#102A43]">
              Tahun Prediksi
            </p>
            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              {matchResult?.prediction_year
                ? `Prediksi tahun ${matchResult.prediction_year}.`
                : "Menggunakan hasil AI terbaru dari backend."}
            </p>
          </div>

          <div className="rounded-[1.55rem] border border-white/70 bg-white/48 p-5 ring-1 ring-white/40 backdrop-blur-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#5EEAD4]/18 text-[#0F766E]">
              <HandHeart size={20} />
            </div>
            <p className="text-sm font-extrabold text-[#102A43]">Rekomendasi</p>
            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              {recommendations.length > 0
                ? `${recommendations.length} wilayah siap dipertimbangkan.`
                : "Top 5 wilayah akan tampil setelah matching."}
            </p>
          </div>

          <div className="rounded-[1.55rem] border border-white/70 bg-white/48 p-5 ring-1 ring-white/40 backdrop-blur-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-[#5EEAD4]/18 text-[#0F766E]">
              <PiggyBank size={20} />
            </div>
            <p className="text-sm font-extrabold text-[#102A43]">
              Estimasi Nilai CSR
            </p>
            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              {recommendations[0]?.total_csr_value
                ? formatCurrency(recommendations[0].total_csr_value)
                : "Disesuaikan dengan skala anggaran."}
            </p>
          </div>
        </div>
      </div>

      {matchResult && recommendations.length === 0 && (
        <DashboardEmptyState
          title="Belum ada rekomendasi."
          description="Pastikan batch prediction AI sudah dijalankan dan data predictions AI terbaru tersedia."
        />
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-2 rounded-[1.35rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35 sm:flex-row sm:items-center">
            <div>
              <p className="font-extrabold text-[#102A43]">
                Top {recommendations.length} rekomendasi wilayah CSR
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">
                Fokus: {form.focusArea} · Budget: {form.budgetRange} ·
                Confidence tertinggi tetap diprioritaskan bila relevan.
              </p>
            </div>
          </div>

          {recommendations.map((item, index) => (
            <RecommendationCard
              key={item.region_id || item.prediction_id}
              item={item}
              rank={index + 1}
              onUseRecommendation={
                onUseRecommendation ? handleUseRecommendation : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
