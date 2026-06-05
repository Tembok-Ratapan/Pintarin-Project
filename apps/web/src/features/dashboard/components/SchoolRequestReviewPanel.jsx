import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/Select";
import LoadingState from "../../../components/feedback/LoadingState";
import { formatCurrency, formatNumber } from "../../../lib/utils";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardErrorBanner from "./DashboardErrorBanner";
import DashboardRecordCard from "./DashboardRecordCard";
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

          <h3 className="mt-2 text-2xl font-extrabold text-[#102A43]">
            {request.title}
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            {request.school_name || "Sekolah"} - {request.category} -{" "}
            {formatCurrency(request.requested_value)}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <SelectField label="Status" value={status} onChange={onStatusChange}>
            {reviewStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </SelectField>

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
  const ActiveIcon = activeStatus?.icon || Clock3;

  return (
    <DashboardRecordCard
      title={request.title}
      status={request.status}
      meta={`${request.request_code} - ${request.school_name || "-"} - ${
        request.region_name || "-"
      }`}
      description={request.description || "Tidak ada keterangan."}
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
        <div className="space-y-4">
          {request.review_note && (
            <p className="text-sm leading-6 text-[#64748B]">
              <span className="font-extrabold text-[#102A43]">Catatan:</span>{" "}
              {request.review_note}
            </p>
          )}

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5EEAD4]/18 text-[#0F766E]">
                <ActiveIcon size={18} />
              </span>
              <p className="text-sm font-semibold leading-6 text-[#64748B]">
                Status sekarang{" "}
                <span className="font-extrabold text-[#102A43]">
                  {request.status}
                </span>
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => onReview(request, request.status || "Ditinjau")}
              className="justify-center"
            >
              <ShieldCheck size={16} />
              Review keputusan
            </Button>
          </div>
        </div>
      }
    />
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
            variant="iconGhost"
            size="icon"
            aria-label="Refresh ajuan sekolah"
            title="Refresh data"
            onClick={() => setReloadKey((current) => current + 1)}
            disabled={isLoading}
          >
            <RefreshCcw size={20} />
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
