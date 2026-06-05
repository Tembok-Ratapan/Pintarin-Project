const csrAidRepository = require("./csrAid.repository");

const allocationTypes = ["sekolah_tertentu", "fleksibel"];
const allowedReviewStatuses = [
  "Ditinjau",
  "Disetujui",
  "Ditolak",
  "Disalurkan",
];
const activeRecommendationStatus = "Direkomendasikan";

const sanitizeText = (value, maxLength = 500) => {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, maxLength);
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const appendReviewNote = (currentNote, nextNote) => {
  const next = sanitizeText(nextNote, 1500);
  if (!next) return currentNote || null;

  return [currentNote, next].filter(Boolean).join("\n\n");
};

const getValidatedSchool = async ({
  schoolId,
  proposal,
  missingMessage,
  regionMessage,
}) => {
  const school = await csrAidRepository.getSchoolById(schoolId);

  if (!school) {
    throw createError(missingMessage, 400);
  }

  if (
    proposal.target_region_id &&
    Number(school.region_id) !== Number(proposal.target_region_id)
  ) {
    throw createError(regionMessage, 400);
  }

  return school;
};

const listAidProposals = async ({ user, query }) => {
  const proposals = await csrAidRepository.listAidProposals({
    user,
    status: query.status,
    limit: query.limit,
  });

  return {
    count: proposals.length,
    proposals,
  };
};

