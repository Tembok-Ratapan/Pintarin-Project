const schoolRequestRepository = require("./schoolRequest.repository");

const allowedUrgencies = ["Rendah", "Sedang", "Tinggi"];
const allowedReviewStatuses = [
  "Ditinjau",
  "Disetujui",
  "Ditolak",
  "Disalurkan",
];
const editableRequestStatuses = ["Diajukan", "Ditinjau"];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sanitizeText = (value, maxLength = 500) => {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, maxLength);
};

const normalizeId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const resolveRequestScope = async ({ user, payload }) => {
  const requestedSchoolId = normalizeId(payload.school_id);
  const requestedRegionId = normalizeId(payload.region_id);
  const userRegionId = normalizeId(user.region_id);

  if (user.role !== "school_operator") {
    const school = requestedSchoolId
      ? await schoolRequestRepository.getSchoolById(requestedSchoolId)
      : null;

    if (requestedSchoolId && !school) {
      throw createError("Sekolah yang dipilih tidak ditemukan.", 400);
    }

    if (
      school?.region_id &&
      requestedRegionId &&
      Number(school.region_id) !== requestedRegionId
    ) {
      throw createError("Wilayah ajuan tidak sesuai dengan sekolah.", 400);
    }

    return {
      schoolId: school?.id || null,
      regionId: requestedRegionId || school?.region_id || userRegionId || null,
    };
  }

  const profileContext =
    await schoolRequestRepository.getSchoolOperatorContext(user.id);
  const profileSchoolId = normalizeId(profileContext?.school_id);
  const profileRegionId = normalizeId(profileContext?.profile_region_id);
  const schoolRegionId = normalizeId(profileContext?.school_region_id);
  const allowedRegionId = profileRegionId || userRegionId;

  if (profileSchoolId) {
    if (requestedSchoolId && requestedSchoolId !== profileSchoolId) {
      throw createError(
        "Operator sekolah hanya dapat membuat ajuan untuk sekolahnya sendiri.",
        403,
      );
    }

    return {
      schoolId: profileSchoolId,
      regionId: schoolRegionId || profileRegionId || userRegionId || null,
    };
  }

  if (!requestedSchoolId) {
    const fallbackSchool = allowedRegionId
      ? await schoolRequestRepository.getFirstSchoolByRegion(allowedRegionId)
      : await schoolRequestRepository.getFirstSchool();

    if (fallbackSchool) {
      return {
        schoolId: fallbackSchool.id,
        regionId: fallbackSchool.region_id || allowedRegionId || null,
      };
    }

    throw createError(
      "Akun operator belum terhubung ke sekolah. Lengkapi profil sekolah terlebih dahulu.",
      400,
    );
  }

  const school = await schoolRequestRepository.getSchoolById(requestedSchoolId);

  if (!school) {
    throw createError("Sekolah yang dipilih tidak ditemukan.", 400);
  }

  if (allowedRegionId && Number(school.region_id) !== allowedRegionId) {
    throw createError(
      "Operator sekolah hanya dapat membuat ajuan untuk sekolah di wilayahnya.",
      403,
    );
  }

  return {
    schoolId: school.id,
    regionId: school.region_id || allowedRegionId || null,
  };
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

  const { schoolId, regionId } = await resolveRequestScope({ user, payload });

  const id = await schoolRequestRepository.createRequest({
    schoolId,
    regionId,
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

const ensureEditableRequest = ({ user, request }) => {
  if (!request) {
    throw createError("Ajuan sekolah tidak ditemukan.", 404);
  }

  const isOwner = Number(request.submitted_by) === Number(user.id);
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw createError("Ajuan sekolah hanya bisa diubah oleh pemiliknya.", 403);
  }

  if (!editableRequestStatuses.includes(request.status)) {
    throw createError(
      "Ajuan yang sudah diputuskan tidak bisa diubah atau dihapus.",
      409,
    );
  }
};

const updateRequest = async ({ user, id, payload }) => {
  const request = await schoolRequestRepository.getRequestById(id);

  ensureEditableRequest({ user, request });

  const title = sanitizeText(payload.title, 180);
  const category = sanitizeText(payload.category, 80);

  if (!title) {
    throw createError("Judul ajuan wajib diisi.", 400);
  }

  if (!category) {
    throw createError("Kategori ajuan wajib diisi.", 400);
  }

  const urgency = allowedUrgencies.includes(payload.urgency)
    ? payload.urgency
    : request.urgency || "Sedang";

  await schoolRequestRepository.updateRequest({
    id,
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

const deleteRequest = async ({ user, id }) => {
  const request = await schoolRequestRepository.getRequestById(id);

  ensureEditableRequest({ user, request });

  await schoolRequestRepository.deleteRequest(id);

  return {
    id: Number(id),
    deleted: true,
  };
};

const reviewRequest = async ({ user, id, payload }) => {
  const request = await schoolRequestRepository.getRequestById(id);

  if (!request) {
    throw createError("Ajuan sekolah tidak ditemukan.", 404);
  }

  if (!allowedReviewStatuses.includes(payload.status)) {
    throw createError("Status review tidak valid.", 400);
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
  deleteRequest,
  listRequests,
  reviewRequest,
  updateRequest,
};
