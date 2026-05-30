const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { parse } = require("csv-parse/sync");
const { pool } = require("../connection");

const rawDataDir = path.resolve(__dirname, "../../../../../data/raw");

const excelPath = path.join(rawDataDir, "PINTARIN_DUMMY_DATA.xlsx");
const csvPath = path.join(
  rawDataDir,
  "jumlah_penduduk_kota_bandung_berdasarkan_jenis_pendidikan_2.csv",
);

const normalizeKey = (key) => {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

const normalizeText = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
};

const normalizeName = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number")
    return Number.isFinite(value) ? value : fallback;

  const cleaned = String(value)
    .trim()
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  return Math.round(toNumber(value, fallback));
};

const toBoolean = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const text = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "ya", "benar", "correct"].includes(text))
    return true;
  if (["false", "0", "no", "tidak", "salah", "incorrect"].includes(text))
    return false;

  return fallback;
};

const toRatio = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") return fallback;

  const number = toNumber(value, fallback);
  if (number === null) return fallback;

  return number > 1 ? number / 100 : number;
};

const toSqlDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
};

const toSqlDateTime = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 19).replace("T", " ");
};

const getValue = (row, keys, fallback = null) => {
  for (const key of keys) {
    const normalizedKey = normalizeKey(key);

    if (
      Object.prototype.hasOwnProperty.call(row, normalizedKey) &&
      row[normalizedKey] !== null &&
      row[normalizedKey] !== undefined &&
      row[normalizedKey] !== ""
    ) {
      return row[normalizedKey];
    }
  }

  return fallback;
};

const normalizeRiskLabel = (value) => {
  const text = String(value || "")
    .trim()
    .toLowerCase();

  if (text.includes("tinggi")) return "Tinggi";
  if (text.includes("sedang")) return "Sedang";
  if (text.includes("rendah")) return "Rendah";

  return "Rendah";
};

const normalizeRiskTrend = (value) => {
  const text = String(value || "")
    .trim()
    .toLowerCase();

  if (text.includes("meningkat")) return "Meningkat";
  if (text.includes("menurun")) return "Menurun";
  if (text.includes("stabil")) return "Stabil";

  return null;
};

const normalizeSchoolLevel = (value) => {
  const text = String(value || "")
    .trim()
    .toUpperCase();

  if (text.includes("SMK")) return "SMK";
  if (text.includes("SMA")) return "SMA";
  if (text.includes("SMP")) return "SMP";
  if (text.includes("SD")) return "SD";

  return "SD";
};

const normalizeSchoolOwnership = (value) => {
  const text = String(value || "")
    .trim()
    .toLowerCase();

  if (text.includes("negeri")) return "Negeri";
  if (text.includes("swasta")) return "Swasta";

  return null;
};

const normalizeUserRole = (value) => {
  const text = String(value || "")
    .trim()
    .toLowerCase();

  if (text.includes("admin")) return "admin";
  if (
    text.includes("csr") ||
    text.includes("perusahaan") ||
    text.includes("mitra")
  )
    return "csr_partner";
  if (text.includes("sekolah")) return "school_operator";
  if (text.includes("analis") || text.includes("analyst")) return "analyst";
  if (
    text.includes("dinas") ||
    text.includes("operator") ||
    text.includes("kepala")
  )
    return "officer";
  if (text.includes("officer")) return "officer";

  return "viewer";
};

const normalizeCsrStatus = (value) => {
  const text = String(value || "")
    .trim()
    .toLowerCase();

  if (text.includes("selesai")) return "Selesai";
  if (text.includes("salur")) return "Disalurkan";
  if (text.includes("setuju")) return "Disetujui";
  if (text.includes("tolak")) return "Ditolak";
  if (text.includes("aju")) return "Diajukan";

  return "Diajukan";
};

const normalizeAuditStatus = (value) => {
  const text = String(value || "")
    .trim()
    .toUpperCase();

  if (text.includes("SUCCESS")) return "SUCCESS";
  if (text.includes("FAILED")) return "FAILED";
  if (text.includes("UNAUTHORIZED")) return "UNAUTHORIZED";

  return null;
};

const toJsonString = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "object" && !(value instanceof Date)) {
    return JSON.stringify(value);
  }

  const text = String(value).trim();

  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return JSON.stringify({ raw: text });
  }
};

