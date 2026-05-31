const { pool } = require("../../db/connection");

const listRequests = async ({ user, status, limit = 20 }) => {
  const values = [];
  const conditions = [];

  if (status) {
    conditions.push("snr.status = ?");
    values.push(status);
  }

  if (user.role === "school_operator") {
    conditions.push("snr.submitted_by = ?");
    values.push(user.id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(Math.min(Number(limit) || 20, 50));

  const [rows] = await pool.query(
    `
    SELECT
      snr.id,
      snr.request_code,
      snr.school_id,
      s.name AS school_name,
      snr.region_id,
      r.name AS region_name,
      snr.submitted_by,
      submitter.full_name AS submitted_by_name,
      snr.category,
      snr.title,
      snr.description,
      snr.urgency,
      snr.requested_value,
      snr.evidence_url,
      snr.evidence_note,
      snr.status,
      snr.reviewed_by,
      reviewer.full_name AS reviewed_by_name,
      snr.review_note,
      snr.created_at,
      snr.updated_at
    FROM school_need_requests snr
    LEFT JOIN schools s ON s.id = snr.school_id
    LEFT JOIN regions r ON r.id = snr.region_id
    LEFT JOIN users submitter ON submitter.id = snr.submitted_by
    LEFT JOIN users reviewer ON reviewer.id = snr.reviewed_by
    ${whereClause}
    ORDER BY snr.created_at DESC
    LIMIT ?
    `,
    values,
  );

  return rows;
};

const createRequest = async ({
  schoolId,
  regionId,
  submittedBy,
  category,
  title,
  description,
  urgency,
  requestedValue,
  evidenceUrl,
  evidenceNote,
}) => {
  const requestCode = `REQ-${Date.now()}`;

  const [result] = await pool.query(
    `
    INSERT INTO school_need_requests (
      request_code,
      school_id,
      region_id,
      submitted_by,
      category,
      title,
      description,
      urgency,
      requested_value,
      evidence_url,
      evidence_note,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Diajukan')
    `,
    [
      requestCode,
      schoolId || null,
      regionId || null,
      submittedBy,
      category,
      title,
      description || null,
      urgency || "Sedang",
      Number(requestedValue || 0),
      evidenceUrl || null,
      evidenceNote || null,
    ],
  );

  return result.insertId;
};

const getRequestById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM school_need_requests
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

const reviewRequest = async ({ id, reviewedBy, status, reviewNote }) => {
  await pool.query(
    `
    UPDATE school_need_requests
    SET
      status = ?,
      reviewed_by = ?,
      review_note = ?
    WHERE id = ?
    `,
    [status, reviewedBy, reviewNote || null, id],
  );
};

module.exports = {
  createRequest,
  getRequestById,
  listRequests,
  reviewRequest,
};