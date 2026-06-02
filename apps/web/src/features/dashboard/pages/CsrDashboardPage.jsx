import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  HandHeart,
  MapPinned,
  PiggyBank,
  RefreshCcw,
  School,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/Select";
import LoadingState from "../../../components/feedback/LoadingState";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from "../../../lib/utils";
import DashboardEmptyState from "../components/DashboardEmptyState";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import GenAiPanel from "../components/GenAiPanel";
import { csrAidService } from "../csrAidService";
import { dashboardService } from "../dashboardService";
import { schoolCatalogService } from "../schoolCatalogService";
import DashboardChoroplethPanel from "../components/DashboardChoroplethPanel";
import CsrMatchingPanel from "../components/CsrMatchingPanel";
import {
  getAiRiskStatus,
  getRiskTheme,
} from "../../../components/map/riskMapUtils";

const aidTypes = [
  "Laptop",
  "Internet",
  "Beasiswa",
  "Renovasi",
  "Buku",
  "Alat Belajar",
  "Dana Fleksibel",
  "Lainnya",
];

const initialAidForm = {
  allocation_type: "fleksibel",
  target_school_id: "",
  target_region_id: "",
  aid_name: "",
  aid_type: "Beasiswa",
  aid_value: "",
  description: "",
  evidence_url: "",
};

const aidTypeByFocusArea = {
  umum: "Dana Fleksibel",
  beasiswa: "Beasiswa",
  infrastruktur_sd: "Renovasi",
  angka_putus_sekolah: "Dana Fleksibel",
};

const aidValueByBudgetRange = {
  kecil: "75000000",
  sedang: "250000000",
  besar: "750000000",
};

const focusLabelByValue = {
  umum: "Umum",
  beasiswa: "Beasiswa / PIP",
  infrastruktur_sd: "Infrastruktur SD",
  angka_putus_sekolah: "Pencegahan Putus Sekolah",
};

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getRegionName = (region) => {
  return region?.name || region?.region_name || "-";
};

const getSchoolName = (school) => {
  return school?.name || school?.school_name || "-";
};

const getStatusBadgeClass = (status) => {
  if (
    status === "Disetujui" ||
    status === "Disalurkan" ||
    status === "Selesai"
  ) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "Ditolak") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "Ditinjau") {
    return "border-yellow-200 bg-yellow-50 text-yellow-800";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
};

const defaultCsrSection = "overview";

const csrSectionMeta = {
  overview: {
    badge: "Overview",
    title: "Overview CSR",
    description: "Ringkasan bantuan, proposal, dan prioritas wilayah CSR.",
  },
  "map-risk": {
    badge: "Map Risk",
    title: "Map Risk",
    description: "Lihat wilayah prioritas untuk penyaluran bantuan CSR.",
  },
  "ai-matching": {
    badge: "AI Matching",
    title: "AI Matching",
    description: "Temukan wilayah yang paling sesuai dengan fokus CSR.",
  },
  analytic: {
    badge: "Analitik",
    title: "Analitik CSR",
    description: "Ringkasan nilai bantuan, proposal aktif, dan pola penyaluran.",
  },
  pengajuan: {
    badge: "Pengajuan",
    title: "Pengajuan Bantuan",
    description: "Ajukan bantuan untuk sekolah tertentu atau wilayah prioritas.",
  },
  riwayat: {
    badge: "Riwayat",
    title: "Riwayat Pengajuan",
    description: "Pantau status proposal bantuan CSR.",
  },
  "gen-ai": {
    badge: "Gen AI",
    title: "Gen AI",
    description: "Asisten Gemini untuk strategi program dan proposal CSR.",
  },
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-extrabold text-[#102A43]">{label}</label>

      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-extrabold text-[#102A43]">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold leading-7 text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
      />
    </div>
  );
}

function AidProposalForm({
  form,
  schools,
  regions,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  const isSpecificSchool = form.allocation_type === "sekolah_tertentu";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField
          label="Jenis Penyaluran"
          value={form.allocation_type}
          onChange={(value) => onChange("allocation_type", value)}
        >
          <option value="fleksibel">Bantuan Fleksibel</option>
          <option value="sekolah_tertentu">Sekolah Tertentu</option>
        </SelectField>

        <SelectField
          label="Jenis Bantuan"
          value={form.aid_type}
          onChange={(value) => onChange("aid_type", value)}
        >
          {aidTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectField>
      </div>

      {isSpecificSchool ? (
        schools.length > 0 ? (
          <SelectField
            label="Target Sekolah"
            value={form.target_school_id}
            onChange={(value) => onChange("target_school_id", value)}
          >
            <option value="">Pilih sekolah</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {getSchoolName(school)} — {school.region_name || "-"}
              </option>
            ))}
          </SelectField>
        ) : (
          <TextField
            label="ID Sekolah"
            type="number"
            value={form.target_school_id}
            onChange={(value) => onChange("target_school_id", value)}
            placeholder="Contoh: 1"
            required
          />
        )
      ) : (
        <SelectField
          label="Wilayah Tujuan"
          value={form.target_region_id}
          onChange={(value) => onChange("target_region_id", value)}
        >
          <option value="">Fleksibel semua wilayah</option>
          {regions.map((region) => (
            <option
              key={region.id || region.region_id}
              value={region.id || region.region_id}
            >
              {getRegionName(region)}
            </option>
          ))}
        </SelectField>
      )}

      <TextField
        label="Nama Bantuan"
        value={form.aid_name}
        onChange={(value) => onChange("aid_name", value)}
        placeholder="Contoh: Bantuan laptop sekolah"
        required
      />

      <TextField
        label="Nilai Bantuan"
        type="number"
        value={form.aid_value}
        onChange={(value) => onChange("aid_value", value)}
        placeholder="120000000"
      />

      <TextAreaField
        label="Keterangan"
        value={form.description}
        onChange={(value) => onChange("description", value)}
        placeholder="Jelaskan bantuan secara singkat."
      />

      <TextField
        label="Link Dokumen"
        value={form.evidence_url}
        onChange={(value) => onChange("evidence_url", value)}
        placeholder="https://..."
      />

      <Button
        type="submit"
        size="lg"
        className="w-full justify-center"
        disabled={isSubmitting}
      >
        <Send size={18} />
        {isSubmitting ? "Mengirim..." : "Ajukan Bantuan"}
      </Button>
    </form>
  );
}

