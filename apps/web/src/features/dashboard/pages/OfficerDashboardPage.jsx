import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/feedback/LoadingState";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../../lib/utils";
import DashboardErrorBanner from "../components/DashboardErrorBanner";
import DashboardMetricCard from "../components/DashboardMetricCard";
import DashboardSection from "../components/DashboardSection";
import DashboardShell from "../components/DashboardShell";
import GenAiPanel from "../components/GenAiPanel";
import { dashboardService } from "../dashboardService";
import SchoolRequestReviewPanel from "../components/SchoolRequestReviewPanel";
import CsrAidReviewPanel from "../components/CsrAidReviewPanel";
import DashboardChoroplethPanel from "../components/DashboardChoroplethPanel";
import PredictionReviewQueuePanel from "../components/PredictionReviewQueuePanel";

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getPredictionLabel = (prediction) => {
  return prediction?.final_label || prediction?.predicted_label || "Sedang";
};

const getConfidencePercent = (prediction) => {
  const score = Number(prediction?.confidence_score || 0);

  return score <= 1 ? score * 100 : score;
};

const defaultOfficerSection = "overview";

const statusColors = {
  Diajukan: "#0284C7",
  Ditinjau: "#D97706",
  Disetujui: "#059669",
  Ditolak: "#DC2626",
  Disalurkan: "#0F766E",
  Selesai: "#14B8A6",
};

const getDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultAnalyticsRange = () => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 29);

  return {
    fromDate: getDateInputValue(fromDate),
    toDate: getDateInputValue(toDate),
  };
};

