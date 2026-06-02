const express = require("express");

const env = require("../../config/env");
const { roleGroups } = require("../../constants/permissions");
const authMiddleware = require("../../middlewares/authMiddleware");
const { createRateLimiter } = require("../../middlewares/rateLimiter");
const roleGuard = require("../../middlewares/roleGuard");
const genAiController = require("./genAi.controller");

const router = express.Router();

const genAiLimiter = createRateLimiter({
  windowMs: env.security.genAiRateLimitWindowMs,
  max: env.security.genAiRateLimitMax,
  keyGenerator: (req) => `gen-ai:${req.user?.id || req.ip || "anonymous"}`,
  message: "Terlalu banyak request Gen AI. Coba lagi beberapa saat lagi.",
});

router.post(
  "/chat",
  authMiddleware,
  roleGuard(roleGroups.ALL_AUTHENTICATED),
  genAiLimiter,
  genAiController.chat,
);

module.exports = router;
