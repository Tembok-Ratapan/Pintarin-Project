const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const roleGuard = require("../../middlewares/roleGuard");
const { roleGroups } = require("../../constants/permissions");
const csrAidController = require("./csrAid.controller");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleGuard(roleGroups.CSR_WORKERS),
  csrAidController.listAidProposals,
);

router.post(
  "/",
  authMiddleware,
  roleGuard(["admin", "csr_partner"]),
  csrAidController.createAidProposal,
);

router.patch(
  "/:id/review",
  authMiddleware,
  roleGuard(roleGroups.DECISION_MAKERS),
  csrAidController.reviewAidProposal,
);

module.exports = router;