const officerSectionMeta = {
  overview: {
    badge: "Ruang Dinas",
    title: "Overview Dinas",
    description: "Ringkasan validasi, prioritas risiko, dan kualitas prediksi.",
  },
  "map-risk": {
    badge: "",
    title: "Kota Bandung Map Risk",
    description: "",
  },
  analytic: {
    badge: "Analitik",
    title: "Pintarin Analitik",
    description: "Baca antrean validasi dan confidence prediksi AI.",
  },
  "validasi-csr": {
    badge: "Validasi CSR",
    title: "Validasi CSR",
    description: "Review dan validasi bantuan yang diajukan mitra CSR.",
  },
  "validasi-sekolah": {
    badge: "Validasi Sekolah",
    title: "Validasi Sekolah",
    description: "Review kebutuhan yang dikirim oleh operator sekolah.",
  },
  review: {
    badge: "Review",
    title: "Review Prediksi",
    description: "Validasi prediksi AI yang membutuhkan keputusan manual.",
  },
  "gen-ai": {
    badge: "Gen AI",
    title: "Gen AI",
    description: "Asisten Gemini untuk insight validasi dan kebijakan.",
  },
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-xs shadow-2xl shadow-slate-900/12 ring-1 ring-white/50 backdrop-blur-2xl">
      <p className="mb-2 font-extrabold text-[#102A43]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={`${item.dataKey}-${item.name}`}
            className="flex items-center justify-between gap-5"
          >
            <span className="font-semibold text-[#64748B]">{item.name}</span>
            <span className="font-extrabold text-[#102A43]">
              {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsChartCard({ badge, title, description, children }) {
  return (
    <DashboardSection
      badge={badge}
      title={title}
      description={description}
      contentClassName="p-5 sm:p-6"
    >
      {children}
    </DashboardSection>
  );
}

function OfficerAnalyticsCharts({ analytics, dateRange, onDateRangeChange }) {
  const daily = getArray(analytics?.daily);
  const summary = analytics?.summary || {};
  const schoolStatuses = getArray(analytics?.status_breakdown?.school_requests);
  const csrStatuses = getArray(analytics?.status_breakdown?.csr_proposals);
  const statusData = [...schoolStatuses, ...csrStatuses].reduce(
    (items, item) => {
      const status = item.status || "Lainnya";
      const existing = items.find((entry) => entry.status === status);

      if (existing) {
        existing.total += Number(item.total || 0);
      } else {
        items.push({ status, total: Number(item.total || 0) });
      }

      return items;
    },
    [],
  );

  const cards = [
    {
      label: "Pengajuan",
      value: formatNumber(summary.total_submissions),
      helper: "Sekolah dan CSR",
      icon: ClipboardCheck,
      tone: "teal",
    },
    {
      label: "Minta Bantuan",
      value: formatNumber(summary.school_requests),
      helper: "Ajuan sekolah",
      icon: SlidersHorizontal,
      tone: "teal",
    },
    {
      label: "Tervalidasi",
      value: formatNumber(summary.request_validations),
      helper: "Ajuan selesai ditinjau",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Nilai Bantuan",
      value: formatCurrency(summary.aid_value),
      detailValue: formatCurrency(summary.aid_value),
      helper: "Total ajuan periode ini",
      icon: BarChart3,
      tone: "amber",
    },
  ];

  const handleDateChange = (field, value) => {
    if (!value) return;

    onDateRangeChange((current) => {
      const next = { ...current, [field]: value };

      if (next.fromDate && next.toDate && next.fromDate > next.toDate) {
        if (field === "fromDate") {
          next.toDate = value;
        } else {
          next.fromDate = value;
        }
      }

      return next;
    });
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-white/70 bg-white/38 p-4 shadow-xl shadow-slate-300/16 ring-1 ring-white/40 backdrop-blur-2xl lg:flex-row lg:items-stretch">
        <div className="flex min-h-[4.9rem] items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
            <CalendarDays size={19} />
          </span>

          <div className="flex min-h-11 items-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
              Rentang Analitik
            </p>
          </div>
        </div>

        <div className="grid items-end gap-3 rounded-[1.25rem] bg-white/48 p-2 ring-1 ring-white/55 backdrop-blur-xl sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="px-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#64748B]">
              Dari
            </span>
            <input
              type="date"
              value={dateRange.fromDate}
              max={dateRange.toDate}
              onChange={(event) =>
                handleDateChange("fromDate", event.target.value)
              }
              className="min-h-11 rounded-[0.95rem] border border-white/70 bg-white/78 px-3 text-sm font-extrabold text-[#102A43] shadow-sm outline-none ring-1 ring-white/50 transition focus:border-[#5EEAD4]/70 focus:ring-4 focus:ring-[#5EEAD4]/25"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="px-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#64748B]">
              Sampai
            </span>
            <input
              type="date"
              value={dateRange.toDate}
              min={dateRange.fromDate}
              onChange={(event) =>
                handleDateChange("toDate", event.target.value)
              }
              className="min-h-11 rounded-[0.95rem] border border-white/70 bg-white/78 px-3 text-sm font-extrabold text-[#102A43] shadow-sm outline-none ring-1 ring-white/50 transition focus:border-[#5EEAD4]/70 focus:ring-4 focus:ring-[#5EEAD4]/25"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
        <div className="grid gap-4 self-start">
          {cards.map((metric) => (
            <DashboardMetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="grid gap-6">
          <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
            <AnalyticsChartCard
              badge="Trend"
              title="Aktivitas pengajuan"
              description="Jumlah ajuan sekolah dan proposal CSR per hari."
            >
              <div className="h-[19rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={daily} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="schoolRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F766E" stopOpacity={0.36} />
                        <stop offset="95%" stopColor="#0F766E" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="csrProposals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(100,116,139,0.15)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748B", fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748B", fontSize: 12, fontWeight: 700 }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="school_requests"
                      name="Ajuan sekolah"
                      stroke="#0F766E"
                      strokeWidth={3}
                      fill="url(#schoolRequests)"
                    />
                    <Area
                      type="monotone"
                      dataKey="csr_proposals"
                      name="Proposal CSR"
                      stroke="#0284C7"
                      strokeWidth={3}
                      fill="url(#csrProposals)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsChartCard>

            <AnalyticsChartCard
              badge="Status"
              title="Komposisi status"
              description="Sebaran status ajuan pada periode aktif."
            >
              <div className="grid min-h-[19rem] gap-4 md:grid-cols-[0.9fr_1.1fr] 2xl:grid-cols-1">
                <div className="h-[13rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="total"
                        nameKey="status"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={4}
                      >
                        {statusData.map((item) => (
                          <Cell
                            key={item.status}
                            fill={statusColors[item.status] || "#64748B"}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {statusData.length === 0 ? (
                    <p className="rounded-2xl bg-white/42 p-4 text-sm font-semibold text-[#64748B]">
                      Belum ada status ajuan pada periode ini.
                    </p>
                  ) : (
                    statusData.map((item) => (
                      <div
                        key={item.status}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white/42 px-3 py-2.5"
                      >
                        <span className="flex items-center gap-2 text-sm font-extrabold text-[#102A43]">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                statusColors[item.status] || "#64748B",
                            }}
                          />
                          {item.status}
                        </span>
                        <span className="text-sm font-extrabold text-[#0F766E]">
                          {formatNumber(item.total)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </AnalyticsChartCard>
          </div>
        </div>
      </div>

      <AnalyticsChartCard
        badge="Validasi"
        title="Validasi dan review AI"
        description="Ajuan yang sudah divalidasi dibandingkan review prediksi AI per hari."
      >
        <div className="h-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="rgba(100,116,139,0.15)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748B", fontSize: 12, fontWeight: 700 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="request_validations"
                name="Validasi ajuan"
                fill="#0F766E"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="ai_reviews"
                name="Review AI"
                fill="#F59E0B"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsChartCard>
    </>
  );
}

export default function OfficerDashboardPage() {
  const { section } = useParams();
  const currentSection = section || defaultOfficerSection;
  const sectionMeta = officerSectionMeta[currentSection];

  const [summaryData, setSummaryData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [pendingPayload, setPendingPayload] = useState({
    count: 0,
    predictions: [],
  });
  const [operationalAnalytics, setOperationalAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState(getDefaultAnalyticsRange);
  const [reloadKey, setReloadKey] = useState(0);
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
        const [summaryResult, pendingResult, regionsResult, operationsResult] =
          await Promise.allSettled([
            dashboardService.getAnalyticsSummary(controller.signal),
            dashboardService.getPendingReviews({
              limit: 30,
              signal: controller.signal,
            }),
            dashboardService.getRegions(controller.signal),
            dashboardService.getOfficerOperationalAnalytics({
              fromDate: analyticsRange.fromDate,
              toDate: analyticsRange.toDate,
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

        if (regionsResult.status === "fulfilled") {
          setRegions(getArray(regionsResult.value));
        }

        if (operationsResult.status === "fulfilled") {
          setOperationalAnalytics(operationsResult.value);
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
  }, [analyticsRange.fromDate, analyticsRange.toDate, reloadKey]);

  const metricCards = [
    {
      label: "Pending Review",
      value: formatNumber(pendingCount),
      helper: "Prediksi menunggu validasi",
      icon: Clock3,
      tone: "amber",
      showDetail: false,
    },
    {
      label: "Risiko Tinggi",
      value: formatNumber(highRiskQueue.length),
      helper: "Perlu prioritas keputusan",
      icon: AlertTriangle,
      tone: "red",
      showDetail: false,
    },
    {
      label: "Confidence Rendah",
      value: formatNumber(lowConfidenceQueue.length),
      helper: "Butuh pemeriksaan manual",
      icon: ShieldCheck,
      tone: "red",
      showDetail: false,
    },
    {
      label: "Avg Confidence",
      value: formatPercent(avgConfidence),
      helper: `Total prediksi AI ${formatNumber(summary.total_predictions)}`,
      icon: ClipboardCheck,
      tone: "teal",
      showDetail: false,
    },
  ];

  if (!sectionMeta) {
    return <Navigate to="/dashboard/officer/overview" replace />;
  }

  const decisionGuide = (
    <DashboardSection
      badge="Decision Guide"
      title="Prinsip validasi"
      description="Gunakan AI sebagai bantuan analisis, bukan keputusan tunggal."
    >
      <div className="space-y-4">
        {[
          {
            title: "Approve",
            description: "Pakai saat label AI sesuai konteks data wilayah.",
            icon: CheckCircle2,
          },
          {
            title: "Override",
            description: "Pakai saat bukti lapangan lebih kuat dari prediksi.",
            icon: SlidersHorizontal,
          },
          {
            title: "Audit Trail",
            description: "Setiap validasi dicatat untuk transparansi.",
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

              <p className="font-extrabold text-[#102A43]">{item.title}</p>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </DashboardSection>
  );

  const renderMetricGrid = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map((metric) => (
        <DashboardMetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );

  const renderSectionContent = () => {
    if (currentSection === "map-risk") {
      return (
        <DashboardChoroplethPanel
          regions={regions}
          topRegions={topRiskRegions}
        />
      );
    }

    if (currentSection === "analytic") {
      return (
        <OfficerAnalyticsCharts
          analytics={operationalAnalytics}
          dateRange={analyticsRange}
          onDateRangeChange={setAnalyticsRange}
        />
      );
    }

    if (currentSection === "validasi-csr") {
      return <CsrAidReviewPanel />;
    }

    if (currentSection === "validasi-sekolah") {
      return <SchoolRequestReviewPanel />;
    }

    if (currentSection === "review") {
      return (
        <>
          {renderMetricGrid()}

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <DashboardSection
              badge="Human-in-the-Loop"
              title="Antrian review prediksi"
              description="Prediksi confidence rendah perlu diperiksa sebelum dipakai sebagai keputusan final."
            >
              <PredictionReviewQueuePanel
                limit={30}
                onValidated={() => setReloadKey((current) => current + 1)}
              />
            </DashboardSection>

            {decisionGuide}
          </div>
        </>
      );
    }

    if (currentSection === "gen-ai") {
      return (
        <GenAiPanel
          title="Gen AI Dinas"
          description="Bantu susun insight validasi dan rekomendasi kebijakan pendidikan."
          context={{
            role: "officer",
            pending_reviews: pendingCount,
            high_risk_queue: highRiskQueue.length,
            low_confidence_queue: lowConfidenceQueue.length,
            average_confidence: avgConfidence,
            total_predictions: summary.total_predictions,
            top_risk_regions: topRiskRegions.slice(0, 3).map((region) => ({
              name: region.region_name || region.name,
              risk_status: region.risk_status || region.final_label,
              priority_score: region.priority_score,
            })),
          }}
          starterPrompts={[
            "Ringkas prioritas validasi dinas berdasarkan konteks ini.",
            "Buat rekomendasi kebijakan singkat untuk wilayah risiko tinggi.",
            "Apa risiko keputusan yang perlu direview manusia sebelum disetujui?",
          ]}
        />
      );
    }

    return (
      <>
        {renderMetricGrid()}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <DashboardSection
            badge="Prioritas"
            title="Fokus kerja hari ini"
            description="Ringkas antrean yang perlu dibaca sebelum validasi."
          >
            <div className="space-y-3">
              {[
                {
                  label: "Prediksi menunggu",
                  value: formatNumber(pendingCount),
                  helper: "Masuk ke Review Prediksi untuk keputusan manual.",
                  icon: Clock3,
                },
                {
                  label: "Risiko tinggi",
                  value: formatNumber(highRiskQueue.length),
                  helper: "Utamakan validasi untuk wilayah prioritas.",
                  icon: AlertTriangle,
                },
                {
                  label: "Confidence rendah",
                  value: formatNumber(lowConfidenceQueue.length),
                  helper: "Periksa konteks data sebelum dipakai.",
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 rounded-[1.2rem] bg-white/42 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                      <Icon size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-[#102A43]">
                        {item.label}: {item.value}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#64748B]">
                        {item.helper}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardSection>

          {decisionGuide}
        </div>
      </>
    );
  };

  return (
    <DashboardShell
      badge={sectionMeta.badge}
      title={sectionMeta.title}
      description={sectionMeta.description}
      actions={
        <Button
          variant="iconGhost"
          size="icon"
          aria-label="Refresh data"
          title="Refresh data"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={isLoading}
        >
          <RotateCcw size={20} />
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

          {renderSectionContent()}
        </>
      )}
    </DashboardShell>
  );
}