function AidHistory({ proposals = [] }) {
  if (proposals.length === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada bantuan."
        description="Bantuan yang diajukan CSR akan tampil di sini."
      />
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-extrabold text-[#102A43]">
                  {proposal.aid_name}
                </p>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getStatusBadgeClass(
                    proposal.status,
                  )}`}
                >
                  {proposal.status}
                </span>
              </div>

              <p className="mt-1 text-xs font-semibold text-[#64748B]">
                {proposal.proposal_code} · {proposal.aid_type} ·{" "}
                {proposal.allocation_type === "sekolah_tertentu"
                  ? "Sekolah tertentu"
                  : "Fleksibel"}
              </p>

              <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#64748B]">
                {proposal.description || "Tidak ada keterangan tambahan."}
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
                Nilai
              </p>

              <p className="mt-1 font-extrabold text-[#0F766E]">
                {formatCurrency(proposal.aid_value)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-white/70 bg-white/38 p-4 text-sm leading-6 text-[#64748B] md:grid-cols-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
                Sekolah
              </p>
              <p className="mt-1 font-extrabold text-[#102A43]">
                {proposal.target_school_name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
                Wilayah
              </p>
              <p className="mt-1 font-extrabold text-[#102A43]">
                {proposal.target_region_name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
                Dokumen
              </p>

              {proposal.evidence_url ? (
                <a
                  href={proposal.evidence_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 font-extrabold text-[#0F766E] hover:text-[#115E59]"
                >
                  Lihat dokumen <ExternalLink size={14} />
                </a>
              ) : (
                <p className="mt-1 font-semibold text-[#64748B]">Belum ada</p>
              )}
            </div>
          </div>

          {proposal.review_note && (
            <div className="mt-3 rounded-2xl border border-white/70 bg-white/38 p-3 text-sm leading-6 text-[#64748B]">
              <span className="font-extrabold text-[#102A43]">Catatan:</span>{" "}
              {proposal.review_note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CsrGuide() {
  const items = [
    {
      title: "Sekolah tertentu",
      description: "Pilih jika CSR sudah menentukan sekolah tujuan.",
      icon: School,
    },
    {
      title: "Fleksibel",
      description: "Pilih jika bantuan akan disalurkan admin atau dinas.",
      icon: PiggyBank,
    },
    {
      title: "Validasi",
      description: "Bantuan akan diperiksa sebelum disalurkan.",
      icon: ShieldCheck,
    },
    {
      title: "Dampak",
      description: "Gunakan deskripsi singkat agar bantuan mudah diproses.",
      icon: Building2,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
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

function CsrOverview({ metricCards, topRiskRegions, proposals, onNavigate }) {
  const priorityRegions = topRiskRegions.slice(0, 4);
  const recentProposals = proposals.slice(0, 3);

  const quickActions = [
    {
      title: "Map Risk",
      description: "Baca prioritas wilayah sebelum menentukan bantuan.",
      path: "/dashboard/csr/map-risk",
      icon: MapPinned,
    },
    {
      title: "AI Matching",
      description: "Cocokkan fokus CSR dengan rekomendasi AI.",
      path: "/dashboard/csr/ai-matching",
      icon: Sparkles,
    },
    {
      title: "Pengajuan",
      description: "Kirim proposal bantuan yang sudah siap divalidasi.",
      path: "/dashboard/csr/pengajuan",
      icon: Send,
    },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {metricCards.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <DashboardSection
          badge="Prioritas"
          title="Wilayah sasaran"
          description="Ringkasan wilayah yang paling relevan untuk bantuan CSR."
        >
          {priorityRegions.length === 0 ? (
            <DashboardEmptyState
              title="Belum ada wilayah prioritas."
              description="Data wilayah prioritas akan tampil setelah analytics tersedia."
            />
          ) : (
            <div className="space-y-3">
              {priorityRegions.map((region, index) => {
                const riskStatus = getAiRiskStatus(region);
                const theme = getRiskTheme(riskStatus);

                return (
                  <button
                    key={region.id || region.region_id || region.name || index}
                    type="button"
                    onClick={() => onNavigate("/dashboard/csr/map-risk")}
                    className="flex w-full items-center justify-between gap-4 rounded-[1.2rem] border border-white/70 bg-white/42 p-4 text-left ring-1 ring-white/35 transition duration-200 hover:-translate-y-0.5 hover:bg-white/64"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: theme.fillColor }}
                        />
                        <p className="truncate text-sm font-extrabold uppercase text-[#102A43]">
                          {getRegionName(region)}
                        </p>
                      </div>

                      <p className="mt-1 text-xs font-semibold text-[#64748B]">
                        Warga rentan{" "}
                        {formatNumber(
                          region.total_vulnerable_population ||
                            region.avg_vulnerable_population,
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-extrabold ${theme.badgeClass}`}
                    >
                      #{region.risk_ranking || index + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          badge="Aksi"
          title="Langkah cepat"
          description="Mulai dari prioritas, cocokkan fokus, lalu ajukan bantuan."
        >
          <div className="space-y-3">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className="flex w-full items-center gap-4 rounded-[1.2rem] border border-white/70 bg-white/42 p-4 text-left ring-1 ring-white/35 transition duration-200 hover:-translate-y-0.5 hover:bg-white/64"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                    <Icon size={18} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-[#102A43]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-[#64748B]">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        badge="Riwayat"
        title="Proposal terbaru"
        description="Status bantuan terbaru dari akun CSR ini."
      >
        <AidHistory proposals={recentProposals} />
      </DashboardSection>
    </>
  );
}

