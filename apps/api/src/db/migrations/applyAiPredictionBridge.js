const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});
dotenv.config();

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

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
    const migrationPath = path.join(__dirname, "005_ai_prediction_bridge.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("Applying AI prediction bridge migration...");
    await connection.query(sql);
    console.log("AI prediction bridge migration applied successfully.");
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error("AI prediction bridge migration failed.");
  console.error(error);
  process.exitCode = 1;
});
