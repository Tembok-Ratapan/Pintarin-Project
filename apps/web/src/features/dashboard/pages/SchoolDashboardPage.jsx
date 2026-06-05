import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Edit3,
  GraduationCap,
  HandHeart,
  LineChart,
  Plus,
  RefreshCcw,
  Save,
  School,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/Select";
import LoadingState from "../../../components/feedback/LoadingState";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getRiskBadgeClass,
} from "../../../lib/utils";
import { useAuth } from "../../auth/useAuth";
import DashboardEmptyState from "../components/DashboardEmptyState";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardRecordCard from "../components/DashboardRecordCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import DashboardTable from "../components/DashboardTable";
import GenAiPanel from "../components/GenAiPanel";
import { dashboardService } from "../dashboardService";
import { profileService } from "../profileService";
import { schoolRequestService } from "../schoolRequestService";
import DashboardChoroplethPanel from "../components/DashboardChoroplethPanel";
import { csrAidService } from "../csrAidService";

const requestCategories = [
  "Laptop",
  "Internet",
  "Renovasi",
  "Beasiswa",
  "Buku",
  "Alat Belajar",
  "Lainnya",
];

const urgencyOptions = ["Rendah", "Sedang", "Tinggi"];
const editableRequestStatuses = ["Diajukan", "Ditinjau"];

const initialRequestForm = {
  category: "Laptop",
  title: "",
  description: "",
  urgency: "Sedang",
  requested_value: "",
  evidence_url: "",
  evidence_note: "",
};

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getRegionId = (region) => {
  return (
    region?.id || region?.region_id || region?.kode_kecamatan || region?.name
  );
};

const getRegionName = (region) => {
  return region?.name || region?.region_name || region?.nama_kecamatan || "-";
};

const getRegionRiskStatus = (region) => {
  return (
    region?.risk_status ||
    region?.dominant_risk_status ||
    region?.final_label ||
    region?.predicted_label ||
    "Sedang"
  );
};

const getPopulation = (region) => {
  return Number(region?.total_population || region?.avg_population || 0);
};

const getVulnerablePopulation = (region) => {
  return Number(
    region?.total_vulnerable_population ||
      region?.avg_vulnerable_population ||
      0,
  );
};

const getVulnerableRatio = (region) => {
  const rawValue = Number(
    region?.vulnerable_ratio || region?.avg_vulnerable_ratio || 0,
  );

  return rawValue > 1 ? rawValue : rawValue * 100;
};

const getTotalSchools = (region) => {
  return Number(region?.total_schools || region?.school_count || 0);
};

