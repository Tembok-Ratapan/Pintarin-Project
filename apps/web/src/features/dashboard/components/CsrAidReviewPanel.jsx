import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/Select";
import LoadingState from "../../../components/feedback/LoadingState";
import { formatCurrency, formatNumber } from "../../../lib/utils";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardErrorBanner from "./DashboardErrorBanner";
import DashboardSection from "./DashboardSection";
import { csrAidService } from "../csrAidService";

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
  {
    value: "Selesai",
    label: "Selesai",
    icon: Sparkles,
    variant: "secondary",
  },
];

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
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

function ReviewModal({
  proposal,
  status,
  reviewNote,
  isSubmitting,
  onStatusChange,
  onNoteChange,
  onClose,
  onConfirm,
}) {
  if (!proposal) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0B172A]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
            Review Bantuan CSR
          </p>

          <h3 className="mt-2 text-2xl font-extrabold text-[#102A43]">
            {proposal.aid_name}
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            {proposal.submitted_by_name || "CSR"} · {proposal.aid_type} ·{" "}
            {formatCurrency(proposal.aid_value)}
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
              placeholder="Tulis catatan singkat untuk pihak CSR."
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

function AidCard({ proposal, onReview }) {
  const activeStatus = reviewStatuses.find(
    (item) => item.value === proposal.status,
  );
  const ActiveIcon = activeStatus?.icon || Clock3;

  return (
    <div className="rounded-[1.45rem] bg-white/46 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold text-[#102A43]">{proposal.aid_name}</p>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${getStatusBadgeClass(
                proposal.status,
              )}`}
            >
              {proposal.status}
            </span>
          </div>

          <p className="mt-1 text-xs font-semibold text-[#64748B]">
            {proposal.proposal_code} · {proposal.submitted_by_name || "-"} ·{" "}
            {proposal.allocation_type === "sekolah_tertentu"
              ? "Sekolah tertentu"
              : "Fleksibel"}
          </p>

          <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#64748B]">
            {proposal.description || "Tidak ada keterangan."}
          </p>
        </div>

        <div className="shrink-0 text-left xl:text-right">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Nilai
          </p>

          <p className="mt-1 text-base font-extrabold text-[#0F766E]">
            {formatCurrency(proposal.aid_value)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-white/38 p-4 text-sm leading-6 text-[#64748B] shadow-inner shadow-white/40 md:grid-cols-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Jenis
          </p>
          <p className="mt-1 font-extrabold text-[#102A43]">
            {proposal.aid_type}
          </p>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">
            Target
          </p>
          <p className="mt-1 font-extrabold text-[#102A43]">
            {proposal.target_school_name ||
              proposal.target_region_name ||
              "Fleksibel"}
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
        <div className="mt-3 rounded-2xl bg-white/38 p-3 text-sm leading-6 text-[#64748B] shadow-inner shadow-white/40">
          <span className="font-extrabold text-[#102A43]">Catatan:</span>{" "}
          {proposal.review_note}
        </div>
      )}

      <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl bg-[#ECFEFF]/40 p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
            <ActiveIcon size={18} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-[#102A43]">
              Status saat ini: {proposal.status}
            </p>
            <p className="text-xs font-semibold leading-5 text-[#64748B]">
              Pilih keputusan penyaluran lewat modal review.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onReview(proposal, proposal.status || "Ditinjau")}
          className="justify-center"
        >
          <ShieldCheck size={16} />
          Review keputusan
        </Button>
      </div>
    </div>
  );
}

export default function CsrAidReviewPanel() {
  const [proposalsPayload, setProposalsPayload] = useState({
    count: 0,
    proposals: [],
  });
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Ditinjau");
  const [reviewNote, setReviewNote] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const proposals = getArray(proposalsPayload.proposals);
  const activeProposals = proposals.filter((proposal) =>
    ["Diajukan", "Ditinjau"].includes(proposal.status),
  );

  const openReview = (proposal, status) => {
    setSelectedProposal(proposal);
    setSelectedStatus(status);
    setReviewNote(proposal.review_note || "");
    setErrorMessage("");
  };

  const closeReview = () => {
    if (isReviewing) return;

    setSelectedProposal(null);
    setSelectedStatus("Ditinjau");
    setReviewNote("");
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProposals = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await csrAidService.getAidProposals({
          limit: 30,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setProposalsPayload(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Bantuan CSR belum bisa dimuat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchProposals();

    return () => controller.abort();
  }, [reloadKey]);

  const handleConfirmReview = async () => {
    if (!selectedProposal) return;

    setIsReviewing(true);
    setErrorMessage("");

    try {
      await csrAidService.reviewAidProposal({
        proposalId: selectedProposal.id,
        status: selectedStatus,
        reviewNote,
      });

      closeReview();
      setReloadKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Review bantuan CSR gagal disimpan.",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <>
      <DashboardSection
        badge="Bantuan CSR"
        title="Validasi bantuan"
        description="Tinjau bantuan dari pihak CSR."
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
              title="Bantuan CSR belum bisa diproses."
              description={errorMessage}
            />
          </div>
        )}

        {isLoading ? (
          <LoadingState label="Mengambil bantuan CSR..." />
        ) : activeProposals.length === 0 ? (
          <DashboardEmptyState
            title="Tidak ada bantuan aktif."
            description={`Total bantuan terbaca: ${formatNumber(proposals.length)}.`}
          />
        ) : (
          <div className="space-y-4">
            {activeProposals.map((proposal) => (
              <AidCard
                key={proposal.id}
                proposal={proposal}
                onReview={openReview}
              />
            ))}
          </div>
        )}
      </DashboardSection>

      <ReviewModal
        proposal={selectedProposal}
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
