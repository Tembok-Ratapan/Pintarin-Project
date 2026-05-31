const bcrypt = require("bcrypt");
const { pool } = require("../connection");

const DEFAULT_DEV_PASSWORD = "Pintarin@2026";

const resetDevPasswords = async () => {
  const connection = await pool.getConnection();

  try {
    const passwordHash = await bcrypt.hash(DEFAULT_DEV_PASSWORD, 10);

    const [result] = await connection.query(
      `
      UPDATE users
      SET password_hash = ?
      WHERE is_active = 1
      `,
      [passwordHash],
    );

    console.log("✅ Development passwords reset successfully.");
    console.log(`Updated users: ${result.affectedRows}`);
    console.log(`Default password: ${DEFAULT_DEV_PASSWORD}`);
  } catch (error) {
    console.error("❌ Failed to reset development passwords.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

resetDevPasswords();