export default function CsrDashboardPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const currentSection = section || defaultCsrSection;
  const sectionMeta = csrSectionMeta[currentSection];

  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [proposalsPayload, setProposalsPayload] = useState({
    count: 0,
    proposals: [],
  });
  const [aidForm, setAidForm] = useState(initialAidForm);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAid, setIsSubmittingAid] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const summary = summaryData?.summary || {};
  const topRiskRegions = getArray(summaryData?.top_risk_regions);
  const proposals = getArray(proposalsPayload.proposals);

  const stats = useMemo(() => {
    const flexibleCount = proposals.filter(
      (item) => item.allocation_type === "fleksibel",
    ).length;

    const specificCount = proposals.filter(
      (item) => item.allocation_type === "sekolah_tertentu",
    ).length;

    const activeCount = proposals.filter((item) =>
      ["Diajukan", "Ditinjau"].includes(item.status),
    ).length;

    const totalValue = proposals.reduce(
      (total, item) => total + Number(item.aid_value || 0),
      0,
    );

    return {
      flexibleCount,
      specificCount,
      activeCount,
      totalValue,
    };
  }, [proposals]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [summaryResult, regionsResult, schoolsResult, proposalsResult] =
          await Promise.allSettled([
            dashboardService.getAnalyticsSummary(controller.signal),
            dashboardService.getRegions(controller.signal),
            schoolCatalogService.getSchools({
              limit: 80,
              signal: controller.signal,
            }),
            csrAidService.getAidProposals({
              limit: 30,
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

        if (schoolsResult.status === "fulfilled") {
          setSchools(getArray(schoolsResult.value));
        }

        if (proposalsResult.status === "fulfilled") {
          setProposalsPayload(proposalsResult.value);
        }

        if (proposalsResult.status === "rejected") {
          setErrorMessage("Data bantuan CSR belum bisa diambil.");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.message || "Dashboard CSR belum bisa terhubung.",
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

  const updateAidField = (field, value) => {
    setSuccessMessage("");
    setAidForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (field === "allocation_type") {
        if (value === "fleksibel") {
          next.target_school_id = "";
        } else {
          next.target_region_id = "";
        }
      }

      return next;
    });
  };

  const handleSubmitAid = async (event) => {
    event.preventDefault();

    setIsSubmittingAid(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (
        aidForm.allocation_type === "sekolah_tertentu" &&
        !aidForm.target_school_id
      ) {
        throw new Error("Pilih sekolah tujuan terlebih dahulu.");
      }

      await csrAidService.createAidProposal({
        allocation_type: aidForm.allocation_type,
        target_school_id:
          aidForm.allocation_type === "sekolah_tertentu"
            ? aidForm.target_school_id
            : null,
        target_region_id: aidForm.target_region_id || null,
        aid_name: aidForm.aid_name,
        aid_type: aidForm.aid_type,
        aid_value: aidForm.aid_value,
        description: aidForm.description,
        evidence_url: aidForm.evidence_url,
      });

      setAidForm(initialAidForm);
      setSuccessMessage("Bantuan berhasil diajukan.");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Bantuan gagal diajukan.",
      );
    } finally {
      setIsSubmittingAid(false);
    }
  };

  const handleUseRecommendationForAid = (recommendation, context = {}) => {
    const focusArea = context.focusArea || "umum";
    const budgetRange = context.budgetRange || "semua";
    const regionName = getRegionName(recommendation);
    const aidType = aidTypeByFocusArea[focusArea] || "Dana Fleksibel";
    const suggestedValue = aidValueByBudgetRange[budgetRange] || "";
    const reasons = Array.isArray(recommendation.reasons)
      ? recommendation.reasons
          .map((reason, index) => `${index + 1}. ${reason}`)
          .join("\n")
      : "";

    const description = [
      `Rekomendasi AI PINTARIN untuk wilayah ${regionName}.`,
      `Fokus program: ${focusLabelByValue[focusArea] || focusArea}.`,
      `Match score: ${Number(recommendation.match_score || 0)}%. Risk score: ${Number(
        recommendation.predicted_score || 0,
      ).toFixed(1)}. Priority score: ${Number(
        recommendation.priority_score || 0,
      ).toFixed(1)}.`,
      recommendation.budget_fit
        ? `Budget fit: ${recommendation.budget_fit}`
        : "",
      reasons ? `Alasan rekomendasi:\n${reasons}` : "",
      recommendation.recommendation_text
        ? `Catatan AI: ${recommendation.recommendation_text}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    setErrorMessage("");
    setSuccessMessage(
      "Rekomendasi AI sudah dimasukkan ke form bantuan. Lengkapi detail lalu ajukan.",
    );

    setAidForm((current) => ({
      ...current,
      allocation_type: "fleksibel",
      target_school_id: "",
      target_region_id: recommendation.region_id
        ? String(recommendation.region_id)
        : "",
      aid_name: `Bantuan CSR ${aidType} - ${regionName}`,
      aid_type: aidType,
      aid_value: suggestedValue || current.aid_value,
      description,
    }));

    navigate("/dashboard/csr/pengajuan");

    window.setTimeout(() => {
      document
        .getElementById("csr-aid-proposal-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const metricCards = [
    {
      label: "Nilai CSR",
      value: formatCurrency(stats.totalValue || summary.total_csr_value),
      displayValue: formatCompactCurrency(
        stats.totalValue || summary.total_csr_value,
      ),
      detailValue: formatCurrency(stats.totalValue || summary.total_csr_value),
      helper: "Total bantuan CSR",
      icon: HandHeart,
      tone: "teal",
    },
    {
      label: "Proposal",
      value: formatNumber(proposals.length),
      helper: "Bantuan diajukan",
      icon: Sparkles,
      tone: "blue",
    },
    {
      label: "Diproses",
      value: formatNumber(stats.activeCount),
      helper: "Diajukan atau ditinjau",
      icon: ShieldCheck,
      tone: "amber",
    },
    {
      label: "Fleksibel",
      value: formatNumber(stats.flexibleCount),
      helper: `${formatNumber(stats.specificCount)} sekolah tertentu`,
      icon: MapPinned,
      tone: "teal",
    },
  ];

  if (!sectionMeta) {
    return <Navigate to="/dashboard/csr/overview" replace />;
  }

  const renderSectionContent = () => {
    if (currentSection === "overview") {
      return (
        <CsrOverview
          metricCards={metricCards}
          topRiskRegions={topRiskRegions}
          proposals={proposals}
          onNavigate={navigate}
        />
      );
    }

    if (currentSection === "ai-matching") {
      return (
        <DashboardSection
          badge="AI Matching"
          title="Rekomendasi wilayah CSR"
          description="Pilih fokus program, lalu gunakan rekomendasi untuk mengisi pengajuan."
        >
          <CsrMatchingPanel onUseRecommendation={handleUseRecommendationForAid} />
        </DashboardSection>
      );
    }

    if (currentSection === "analytic") {
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <DashboardSection
            badge="Panduan"
            title="Cara memilih bantuan"
            description="Gunakan jenis penyaluran sesuai kondisi CSR."
          >
            <CsrGuide />
          </DashboardSection>
        </>
      );
    }

    if (currentSection === "pengajuan") {
      return (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.72fr]">
          <div id="csr-aid-proposal-form">
            <DashboardSection
              badge="Ajukan"
              title="Buat bantuan"
              description="Pilih tujuan bantuan CSR."
            >
              <AidProposalForm
                form={aidForm}
                schools={schools}
                regions={regions}
                isSubmitting={isSubmittingAid}
                onChange={updateAidField}
                onSubmit={handleSubmitAid}
              />
            </DashboardSection>
          </div>

          <DashboardSection
            badge="Panduan"
            title="Cara memilih bantuan"
            description="Gunakan jenis penyaluran sesuai kondisi CSR."
          >
            <CsrGuide />
          </DashboardSection>
        </div>
      );
    }

    if (currentSection === "riwayat") {
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <DashboardSection
            badge="Riwayat"
            title="Riwayat bantuan"
            description="Pantau status bantuan CSR."
          >
            <AidHistory proposals={proposals} />
          </DashboardSection>
        </>
      );
    }

    if (currentSection === "gen-ai") {
      return (
        <GenAiPanel
          title="Gen AI CSR"
          description="Bantu susun strategi program CSR dan narasi proposal bantuan."
          context={{
            role: "csr_partner",
            proposal_count: proposals.length,
            active_proposals: stats.activeCount,
            flexible_proposals: stats.flexibleCount,
            specific_school_proposals: stats.specificCount,
            total_value: stats.totalValue || summary.total_csr_value,
            top_risk_regions: topRiskRegions.slice(0, 3).map((region) => ({
              name: getRegionName(region),
              risk_status: region.risk_status || region.final_label,
              priority_score: region.priority_score,
            })),
          }}
          starterPrompts={[
            "Buat rekomendasi strategi CSR berdasarkan konteks dashboard ini.",
            "Wilayah seperti apa yang paling tepat untuk bantuan fleksibel?",
            "Susun narasi singkat proposal bantuan CSR yang tetap perlu review manusia.",
          ]}
        />
      );
    }

    return (
      <DashboardChoroplethPanel
        badge="Map Risk"
        title="Map Risk"
        description="Klik wilayah untuk membaca prioritas bantuan."
        regions={regions}
        topRegions={topRiskRegions}
      />
    );
  };

  return (
    <DashboardShell
      badge={sectionMeta.badge}
      title={sectionMeta.title}
      description={sectionMeta.description}
      actions={
        <Button
          variant="secondary"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={isLoading}
        >
          <RefreshCcw size={16} />
          Refresh
        </Button>
      }
    >
      {isLoading ? (
        <LoadingState label="Mengambil data CSR..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Data CSR belum bisa diproses."
              description={errorMessage}
            />
          )}

          {successMessage && (
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-[#5EEAD4]/45 bg-[#5EEAD4]/14 p-4 text-[#0F766E] ring-1 ring-white/40 backdrop-blur-xl">
              <CheckCircle2 size={20} />
              <p className="text-sm font-extrabold">{successMessage}</p>
            </div>
          )}

          {renderSectionContent()}
        </>
      )}
    </DashboardShell>
  );
}
