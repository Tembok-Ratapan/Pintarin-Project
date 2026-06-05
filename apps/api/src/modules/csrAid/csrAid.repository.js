const { pool } = require("../../db/connection");

const dummyProposalCodes = ["CSR-AID-0001", "CSR-AID-0002", "CSR-AID-0003"];
const distributionFlowColumns = [
  "final_school_id",
  "recommended_school_id",
  "recommendation_status",
  "recommendation_note",
  "distributed_by",
  "distributed_at",
];

const getCsrAidSchema = async () => {
  const [rows] = await pool.query(
    `
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'csr_aid_proposals'
    `,
  );

  return new Set(rows.map((row) => row.COLUMN_NAME));
};

const hasColumn = (schema, columnName) => schema.has(columnName);

const hasDistributionFlowColumns = async () => {
  const schema = await getCsrAidSchema();
  return distributionFlowColumns.every((columnName) =>
    hasColumn(schema, columnName),
  );
};

const getSchoolOperatorContext = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      sp.school_id,
      sp.region_id AS profile_region_id,
      s.region_id AS school_region_id
    FROM stakeholder_profiles sp
    LEFT JOIN schools s ON s.id = sp.school_id
    WHERE sp.user_id = ?
    LIMIT 1
    `,
    [userId],
  );

  return rows[0] || null;
};

const getSchoolById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.region_id,
      r.name AS region_name
    FROM schools s
    LEFT JOIN regions r ON r.id = s.region_id
    WHERE s.id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

const getAidSelectQuery = (schema) => {
  const hasFinalSchool = hasColumn(schema, "final_school_id");
  const hasRecommendedSchool = hasColumn(schema, "recommended_school_id");
  const hasRecommendationStatus = hasColumn(schema, "recommendation_status");
  const hasRecommendationNote = hasColumn(schema, "recommendation_note");
  const hasDistributedBy = hasColumn(schema, "distributed_by");
  const hasDistributedAt = hasColumn(schema, "distributed_at");

  return `
  SELECT
    cap.id,
    cap.proposal_code,
    cap.submitted_by,
    submitter.full_name AS submitted_by_name,
    cap.allocation_type,
    cap.target_school_id,
    s.name AS target_school_name,
    COALESCE(cap.target_region_id, s.region_id) AS target_region_id,
    COALESCE(r.name, target_school_region.name) AS target_region_name,
    ${hasFinalSchool ? "cap.final_school_id" : "NULL AS final_school_id"},
    ${hasFinalSchool ? "final_school.name" : "NULL"} AS final_school_name,
    ${hasFinalSchool ? "final_region.name" : "NULL"} AS final_school_region_name,
    ${hasRecommendedSchool ? "cap.recommended_school_id" : "NULL AS recommended_school_id"},
    ${hasRecommendedSchool ? "recommended_school.name" : "NULL"} AS recommended_school_name,
    ${hasRecommendedSchool ? "recommended_region.name" : "NULL"} AS recommended_school_region_name,
    ${hasRecommendationStatus ? "cap.recommendation_status" : "'Tidak Ada' AS recommendation_status"},
    ${hasRecommendationNote ? "cap.recommendation_note" : "NULL AS recommendation_note"},
    cap.aid_name,
    cap.aid_type,
    cap.aid_value,
    cap.description,
    cap.evidence_url,
    cap.status,
    cap.reviewed_by,
    reviewer.full_name AS reviewed_by_name,
    cap.review_note,
    ${hasDistributedBy ? "cap.distributed_by" : "NULL AS distributed_by"},
    ${hasDistributedBy ? "distributor.full_name" : "NULL"} AS distributed_by_name,
    ${hasDistributedAt ? "cap.distributed_at" : "NULL AS distributed_at"},
    cap.created_at,
    cap.updated_at
  FROM csr_aid_proposals cap
  LEFT JOIN users submitter ON submitter.id = cap.submitted_by
  LEFT JOIN users reviewer ON reviewer.id = cap.reviewed_by
  ${hasDistributedBy ? "LEFT JOIN users distributor ON distributor.id = cap.distributed_by" : ""}
  LEFT JOIN schools s ON s.id = cap.target_school_id
  LEFT JOIN regions r ON r.id = cap.target_region_id
  LEFT JOIN regions target_school_region ON target_school_region.id = s.region_id
  ${hasFinalSchool ? "LEFT JOIN schools final_school ON final_school.id = cap.final_school_id" : ""}
  ${hasFinalSchool ? "LEFT JOIN regions final_region ON final_region.id = final_school.region_id" : ""}
  ${hasRecommendedSchool ? "LEFT JOIN schools recommended_school ON recommended_school.id = cap.recommended_school_id" : ""}
  ${hasRecommendedSchool ? "LEFT JOIN regions recommended_region ON recommended_region.id = recommended_school.region_id" : ""}
