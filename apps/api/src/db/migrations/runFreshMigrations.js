const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});
dotenv.config();

const requiredEnv = ["DB_HOST", "DB_USER", "DB_NAME"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const migrationFiles = [
  "001_init_schema.sql",
  "002_stakeholder_profiles.sql",
  "003_requests_and_csr_aid.sql",
  "004_education_indicators.sql",
  "005_ai_prediction_bridge.sql",
  "006_drop_legacy_unused_tables.sql",
  "007_csr_aid_distribution_flow.sql",
];

const activeTables = [
  "prediction_validations",
  "csr_match_logs",
  "audit_logs",
  "analytics_snapshots",
  "school_need_requests",
  "csr_aid_proposals",
  "stakeholder_profiles",
  "education_indicators",
  "predictions",
  "schools",
  "users",
  "regions",
];

const createConnection = () => {
  const sslEnabled = toBoolean(process.env.DB_SSL, false);

  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: sslEnabled
      ? {
          minVersion: "TLSv1.2",
          rejectUnauthorized: toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
        }
      : undefined,
  });
};

const main = async () => {
  const connection = await createConnection();

  try {
    console.log("Running fresh PINTARIN migrations...");
    console.log(`Target database: ${process.env.DB_NAME}`);

    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const tableName of activeTables) {
      console.log(`Dropping ${tableName} if exists`);
      await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    for (const fileName of migrationFiles) {
      const filePath = path.join(__dirname, fileName);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`Applying ${fileName}`);
      await connection.query(sql);
    }

    console.log("Fresh migrations completed successfully.");
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error("Fresh migration failed.");
  console.error(error);
  process.exitCode = 1;
});
