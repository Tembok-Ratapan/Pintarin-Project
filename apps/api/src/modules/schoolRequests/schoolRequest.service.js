const schoolRequestRepository = require("./schoolRequest.repository");

const allowedUrgencies = ["Rendah", "Sedang", "Tinggi"];
const allowedReviewStatuses = [
  "Ditinjau",
  "Disetujui",
  "Ditolak",
  "Disalurkan",
];

const sanitizeText = (value, maxLength = 500) => {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, maxLength);
};

const listRequests = async ({ user, query }) => {
  const requests = await schoolRequestRepository.listRequests({
    user,
    status: query.status,
    limit: query.limit,
  });

  return {
    count: requests.length,
    requests,
  };
};

const createRequest = async ({ user, payload }) => {
  const title = sanitizeText(payload.title, 180);
  const category = sanitizeText(payload.category, 80);

  if (!title) {
    const error = new Error("Judul ajuan wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  if (!category) {
    const error = new Error("Kategori ajuan wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  const urgency = allowedUrgencies.includes(payload.urgency)
    ? payload.urgency
    : "Sedang";

  const isSchoolOperator = user.role === "school_operator";

  const safeSchoolId = isSchoolOperator ? null : payload.school_id || null;
  const safeRegionId = isSchoolOperator
    ? user.region_id || null
    : payload.region_id || user.region_id || null;

  const id = await schoolRequestRepository.createRequest({
    schoolId: safeSchoolId,
    regionId: safeRegionId,
    submittedBy: user.id,
    category,
    title,
    description: sanitizeText(payload.description, 1500),
    urgency,
    requestedValue: payload.requested_value,
    evidenceUrl: sanitizeText(payload.evidence_url, 500),
    evidenceNote: sanitizeText(payload.evidence_note, 1500),
  });

  return schoolRequestRepository.getRequestById(id);
};

const reviewRequest = async ({ user, id, payload }) => {
  const request = await schoolRequestRepository.getRequestById(id);

  if (!request) {
    const error = new Error("Ajuan sekolah tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  if (!allowedReviewStatuses.includes(payload.status)) {
    const error = new Error("Status review tidak valid.");
    error.statusCode = 400;
    throw error;
  }

  await schoolRequestRepository.reviewRequest({
    id,
    reviewedBy: user.id,
    status: payload.status,
    reviewNote: sanitizeText(payload.review_note, 1500),
  });

  return schoolRequestRepository.getRequestById(id);
};

module.exports = {
  createRequest,
  listRequests,
  reviewRequest,
};
