import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  HandHeart,
  MapPinned,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import Button from "../../../components/ui/Button";
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
import { dashboardService } from "../dashboardService";

const focusOptions = [
  {
    value: "umum",
    label: "Umum",
    description: "Rekomendasi umum berbasis prioritas risiko pendidikan.",
  },
  {
    value: "beasiswa",
    label: "Beasiswa",
    description:
      "Fokus pada wilayah dengan kebutuhan dukungan akses pendidikan.",
  },
  {
    value: "infrastruktur_sd",
    label: "Infrastruktur SD",
    description: "Fokus pada dukungan fasilitas dan kondisi sekolah dasar.",
  },
  {
    value: "angka_putus_sekolah",
    label: "Risiko Putus Sekolah",
    description: "Fokus pada wilayah dengan indikasi kerentanan pendidikan.",
  },
];

const budgetOptions = [
  { value: "semua", label: "Semua Budget" },
  { value: "kecil", label: "Kecil" },
  { value: "sedang", label: "Sedang" },
  { value: "besar", label: "Besar" },
];

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getRecommendations = (payload) => {
  return getArray(
    payload?.recommended ||
      payload?.recommendations ||
      payload?.matches ||
      payload?.regions ||
      payload?.data,
  );
};

const getRegionName = (item) => {
  return item.region_name || item.name || item.nama_kecamatan || "-";
};

const getRegionId = (item, index) => {
  return item.region_id || item.id || `${getRegionName(item)}-${index}`;
};

const getMatchScore = (item) => {
  return Number(item.match_score || item.score || item.match || 0);
};

const getRiskStatus = (item) => {
  return (
    item.risk_status || item.final_label || item.predicted_label || "Sedang"
  );
};

const getRiskBarClass = (riskStatus) => {
  if (riskStatus === "Tinggi") return "bg-red-600";
  if (riskStatus === "Sedang") return "bg-yellow-400";
  return "bg-green-600";
};

const getSelectedFocus = (focusArea) => {
  return (
    focusOptions.find((option) => option.value === focusArea) || focusOptions[0]
  );
};

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-extrabold text-[#102A43]">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CsrMatchingForm({
  focusArea,
  budgetRange,
  isSubmitting,
  onFocusChange,
  onBudgetChange,
  onSubmit,
}) {
  const selectedFocus = getSelectedFocus(focusArea);

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-white/70 bg-white/44 p-5 ring-1 ring-white/40 backdrop-blur-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
          <Target size={22} />
        </div>

        <h3 className="text-xl font-extrabold tracking-[-0.035em] text-[#102A43]">
          Parameter matching
        </h3>

        <p className="mt-2 text-sm leading-7 text-[#64748B]">
          Pilih fokus program dan skala budget agar sistem menghitung wilayah
          yang paling relevan untuk bantuan CSR.
        </p>
      </div>

      <div className="grid gap-4">
        <SelectField
          label="Fokus Program"
          value={focusArea}
          onChange={onFocusChange}
          options={focusOptions}
        />

        <SelectField
          label="Skala Budget"
          value={budgetRange}
          onChange={onBudgetChange}
          options={budgetOptions}
        />
      </div>

      <div className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
          Fokus dipilih
        </p>

        <p className="mt-2 font-extrabold text-[#102A43]">
          {selectedFocus.label}
        </p>

        <p className="mt-2 text-sm leading-7 text-[#64748B]">
          {selectedFocus.description}
        </p>
      </div>

      <Button
        className="w-full justify-center"
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Menghitung rekomendasi..." : "Cari Rekomendasi"}
        {!isSubmitting && <ArrowUpRight size={18} />}
      </Button>
    </div>
  );
}