const readExcelSheet = async (workbook, sheetName) => {
  const worksheet = workbook.getWorksheet(sheetName);

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" tidak ditemukan di Excel`);
  }

  const headerRow = worksheet.getRow(1);
  const headers = [];

  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = normalizeKey(cell.value);
  });

  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const item = {};

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (!key) return;

      if (cell.value && typeof cell.value === "object" && cell.value.text) {
        item[key] = cell.value.text;
      } else if (
        cell.value &&
        typeof cell.value === "object" &&
        cell.value.result
      ) {
        item[key] = cell.value.result;
      } else {
        item[key] = cell.value;
      }
    });

    rows.push(item);
  });

  return rows;
};

const readCsv = () => {
  const content = fs.readFileSync(csvPath, "utf8");

  return parse(content, {
    columns: (headers) => headers.map(normalizeKey),
    skip_empty_lines: true,
    trim: true,
  });
};

const batchInsert = async (
  connection,
  tableName,
  columns,
  rows,
  batchSize = 500,
) => {
  if (!rows.length) return;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);

    await connection.query(
      `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES ?`,
      [batch],
    );
  }
};

const resetTables = async (connection) => {
  const tables = [
    "prediction_validations",
    "csr_match_logs",
    "audit_logs",
    "analytics_snapshots",
    "csr_programs",
    "predictions",
    "risk_records",
    "population_education_records",
    "schools",
    "users",
    "regions",
  ];

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of tables) {
    await connection.query(`TRUNCATE TABLE ${table}`);
  }

  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
};

const importRegions = async (connection, rows) => {
  const columns = [
    "region_code",
    "name",
    "city",
    "province",
    "postal_code",
    "village_count",
    "village_list",
    "area_km2",
    "center_latitude",
    "center_longitude",
    "avg_population",
    "avg_vulnerable_population",
    "avg_vulnerable_ratio",
    "dominant_risk_status",
    "created_at",
    "updated_at",
  ];

  const values = rows.map((row) => [
    normalizeText(getValue(row, ["wilayah_id", "region_code"])),
    normalizeText(getValue(row, ["kecamatan", "name", "nama_kecamatan"])),
    normalizeText(getValue(row, ["kota", "city"], "Kota Bandung")),
    normalizeText(getValue(row, ["provinsi", "province"], "Jawa Barat")),
    normalizeText(getValue(row, ["kode_pos", "postal_code"])),
    toInteger(getValue(row, ["jumlah_kelurahan", "village_count"])),
    normalizeText(getValue(row, ["kelurahan_list", "village_list"])),
    toNumber(getValue(row, ["luas_wilayah_km2", "area_km2"]), null),
    toNumber(getValue(row, ["latitude_center", "center_latitude"]), null),
    toNumber(getValue(row, ["longitude_center", "center_longitude"]), null),
    toInteger(getValue(row, ["avg_populasi", "avg_population"])),
    toNumber(getValue(row, ["avg_warga_rentan", "avg_vulnerable_population"])),
    toNumber(getValue(row, ["avg_rasio_rentan", "avg_vulnerable_ratio"])),
    normalizeRiskLabel(
      getValue(row, ["status_resiko_dominan", "dominant_risk_status"]),
    ),
    toSqlDateTime(getValue(row, ["created_at"])),
    toSqlDateTime(getValue(row, ["updated_at"])),
  ]);

  await batchInsert(connection, "regions", columns, values);

  const [regions] = await connection.query("SELECT id, name FROM regions");
  return new Map(
    regions.map((region) => [normalizeName(region.name), region.id]),
  );
};

const importUsers = async (connection, rows, regionIdByName) => {
  const columns = [
    "user_code",
    "username",
    "email",
    "full_name",
    "role",
    "source_role",
    "institution",
    "region_id",
    "is_active",
    "last_login",
    "password_hash",
    "created_at",
  ];

  const values = rows.map((row) => {
    const regionName = getValue(row, ["kecamatan", "nama_kecamatan"]);
    const sourceRole = normalizeText(getValue(row, ["role"]));

    return [
      normalizeText(getValue(row, ["user_id", "user_code"])),
      normalizeText(getValue(row, ["username"])),
      normalizeText(getValue(row, ["email"])),
      normalizeText(getValue(row, ["full_name", "nama_lengkap", "name"])),
      normalizeUserRole(sourceRole),
      sourceRole,
      normalizeText(getValue(row, ["instansi", "institution"])),
      regionIdByName.get(normalizeName(regionName)) || null,
      toBoolean(getValue(row, ["is_active"]), true),
      toSqlDateTime(getValue(row, ["last_login"])),
      normalizeText(getValue(row, ["password_hash"])) ||
        "$2b$10$dummy.hash.for.development.only",
      toSqlDateTime(getValue(row, ["created_at"])),
    ];
  });

  await batchInsert(connection, "users", columns, values);

  const [users] = await connection.query(
    "SELECT id, user_code, username FROM users",
  );

  return {
    userIdByCode: new Map(
      users.map((user) => [normalizeText(user.user_code), user.id]),
    ),
    userIdByUsername: new Map(
      users.map((user) => [normalizeText(user.username), user.id]),
    ),
  };
};

