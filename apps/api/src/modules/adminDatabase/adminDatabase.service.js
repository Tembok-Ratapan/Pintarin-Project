const bcrypt = require("bcrypt");

const adminDatabaseRepository = require("./adminDatabase.repository");
const {
  getTableConfig,
  listTableMetadata,
} = require("./adminDatabase.registry");

const MAX_LIMIT = 100;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getConfigOrThrow = (tableKey) => {
  const config = getTableConfig(tableKey);

  if (!config) {
    throw createError("Table is not available for admin database management.", 404);
  }

  return config;
};

const parsePagination = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 20, 1),
    MAX_LIMIT,
  );

  return {
    page,
    limit,
    search: String(query.search || "").trim(),
  };
};

const isEmpty = (value) => value === undefined || value === null || value === "";

const normalizeFieldValue = (field, rawValue) => {
  if (rawValue === "" && field.nullable) return null;

  if (isEmpty(rawValue)) {
    if (field.nullable) return null;
    return rawValue;
  }

  if (field.type === "integer") {
    const value = Number.parseInt(rawValue, 10);

    if (!Number.isInteger(value)) {
      throw createError(`${field.label} harus berupa angka bulat.`);
    }

    return value;
  }

  if (field.type === "decimal") {
    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      throw createError(`${field.label} harus berupa angka.`);
    }

    return value;
  }

  if (field.type === "boolean") {
    if (typeof rawValue === "boolean") return rawValue ? 1 : 0;
    if (rawValue === 1 || rawValue === "1") return 1;
    if (rawValue === 0 || rawValue === "0") return 0;

    const normalized = String(rawValue).toLowerCase();

    if (["true", "yes", "on"].includes(normalized)) return 1;
    if (["false", "no", "off"].includes(normalized)) return 0;

    throw createError(`${field.label} harus bernilai aktif/nonaktif.`);
  }

  if (field.type === "enum") {
    if (!field.options.includes(rawValue)) {
      throw createError(`${field.label} harus salah satu dari opsi yang tersedia.`);
    }

    return rawValue;
  }

  if (field.type === "json") {
    if (typeof rawValue === "object") {
      return JSON.stringify(rawValue);
    }

    try {
      JSON.parse(rawValue);
      return rawValue;
    } catch {
      throw createError(`${field.label} harus berupa JSON valid.`);
    }
  }

  if (field.type === "date" || field.type === "datetime") {
    const value = String(rawValue).trim();
    const parsed = Date.parse(value);

    if (Number.isNaN(parsed)) {
      throw createError(`${field.label} harus berupa tanggal valid.`);
    }

    return value;
  }

  return String(rawValue).trim();
};

const buildWritableValues = async ({
  config,
  payload,
  isCreate,
  currentUser,
  recordId,
}) => {
  const values = {};

  for (const field of config.fields) {
    if (field.readOnly || field.virtual) continue;

    if (Object.prototype.hasOwnProperty.call(payload, field.name)) {
      const normalizedValue = normalizeFieldValue(field, payload[field.name]);

      if (field.required && isEmpty(normalizedValue)) {
        throw createError(`${field.label} wajib diisi.`);
      }

      values[field.name] = normalizedValue;
    } else if (isCreate && field.required) {
      throw createError(`${field.label} wajib diisi.`);
    }
  }

  if (config.key === "users") {
    const password = payload.password;

    if (isCreate && isEmpty(password)) {
      throw createError("Password wajib diisi untuk user baru.");
    }

    if (!isEmpty(password)) {
      if (String(password).length < 8) {
        throw createError("Password minimal 8 karakter.");
      }

      values.password_hash = await bcrypt.hash(String(password), 10);
    }

    if (!isCreate && Number(recordId) === Number(currentUser.id)) {
      if (values.role && values.role !== "admin") {
        throw createError("Admin tidak bisa mengubah role akunnya sendiri.");
      }

      if (Object.prototype.hasOwnProperty.call(values, "is_active") && !values.is_active) {
        throw createError("Admin tidak bisa menonaktifkan akunnya sendiri.");
      }
    }
  }

  if (Object.keys(values).length === 0) {
    throw createError("Tidak ada data yang bisa disimpan.");
  }

  return values;
};

