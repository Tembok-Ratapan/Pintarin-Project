const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const roleGuard = require("../../middlewares/roleGuard");
const schoolRequestController = require("./schoolRequest.controller");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleGuard(["admin", "officer", "school_operator"]),
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
  roleGuard(["admin", "officer"]),
  schoolRequestController.reviewRequest,
);

module.exports = router;