const getPipGap = (region) => {
  return Number(region?.pip_gap || region?.gap_pip || 0);
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

const getRiskTone = (riskStatus) => {
  if (riskStatus === "Tinggi") return "red";
  if (riskStatus === "Sedang") return "amber";
  return "teal";
};

const defaultSchoolSection = "overview";
const schoolMetricGridClass =
  "grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

const schoolSectionMeta = {
  overview: {
    badge: "Ruang Sekolah",
    title: "Overview Sekolah",
    description: "Ringkasan data sekolah, status wilayah, dan sinyal prioritas.",
  },
  pengajuan: {
    badge: "Pengajuan",
    title: "Pengajuan Kebutuhan",
    description: "Kirim kebutuhan sekolah dengan bukti pendukung yang jelas.",
  },
  riwayat: {
    badge: "Riwayat",
    title: "Riwayat Pengajuan",
    description: "Pantau status kebutuhan yang sudah dikirim.",
  },
  "gen-ai": {
    badge: "Gen AI",
    title: "Gen AI",
    description: "Asisten Gemini untuk analisis pengajuan sekolah.",
  },
};

function SchoolDataCard({ profile, region }) {
  const schoolName =
    profile?.school_name ||
    profile?.organization_name ||
    profile?.display_name ||
    "Data sekolah belum lengkap";

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/50 p-6 shadow-xl shadow-slate-200/35 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#5EEAD4]/22 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-[#5EEAD4]/18 text-[#0F766E]">
            <School size={24} />
          </div>

          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
            Data Sekolah
          </p>

          <h2 className="font-heading mt-2 text-2xl font-extrabold text-[#102A43] sm:text-[1.75rem]">
            {schoolName}
          </h2>

          <div className="mt-4 grid gap-2 text-sm font-medium leading-7 text-[#64748B]">
            <p>Wilayah: {profile?.region_name || getRegionName(region)}</p>
            <p>
              Email: {profile?.contact_email || profile?.account_email || "-"}
            </p>
            <p>Telepon: {profile?.phone || "-"}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <Link
            to="/dashboard/profile"
            className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-2xl border border-white/70 bg-white/58 px-5 text-sm font-extrabold text-[#102A43] shadow-sm ring-1 ring-white/45 backdrop-blur-2xl transition hover:bg-white/78 hover:text-[#0F766E]"
          >
            <Save size={17} />
            Perbarui Data
          </Link>

          <span
            className={`inline-flex justify-center rounded-full border px-3 py-1.5 text-sm font-extrabold ${getRiskBadgeClass(
              getRegionRiskStatus(region),
            )}`}
          >
            Risiko {getRegionRiskStatus(region)}
          </span>
        </div>
      </div>
    </div>
  );
}

function EducationSignalPanel({ region }) {
  if (!region) {
    return (
      <DashboardEmptyState
        title="Wilayah belum tersedia."
        description="Pilih wilayah untuk melihat sinyal pendidikan."
      />
    );
  }

  const signals = [
    {
      label: "Populasi",
      value: formatNumber(getPopulation(region)),
      icon: UsersRound,
    },
    {
      label: "Warga Rentan",
      value: formatNumber(getVulnerablePopulation(region)),
      icon: AlertTriangle,
    },
    {
      label: "Rasio Rentan",
      value: formatPercent(getVulnerableRatio(region)),
      icon: LineChart,
    },
    {
      label: "Gap PIP",
      value: formatNumber(getPipGap(region)),
      icon: BookOpenCheck,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {signals.map((signal) => {
        const Icon = signal.icon;

        return (
          <div
            key={signal.label}
            className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
              <Icon size={18} />
            </div>

            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
              {signal.label}
            </p>

            <p className="mt-2 text-xl font-extrabold text-[#102A43]">
              {signal.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function RequestForm({
  form,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel = "Ajukan Kebutuhan",
  SubmitIcon = Plus,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField
          label="Kategori"
          value={form.category}
          onChange={(value) => onChange("category", value)}
        >
          {requestCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Urgensi"
          value={form.urgency}
          onChange={(value) => onChange("urgency", value)}
        >
          {urgencyOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectField>
      </div>

      <div>
        <label className="text-sm font-extrabold text-[#102A43]">
          Judul Ajuan
        </label>
        <input
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="Contoh: Bantuan laptop untuk lab komputer"
          className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
          required
        />
      </div>

      <div>
        <label className="text-sm font-extrabold text-[#102A43]">
          Estimasi Nilai
        </label>
        <input
          type="number"
          min="0"
          value={form.requested_value}
          onChange={(event) => onChange("requested_value", event.target.value)}
          placeholder="45000000"
          className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
        />
      </div>

      <div>
        <label className="text-sm font-extrabold text-[#102A43]">
          Keterangan
        </label>
        <textarea
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={4}
          placeholder="Jelaskan kebutuhan sekolah secara singkat."
          className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold leading-7 text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-sm font-extrabold text-[#102A43]">
            Link Bukti
          </label>
          <input
            value={form.evidence_url}
            onChange={(event) => onChange("evidence_url", event.target.value)}
            placeholder="https://..."
            className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
          />
        </div>

        <div>
          <label className="text-sm font-extrabold text-[#102A43]">
            Catatan Bukti
          </label>
          <input
            value={form.evidence_note}
            onChange={(event) => onChange("evidence_note", event.target.value)}
            placeholder="Foto kelas, dokumen kebutuhan, dll."
            className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full justify-center"
        disabled={isSubmitting}
      >
        <SubmitIcon size={18} />
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}

function RequestEditModal({
  request,
  form,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0B172A]/35 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[2rem] bg-white/90 p-5 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
              Edit Ajuan
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-[#102A43]">
              {request.request_code}
            </h3>
            <p className="mt-1 text-sm font-medium leading-6 text-[#64748B]">
              Perubahan hanya tersedia untuk status Diajukan atau Ditinjau.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/62 text-[#64748B] transition hover:bg-white hover:text-[#102A43]"
            aria-label="Tutup modal edit"
          >
            <X size={18} />
          </button>
        </div>

        <RequestForm
          form={form}
          isSubmitting={isSubmitting}
          onChange={onChange}
          onSubmit={onSubmit}
          submitLabel="Simpan perubahan"
          SubmitIcon={Save}
        />
      </div>
    </div>
  );
}

function RequestHistory({
  requests = [],
  onEdit,
  onDelete,
  isMutatingRequestId,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleRequests = isExpanded ? requests : requests.slice(0, 3);
  const hasMoreRequests = requests.length > 3;

  if (requests.length === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada ajuan."
        description="Ajuan kebutuhan sekolah akan tampil di sini."
      />
    );
  }

  return (
    <div className="space-y-3">
      {visibleRequests.map((request) => {
        const canEdit = editableRequestStatuses.includes(request.status);
        const hasFooter = request.review_note || canEdit;

        return (
          <DashboardRecordCard
            key={request.id}
            title={request.title}
            status={request.status}
            meta={`${request.request_code} - ${request.category} - ${request.urgency}`}
            description={
              request.description || "Tidak ada keterangan tambahan."
            }
            valueLabel="Nilai"
            value={formatCurrency(request.requested_value)}
            details={[
              { label: "Kategori", value: request.category },
              { label: "Urgensi", value: request.urgency },
              {
                label: "Bukti",
                value: request.evidence_url ? "Lihat bukti" : "Belum ada",
                href: request.evidence_url,
              },
            ]}
            footer={
              hasFooter ? (
                <div className="space-y-3 text-sm leading-6 text-[#64748B]">
                  {request.review_note && (
                    <p>
                      <span className="font-extrabold text-[#102A43]">
                        Review:
                      </span>{" "}
                      {request.review_note}
                    </p>
                  )}

                  {canEdit && (
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(request)}
                        disabled={isMutatingRequestId === request.id}
                      >
                        <Edit3 size={16} />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(request)}
                        disabled={isMutatingRequestId === request.id}
                      >
                        <Trash2 size={16} />
                        {isMutatingRequestId === request.id
                          ? "Menghapus"
                          : "Hapus"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : null
            }
          />
        );
      })}

      {hasMoreRequests && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="rounded-2xl bg-white/50 px-4 py-2 text-sm font-extrabold text-[#0F766E] ring-1 ring-white/55 transition hover:bg-white/75 hover:text-[#115E59]"
          >
            {isExpanded ? "Tampilkan lebih sedikit" : "Lihat Selengkapnya"}
          </button>
        </div>
      )}
    </div>
  );
}

function IncomingCsrAidList({ proposals = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleProposals = isExpanded ? proposals : proposals.slice(0, 3);
  const hasMoreProposals = proposals.length > 3;

  if (proposals.length === 0) {
    return (
      <DashboardEmptyState
        title="Belum ada bantuan CSR masuk."
        description="Bantuan dari mitra CSR akan tampil setelah dinas mengarahkan bantuan ke sekolah ini."
      />
    );
  }

  return (
    <div className="space-y-3">
      {visibleProposals.map((proposal) => {
        const distributedDate = proposal.distributed_at
          ? new Date(proposal.distributed_at).toLocaleDateString("id-ID")
          : "-";
        const hasFooter = proposal.review_note || proposal.recommendation_note;

        return (
          <DashboardRecordCard
            key={proposal.id}
            title={proposal.aid_name}
            status={proposal.status}
            meta={`${proposal.proposal_code} - ${proposal.aid_type} - ${
              proposal.submitted_by_name || "CSR"
            }`}
            description={
              proposal.description || "Tidak ada keterangan tambahan."
            }
            valueLabel="Nilai"
            value={formatCurrency(proposal.aid_value)}
            details={[
              {
                label: "Penerima",
                value:
                  proposal.final_school_name ||
                  proposal.target_school_name ||
                  "-",
              },
              {
                label: "Wilayah",
                value:
                  proposal.final_school_region_name ||
                  proposal.target_region_name ||
                  "-",
              },
              { label: "Disalurkan", value: distributedDate },
            ]}
            footer={
              hasFooter ? (
                <div className="space-y-3 text-sm leading-6 text-[#64748B]">
                  {proposal.review_note && (
                    <p>
                      <span className="font-extrabold text-[#102A43]">
                        Catatan:
                      </span>{" "}
                      {proposal.review_note}
                    </p>
                  )}
                  {proposal.recommendation_note && (
                    <p>
                      <span className="font-extrabold text-[#102A43]">
                        Rekomendasi:
                      </span>{" "}
                      {proposal.recommendation_note}
                    </p>
                  )}
                </div>
              ) : null
            }
          />
        );
      })}

      {hasMoreProposals && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="rounded-2xl bg-white/50 px-4 py-2 text-sm font-extrabold text-[#0F766E] ring-1 ring-white/55 transition hover:bg-white/75 hover:text-[#115E59]"
          >
            {isExpanded ? "Tampilkan lebih sedikit" : "Lihat Selengkapnya"}
          </button>
        </div>
      )}
    </div>
  );
}

function FollowUpGuidance() {
  const items = [
    {
      title: "Lengkapi data",
      description: "Perbarui profil sekolah sebelum mengajukan kebutuhan.",
      icon: CheckCircle2,
    },
    {
      title: "Bukti jelas",
      description: "Gunakan link dokumen atau foto kondisi sekolah.",
      icon: ClipboardList,
    },
    {
      title: "Pantau status",
      description: "Ajuan akan ditinjau admin atau dinas.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-[1.35rem] bg-white/44 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
              <Icon size={18} />
            </div>

            <div className="min-w-0">
              <p className="font-extrabold text-[#102A43]">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-[#64748B]">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const { section } = useParams();
  const currentSection = section || defaultSchoolSection;
  const sectionMeta = schoolSectionMeta[currentSection];

  const [profile, setProfile] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [requestsPayload, setRequestsPayload] = useState({
    count: 0,
    requests: [],
  });
  const [incomingAidPayload, setIncomingAidPayload] = useState({
    count: 0,
    proposals: [],
  });
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [editRequest, setEditRequest] = useState(null);
  const [editRequestForm, setEditRequestForm] = useState(initialRequestForm);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isMutatingRequest, setIsMutatingRequest] = useState(false);
  const [mutatingRequestId, setMutatingRequestId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const topRiskRegions = getArray(summaryData?.top_risk_regions);
  const summary = summaryData?.summary || {};
  const schoolRequests = getArray(requestsPayload.requests);
  const incomingAid = getArray(incomingAidPayload.proposals);

  const regionOptions = regions.length > 0 ? regions : topRiskRegions;

  const fallbackRegionId = regionOptions[0]
    ? String(getRegionId(regionOptions[0]))
    : "";

  const profileRegionId = profile?.region_id ? String(profile.region_id) : "";
  const userRegionId = user?.region_id ? String(user.region_id) : "";

  const activeRegionId = profileRegionId || userRegionId || fallbackRegionId;

  const selectedRegion =
    regionOptions.find(
      (region) => String(getRegionId(region)) === String(activeRegionId),
    ) ||
    regionOptions[0] ||
    null;

  const regionPredictions = latestPredictions.filter((prediction) => {
    const regionName = getRegionName(selectedRegion).toLowerCase();

    return (
      String(prediction.region_id || "") ===
        String(getRegionId(selectedRegion)) ||
      String(prediction.region_name || "")
        .toLowerCase()
        .includes(regionName)
    );
  });

  const pendingRequests = schoolRequests.filter((request) =>
    ["Diajukan", "Ditinjau"].includes(request.status),
  );

  const approvedRequests = schoolRequests.filter((request) =>
    ["Disetujui", "Disalurkan"].includes(request.status),
  );

  const riskStatus = getRegionRiskStatus(selectedRegion);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [
          profileResult,
          summaryResult,
          regionsResult,
          predictionsResult,
          requestsResult,
          incomingAidResult,
        ] = await Promise.allSettled([
          profileService.getMyProfile(controller.signal),
          dashboardService.getAnalyticsSummary(controller.signal),
          dashboardService.getRegions(controller.signal),
          dashboardService.getLatestPredictions({
            limit: 16,
            signal: controller.signal,
          }),
          schoolRequestService.getRequests({
            limit: 20,
            signal: controller.signal,
          }),
          csrAidService.getAidProposals({
            limit: 20,
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
        }

        if (summaryResult.status === "fulfilled") {
          setSummaryData(summaryResult.value);
        }

        if (regionsResult.status === "fulfilled") {
          setRegions(getArray(regionsResult.value));
        }

        if (predictionsResult.status === "fulfilled") {
          setLatestPredictions(getArray(predictionsResult.value?.predictions));
        }

        if (requestsResult.status === "fulfilled") {
          setRequestsPayload(requestsResult.value);
        }

        if (incomingAidResult.status === "fulfilled") {
          setIncomingAidPayload(incomingAidResult.value);
        }

        if (summaryResult.status === "rejected") {
          setErrorMessage("Data sekolah belum bisa diambil dari backend.");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.message || "Dashboard sekolah belum bisa terhubung.",
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

  const updateRequestField = (field, value) => {
    setSuccessMessage("");
    setRequestForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateEditRequestField = (field, value) => {
    setSuccessMessage("");
    setEditRequestForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openEditRequest = (request) => {
    if (!editableRequestStatuses.includes(request.status)) return;

    setErrorMessage("");
    setSuccessMessage("");
    setEditRequest(request);
    setEditRequestForm({
      category: request.category || "Laptop",
      title: request.title || "",
      description: request.description || "",
      urgency: request.urgency || "Sedang",
      requested_value: request.requested_value || "",
      evidence_url: request.evidence_url || "",
      evidence_note: request.evidence_note || "",
    });
  };

  const closeEditRequest = () => {
    if (isMutatingRequest) return;

    setEditRequest(null);
    setEditRequestForm(initialRequestForm);
  };

  const handleSubmitRequest = async (event) => {
    event.preventDefault();

    setIsSubmittingRequest(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await schoolRequestService.createRequest({
        school_id: profile?.school_id || null,
        region_id: profile?.region_id || activeRegionId || null,
        category: requestForm.category,
        title: requestForm.title,
        description: requestForm.description,
        urgency: requestForm.urgency,
        requested_value: requestForm.requested_value,
        evidence_url: requestForm.evidence_url,
        evidence_note: requestForm.evidence_note,
      });

      setRequestForm(initialRequestForm);
      setSuccessMessage("Ajuan berhasil dikirim.");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Ajuan gagal dikirim.",
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const metricCards = [
    {
      label: "Sekolah",
      value: formatNumber(
        profile?.school_id
          ? 1
          : getTotalSchools(selectedRegion) || summary.total_schools,
      ),
      helper: "Data sekolah aktif",
      icon: School,
      tone: "teal",
    },
    {
      label: "Risiko",
      value: riskStatus,
      helper: `Wilayah ${getRegionName(selectedRegion)}`,
      icon: ShieldCheck,
      tone: getRiskTone(riskStatus),
    },
    {
      label: "Ajuan Aktif",
      value: formatNumber(pendingRequests.length),
      helper: "Diajukan atau ditinjau",
      icon: ClipboardList,
      tone: "amber",
    },
    {
      label: "Disetujui",
      value: formatNumber(approvedRequests.length),
      helper: "Ajuan diterima",
      icon: GraduationCap,
      tone: "teal",
    },
    {
      label: "CSR Masuk",
      value: formatNumber(incomingAid.length),
      helper: "Bantuan mitra CSR",
      icon: HandHeart,
      tone: "blue",
    },
  ];

  const predictionColumns = [
    {
      key: "algorithm",
      header: "Model",
      render: (prediction) => prediction.algorithm || "-",
    },
    {
      key: "score",
      header: "Skor",
      render: (prediction) => (
        <span className="font-extrabold text-[#102A43]">
          {getPredictionScore(prediction).toFixed(1)}
        </span>
      ),
    },
    {
      key: "label",
      header: "Risiko",
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
        <span className="font-extrabold text-[#0F766E]">
          {formatPercent(getConfidencePercent(prediction))}
        </span>
      ),
    },
  ];

  if (!sectionMeta) {
    return <Navigate to="/dashboard/school/overview" replace />;
  }

  const renderSectionContent = () => {
    if (currentSection === "pengajuan") {
      return (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.72fr]">
          <DashboardSection
            badge="Ajukan"
            title="Ajukan kebutuhan"
            description="Masukkan kebutuhan utama sekolah."
          >
            <RequestForm
              form={requestForm}
              isSubmitting={isSubmittingRequest}
              onChange={updateRequestField}
              onSubmit={handleSubmitRequest}
            />
          </DashboardSection>

          <DashboardSection
            badge="Panduan"
            title="Agar cepat diproses"
            description="Gunakan data singkat dan bukti jelas."
          >
            <FollowUpGuidance />
          </DashboardSection>
        </div>
      );
    }

    if (currentSection === "riwayat") {
      return (
        <>
          <div className={schoolMetricGridClass}>
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} compact />
            ))}
          </div>

          <DashboardSection
            badge="Riwayat"
            title="Riwayat ajuan"
            description="Pantau status ajuan sekolah."
          >
            <RequestHistory
              requests={schoolRequests}
              onEdit={openEditRequest}
              onDelete={handleDeleteRequest}
              isMutatingRequestId={mutatingRequestId}
            />
          </DashboardSection>

          <DashboardSection
            badge="CSR"
            title="Bantuan CSR masuk"
            description="Bantuan dari mitra CSR yang diarahkan ke sekolah ini."
          >
            <IncomingCsrAidList proposals={incomingAid} />
          </DashboardSection>
        </>
      );
    }

    if (currentSection === "gen-ai") {
      return (
        <GenAiPanel
          title="Gen AI Sekolah"
          description="Bantu susun argumen pengajuan dan prioritas kebutuhan sekolah."
          context={{
            role: "school_operator",
            school_name:
              profile?.school_name ||
              profile?.organization_name ||
              profile?.display_name,
            region_name: profile?.region_name || getRegionName(selectedRegion),
            risk_status: riskStatus,
            active_requests: pendingRequests.length,
            approved_requests: approvedRequests.length,
            incoming_csr_aid: incomingAid.length,
            prediction_count: regionPredictions.length,
          }}
          starterPrompts={[
            "Bantu susun ringkasan pengajuan kebutuhan sekolah berdasarkan konteks ini.",
            "Apa prioritas bantuan yang paling kuat untuk sekolah ini?",
            "Data bukti apa yang perlu ditambahkan agar pengajuan lebih meyakinkan?",
          ]}
        />
      );
    }

    return (
      <>
        <SchoolDataCard profile={profile} region={selectedRegion} />

        <div className={schoolMetricGridClass}>
          {metricCards.map((metric) => (
            <DashboardMetricCard key={metric.label} {...metric} compact />
          ))}
        </div>

        <DashboardSection
          badge="CSR"
          title="Bantuan CSR untuk sekolah"
          description="Pantau bantuan dari mitra CSR yang sudah diarahkan ke sekolah ini."
        >
          <IncomingCsrAidList proposals={incomingAid} />
        </DashboardSection>

        <DashboardChoroplethPanel
          regions={regionOptions}
          topRegions={topRiskRegions}
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
          <DashboardSection
            badge="Wilayah"
            title="Sinyal wilayah"
            description="Ringkasan kondisi sekitar sekolah."
          >
            <EducationSignalPanel region={selectedRegion} />
          </DashboardSection>

          <DashboardSection
            badge="Panduan"
            title="Agar ajuan cepat diproses"
            description="Gunakan data singkat dan bukti jelas."
          >
            <FollowUpGuidance />
          </DashboardSection>
        </div>

        <DashboardSection
          badge="AI"
          title="Sinyal risiko wilayah"
          description="Prediksi terbaru terkait wilayah sekolah."
        >
          <DashboardTable
            columns={predictionColumns}
            rows={regionPredictions}
            getRowKey={(prediction) => prediction.id}
            emptyTitle="Belum ada prediksi wilayah."
            emptyDescription="Prediksi akan tampil saat data tersedia."
          />
        </DashboardSection>
      </>
    );
  };

  const handleUpdateRequest = async (event) => {
    event.preventDefault();

    if (!editRequest) return;

    setIsMutatingRequest(true);
    setMutatingRequestId(editRequest.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await schoolRequestService.updateRequest({
        requestId: editRequest.id,
        payload: {
          category: editRequestForm.category,
          title: editRequestForm.title,
          description: editRequestForm.description,
          urgency: editRequestForm.urgency,
          requested_value: editRequestForm.requested_value,
          evidence_url: editRequestForm.evidence_url,
          evidence_note: editRequestForm.evidence_note,
        },
      });

      setEditRequest(null);
      setEditRequestForm(initialRequestForm);
      setSuccessMessage("Ajuan berhasil diperbarui.");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Ajuan gagal diperbarui.",
      );
    } finally {
      setIsMutatingRequest(false);
      setMutatingRequestId(null);
    }
  };

  const handleDeleteRequest = async (request) => {
    if (!editableRequestStatuses.includes(request.status)) return;

    const confirmed = window.confirm(
      `Hapus ajuan "${request.title}"? Tindakan ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) return;

    setIsMutatingRequest(true);
    setMutatingRequestId(request.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await schoolRequestService.deleteRequest(request.id);
      setSuccessMessage("Ajuan berhasil dihapus.");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Ajuan gagal dihapus.",
      );
    } finally {
      setIsMutatingRequest(false);
      setMutatingRequestId(null);
    }
  };

  return (
    <DashboardShell
      badge={sectionMeta.badge}
      title={sectionMeta.title}
      description={sectionMeta.description}
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Button
            variant="iconGhost"
            size="icon"
            aria-label="Refresh data sekolah"
            title="Refresh data"
            onClick={() => setReloadKey((current) => current + 1)}
            disabled={isLoading}
          >
            <RefreshCcw size={20} />
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState label="Mengambil data sekolah..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Data sekolah belum bisa diproses."
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

          <RequestEditModal
            request={editRequest}
            form={editRequestForm}
            isSubmitting={isMutatingRequest}
            onChange={updateEditRequestField}
            onSubmit={handleUpdateRequest}
            onClose={closeEditRequest}
          />
        </>
      )}
    </DashboardShell>
  );
}