const createAidProposal = async ({ user, payload }) => {
  const aidName = sanitizeText(payload.aid_name, 180);
  const aidType = sanitizeText(payload.aid_type, 80);

  if (!aidName) {
    const error = new Error("Nama bantuan wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  if (!aidType) {
    const error = new Error("Jenis bantuan wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  const allocationType = allocationTypes.includes(payload.allocation_type)
    ? payload.allocation_type
    : "fleksibel";

  if (allocationType === "sekolah_tertentu" && !payload.target_school_id) {
    const error = new Error("Bantuan sekolah membutuhkan target sekolah.");
    error.statusCode = 400;
    throw error;
  }

  const id = await csrAidRepository.createAidProposal({
    submittedBy: user.id,
    allocationType,
    targetSchoolId: payload.target_school_id,
    targetRegionId: payload.target_region_id,
    aidName,
    aidType,
    aidValue: payload.aid_value,
    description: sanitizeText(payload.description, 1500),
    evidenceUrl: sanitizeText(payload.evidence_url, 500),
  });

  return csrAidRepository.getAidProposalById(id);
};

const reviewAidProposal = async ({ user, id, payload }) => {
  const proposal = await csrAidRepository.getAidProposalById(id);

  if (!proposal) {
    throw createError("Bantuan CSR tidak ditemukan.", 404);
  }

  if (!allowedReviewStatuses.includes(payload.status)) {
    throw createError("Status review tidak valid.", 400);
  }

  const requestedFinalSchoolId = normalizeId(payload.final_school_id);
  const requestedRecommendedSchoolId = normalizeId(payload.recommended_school_id);
  const needsDistributionFlowSchema =
    payload.status === "Disalurkan" ||
    requestedFinalSchoolId ||
    requestedRecommendedSchoolId;

  if (
    needsDistributionFlowSchema &&
    !(await csrAidRepository.hasDistributionFlowColumns())
  ) {
    throw createError(
      "Database belum menjalankan migration alur penyaluran CSR. Jalankan migration 007_csr_aid_distribution_flow.sql.",
      500,
    );
  }

  let finalSchoolId = normalizeId(proposal.final_school_id);
  let recommendedSchoolId = normalizeId(proposal.recommended_school_id);
  let recommendationStatus = proposal.recommendation_status || "Tidak Ada";
  let recommendationNote = proposal.recommendation_note || null;
  let distributedBy = normalizeId(proposal.distributed_by);
  let distributedAt = proposal.distributed_at || null;
  let reviewNote = sanitizeText(payload.review_note, 1500);

  if (
    payload.status === "Disetujui" &&
    proposal.allocation_type === "sekolah_tertentu"
  ) {
    finalSchoolId =
      requestedFinalSchoolId || normalizeId(proposal.target_school_id);

    if (finalSchoolId) {
      await getValidatedSchool({
        schoolId: finalSchoolId,
        proposal,
        missingMessage: "Sekolah final tidak ditemukan.",
        regionMessage: "Sekolah final harus berada pada wilayah target CSR.",
      });
    }
  }

  if (payload.status === "Disalurkan") {
    if (recommendationStatus === activeRecommendationStatus) {
      throw createError(
        "Tunggu keputusan CSR atas rekomendasi sekolah sebelum bantuan disalurkan.",
        409,
      );
    }

    finalSchoolId =
      requestedFinalSchoolId ||
      finalSchoolId ||
      normalizeId(proposal.target_school_id);

    if (!finalSchoolId) {
      throw createError(
        "Pilih sekolah tujuan sebelum bantuan disalurkan.",
        400,
      );
    }

    await getValidatedSchool({
      schoolId: finalSchoolId,
      proposal,
      missingMessage: "Sekolah tujuan penyaluran tidak ditemukan.",
      regionMessage: "Sekolah tujuan harus berada pada wilayah target CSR.",
    });

    distributedBy = user.id;
    distributedAt = new Date();
    recommendationStatus =
      recommendationStatus === activeRecommendationStatus
        ? recommendationStatus
        : "Tidak Ada";
  }

  if (requestedRecommendedSchoolId) {
    if (proposal.allocation_type !== "sekolah_tertentu") {
      throw createError(
        "Rekomendasi sekolah lain hanya untuk proposal sekolah tertentu.",
        400,
      );
    }

    const recommendedSchool =
      await csrAidRepository.getSchoolById(requestedRecommendedSchoolId);

    if (!recommendedSchool) {
      throw createError("Sekolah rekomendasi tidak ditemukan.", 400);
    }

    if (
      proposal.target_region_id &&
      Number(recommendedSchool.region_id) !== Number(proposal.target_region_id)
    ) {
      throw createError(
        "Sekolah rekomendasi harus berada pada wilayah yang sama.",
        400,
      );
    }

    recommendedSchoolId = requestedRecommendedSchoolId;
    recommendationStatus = activeRecommendationStatus;
    recommendationNote =
      sanitizeText(payload.recommendation_note, 1500) || reviewNote || null;
    finalSchoolId = normalizeId(proposal.final_school_id);
  }

  await csrAidRepository.reviewAidProposal({
    id,
    reviewedBy: user.id,
    status: payload.status,
    reviewNote,
    finalSchoolId,
    recommendedSchoolId,
    recommendationStatus,
    recommendationNote,
    distributedBy,
    distributedAt,
  });

  return csrAidRepository.getAidProposalById(id);
};

const decideRecommendation = async ({ user, id, payload }) => {
  const proposal = await csrAidRepository.getAidProposalById(id);

  if (!proposal) {
    throw createError("Bantuan CSR tidak ditemukan.", 404);
  }

  if (!(await csrAidRepository.hasDistributionFlowColumns())) {
    throw createError(
      "Database belum menjalankan migration alur rekomendasi CSR. Jalankan migration 007_csr_aid_distribution_flow.sql.",
      500,
    );
  }

  const isOwner = Number(proposal.submitted_by) === Number(user.id);
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw createError("Rekomendasi hanya bisa diputuskan oleh pemilik CSR.", 403);
  }

  if (proposal.recommendation_status !== activeRecommendationStatus) {
    throw createError("Proposal ini tidak memiliki rekomendasi aktif.", 409);
  }

  const decision = sanitizeText(payload.decision, 24).toLowerCase();
  const recommendedSchoolId = normalizeId(proposal.recommended_school_id);

  if (!recommendedSchoolId) {
    throw createError("Sekolah rekomendasi belum tersedia.", 400);
  }

  const note = sanitizeText(payload.note, 1000);

  if (decision === "accept") {
    const recommendedSchool = await csrAidRepository.getSchoolById(
      recommendedSchoolId,
    );

    if (!recommendedSchool) {
      throw createError("Sekolah rekomendasi tidak ditemukan.", 400);
    }

    await csrAidRepository.decideRecommendation({
      id,
      targetSchoolId: recommendedSchool.id,
      targetRegionId: recommendedSchool.region_id || proposal.target_region_id,
      finalSchoolId: recommendedSchool.id,
      status: "Disetujui",
      recommendationStatus: "Diterima CSR",
      reviewNote: appendReviewNote(
        proposal.review_note,
        note || "CSR menerima rekomendasi sekolah dari dinas.",
      ),
    });

    return csrAidRepository.getAidProposalById(id);
  }

  if (decision === "keep") {
    await csrAidRepository.decideRecommendation({
      id,
      targetSchoolId: proposal.target_school_id,
      targetRegionId: proposal.target_region_id,
      finalSchoolId: proposal.target_school_id,
      status: "Diajukan",
      recommendationStatus: "Ditolak CSR",
      reviewNote: appendReviewNote(
        proposal.review_note,
        note || "CSR tetap memilih sekolah tujuan awal.",
      ),
    });

    return csrAidRepository.getAidProposalById(id);
  }

  throw createError("Keputusan rekomendasi harus accept atau keep.", 400);
};

module.exports = {
  createAidProposal,
  decideRecommendation,
  listAidProposals,
  reviewAidProposal,
};
