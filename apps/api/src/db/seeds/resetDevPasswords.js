const bcrypt = require("bcrypt");
const { pool } = require("../connection");

const demoCredentials = [
  { username: "admin", password: "pintarin" },
  { username: "dinas", password: "pintarindinas" },
  { username: "csr", password: "pintarincsr" },
  { username: "school", password: "pintarinschool" },
];

const resetDevPasswords = async () => {
  const connection = await pool.getConnection();

  try {
    for (const credential of demoCredentials) {
      const passwordHash = await bcrypt.hash(credential.password, 10);

      await connection.query(
        `
        UPDATE users
        SET password_hash = ?, is_active = TRUE
        WHERE username = ?
        `,
        [passwordHash, credential.username],
      );
    }

    console.log("Development demo passwords reset successfully.");
    console.table(
      demoCredentials.map(({ username, password }) => ({
        username,
        password,
      })),
    );
  } catch (error) {
    console.error("Failed to reset development demo passwords.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

resetDevPasswords();
