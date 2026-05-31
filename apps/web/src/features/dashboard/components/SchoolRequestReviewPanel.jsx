import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/feedback/LoadingState";
import { formatCurrency, formatNumber } from "../../../lib/utils";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardErrorBanner from "./DashboardErrorBanner";
import DashboardSection from "./DashboardSection";
import { schoolRequestService } from "../schoolRequestService";

const reviewStatuses = [
  {
    value: "Ditinjau",
    label: "Tinjau",
    icon: Clock3,
    variant: "secondary",
  },
  {
    value: "Disetujui",
    label: "Setujui",
    icon: CheckCircle2,
    variant: "primary",
  },
  {
    value: "Ditolak",
    label: "Tolak",
    icon: XCircle,
    variant: "danger",
  },
  {
    value: "Disalurkan",
    label: "Salurkan",
    icon: ShieldCheck,
    variant: "secondary",
  },
];

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
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

function ReviewModal({
  request,
  status,
  reviewNote,
  isSubmitting,
  onStatusChange,
  onNoteChange,
  onClose,
  onConfirm,
}) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0B172A]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
            Review Ajuan
          </p>

          <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#102A43]">
            {request.title}
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            {request.school_name || "Sekolah"} · {request.category} ·{" "}
            {formatCurrency(request.requested_value)}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-extrabold text-[#102A43]">
              Status
            </label>

            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
            >
              {reviewStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-extrabold text-[#102A43]">
              Catatan
            </label>

            <textarea
              value={reviewNote}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={4}
              placeholder="Tulis catatan singkat untuk sekolah."
              className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold leading-7 text-[#102A43] outline-none ring-1 ring-white/40 placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>

          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ request, onReview }) {
  const activeStatus = reviewStatuses.find(
    (item) => item.value === request.status,
  );

  return (
    <div className="rounded-[1.45rem] border border-white/70 bg-white/46 p-5 ring-1 ring-white/40 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
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
            {request.request_code} · {request.school_name || "-"} ·{" "}
            {request.region_name || "-"}
          </p>

          <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#64748B]">
            {request.description || "Tidak ada keterangan."}
          </p>
        </div>

        <div className="shrink-0 text-left xl:text-right">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Nilai
          </p>

          <p className="mt-1 text-base font-extrabold text-[#0F766E]">
            {formatCurrency(request.requested_value)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-white/70 bg-white/38 p-4 text-sm leading-6 text-[#64748B] md:grid-cols-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Kategori
          </p>
          <p className="mt-1 font-extrabold text-[#102A43]">
            {request.category}
          </p>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Urgensi
          </p>
          <p className="mt-1 font-extrabold text-[#102A43]">
            {request.urgency}
          </p>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Bukti
          </p>

          {request.evidence_url ? (
            <a
              href={request.evidence_url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 font-extrabold text-[#0F766E] hover:text-[#115E59]"
            >
              Lihat bukti <ExternalLink size={14} />
            </a>
          ) : (
            <p className="mt-1 font-semibold text-[#64748B]">Belum ada link</p>
          )}
        </div>
      </div>

      {request.review_note && (
        <div className="mt-3 rounded-2xl border border-white/70 bg-white/38 p-3 text-sm leading-6 text-[#64748B]">
          <span className="font-extrabold text-[#102A43]">Catatan:</span>{" "}
          {request.review_note}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {reviewStatuses.map((item) => {
          const Icon = item.icon;
          const isActive = activeStatus?.value === item.value;

          return (
            <Button
              key={item.value}
              size="sm"
              variant={item.variant}
              onClick={() => onReview(request, item.value)}
              disabled={isActive}
            >
              <Icon size={16} />
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default function SchoolRequestReviewPanel() {
  const [requestsPayload, setRequestsPayload] = useState({
    count: 0,
    requests: [],
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Ditinjau");
  const [reviewNote, setReviewNote] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const requests = getArray(requestsPayload.requests);
  const activeRequests = requests.filter((request) =>
    ["Diajukan", "Ditinjau"].includes(request.status),
  );

  const openReview = (request, status) => {
    setSelectedRequest(request);
    setSelectedStatus(status);
    setReviewNote(request.review_note || "");
    setErrorMessage("");
  };

  const closeReview = () => {
    if (isReviewing) return;

    setSelectedRequest(null);
    setSelectedStatus("Ditinjau");
    setReviewNote("");
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await schoolRequestService.getRequests({
          limit: 30,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setRequestsPayload(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Ajuan sekolah belum bisa dimuat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchRequests();

    return () => controller.abort();
  }, [reloadKey]);

  const handleConfirmReview = async () => {
    if (!selectedRequest) return;

    setIsReviewing(true);
    setErrorMessage("");

    try {
      await schoolRequestService.reviewRequest({
        requestId: selectedRequest.id,
        status: selectedStatus,
        reviewNote,
      });

      closeReview();
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Review ajuan gagal disimpan.",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <>
      <DashboardSection
        badge="Ajuan Sekolah"
        title="Validasi ajuan"
        description="Tinjau kebutuhan yang dikirim sekolah."
        action={
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
        {errorMessage && (
          <div className="mb-5">
            <DashboardErrorBanner
              title="Ajuan sekolah belum bisa diproses."
              description={errorMessage}
            />
          </div>
        )}

        {isLoading ? (
          <LoadingState label="Mengambil ajuan sekolah..." />
        ) : activeRequests.length === 0 ? (
          <DashboardEmptyState
            title="Tidak ada ajuan aktif."
            description={`Total ajuan terbaca: ${formatNumber(requests.length)}.`}
          />
        ) : (
          <div className="space-y-4">
            {activeRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onReview={openReview}
              />
            ))}
          </div>
        )}
      </DashboardSection>

      <ReviewModal
        request={selectedRequest}
        status={selectedStatus}
        reviewNote={reviewNote}
        isSubmitting={isReviewing}
        onStatusChange={setSelectedStatus}
        onNoteChange={setReviewNote}
        onClose={closeReview}
        onConfirm={handleConfirmReview}
      />
    </>
  );
}
