const { pool, testDatabaseConnection } = require("./connection");

const tables = [
  "regions",
  "schools",
  "users",
  "stakeholder_profiles",
  "education_indicators",
  "predictions",
  "analytics_snapshots",
  "school_need_requests",
  "csr_aid_proposals",
  "prediction_validations",
  "csr_match_logs",
  "audit_logs",
];

const main = async () => {
  await testDatabaseConnection();

  const result = [];

  for (const table of tables) {
    try {
      const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
      result.push({ table, rows: rows[0]?.total || 0 });
    } catch (error) {
      result.push({ table, rows: "ERROR", error: error.message });
    }
  }

  console.table(result);
};

main()
  .catch((error) => {
    console.error("Database inspection failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
