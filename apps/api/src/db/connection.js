const mysql = require('mysql2/promise')
const env = require('../config/env')

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const testDatabaseConnection = async () => {
  const connection = await pool.getConnection()
  try {
    await connection.ping()
    console.log('Database connected successfully')
  } finally {
    connection.release()
  }
}

module.exports = {
  pool,
  testDatabaseConnection,
}