const csrAidRepository = require("./csrAid.repository");

const allocationTypes = ["sekolah_tertentu", "fleksibel"];
const allowedReviewStatuses = [
  "Ditinjau",
  "Disetujui",
  "Ditolak",
  "Disalurkan",
  "Selesai",
];

const sanitizeText = (value, maxLength = 500) => {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, maxLength);
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
    const error = new Error("Bantuan CSR tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  if (!allowedReviewStatuses.includes(payload.status)) {
    const error = new Error("Status review tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  await csrAidRepository.reviewAidProposal({
    id,
    reviewedBy: user.id,
    status: payload.status,
    reviewNote: sanitizeText(payload.review_note, 1500),
  });

  return csrAidRepository.getAidProposalById(id);
};

module.exports = {
  createAidProposal,
  listAidProposals,
  reviewAidProposal,
};