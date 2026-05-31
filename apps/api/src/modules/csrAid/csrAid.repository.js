const { pool } = require("../../db/connection");

const listAidProposals = async ({ user, status, limit = 20 }) => {
  const values = [];
  const conditions = [];

  if (status) {
    conditions.push("cap.status = ?");
    values.push(status);
  }

  if (user.role === "csr_partner") {
    conditions.push("cap.submitted_by = ?");
    values.push(user.id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(Math.min(Number(limit) || 20, 50));

  const [rows] = await pool.query(
    `
    SELECT
      cap.id,
      cap.proposal_code,
      cap.submitted_by,
      submitter.full_name AS submitted_by_name,
      cap.allocation_type,
      cap.target_school_id,
      s.name AS target_school_name,
      cap.target_region_id,
      r.name AS target_region_name,
      cap.aid_name,
      cap.aid_type,
      cap.aid_value,
      cap.description,
      cap.evidence_url,
      cap.status,
      cap.reviewed_by,
      reviewer.full_name AS reviewed_by_name,
      cap.review_note,
      cap.created_at,
      cap.updated_at
    FROM csr_aid_proposals cap
    LEFT JOIN users submitter ON submitter.id = cap.submitted_by
    LEFT JOIN users reviewer ON reviewer.id = cap.reviewed_by
    LEFT JOIN schools s ON s.id = cap.target_school_id
    LEFT JOIN regions r ON r.id = cap.target_region_id
    ${whereClause}
    ORDER BY cap.created_at DESC
    LIMIT ?
    `,
    values,
  );

  return rows;
};

const createAidProposal = async ({
  submittedBy,
  allocationType,
  targetSchoolId,
  targetRegionId,
  aidName,
  aidType,
  aidValue,
  description,
  evidenceUrl,
}) => {
  const proposalCode = `CSR-${Date.now()}`;

  const [result] = await pool.query(
    `
    INSERT INTO csr_aid_proposals (
      proposal_code,
      submitted_by,
      allocation_type,
      target_school_id,
      target_region_id,
      aid_name,
      aid_type,
      aid_value,
      description,
      evidence_url,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Diajukan')
    `,
    [
      proposalCode,
      submittedBy,
      allocationType,
      targetSchoolId || null,
      targetRegionId || null,
      aidName,
      aidType,
      Number(aidValue || 0),
      description || null,
      evidenceUrl || null,
    ],
  );

  return result.insertId;
};

const getAidProposalById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM csr_aid_proposals
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

const reviewAidProposal = async ({ id, reviewedBy, status, reviewNote }) => {
  await pool.query(
    `
    UPDATE csr_aid_proposals
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
  createAidProposal,
  getAidProposalById,
  listAidProposals,
  reviewAidProposal,
};