`;
};

const listAidProposals = async ({ user, status, limit = 20 }) => {
  const schema = await getCsrAidSchema();
  const values = [];
  const conditions = [
    `cap.proposal_code NOT IN (${dummyProposalCodes.map(() => "?").join(", ")})`,
  ];

  values.push(...dummyProposalCodes);

  if (status) {
    conditions.push("cap.status = ?");
    values.push(status);
  }

  if (user.role === "csr_partner") {
    conditions.push("cap.submitted_by = ?");
    values.push(user.id);
  }

  if (user.role === "school_operator") {
    const context = await getSchoolOperatorContext(user.id);
    const schoolId = context?.school_id;

    if (!schoolId) {
      return [];
    }

    if (hasColumn(schema, "final_school_id")) {
      conditions.push("cap.final_school_id = ?");
      values.push(schoolId);
    } else {
      conditions.push("cap.target_school_id = ?");
      values.push(schoolId);
    }

    conditions.push("cap.status = ?");
    values.push("Disalurkan");
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(Math.min(Number(limit) || 20, 50));

  const [rows] = await pool.query(
    `
    ${getAidSelectQuery(schema)}
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
  const schema = await getCsrAidSchema();
  const [rows] = await pool.query(
    `
    ${getAidSelectQuery(schema)}
    WHERE cap.id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

const reviewAidProposal = async ({
  id,
  reviewedBy,
  status,
  reviewNote,
  finalSchoolId,
  recommendedSchoolId,
  recommendationStatus,
  recommendationNote,
  distributedBy,
  distributedAt,
}) => {
  const schema = await getCsrAidSchema();
  const updates = [
    "status = ?",
    "reviewed_by = ?",
    "review_note = ?",
  ];
  const values = [status, reviewedBy, reviewNote || null];

  if (hasColumn(schema, "final_school_id")) {
    updates.push("final_school_id = ?");
    values.push(finalSchoolId || null);
  }

  if (hasColumn(schema, "recommended_school_id")) {
    updates.push("recommended_school_id = ?");
    values.push(recommendedSchoolId || null);
  }

  if (hasColumn(schema, "recommendation_status")) {
    updates.push("recommendation_status = ?");
    values.push(recommendationStatus || "Tidak Ada");
  }

  if (hasColumn(schema, "recommendation_note")) {
    updates.push("recommendation_note = ?");
    values.push(recommendationNote || null);
  }

  if (hasColumn(schema, "distributed_by")) {
    updates.push("distributed_by = ?");
    values.push(distributedBy || null);
  }

  if (hasColumn(schema, "distributed_at")) {
    updates.push("distributed_at = ?");
    values.push(distributedAt || null);
  }

  values.push(id);

  await pool.query(
    `
    UPDATE csr_aid_proposals
    SET ${updates.join(", ")}
    WHERE id = ?
    `,
    values,
  );
};

const decideRecommendation = async ({
  id,
  targetSchoolId,
  targetRegionId,
  finalSchoolId,
  status,
  recommendationStatus,
  reviewNote,
}) => {
  const schema = await getCsrAidSchema();
  const updates = [
    "target_school_id = ?",
    "target_region_id = ?",
    "status = ?",
    "review_note = ?",
  ];
  const values = [
    targetSchoolId || null,
    targetRegionId || null,
    status,
    reviewNote || null,
  ];

  if (hasColumn(schema, "final_school_id")) {
    updates.splice(2, 0, "final_school_id = ?");
    values.splice(2, 0, finalSchoolId || null);
  }

  if (hasColumn(schema, "recommendation_status")) {
    updates.splice(updates.length - 1, 0, "recommendation_status = ?");
    values.splice(values.length - 1, 0, recommendationStatus);
  }

  values.push(id);

  await pool.query(
    `
    UPDATE csr_aid_proposals
    SET ${updates.join(", ")}
    WHERE id = ?
    `,
    values,
  );
};

module.exports = {
  createAidProposal,
  decideRecommendation,
  getAidProposalById,
  getSchoolById,
  hasDistributionFlowColumns,
  listAidProposals,
  reviewAidProposal,
};
