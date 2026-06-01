import { cn, formatPercent } from "../../../lib/utils";

const normalizeConfidencePercent = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return number <= 1 ? number * 100 : number;
};

const isReviewNeeded = (value) => {
  return value === true || value === 1 || value === "1";
};

const getConfidenceLevel = ({ confidenceLevel, confidencePercent }) => {
  if (confidenceLevel) return confidenceLevel;
  if (confidencePercent === null) return "Rendah";
  if (confidencePercent >= 85) return "Tinggi";
  if (confidencePercent >= 70) return "Sedang";
  return "Rendah";
};

const levelStyles = {
  Tinggi: "border-[#5EEAD4]/70 bg-[#5EEAD4]/18 text-[#0F766E]",
  Sedang: "border-yellow-300/70 bg-yellow-100/70 text-yellow-800",
  Rendah: "border-red-300/70 bg-red-100/70 text-red-700",
};

export default function PredictionConfidenceBadge({
  confidenceScore,
  confidenceLevel,
  needsHumanReview,
  compact = false,
  className,
}) {
  const confidencePercent = normalizeConfidencePercent(confidenceScore);
  const level = getConfidenceLevel({ confidenceLevel, confidencePercent });
  const shouldReview = isReviewNeeded(needsHumanReview);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-full border font-extrabold ring-1 ring-white/40 backdrop-blur-xl",
          compact ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
          levelStyles[level] || levelStyles.Rendah,
        )}
      >
        AI {level} ·{" "}
        {confidencePercent === null ? "Belum ada" : formatPercent(confidencePercent)}
      </span>

      {shouldReview && (
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full border border-orange-300/70 bg-orange-100/75 font-extrabold text-orange-700 ring-1 ring-white/40 backdrop-blur-xl",
            compact ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
          )}
        >
          Perlu Review Manual
        </span>
      )}
    </div>
  );
}