import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Navigate, useParams } from "react-router-dom";

import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/feedback/LoadingState";
import { formatNumber, formatPercent } from "../../../lib/utils";
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

const officerSectionMeta = {
  overview: {
    badge: "Ruang Dinas",
    title: "Overview Dinas",
    description: "Ringkasan validasi, prioritas risiko, dan kualitas prediksi.",
  },
  "map-risk": {
    badge: "Map Risk",
    title: "Map Risk",
    description: "Pantau wilayah yang perlu divalidasi dan diprioritaskan.",
  },
  analytic: {
    badge: "Analitik",
    title: "Analitik Dinas",
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
        const [summaryResult, pendingResult, regionsResult] =
          await Promise.allSettled([
            dashboardService.getAnalyticsSummary(controller.signal),
            dashboardService.getPendingReviews({
              limit: 30,
              signal: controller.signal,
            }),
            dashboardService.getRegions(controller.signal),
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
  }, [reloadKey]);

  const metricCards = [
    {
      label: "Pending Review",
      value: formatNumber(pendingCount),
      helper: "Prediksi menunggu validasi",
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Risiko Tinggi",
      value: formatNumber(highRiskQueue.length),
      helper: "Perlu prioritas keputusan",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "Confidence Rendah",
      value: formatNumber(lowConfidenceQueue.length),
      helper: "Butuh pemeriksaan manual",
      icon: ShieldCheck,
      tone: "red",
    },
    {
      label: "Avg Confidence",
      value: formatPercent(avgConfidence),
      helper: `Total prediksi AI ${formatNumber(summary.total_predictions)}`,
      icon: ClipboardCheck,
      tone: "teal",
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
          badge="Map Risk"
          title="Map Risk"
          description="Klik wilayah untuk membaca prioritas validasi."
          regions={regions}
          topRegions={topRiskRegions}
        />
      );
    }

    if (currentSection === "analytic") {
      return (
        <>
          {renderMetricGrid()}

          <DashboardSection
            badge="Kualitas Data"
            title="Kesehatan antrean validasi"
            description="Gunakan angka ini untuk menentukan prioritas kerja harian."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Antrean",
                  value: formatNumber(pendingCount),
                  helper: "Menunggu validasi",
                  icon: Clock3,
                },
                {
                  label: "Risiko Tinggi",
                  value: formatNumber(highRiskQueue.length),
                  helper: "Butuh prioritas",
                  icon: AlertTriangle,
                },
                {
                  label: "Confidence",
                  value: formatPercent(avgConfidence),
                  helper: "Rata-rata prediksi",
                  icon: BarChart3,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[1.35rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/35"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
                      <Icon size={18} />
                    </div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                      {item.label}
                    </p>
                    <p className="font-heading mt-2 text-2xl font-extrabold text-[#102A43]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#64748B]">
                      {item.helper}
                    </p>
                  </div>
                );
              })}
            </div>
          </DashboardSection>
        </>
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
          variant="secondary"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={isLoading}
        >
          <RotateCcw size={16} />
          Refresh Data
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