const importSchools = async (connection, rows, regionIdByName) => {
  const columns = [
    "school_code",
    "region_id",
    "name",
    "level",
    "city",
    "ownership_status",
    "accreditation",
    "student_count",
    "teacher_count",
    "classroom_count",
    "latitude",
    "longitude",
    "established_year",
    "npsn",
    "created_at",
    "updated_at",
  ];

  const values = rows
    .map((row) => {
      const regionName = getValue(row, ["kecamatan", "nama_kecamatan"]);
      const regionId = regionIdByName.get(normalizeName(regionName));

      if (!regionId) return null;

      return [
        normalizeText(getValue(row, ["sekolah_id", "school_code"])),
        regionId,
        normalizeText(getValue(row, ["nama_sekolah", "name"])),
        normalizeSchoolLevel(getValue(row, ["jenjang", "level"])),
        normalizeText(getValue(row, ["kota", "city"], "Kota Bandung")),
        normalizeSchoolOwnership(getValue(row, ["status", "ownership_status"])),
        normalizeText(getValue(row, ["akreditasi", "accreditation"])),
        toInteger(getValue(row, ["jumlah_siswa", "student_count"])),
        toInteger(getValue(row, ["jumlah_guru", "teacher_count"])),
        toInteger(getValue(row, ["jumlah_kelas", "classroom_count"])),
        toNumber(getValue(row, ["latitude"]), null),
        toNumber(getValue(row, ["longitude"]), null),
        toInteger(getValue(row, ["tahun_berdiri", "established_year"]), null),
        normalizeText(getValue(row, ["npsn"])),
        toSqlDateTime(getValue(row, ["created_at"])),
        toSqlDateTime(getValue(row, ["updated_at"])),
      ];
    })
    .filter(Boolean);

  await batchInsert(connection, "schools", columns, values);

  const [schools] = await connection.query(
    "SELECT id, school_code FROM schools",
  );
  return new Map(
    schools.map((school) => [normalizeText(school.school_code), school.id]),
  );
};

const importPopulationEducation = async (connection, rows, regionIdByName) => {
  const columns = [
    "source_id",
    "region_id",
    "province_code",
    "province_name",
    "bps_city_code",
    "bps_city_name",
    "bps_district_code",
    "bps_district_name",
    "bps_village_code",
    "bps_village_name",
    "kemendagri_district_code",
    "kemendagri_district_name",
    "kemendagri_village_code",
    "kemendagri_village_name",
    "education_type",
    "population_count",
    "unit",
    "semester",
    "year",
  ];

  const values = rows.map((row) => {
    const regionName = getValue(row, [
      "kemendagri_nama_kecamatan",
      "bps_nama_kecamatan",
      "nama_kecamatan",
      "kecamatan",
    ]);

    return [
      toInteger(getValue(row, ["id"]), null),
      regionIdByName.get(normalizeName(regionName)) || null,
      normalizeText(getValue(row, ["kode_provinsi"])),
      normalizeText(getValue(row, ["nama_provinsi"])),
      normalizeText(getValue(row, ["bps_kode_kabupaten_kota"])),
      normalizeText(getValue(row, ["bps_nama_kabupaten_kota"])),
      normalizeText(getValue(row, ["bps_kode_kecamatan"])),
      normalizeText(getValue(row, ["bps_nama_kecamatan"])),
      normalizeText(getValue(row, ["bps_kode_desa_kelurahan"])),
      normalizeText(
        getValue(row, ["bps_nama_desa_kelurahan", "bps_desa_kelurahan"]),
      ),
      normalizeText(getValue(row, ["kemendagri_kode_kecamatan"])),
      normalizeText(getValue(row, ["kemendagri_nama_kecamatan"])),
      normalizeText(getValue(row, ["kemendagri_kode_desa_kelurahan"])),
      normalizeText(getValue(row, ["kemendagri_nama_desa_kelurahan"])),
      normalizeText(getValue(row, ["jenis_pendidikan"])),
      toInteger(getValue(row, ["jumlah_penduduk"])),
      normalizeText(getValue(row, ["satuan"])),
      normalizeText(getValue(row, ["semester"])),
      toInteger(getValue(row, ["tahun"])),
    ];
  });

  await batchInsert(
    connection,
    "population_education_records",
    columns,
    values,
    1000,
  );
};

