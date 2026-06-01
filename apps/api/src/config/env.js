const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = ["PORT", "CLIENT_URL"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "pintarin_db",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "change_this_secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  aiServiceUrl,

  ai: {
    serviceUrl: aiServiceUrl,
    timeoutMs: toNumber(process.env.AI_SERVICE_TIMEOUT_MS, 30000),
    reviewThreshold: toNumber(process.env.AI_REVIEW_THRESHOLD, 0.7),
    batchSize: toNumber(process.env.AI_BATCH_SIZE, 50),
  },
};

module.exports = env;