function RecommendationCard({ item, index }) {
  const riskStatus = getRiskStatus(item);
  const matchScore = getMatchScore(item);
  const reasons = getArray(
    item.reasons || item.reason_list || item.match_reasons,
  );
  const suggestedPrograms = getArray(
    item.suggested_programs || item.programs || item.recommendations,
  );

  return (
    <div className="rounded-[1.55rem] border border-white/70 bg-white/50 p-5 shadow-lg shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-lg font-extrabold uppercase tracking-[-0.02em] text-[#102A43]">
              {getRegionName(item)}
            </p>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getRiskBadgeClass(
                riskStatus,
              )}`}
            >
              Risiko {riskStatus}
            </span>
          </div>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            Rekomendasi #{index + 1} untuk program CSR pendidikan.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Match
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#0F766E]">
            {formatPercent(matchScore)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-bold text-[#64748B]">
          <span>Match strength</span>
          <span>{formatPercent(matchScore)}</span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
          <div
            className={`h-full rounded-full ${getRiskBarClass(riskStatus)}`}
            style={{
              width: `${Math.max(8, Math.min(100, matchScore))}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Alasan matching
          </p>

          {reasons.length === 0 ? (
            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              Sistem menilai wilayah ini relevan berdasarkan prioritas risiko
              dan kebutuhan bantuan.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {reasons.slice(0, 3).map((reason) => (
                <li key={reason} className="text-sm leading-6 text-[#64748B]">
                  • {reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[1.25rem] border border-white/70 bg-white/42 p-4 ring-1 ring-white/35">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Program cocok
          </p>

          {suggestedPrograms.length === 0 ? (
            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              Program dapat diarahkan ke dukungan pendidikan sesuai fokus CSR.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedPrograms.slice(0, 4).map((program) => (
                <span
                  key={program}
                  className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-xs font-extrabold text-[#0F766E] ring-1 ring-white/40"
                >
                  {program}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationList({ recommendations = [] }) {
  if (recommendations.length === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada hasil matching."
        description="Pilih parameter program CSR lalu klik Cari Rekomendasi untuk menampilkan wilayah yang paling relevan."
      />
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((item, index) => (
        <RecommendationCard
          key={getRegionId(item, index)}
          item={item}
          index={index}
        />
      ))}
    </div>
  );
}

function PriorityFitList({ regions = [] }) {
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
      {regions.slice(0, 6).map((region) => {
        const riskStatus = getRiskStatus(region);

        return (
          <div
            key={region.id || region.region_id || region.name}
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
          </div>
        );
      })}
    </div>
  );
}

export default function CsrDashboardPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [focusArea, setFocusArea] = useState("umum");
  const [budgetRange, setBudgetRange] = useState("semua");
  const [matchPayload, setMatchPayload] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [matchError, setMatchError] = useState("");

  const summary = summaryData?.summary || {};
  const topRiskRegions = getArray(summaryData?.top_risk_regions);
  const recommendations = getRecommendations(matchPayload);

  const highRiskRecommendations = recommendations.filter(
    (item) => getRiskStatus(item) === "Tinggi",
  );

  const avgMatchScore =
    recommendations.length === 0
      ? 0
      : recommendations.reduce(
          (total, item) => total + getMatchScore(item),
          0,
        ) / recommendations.length;

  useEffect(() => {
    const controller = new AbortController();

    const fetchSummary = async () => {
      setIsPageLoading(true);
      setErrorMessage("");

      try {
        const result = await dashboardService.getAnalyticsSummary(
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setSummaryData(result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.message || "Data ringkasan CSR belum bisa diambil.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsPageLoading(false);
        }
      }
    };

    fetchSummary();

    return () => controller.abort();
  }, []);

  const handleMatch = async () => {
    setIsMatching(true);
    setMatchError("");

    try {
      const result = await dashboardService.matchCsrRegions({
        focusArea,
        budgetRange,
      });

      setMatchPayload(result);
    } catch (error) {
      setMatchError(
        error.response?.data?.message ||
          error.message ||
          "CSR Matching Engine belum bisa dijalankan.",
      );
    } finally {
      setIsMatching(false);
    }
  };

  const metricCards = [
    {
      label: "Nilai CSR",
      value: formatCurrency(summary.total_csr_value),
      helper: "Total nilai program CSR tercatat",
      icon: HandHeart,
      tone: "teal",
    },
    {
      label: "Wilayah Prioritas",
      value: formatNumber(topRiskRegions.length),
      helper: "Wilayah dengan ranking bantuan",
      icon: MapPinned,
      tone: "red",
    },
    {
      label: "Rekomendasi",
      value: formatNumber(recommendations.length),
      helper: "Hasil matching aktif",
      icon: Sparkles,
      tone: "blue",
    },
    {
      label: "Avg Match",
      value: formatPercent(avgMatchScore),
      helper: `${formatNumber(highRiskRecommendations.length)} risiko tinggi`,
      icon: TrendingUp,
      tone: "amber",
    },
  ];

  return (
    <DashboardShell
      badge="CSR Matching"
      title="Dashboard kerja untuk Mitra CSR."
      description="Mitra CSR mendapat rekomendasi wilayah berdasarkan fokus program, budget, prioritas risiko, dan kebutuhan bantuan pendidikan."
    >
      {isPageLoading ? (
        <LoadingState label="Mengambil ringkasan CSR dari backend..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Ringkasan CSR belum bisa dimuat."
              description={`${errorMessage} Pastikan backend berjalan di http://localhost:5000.`}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
            <DashboardSection
              badge="Matching Engine"
              title="Parameter rekomendasi CSR"
              description="Atur fokus bantuan dan skala budget untuk mendapatkan wilayah rekomendasi."
            >
              <CsrMatchingForm
                focusArea={focusArea}
                budgetRange={budgetRange}
                isSubmitting={isMatching}
                onFocusChange={setFocusArea}
                onBudgetChange={setBudgetRange}
                onSubmit={handleMatch}
              />

              {matchError && (
                <div className="mt-5">
                  <DashboardErrorBanner
                    title="Matching gagal dijalankan."
                    description={matchError}
                  />
                </div>
              )}
            </DashboardSection>

            <DashboardSection
              badge="Recommended Regions"
              title="Hasil rekomendasi wilayah"
              description="Wilayah dengan skor kecocokan terbaik untuk program CSR yang dipilih."
            >
              {isMatching ? (
                <LoadingState label="Menghitung rekomendasi wilayah..." />
              ) : (
                <RecommendationList recommendations={recommendations} />
              )}
            </DashboardSection>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <DashboardSection
              badge="Priority Fit"
              title="Wilayah prioritas bantuan"
              description="Daftar wilayah risiko tinggi yang dapat menjadi referensi awal program CSR."
            >
              <PriorityFitList regions={topRiskRegions} />
            </DashboardSection>

            <DashboardSection
              badge="Program Guidance"
              title="Prinsip penyaluran CSR"
              description="CSR Matching membantu menyusun prioritas, tetapi keputusan tetap perlu mempertimbangkan konteks lapangan."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Fokus program",
                    description:
                      "Pastikan jenis bantuan sesuai kebutuhan wilayah, bukan hanya berdasarkan popularitas program.",
                    icon: Target,
                  },
                  {
                    title: "Kesesuaian budget",
                    description:
                      "Gunakan budget sebagai batas realistik agar rekomendasi tetap feasible.",
                    icon: PiggyBank,
                  },
                  {
                    title: "Validasi stakeholder",
                    description:
                      "Koordinasi dengan dinas dan sekolah sebelum bantuan disalurkan.",
                    icon: Building2,
                  },
                  {
                    title: "Dampak terukur",
                    description:
                      "Catat alasan matching agar program dapat dievaluasi setelah berjalan.",
                    icon: HandHeart,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40"
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