const importRiskRecords = async (connection, rows, regionIdByName) => {
  const columns = [
    "risk_code",
    "region_id",
    "year",
    "total_population",
    "total_vulnerable_population",
    "total_pip_aid",
    "total_pre_school",
    "sd_count",
    "vulnerable_ratio",
    "risk_status",
    "risk_score",
    "risk_trend",
    "notes",
    "created_at",
    "updated_at",
  ];

  const values = rows
    .map((row) => {
      const regionName = getValue(row, ["kecamatan", "nama_kecamatan"]);
      const regionId = regionIdByName.get(normalizeName(regionName));

      if (!regionId) return null;

      return [
        normalizeText(getValue(row, ["risiko_id", "risk_code"])),
        regionId,
        toInteger(getValue(row, ["tahun", "year"])),
        toInteger(getValue(row, ["total_populasi", "total_population"])),
        toNumber(
          getValue(row, ["total_warga_rentan", "total_vulnerable_population"]),
        ),
        toNumber(getValue(row, ["total_bantuan_pip", "total_pip_aid"])),
        toNumber(getValue(row, ["total_pra_sekolah", "total_pre_school"])),
        toNumber(getValue(row, ["jumlah_sd", "sd_count"])),
        toNumber(getValue(row, ["rasio_warga_rentan", "vulnerable_ratio"])),
        normalizeRiskLabel(getValue(row, ["status_resiko", "risk_status"])),
        toNumber(getValue(row, ["skor_risiko", "risk_score"])),
        normalizeRiskTrend(getValue(row, ["trend_risiko", "risk_trend"])),
        normalizeText(getValue(row, ["catatan", "notes"])),
        toSqlDateTime(getValue(row, ["created_at"])),
        toSqlDateTime(getValue(row, ["updated_at"])),
      ];
    })
    .filter(Boolean);

  await batchInsert(connection, "risk_records", columns, values);
};

const importPredictions = async (connection, rows, regionIdByName) => {
  const columns = [
    "prediction_code",
    "region_id",
    "data_year",
    "prediction_year",
    "model_version",
    "algorithm",
    "input_features",
    "actual_score",
    "predicted_score",
    "actual_label",
    "predicted_label",
    "final_label",
    "model_accuracy",
    "confidence_score",
    "confidence_level",
    "mae",
    "rmse",
    "is_correct",
    "needs_human_review",
    "is_human_validated",
    "created_at",
  ];

  const values = rows
    .map((row) => {
      const regionName = getValue(row, ["kecamatan", "nama_kecamatan"]);
      const regionId = regionIdByName.get(normalizeName(regionName));

      if (!regionId) return null;

      const predictedLabel = normalizeRiskLabel(
        getValue(row, ["status_prediksi", "predicted_label"]),
      );
      const actualLabel = normalizeRiskLabel(
        getValue(row, ["status_aktual", "actual_label"]),
      );
      const confidenceScore = toRatio(getValue(row, ["confidence_score"]));

      let confidenceLevel = "Rendah";
      if (confidenceScore !== null && confidenceScore >= 0.85)
        confidenceLevel = "Tinggi";
      else if (confidenceScore !== null && confidenceScore >= 0.7)
        confidenceLevel = "Sedang";

      return [
        normalizeText(getValue(row, ["pred_id", "prediction_code"])),
        regionId,
        toInteger(getValue(row, ["tahun_data", "data_year"])),
        toInteger(getValue(row, ["tahun_prediksi", "prediction_year"])),
        normalizeText(getValue(row, ["model_versi", "model_version"])),
        normalizeText(getValue(row, ["algoritma", "algorithm"])),
        toJsonString(getValue(row, ["fitur_input", "input_features"])),
        toNumber(getValue(row, ["skor_aktual", "actual_score"]), null),
        toNumber(getValue(row, ["skor_prediksi", "predicted_score"])),
        actualLabel,
        predictedLabel,
        predictedLabel,
        toRatio(getValue(row, ["akurasi_model", "model_accuracy"])),
        confidenceScore,
        confidenceLevel,
        toNumber(getValue(row, ["mae"]), null),
        toNumber(getValue(row, ["rmse"]), null),
        toBoolean(getValue(row, ["is_correct"]), null),
        confidenceScore !== null ? confidenceScore < 0.7 : false,
        false,
        toSqlDateTime(getValue(row, ["created_at"])),
      ];
    })
    .filter(Boolean);

  await batchInsert(connection, "predictions", columns, values);
};

