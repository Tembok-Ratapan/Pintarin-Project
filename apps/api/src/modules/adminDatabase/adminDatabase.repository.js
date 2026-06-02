const { pool } = require("../../db/connection");

const quoteIdentifier = (value) => `\`${value}\``;

const getSelectableColumns = (config) => {
  return config.fields
    .filter((field) => !field.virtual)
    .map((field) => quoteIdentifier(field.name));
};

const buildSearchClause = (config, search) => {
  if (!search || config.searchFields.length === 0) {
    return {
      clause: "",
      values: [],
    };
  }

  const searchColumns = config.searchFields.map(
    (fieldName) => `${quoteIdentifier(fieldName)} LIKE ?`,
  );

  return {
    clause: `WHERE ${searchColumns.join(" OR ")}`,
    values: config.searchFields.map(() => `%${search}%`),
  };
};

const listRecords = async (config, { search = "", page = 1, limit = 20 }) => {
  const tableName = quoteIdentifier(config.tableName);
  const columns = getSelectableColumns(config).join(", ");
  const offset = (page - 1) * limit;
  const searchClause = buildSearchClause(config, search);
  const orderBy = quoteIdentifier(config.orderBy || "id");
  const orderDirection = config.orderDirection === "ASC" ? "ASC" : "DESC";

  const [countRows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM ${tableName}
    ${searchClause.clause}
    `,
    searchClause.values,
  );

  const [rows] = await pool.query(
    `
    SELECT ${columns}
    FROM ${tableName}
    ${searchClause.clause}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT ? OFFSET ?
    `,
    [...searchClause.values, limit, offset],
  );

  return {
    rows,
    total: Number(countRows[0]?.total || 0),
  };
};

const getRecordById = async (config, id) => {
  const tableName = quoteIdentifier(config.tableName);
  const columns = getSelectableColumns(config).join(", ");

  const [rows] = await pool.query(
    `
    SELECT ${columns}
    FROM ${tableName}
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

const createRecord = async (config, values) => {
  const tableName = quoteIdentifier(config.tableName);
  const columns = Object.keys(values);
  const placeholders = columns.map(() => "?").join(", ");

  const [result] = await pool.query(
    `
    INSERT INTO ${tableName} (${columns.map(quoteIdentifier).join(", ")})
    VALUES (${placeholders})
    `,
    columns.map((column) => values[column]),
  );

  return result.insertId;
};

const updateRecord = async (config, id, values) => {
  const tableName = quoteIdentifier(config.tableName);
  const columns = Object.keys(values);

  await pool.query(
    `
    UPDATE ${tableName}
    SET ${columns.map((column) => `${quoteIdentifier(column)} = ?`).join(", ")}
    WHERE id = ?
    `,
    [...columns.map((column) => values[column]), id],
  );
};

const deleteRecord = async (config, id) => {
  const tableName = quoteIdentifier(config.tableName);

  await pool.query(
    `
    DELETE FROM ${tableName}
    WHERE id = ?
    `,
    [id],
  );
};

const writeAuditLog = async ({ user, action, tableName, recordId, reqMeta }) => {
  const logCode = `AUD-DB-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  await pool.query(
    `
    INSERT INTO audit_logs (
      log_code,
      user_id,
      user_code,
      username,
      source_role,
      action,
      target_table,
      target_code,
      ip_address,
      user_agent,
      status,
      occurred_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', NOW())
    `,
    [
      logCode,
      user?.id || null,
      user?.user_code || null,
      user?.username || null,
      user?.source_role || user?.role || null,
      action,
      tableName,
      recordId ? String(recordId) : null,
      reqMeta?.ipAddress || null,
      reqMeta?.userAgent || null,
    ],
  );
};

module.exports = {
  createRecord,
  deleteRecord,
  getRecordById,
  listRecords,
  updateRecord,
  writeAuditLog,
};
