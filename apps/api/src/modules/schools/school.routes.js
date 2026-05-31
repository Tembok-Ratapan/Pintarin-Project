const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const roleGuard = require("../../middlewares/roleGuard");
const schoolController = require("./school.controller");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleGuard(["admin", "officer", "csr_partner", "school_operator"]),
  schoolController.listSchools,
);

module.exports = router;