const importCsrPrograms = async (
  connection,
  rows,
  regionIdByName,
  schoolIdByCode,
) => {
  const columns = [
    "csr_code",
    "company_name",
    "region_id",
    "school_id",
    "aid_type",
    "aid_value",
    "recipient_count",
    "program_year",
    "submission_date",
    "realization_date",
    "status",
    "description",
    "created_at",
    "updated_at",
  ];

  const values = rows
    .map((row) => {
      const regionName = getValue(row, ["kecamatan", "nama_kecamatan"]);
      const regionId = regionIdByName.get(normalizeName(regionName));
      const schoolCode = normalizeText(
        getValue(row, ["sekolah_id", "school_code"]),
      );

      if (!regionId) return null;

      return [
        normalizeText(getValue(row, ["csr_id", "csr_code"])),
        normalizeText(getValue(row, ["perusahaan", "company_name"])),
        regionId,
        schoolIdByCode.get(schoolCode) || null,
        normalizeText(getValue(row, ["jenis_bantuan", "aid_type"])),
        toNumber(getValue(row, ["nilai_bantuan", "aid_value"])),
        toInteger(getValue(row, ["jumlah_penerima", "recipient_count"])),
        toInteger(getValue(row, ["tahun", "program_year"])),
        toSqlDate(getValue(row, ["tanggal_pengajuan", "submission_date"])),
        toSqlDate(getValue(row, ["tanggal_realisasi", "realization_date"])),
        normalizeCsrStatus(getValue(row, ["status"])),
        normalizeText(getValue(row, ["deskripsi", "description"])),
        toSqlDateTime(getValue(row, ["created_at"])),
        toSqlDateTime(getValue(row, ["updated_at"])),
      ];
    })
    .filter(Boolean);

  await batchInsert(connection, "csr_programs", columns, values);
};

const importAuditLogs = async (
  connection,
  rows,
  userIdByCode,
  userIdByUsername,
) => {
  const columns = [
    "log_code",
    "user_id",
    "user_code",
    "username",
    "source_role",
    "action",
    "target_table",
    "target_code",
    "region_filter",
    "ip_address",
    "user_agent",
    "status",
    "duration_ms",
    "occurred_at",
  ];

  const values = rows.map((row) => {
    const userCode = normalizeText(getValue(row, ["user_id", "user_code"]));
    const username = normalizeText(getValue(row, ["username"]));

    return [
      normalizeText(getValue(row, ["log_id", "log_code"])),
      userIdByCode.get(userCode) || userIdByUsername.get(username) || null,
      userCode,
      username,
      normalizeText(getValue(row, ["role"])),
      normalizeText(getValue(row, ["action"])),
      normalizeText(getValue(row, ["target_table"])),
      normalizeText(getValue(row, ["target_id", "target_code"])),
      normalizeText(getValue(row, ["kecamatan_filter", "region_filter"])),
      normalizeText(getValue(row, ["ip_address"])),
      normalizeText(getValue(row, ["user_agent"])),
      normalizeAuditStatus(getValue(row, ["status"])),
      toInteger(getValue(row, ["duration_ms"]), null),
      toSqlDateTime(getValue(row, ["timestamp", "occurred_at"])) ||
        toSqlDateTime(new Date()),
    ];
  });

  await batchInsert(connection, "audit_logs", columns, values);
};

