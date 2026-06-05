import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCcw,
  Search,
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
import { csrAidService } from "../csrAidService";
import { schoolCatalogService } from "../schoolCatalogService";

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

const allowedReviewStatusValues = reviewStatuses.map((status) => status.value);

const normalizeReviewStatus = (status) => {
  return allowedReviewStatusValues.includes(status) ? status : "Ditinjau";
};

const getArray = (value) => {
  return Array.isArray(value) ? value : [];
};

function ReviewModal({
  proposal,
  status,
  reviewNote,
  finalSchoolId,
  recommendedSchoolId,
  schoolSearch,
  schools,
  isSearchingSchools,
  isSubmitting,
  onStatusChange,
  onNoteChange,
  onFinalSchoolChange,
  onRecommendedSchoolChange,
  onSchoolSearchChange,
  onClose,
  onConfirm,
}) {
  if (!proposal) return null;

  const isSpecificSchool = proposal.allocation_type === "sekolah_tertentu";
  const showFinalSchoolPicker =
    status === "Disalurkan" || (status === "Disetujui" && isSpecificSchool);
  const showRecommendationPicker = status === "Ditinjau" && isSpecificSchool;
  const activeSchoolId = showRecommendationPicker
    ? recommendedSchoolId
    : finalSchoolId;
  const handleSchoolPick = (schoolId) => {
    const nextSchoolId = String(schoolId);

    if (showRecommendationPicker) {
      onRecommendedSchoolChange(nextSchoolId);
      return;
    }

    onFinalSchoolChange(nextSchoolId);
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto overscroll-contain bg-[#0B172A]/35 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-5 sm:py-6"
    >
      <div
        data-lenis-prevent
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/92 shadow-2xl shadow-slate-900/20 ring-1 ring-white/50 backdrop-blur-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]"
      >
        <div className="shrink-0 border-b border-white/60 px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0F766E]">
            Review Bantuan CSR
          </p>

          <h3 className="mt-2 break-words text-xl font-extrabold leading-tight text-[#102A43] sm:text-2xl">
            {proposal.aid_name}
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            {proposal.submitted_by_name || "CSR"} · {proposal.aid_type} ·{" "}
            {formatCurrency(proposal.aid_value)}
          </p>

          <div className="mt-4 grid gap-3 rounded-2xl border border-white/70 bg-white/44 p-4 text-sm leading-6 text-[#64748B] ring-1 ring-white/35">
            <p>
              <span className="font-extrabold text-[#102A43]">
                Target awal:
              </span>{" "}
              {proposal.target_school_name ||
                proposal.target_region_name ||
                "Fleksibel semua wilayah"}
            </p>

            {(proposal.final_school_name || finalSchoolId) && (
              <p>
                <span className="font-extrabold text-[#102A43]">
                  Sekolah final:
                </span>{" "}
                {proposal.final_school_name || "Dipilih melalui review"}
              </p>
            )}

            {proposal.recommended_school_name && (
              <p>
                <span className="font-extrabold text-[#102A43]">
                  Rekomendasi dinas:
                </span>{" "}
                {proposal.recommended_school_name}
              </p>
            )}
          </div>
        </div>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
        >
          <SelectField label="Status" value={status} onChange={onStatusChange}>
            {reviewStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </SelectField>

          {(showFinalSchoolPicker || showRecommendationPicker) && (
            <div>
              <label className="text-sm font-extrabold text-[#102A43]">
                Cari Sekolah
              </label>

              <div className="relative mt-2">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
                <input
                  value={schoolSearch}
                  onChange={(event) => onSchoolSearchChange(event.target.value)}
                  placeholder="Cari sekolah berdasarkan nama"
                  className="h-12 w-full rounded-2xl border border-white/70 bg-white/70 pl-11 pr-4 text-sm font-semibold text-[#102A43] outline-none ring-1 ring-white/40 backdrop-blur-2xl placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
                />
              </div>

              <p className="mt-2 text-xs font-semibold leading-5 text-[#64748B]">
                {proposal.target_region_name
                  ? `Daftar dibatasi ke wilayah ${proposal.target_region_name}.`
                  : "Gunakan pencarian untuk memilih sekolah tujuan."}
              </p>

              <div
                data-lenis-prevent
                className="mt-3 max-h-48 overflow-y-auto overscroll-contain rounded-2xl border border-white/70 bg-white/58 p-2 ring-1 ring-white/40"
              >
                {isSearchingSchools ? (
                  <p className="px-3 py-2 text-sm font-semibold text-[#64748B]">
                    Mencari sekolah...
                  </p>
                ) : schools.length === 0 ? (
                  <p className="px-3 py-2 text-sm font-semibold text-[#64748B]">
                    Sekolah belum ditemukan. Coba kata kunci lain.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {schools.map((school) => {
                      const schoolId = String(school.id);
                      const isSelected = activeSchoolId === schoolId;

                      return (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => handleSchoolPick(school.id)}
                          className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${
                            isSelected
                              ? "bg-[#0F766E] text-white"
                              : "text-[#102A43] hover:bg-[#5EEAD4]/18"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-extrabold">
                              {school.name || school.school_name}
                            </span>
                            <span
                              className={`mt-0.5 block truncate text-xs font-semibold ${
                                isSelected ? "text-white/75" : "text-[#64748B]"
                              }`}
                            >
                              {school.region_name || "Wilayah belum tersedia"}
                            </span>
                          </span>

                          {isSelected && (
                            <span className="shrink-0 text-xs font-extrabold">
                              Dipilih
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {showFinalSchoolPicker && (
            <SelectField
              label={
                status === "Disalurkan"
                  ? "Sekolah Penerima"
                  : "Sekolah Final"
              }
              value={finalSchoolId}
              onChange={onFinalSchoolChange}
            >
              <option value="">
                {isSearchingSchools ? "Mencari sekolah..." : "Pilih sekolah"}
              </option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name || school.school_name} -{" "}
                  {school.region_name || "-"}
                </option>
              ))}
            </SelectField>
          )}

          {showRecommendationPicker && (
            <SelectField
              label="Rekomendasikan Sekolah Lain"
              value={recommendedSchoolId}
              onChange={onRecommendedSchoolChange}
            >
              <option value="">
                {isSearchingSchools
                  ? "Mencari sekolah..."
                  : "Tidak ada rekomendasi"}
              </option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name || school.school_name} -{" "}
                  {school.region_name || "-"}
                </option>
              ))}
            </SelectField>
          )}

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

        <div className="shrink-0 border-t border-white/60 bg-white/58 px-4 py-4 backdrop-blur-2xl sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Review"}
            </Button>
          </div>
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
  const allocationLabel =
    proposal.allocation_type === "sekolah_tertentu"
      ? "Sekolah tertentu"
      : "Fleksibel";
  const hasFooter = proposal.review_note || proposal.recommendation_note;

  return (
    <DashboardRecordCard
      title={proposal.aid_name}
      status={proposal.status}
      meta={`${proposal.proposal_code} - ${
        proposal.submitted_by_name || "-"
      } - ${allocationLabel}`}
      description={proposal.description || "Tidak ada keterangan."}
      valueLabel="Nilai"
      value={formatCurrency(proposal.aid_value)}
      details={[
        { label: "Jenis", value: proposal.aid_type },
        {
          label: "Target awal",
          value:
            proposal.target_school_name ||
            proposal.target_region_name ||
            "Fleksibel",
        },
        {
          label: "Dokumen",
          value: proposal.evidence_url ? "Lihat dokumen" : "Belum ada",
          href: proposal.evidence_url,
        },
        { label: "Penerima", value: proposal.final_school_name },
        {
          label: "Rekomendasi",
          value: proposal.recommended_school_name
            ? `${proposal.recommended_school_name} (${proposal.recommendation_status})`
            : "",
        },
        {
          label: "Disalurkan",
          value: proposal.distributed_at
            ? new Date(proposal.distributed_at).toLocaleDateString("id-ID")
            : "",
        },
      ]}
      footer={
        <div className="space-y-4">
          {hasFooter && (
            <div className="space-y-2 text-sm leading-6 text-[#64748B]">
              {proposal.recommendation_note && (
                <p>
                  <span className="font-extrabold text-[#102A43]">
                    Rekomendasi:
                  </span>{" "}
                  {proposal.recommendation_note}
                </p>
              )}

              {proposal.review_note && (
                <p>
                  <span className="font-extrabold text-[#102A43]">
                    Catatan:
                  </span>{" "}
                  {proposal.review_note}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5EEAD4]/18 text-[#0F766E]">
                <ActiveIcon size={18} />
              </span>
              <p className="text-sm font-semibold leading-6 text-[#64748B]">
                Status sekarang{" "}
                <span className="font-extrabold text-[#102A43]">
                  {proposal.status}
                </span>
              </p>
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
      }
    />
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
  const [finalSchoolId, setFinalSchoolId] = useState("");
  const [recommendedSchoolId, setRecommendedSchoolId] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schools, setSchools] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSearchingSchools, setIsSearchingSchools] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const proposals = getArray(proposalsPayload.proposals);
  const activeProposals = proposals.filter((proposal) =>
    ["Diajukan", "Ditinjau", "Disetujui"].includes(proposal.status),
  );

  const openReview = (proposal, status) => {
    setSelectedProposal(proposal);
    setSelectedStatus(normalizeReviewStatus(status));
    setReviewNote(proposal.review_note || "");
    setFinalSchoolId(
      proposal.final_school_id || proposal.target_school_id
        ? String(proposal.final_school_id || proposal.target_school_id)
        : "",
    );
    setRecommendedSchoolId(
      proposal.recommended_school_id ? String(proposal.recommended_school_id) : "",
    );
    setSchoolSearch("");
    setSchools([]);
    setErrorMessage("");
  };

  const closeReview = () => {
    if (isReviewing) return;

    setSelectedProposal(null);
    setSelectedStatus("Ditinjau");
    setReviewNote("");
    setFinalSchoolId("");
    setRecommendedSchoolId("");
    setSchoolSearch("");
    setSchools([]);
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

  useEffect(() => {
    if (!selectedProposal) return undefined;

    const isSpecificSchool =
      selectedProposal.allocation_type === "sekolah_tertentu";
    const shouldSearch =
      selectedStatus === "Disalurkan" ||
      (selectedStatus === "Disetujui" && isSpecificSchool) ||
      (selectedStatus === "Ditinjau" && isSpecificSchool);

    if (!shouldSearch) return undefined;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearchingSchools(true);

      try {
        const data = await schoolCatalogService.getSchools({
          search: schoolSearch.trim(),
          regionId: selectedProposal.target_region_id || undefined,
          limit: 80,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setSchools(getArray(data));
        }
      } catch (error) {
        if (
          !controller.signal.aborted &&
          error.code !== "ERR_CANCELED" &&
          error.name !== "CanceledError"
        ) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Daftar sekolah belum bisa dimuat.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingSchools(false);
        }
      }
    }, 240);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [selectedProposal, selectedStatus, schoolSearch]);

  const handleConfirmReview = async () => {
    if (!selectedProposal) return;

    setIsReviewing(true);
    setErrorMessage("");

    try {
      await csrAidService.reviewAidProposal({
        proposalId: selectedProposal.id,
        status: selectedStatus,
        reviewNote,
        finalSchoolId:
          selectedStatus === "Disalurkan" || selectedStatus === "Disetujui"
            ? finalSchoolId || null
            : null,
        recommendedSchoolId:
          selectedStatus === "Ditinjau" ? recommendedSchoolId || null : null,
        recommendationNote:
          selectedStatus === "Ditinjau" && recommendedSchoolId
            ? reviewNote
            : null,
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
            variant="iconGhost"
            size="icon"
            aria-label="Refresh bantuan CSR"
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
        finalSchoolId={finalSchoolId}
        recommendedSchoolId={recommendedSchoolId}
        schoolSearch={schoolSearch}
        schools={schools}
        isSearchingSchools={isSearchingSchools}
        isSubmitting={isReviewing}
        onStatusChange={setSelectedStatus}
        onNoteChange={setReviewNote}
        onFinalSchoolChange={setFinalSchoolId}
        onRecommendedSchoolChange={setRecommendedSchoolId}
        onSchoolSearchChange={setSchoolSearch}
        onClose={closeReview}
        onConfirm={handleConfirmReview}
      />
    </>
  );
}
