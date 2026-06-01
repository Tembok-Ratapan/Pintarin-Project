const dotenv = require("dotenv");

dotenv.config();

const DEFAULT_JWT_SECRET = "change_this_secret";
const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const parseCsv = (value) => {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const clientUrls = parseCsv(process.env.CLIENT_URLS || process.env.CLIENT_URL);

if (clientUrls.length === 0) {
  throw new Error("Missing required environment variable: CLIENT_URL or CLIENT_URLS");
}

if (!process.env.PORT) {
  throw new Error("Missing required environment variable: PORT");
}

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

if (isProduction && process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
  throw new Error("JWT_SECRET must be changed before running in production");
}

if (!isProduction && process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
  console.warn("Warning: using development JWT_SECRET. Change it before deploy.");
}

const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  clientUrl: clientUrls[0],
  clientUrls,

  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "pintarin_db",
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  aiServiceUrl,

  ai: {
    serviceUrl: aiServiceUrl,
    timeoutMs: toNumber(process.env.AI_SERVICE_TIMEOUT_MS, 30000),
    reviewThreshold: toNumber(process.env.AI_REVIEW_THRESHOLD, 0.7),
    batchSize: toNumber(process.env.AI_BATCH_SIZE, 50),
  },

  security: {
    trustProxy: toBoolean(process.env.TRUST_PROXY, isProduction),
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== "false",
    rateLimitWindowMs: toPositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    rateLimitMax: toPositiveInteger(process.env.RATE_LIMIT_MAX, 300),
    loginRateLimitWindowMs: toPositiveInteger(
      process.env.LOGIN_RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000,
    ),
    loginRateLimitMax: toPositiveInteger(process.env.LOGIN_RATE_LIMIT_MAX, 20),
    loginIdentifierRateLimitMax: toPositiveInteger(
      process.env.LOGIN_IDENTIFIER_RATE_LIMIT_MAX,
      8,
    ),
  },
};

module.exports = env;