const importAnalyticsSnapshots = async (connection, rows, regionIdByName) => {
  const columns = [
    "analytics_code",
    "region_id",
    "year",
    "total_population",
    "total_vulnerable_population",
    "vulnerable_ratio",
    "total_pip_aid",
    "pip_coverage_pct",
    "total_pre_school",
    "sd_count",
    "risk_status",
    "total_schools_in_region",
    "total_csr_programs",
    "total_csr_value",
    "vulnerability_index",
    "pip_gap",
    "risk_ranking",
    "created_at",
  ];

  const values = rows
    .map((row) => {
      const regionName = getValue(row, ["kecamatan", "nama_kecamatan"]);
      const regionId = regionIdByName.get(normalizeName(regionName));

      if (!regionId) return null;

      return [
        normalizeText(getValue(row, ["analytics_id", "analytics_code"])),
        regionId,
        toInteger(getValue(row, ["tahun", "year"])),
        toInteger(getValue(row, ["total_populasi", "total_population"])),
        toNumber(
          getValue(row, ["total_warga_rentan", "total_vulnerable_population"]),
        ),
        toNumber(getValue(row, ["rasio_warga_rentan", "vulnerable_ratio"])),
        toNumber(getValue(row, ["total_bantuan_pip", "total_pip_aid"])),
        toNumber(getValue(row, ["coverage_pip_pct", "pip_coverage_pct"])),
        toNumber(getValue(row, ["total_pra_sekolah", "total_pre_school"])),
        toNumber(getValue(row, ["jumlah_sd", "sd_count"])),
        normalizeRiskLabel(getValue(row, ["status_resiko", "risk_status"])),
        toInteger(
          getValue(row, ["total_sekolah_kec", "total_schools_in_region"]),
        ),
        toInteger(getValue(row, ["total_program_csr", "total_csr_programs"])),
        toNumber(getValue(row, ["total_nilai_csr", "total_csr_value"])),
        toNumber(getValue(row, ["indeks_kerentanan", "vulnerability_index"])),
        toNumber(getValue(row, ["gap_pip", "pip_gap"])),
        toInteger(getValue(row, ["ranking_risiko", "risk_ranking"]), null),
        toSqlDateTime(getValue(row, ["created_at"])),
      ];
    })
    .filter(Boolean);

  await batchInsert(connection, "analytics_snapshots", columns, values);
};

const main = async () => {
  console.log("Starting PINTARIN data import...");
  console.log(`Excel source: ${excelPath}`);
  console.log(`CSV source  : ${csvPath}`);

  if (!fs.existsSync(excelPath)) {
    throw new Error(`Excel file tidak ditemukan: ${excelPath}`);
  }

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file tidak ditemukan: ${csvPath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const data = {
    regions: await readExcelSheet(workbook, "Data_Wilayah"),
    users: await readExcelSheet(workbook, "Data_User_Auth"),
    schools: await readExcelSheet(workbook, "Data_Sekolah"),
    risks: await readExcelSheet(workbook, "Data_Risiko"),
    predictions: await readExcelSheet(workbook, "Data_AI_Prediction"),
    csrPrograms: await readExcelSheet(workbook, "Data_Bantuan_CSR"),
    auditLogs: await readExcelSheet(workbook, "Data_Audit_Log"),
    analytics: await readExcelSheet(workbook, "Data_Analytics"),
    populationEducation: readCsv(),
  };

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await resetTables(connection);

    const regionIdByName = await importRegions(connection, data.regions);

    const { userIdByCode, userIdByUsername } = await importUsers(
      connection,
      data.users,
      regionIdByName,
    );

    const schoolIdByCode = await importSchools(
      connection,
      data.schools,
      regionIdByName,
    );

    await importPopulationEducation(
      connection,
      data.populationEducation,
      regionIdByName,
    );
    await importRiskRecords(connection, data.risks, regionIdByName);
    await importPredictions(connection, data.predictions, regionIdByName);
    await importCsrPrograms(
      connection,
      data.csrPrograms,
      regionIdByName,
      schoolIdByCode,
    );
    await importAuditLogs(
      connection,
      data.auditLogs,
      userIdByCode,
      userIdByUsername,
    );
    await importAnalyticsSnapshots(connection, data.analytics, regionIdByName);

    await connection.commit();

    console.log("PINTARIN data import completed successfully.");
    console.table({
      regions: data.regions.length,
      users: data.users.length,
      schools: data.schools.length,
      population_education_records: data.populationEducation.length,
      risk_records: data.risks.length,
      predictions: data.predictions.length,
      csr_programs: data.csrPrograms.length,
      audit_logs: data.auditLogs.length,
      analytics_snapshots: data.analytics.length,
    });
  } catch (error) {
    await connection.rollback();
    console.error("PINTARIN data import failed.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

main();
