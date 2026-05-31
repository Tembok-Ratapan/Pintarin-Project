const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const roleGuard = require("../../middlewares/roleGuard");
const { roleGroups } = require("../../constants/permissions");
const schoolRequestController = require("./schoolRequest.controller");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleGuard(roleGroups.SCHOOL_WORKERS),
  schoolRequestController.listRequests,
);

router.post(
  "/",
  authMiddleware,
  roleGuard(["admin", "school_operator"]),
  schoolRequestController.createRequest,
);

router.patch(
  "/:id/review",
  authMiddleware,
  roleGuard(roleGroups.DECISION_MAKERS),
  schoolRequestController.reviewRequest,
);

module.exports = router;