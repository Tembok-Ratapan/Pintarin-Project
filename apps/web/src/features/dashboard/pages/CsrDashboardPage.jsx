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

import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/feedback/LoadingState";
import { formatCurrency, formatNumber } from "../../../lib/utils";
import DashboardEmptyState from "../components/DashboardEmptyState";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import { csrAidService } from "../csrAidService";
import { dashboardService } from "../dashboardService";
import { schoolCatalogService } from "../schoolCatalogService";

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

function SelectField({ label, value, onChange, children, disabled = false }) {
  return (
    <div>
      <label className="text-sm font-extrabold text-[#102A43]">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </div>
  );
}

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

export default function CsrDashboardPage() {
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

  const metricCards = [
    {
      label: "Nilai CSR",
      value: formatCurrency(stats.totalValue || summary.total_csr_value),
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

  return (
    <DashboardShell
      badge="Ruang Bantuan"
      title="Ruang Bantuan"
      description="Ajukan bantuan untuk sekolah tertentu atau bantuan fleksibel."
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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

            <DashboardSection
              badge="Riwayat"
              title="Riwayat bantuan"
              description="Pantau status bantuan CSR."
            >
              <AidHistory proposals={proposals} />
            </DashboardSection>
          </div>

          <DashboardSection
            badge="Panduan"
            title="Cara memilih bantuan"
            description="Gunakan jenis penyaluran sesuai kondisi CSR."
          >
            <CsrGuide />
          </DashboardSection>
        </>
      )}
    </DashboardShell>
  );
}
