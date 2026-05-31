const { pool } = require("../../db/connection");

const toProfileType = (role) => {
  if (role === "officer") return "dinas";
  if (role === "school_operator") return "sekolah";
  if (role === "csr_partner") return "csr";
  if (role === "analyst") return "analitik";
  if (role === "admin") return "admin";

  return "viewer";
};

const ensureProfileByUserId = async (userId) => {
  await pool.query(
    `
    INSERT INTO stakeholder_profiles (
      user_id,
      profile_type,
      display_name,
      organization_name,
      contact_email,
      description,
      region_id,
      is_verified
    )
    SELECT
      u.id,
      ?,
      u.full_name,
      COALESCE(u.institution, 'PINTARIN'),
      u.email,
      'Profil stakeholder PINTARIN.',
      u.region_id,
      FALSE
    FROM users u
    WHERE u.id = ?
    ON DUPLICATE KEY UPDATE
      updated_at = CURRENT_TIMESTAMP
    `,
    ["viewer", userId],
  );
};

const getProfileByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      sp.id,
      sp.user_id,
      sp.profile_type,
      sp.display_name,
      sp.organization_name,
      sp.phone,
      sp.contact_email,
      sp.address,
      sp.website,
      sp.logo_url,
      sp.description,
      sp.region_id,
      r.name AS region_name,
      sp.school_id,
      s.name AS school_name,
      sp.is_verified,
      sp.created_at,
      sp.updated_at,

      u.username,
      u.email AS account_email,
      u.full_name AS account_name,
      u.role,
      u.institution
    FROM stakeholder_profiles sp
    JOIN users u ON u.id = sp.user_id
    LEFT JOIN regions r ON r.id = sp.region_id
    LEFT JOIN schools s ON s.id = sp.school_id
    WHERE sp.user_id = ?
    LIMIT 1
    `,
    [userId],
  );

  return rows[0] || null;
};

const createDefaultProfile = async (user) => {
  await pool.query(
    `
    INSERT INTO stakeholder_profiles (
      user_id,
      profile_type,
      display_name,
      organization_name,
      contact_email,
      description,
      region_id,
      is_verified
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      user.id,
      toProfileType(user.role),
      user.full_name || user.username,
      user.institution || "PINTARIN",
      user.email,
      "Profil stakeholder PINTARIN.",
      user.region_id || null,
      ["admin", "officer"].includes(user.role),
    ],
  );
};

const updateProfileByUserId = async (userId, payload) => {
  const allowedFields = [
    "display_name",
    "organization_name",
    "phone",
    "contact_email",
    "address",
    "website",
    "logo_url",
    "description",
  ];

  const fields = [];
  const values = [];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      fields.push(`${field} = ?`);
      values.push(payload[field] || null);
    }
  });

  if (fields.length === 0) {
    return;
  }

  values.push(userId);

  await pool.query(
    `
    UPDATE stakeholder_profiles
    SET ${fields.join(", ")}
    WHERE user_id = ?
    `,
    values,
  );
};

module.exports = {
  createDefaultProfile,
  ensureProfileByUserId,
  getProfileByUserId,
  updateProfileByUserId,
};