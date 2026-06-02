import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  LineChart,
  Plus,
  RefreshCcw,
  Save,
  School,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import Button from "../../../components/ui/Button";
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
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import DashboardTable from "../components/DashboardTable";
import GenAiPanel from "../components/GenAiPanel";
import { dashboardService } from "../dashboardService";
import { profileService } from "../profileService";
import { schoolRequestService } from "../schoolRequestService";
import DashboardChoroplethPanel from "../components/DashboardChoroplethPanel";

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

const getStatusBadgeClass = (status) => {
  if (status === "Disetujui" || status === "Disalurkan") {
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

const defaultSchoolSection = "overview";

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

function RegionSelector({
  regions = [],
  selectedRegionId,
  onChange,
  disabled,
}) {
  if (regions.length === 0) return null;

  return (
    <div className="w-full sm:w-[18rem]">
      <label className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
        Wilayah
      </label>

      <select
        value={selectedRegionId || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl transition focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {regions.map((region) => (
          <option key={getRegionId(region)} value={getRegionId(region)}>
            {getRegionName(region)}
          </option>
        ))}
      </select>
    </div>
  );
}

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

function RequestForm({ form, isSubmitting, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-sm font-extrabold text-[#102A43]">
            Kategori
          </label>
          <select
            value={form.category}
            onChange={(event) => onChange("category", event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
          >
            {requestCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-extrabold text-[#102A43]">
            Urgensi
          </label>
          <select
            value={form.urgency}
            onChange={(event) => onChange("urgency", event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
          >
            {urgencyOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
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
        <Plus size={18} />
        {isSubmitting ? "Mengirim..." : "Ajukan Kebutuhan"}
      </Button>
    </form>
  );
}

function RequestHistory({ requests = [] }) {
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
      {requests.map((request) => (
        <div
          key={request.id}
          className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-extrabold text-[#102A43]">{request.title}</p>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getStatusBadgeClass(
                    request.status,
                  )}`}
                >
                  {request.status}
                </span>
              </div>

              <p className="mt-1 text-xs font-semibold text-[#64748B]">
                {request.request_code} · {request.category} · {request.urgency}
              </p>

              <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#64748B]">
                {request.description || "Tidak ada keterangan tambahan."}
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
                Nilai
              </p>
              <p className="mt-1 font-extrabold text-[#0F766E]">
                {formatCurrency(request.requested_value)}
              </p>
            </div>
          </div>

          {(request.review_note || request.evidence_url) && (
            <div className="mt-4 rounded-2xl border border-white/70 bg-white/42 p-3 text-sm leading-6 text-[#64748B]">
              {request.review_note && (
                <p>
                  <span className="font-extrabold text-[#102A43]">Review:</span>{" "}
                  {request.review_note}
                </p>
              )}

              {request.evidence_url && (
                <a
                  href={request.evidence_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 font-extrabold text-[#0F766E] hover:text-[#115E59]"
                >
                  Lihat bukti <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>
      ))}
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
    <div className="grid gap-4 md:grid-cols-3">
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
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const topRiskRegions = getArray(summaryData?.top_risk_regions);
  const summary = summaryData?.summary || {};
  const schoolRequests = getArray(requestsPayload.requests);

  const regionOptions = regions.length > 0 ? regions : topRiskRegions;

  const fallbackRegionId = regionOptions[0]
    ? String(getRegionId(regionOptions[0]))
    : "";

  const profileRegionId = profile?.region_id ? String(profile.region_id) : "";
  const userRegionId = user?.region_id ? String(user.region_id) : "";

  const activeRegionId =
    selectedRegionId || profileRegionId || userRegionId || fallbackRegionId;

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

  const userHasFixedRegion = Boolean(
    (profile?.region_id || user?.region_id) && user?.role !== "admin",
  );

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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <DashboardSection
            badge="Riwayat"
            title="Riwayat ajuan"
            description="Pantau status ajuan sekolah."
          >
            <RequestHistory requests={schoolRequests} />
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <DashboardMetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <DashboardChoroplethPanel
          badge="Map Risk"
          title="Map Risk"
          description="Klik wilayah untuk melihat detail prioritas AI."
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

  return (
    <DashboardShell
      badge={sectionMeta.badge}
      title={sectionMeta.title}
      description={sectionMeta.description}
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <RegionSelector
            regions={regionOptions}
            selectedRegionId={activeRegionId}
            onChange={setSelectedRegionId}
            disabled={userHasFixedRegion}
          />

          <Button
            variant="secondary"
            onClick={() => setReloadKey((current) => current + 1)}
            disabled={isLoading}
          >
            <RefreshCcw size={16} />
            Refresh
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
        </>
      )}
    </DashboardShell>
  );
}
