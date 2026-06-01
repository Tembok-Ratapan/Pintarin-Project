const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const env = require("../../config/env");
const {
  createRateLimiter,
  getIdentifierKey,
} = require("../../middlewares/rateLimiter");

const router = express.Router();

const loginIpLimiter = createRateLimiter({
  windowMs: env.security.loginRateLimitWindowMs,
  max: env.security.loginRateLimitMax,
  message: "Terlalu banyak percobaan login dari jaringan ini. Coba lagi nanti.",
});

const loginIdentifierLimiter = createRateLimiter({
  windowMs: env.security.loginRateLimitWindowMs,
  max: env.security.loginIdentifierRateLimitMax,
  keyGenerator: getIdentifierKey,
  message: "Terlalu banyak percobaan untuk akun ini. Coba lagi nanti.",
});

router.post("/login", loginIpLimiter, loginIdentifierLimiter, authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
