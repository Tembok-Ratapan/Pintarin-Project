import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Layers3,
  LineChart,
  MapPinned,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import LoadingState from "../../../components/feedback/LoadingState";
import {
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
import { dashboardService } from "../dashboardService";

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

const getRiskBarClass = (riskStatus) => {
  if (riskStatus === "Tinggi") return "bg-red-600";
  if (riskStatus === "Sedang") return "bg-yellow-400";
  return "bg-green-600";
};

const getRiskTone = (riskStatus) => {
  if (riskStatus === "Tinggi") return "red";
  if (riskStatus === "Sedang") return "amber";
  return "teal";
};

const getReadinessItems = (region) => {
  const riskStatus = getRegionRiskStatus(region);
  const vulnerableRatio = getVulnerableRatio(region);
  const pipGap = getPipGap(region);
  const totalSchools = getTotalSchools(region);

  return [
    {
      title: "Validasi data sekolah",
      description:
        "Pastikan data sekolah, jumlah siswa, dan kebutuhan bantuan sudah sinkron sebelum masuk proses keputusan.",
      status: totalSchools > 0 ? "Siap dicek" : "Perlu data sekolah",
      icon: School,
    },
    {
      title: "Cek kerentanan wilayah",
      description:
        "Gunakan rasio warga rentan sebagai indikator awal untuk membaca kebutuhan akses pendidikan.",
      status: vulnerableRatio >= 25 ? "Prioritas" : "Normal",
      icon: UsersRound,
    },
    {
      title: "Periksa gap bantuan",
      description:
        "Gap PIP membantu operator melihat potensi kebutuhan bantuan yang belum tertutup.",
      status: pipGap > 0 ? "Ada gap" : "Belum terdeteksi",
      icon: ClipboardList,
    },
    {
      title: "Koordinasi validasi",
      description:
        "Jika risiko wilayah tinggi, koordinasikan temuan dengan dinas sebelum tindak lanjut bantuan.",
      status: riskStatus === "Tinggi" ? "Perlu koordinasi" : "Monitor",
      icon: ShieldCheck,
    },
  ];
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
        Wilayah aktif
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

function RegionHeroCard({ region }) {
  if (!region) {
    return (
      <DashboardEmptyState
        title="Wilayah belum tersedia."
        description="Konteks wilayah akan tampil setelah data region tersedia dari backend."
      />
    );
  }

  const riskStatus = getRegionRiskStatus(region);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/50 p-6 shadow-xl shadow-slate-200/35 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#5EEAD4]/22 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-[1.35rem] bg-[#5EEAD4]/18 text-[#0F766E]">
            <MapPinned size={24} />
          </div>

          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
            Konteks wilayah sekolah
          </p>

          <h2 className="font-heading mt-2 text-3xl font-extrabold uppercase tracking-[-0.045em] text-[#102A43] sm:text-4xl">
            {getRegionName(region)}
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-8 text-[#64748B]">
            Dashboard ini membantu operator sekolah membaca kondisi wilayah,
            risiko pendidikan, gap bantuan, dan kesiapan data untuk koordinasi
            bantuan pendidikan.
          </p>
        </div>

        <div className="shrink-0 rounded-[1.35rem] border border-white/70 bg-white/50 p-4 ring-1 ring-white/40">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            Status risiko
          </p>

          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-extrabold ${getRiskBadgeClass(
              riskStatus,
            )}`}
          >
            Risiko {riskStatus}
          </span>

          <div className="mt-4 h-2.5 w-44 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full ${getRiskBarClass(riskStatus)}`}
              style={{
                width:
                  riskStatus === "Tinggi"
                    ? "92%"
                    : riskStatus === "Sedang"
                      ? "62%"
                      : "38%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AidReadinessPanel({ region }) {
  if (!region) {
    return (
      <DashboardEmptyState
        title="Belum ada konteks kesiapan."
        description="Kesiapan bantuan akan tampil setelah wilayah dipilih."
      />
    );
  }

  const items = getReadinessItems(region);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                <Icon size={18} />
              </div>

              <span className="rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-xs font-extrabold text-[#0F766E] ring-1 ring-white/40">
                {item.status}
              </span>
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

function EducationSignalPanel({ region }) {
  if (!region) {
    return (
      <DashboardEmptyState
        title="Belum ada sinyal pendidikan."
        description="Pilih wilayah untuk melihat ringkasan indikator pendidikan."
      />
    );
  }

  const signals = [
    {
      label: "Populasi wilayah",
      value: formatNumber(getPopulation(region)),
      icon: UsersRound,
    },
    {
      label: "Warga rentan",
      value: formatNumber(getVulnerablePopulation(region)),
      icon: AlertTriangle,
    },
    {
      label: "Rasio rentan",
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

            <p className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[#102A43]">
              {signal.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function FollowUpGuidance() {
  const items = [
    {
      title: "Pastikan data mutakhir",
      description:
        "Periksa data sekolah dan indikator bantuan sebelum digunakan untuk rekomendasi program.",
      icon: CheckCircle2,
    },
    {
      title: "Koordinasi dengan dinas",
      description:
        "Untuk wilayah risiko tinggi, validasi lapangan perlu melibatkan petugas dinas.",
      icon: Building2,
    },
    {
      title: "Catat kebutuhan prioritas",
      description:
        "Buat catatan kebutuhan sekolah agar program bantuan lebih mudah disesuaikan.",
      icon: ClipboardList,
    },
    {
      title: "Pantau perubahan risiko",
      description:
        "Gunakan dashboard secara berkala untuk membaca perubahan status wilayah.",
      icon: Layers3,
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40"
          >
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                <Icon size={18} />
              </div>

              <div>
                <p className="font-extrabold text-[#102A43]">{item.title}</p>
                <p className="mt-1 text-sm leading-7 text-[#64748B]">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SchoolDashboardPage() {
  const { user } = useAuth();

  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [latestPredictions, setLatestPredictions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const topRiskRegions = getArray(summaryData?.top_risk_regions);
  const summary = summaryData?.summary || {};

  const regionOptions = regions.length > 0 ? regions : topRiskRegions;

  const fallbackRegionId = regionOptions[0]
    ? String(getRegionId(regionOptions[0]))
    : "";

  const activeRegionId =
    selectedRegionId ||
    (user?.region_id ? String(user.region_id) : "") ||
    fallbackRegionId;

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

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [summaryResult, regionsResult, predictionsResult] =
          await Promise.allSettled([
            dashboardService.getAnalyticsSummary(controller.signal),
            dashboardService.getRegions(controller.signal),
            dashboardService.getLatestPredictions({
              limit: 16,
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

        if (predictionsResult.status === "fulfilled") {
          setLatestPredictions(getArray(predictionsResult.value?.predictions));
        }

        if (summaryResult.status === "rejected") {
          setErrorMessage(
            "Data konteks sekolah belum bisa diambil dari backend.",
          );
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
  }, []);

  const riskStatus = getRegionRiskStatus(selectedRegion);
  const userHasFixedRegion = Boolean(user?.region_id && user?.role !== "admin");

  const metricCards = [
    {
      label: "Sekolah",
      value: formatNumber(
        getTotalSchools(selectedRegion) || summary.total_schools,
      ),
      helper: "Sekolah pada konteks wilayah",
      icon: School,
      tone: "teal",
    },
    {
      label: "Status Risiko",
      value: riskStatus,
      helper: `Wilayah ${getRegionName(selectedRegion)}`,
      icon: ShieldCheck,
      tone: getRiskTone(riskStatus),
    },
    {
      label: "Warga Rentan",
      value: formatNumber(getVulnerablePopulation(selectedRegion)),
      helper: "Indikator kebutuhan bantuan",
      icon: UsersRound,
      tone: riskStatus === "Tinggi" ? "red" : "teal",
    },
    {
      label: "Gap PIP",
      value: formatNumber(getPipGap(selectedRegion)),
      helper: "Potensi kebutuhan bantuan",
      icon: GraduationCap,
      tone: getPipGap(selectedRegion) > 0 ? "amber" : "teal",
    },
  ];

  const predictionColumns = [
    {
      key: "algorithm",
      header: "Algoritma",
      render: (prediction) => prediction.algorithm || "-",
    },
    {
      key: "score",
      header: "Risk Score",
      render: (prediction) => (
        <span className="font-extrabold text-[#102A43]">
          {getPredictionScore(prediction).toFixed(1)}
        </span>
      ),
    },
    {
      key: "label",
      header: "Label",
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

  return (
    <DashboardShell
      badge="School Context"
      title="Dashboard kerja untuk Operator Sekolah."
      description="Operator sekolah membaca konteks wilayah, status risiko, gap bantuan, dan kesiapan data untuk mendukung distribusi bantuan pendidikan."
      actions={
        <RegionSelector
          regions={regionOptions}
          selectedRegionId={activeRegionId}
          onChange={setSelectedRegionId}
          disabled={userHasFixedRegion}
        />
      }
    >
      {isLoading ? (
        <LoadingState label="Mengambil konteks sekolah dan wilayah..." />
      ) : (
        <>
          {errorMessage && (
            <DashboardErrorBanner
              title="Konteks sekolah belum bisa dimuat."
              description={`${errorMessage} Pastikan backend berjalan di http://localhost:5000.`}
            />
          )}

          <RegionHeroCard region={selectedRegion} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <DashboardMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DashboardSection
              badge="Education Signals"
              title="Sinyal pendidikan wilayah"
              description="Indikator utama untuk memahami kebutuhan bantuan di wilayah sekolah."
            >
              <EducationSignalPanel region={selectedRegion} />
            </DashboardSection>

            <DashboardSection
              badge="Aid Readiness"
              title="Kesiapan data bantuan"
              description="Checklist konteks sekolah dan wilayah sebelum tindak lanjut bantuan."
            >
              <AidReadinessPanel region={selectedRegion} />
            </DashboardSection>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
            <DashboardSection
              badge="Regional AI Signal"
              title="Prediksi AI terkait wilayah"
              description="Prediksi terbaru yang berkaitan dengan wilayah sekolah aktif."
            >
              <DashboardTable
                columns={predictionColumns}
                rows={regionPredictions}
                getRowKey={(prediction) => prediction.id}
                emptyTitle="Belum ada prediksi untuk wilayah ini."
                emptyDescription="Data prediksi terkait wilayah akan tampil setelah endpoint predictions/latest mengirimkan data yang sesuai."
              />
            </DashboardSection>

            <DashboardSection
              badge="Follow-up"
              title="Rekomendasi tindak lanjut"
              description="Langkah praktis untuk menjaga data dan proses bantuan tetap valid."
            >
              <FollowUpGuidance />
            </DashboardSection>
          </div>

          <DashboardSection
            badge="Operator Notes"
            title="Peran operator sekolah dalam PINTARIN"
            description="Operator sekolah membantu menjaga kualitas data dari level paling dekat dengan peserta didik dan kebutuhan lapangan."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Data sebagai dasar",
                  description:
                    "Semakin rapi data sekolah, semakin akurat rekomendasi bantuan yang bisa dihasilkan sistem.",
                  icon: ClipboardList,
                },
                {
                  title: "Validasi konteks",
                  description:
                    "Operator membantu memberi konteks lapangan yang tidak selalu terlihat dari angka.",
                  icon: BookOpenCheck,
                },
                {
                  title: "Koordinasi bantuan",
                  description:
                    "Insight wilayah dapat menjadi bahan komunikasi dengan dinas dan mitra bantuan.",
                  icon: Sparkles,
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
        </>
      )}
    </DashboardShell>
  );
}
