const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
