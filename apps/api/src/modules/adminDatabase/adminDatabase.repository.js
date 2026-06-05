const { pool } = require("../../db/connection");

const quoteIdentifier = (value) => `\`${value}\``;
const columnCache = new Map();

const getColumnSet = async (tableName) => {
  if (columnCache.has(tableName)) {
    return columnCache.get(tableName);
  }

  const [rows] = await pool.query(
    `
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    `,
    [tableName],
  );

  const columns = new Set(rows.map((row) => row.COLUMN_NAME));
  columnCache.set(tableName, columns);

  return columns;
};

const getExistingFieldNames = async (config) => {
  const columnSet = await getColumnSet(config.tableName);

  return config.fields
    .filter((field) => !field.virtual && columnSet.has(field.name))
    .map((field) => field.name);
};

const buildSearchClause = (config, search, columnSet) => {
  const searchFields = config.searchFields.filter((fieldName) =>
    columnSet.has(fieldName),
  );

  if (!search || searchFields.length === 0) {
    return {
      clause: "",
      values: [],
    };
  }

  const searchColumns = searchFields.map(
    (fieldName) => `${quoteIdentifier(fieldName)} LIKE ?`,
  );

  return {
    clause: `WHERE ${searchColumns.join(" OR ")}`,
    values: searchFields.map(() => `%${search}%`),
  };
};

const getOrderColumn = (config, columnSet) => {
  if (config.orderBy && columnSet.has(config.orderBy)) return config.orderBy;
  if (columnSet.has("id")) return "id";
  return [...columnSet][0];
};

const filterValuesByColumns = async (config, values) => {
  const columnSet = await getColumnSet(config.tableName);

  return Object.fromEntries(
    Object.entries(values).filter(([column]) => columnSet.has(column)),
  );
};

const listRecords = async (config, { search = "", page = 1, limit = 20 }) => {
  const tableName = quoteIdentifier(config.tableName);
  const columnSet = await getColumnSet(config.tableName);
  const fieldNames = await getExistingFieldNames(config);
  const columns = fieldNames.map(quoteIdentifier).join(", ");
  const offset = (page - 1) * limit;
  const searchClause = buildSearchClause(config, search, columnSet);
  const orderColumn = getOrderColumn(config, columnSet);
  const orderBy = quoteIdentifier(orderColumn);
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
  const fieldNames = await getExistingFieldNames(config);
  const columns = fieldNames.map(quoteIdentifier).join(", ");

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
  const existingValues = await filterValuesByColumns(config, values);
  const columns = Object.keys(existingValues);
  const placeholders = columns.map(() => "?").join(", ");

  const [result] = await pool.query(
    `
    INSERT INTO ${tableName} (${columns.map(quoteIdentifier).join(", ")})
    VALUES (${placeholders})
    `,
    columns.map((column) => existingValues[column]),
  );

  return result.insertId;
};

const updateRecord = async (config, id, values) => {
  const tableName = quoteIdentifier(config.tableName);
  const existingValues = await filterValuesByColumns(config, values);
  const columns = Object.keys(existingValues);

  if (columns.length === 0) return;

  await pool.query(
    `
    UPDATE ${tableName}
    SET ${columns.map((column) => `${quoteIdentifier(column)} = ?`).join(", ")}
    WHERE id = ?
    `,
    [...columns.map((column) => existingValues[column]), id],
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