const handleDatabaseError = (error) => {
  if (error?.code === "ER_DUP_ENTRY") {
    throw createError("Data dengan nilai unik yang sama sudah tersedia.", 409);
  }

  if (error?.code === "ER_NO_REFERENCED_ROW_2") {
    throw createError("Relasi data tidak ditemukan. Periksa ID referensi.", 400);
  }

  if (error?.code === "ER_ROW_IS_REFERENCED_2") {
    throw createError("Data tidak bisa dihapus karena masih dipakai data lain.", 409);
  }

  throw error;
};

const audit = async ({ user, action, tableName, recordId, reqMeta }) => {
  try {
    await adminDatabaseRepository.writeAuditLog({
      user,
      action,
      tableName,
      recordId,
      reqMeta,
    });
  } catch {
    // Audit failure should not undo the completed admin database operation.
  }
};

const listTables = () => ({
  tables: listTableMetadata(),
});

const listRecords = async ({ tableKey, query }) => {
  const config = getConfigOrThrow(tableKey);
  const pagination = parsePagination(query);

  const result = await adminDatabaseRepository.listRecords(config, pagination);

  return {
    table: listTableMetadata().find((table) => table.key === config.key),
    rows: result.rows,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
      total_pages: Math.max(Math.ceil(result.total / pagination.limit), 1),
    },
  };
};

const getRecord = async ({ tableKey, id }) => {
  const config = getConfigOrThrow(tableKey);
  const record = await adminDatabaseRepository.getRecordById(config, id);

  if (!record) {
    throw createError("Data tidak ditemukan.", 404);
  }

  return {
    table: listTableMetadata().find((table) => table.key === config.key),
    record,
  };
};

const createRecord = async ({ user, tableKey, payload, reqMeta }) => {
  const config = getConfigOrThrow(tableKey);

  if (!config.canCreate) {
    throw createError("Table ini tidak mendukung tambah data.", 403);
  }

  try {
    const values = await buildWritableValues({
      config,
      payload,
      isCreate: true,
      currentUser: user,
    });

    const id = await adminDatabaseRepository.createRecord(config, values);
    const record = await adminDatabaseRepository.getRecordById(config, id);

    await audit({
      user,
      action: "ADMIN_DB_CREATE",
      tableName: config.tableName,
      recordId: id,
      reqMeta,
    });

    return {
      record,
    };
  } catch (error) {
    handleDatabaseError(error);
  }
};

const updateRecord = async ({ user, tableKey, id, payload, reqMeta }) => {
  const config = getConfigOrThrow(tableKey);

  if (!config.canUpdate) {
    throw createError("Table ini tidak mendukung edit data.", 403);
  }

  const existingRecord = await adminDatabaseRepository.getRecordById(config, id);

  if (!existingRecord) {
    throw createError("Data tidak ditemukan.", 404);
  }

  try {
    const values = await buildWritableValues({
      config,
      payload,
      isCreate: false,
      currentUser: user,
      recordId: id,
    });

    await adminDatabaseRepository.updateRecord(config, id, values);

    const record = await adminDatabaseRepository.getRecordById(config, id);

    await audit({
      user,
      action: "ADMIN_DB_UPDATE",
      tableName: config.tableName,
      recordId: id,
      reqMeta,
    });

    return {
      record,
    };
  } catch (error) {
    handleDatabaseError(error);
  }
};

const deleteRecord = async ({ user, tableKey, id, reqMeta }) => {
  const config = getConfigOrThrow(tableKey);

  if (!config.canDelete) {
    throw createError("Table ini tidak mendukung hapus data.", 403);
  }

  if (config.key === "users" && Number(id) === Number(user.id)) {
    throw createError("Admin tidak bisa menghapus akunnya sendiri.");
  }

  const existingRecord = await adminDatabaseRepository.getRecordById(config, id);

  if (!existingRecord) {
    throw createError("Data tidak ditemukan.", 404);
  }

  try {
    await adminDatabaseRepository.deleteRecord(config, id);

    await audit({
      user,
      action: "ADMIN_DB_DELETE",
      tableName: config.tableName,
      recordId: id,
      reqMeta,
    });

    return {
      deleted_id: Number(id),
    };
  } catch (error) {
    handleDatabaseError(error);
  }
};

module.exports = {
  buildWritableValues,
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  listTables,
  normalizeFieldValue,
  updateRecord,
};
