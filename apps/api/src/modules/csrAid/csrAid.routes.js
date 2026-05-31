const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const roleGuard = require("../../middlewares/roleGuard");
const csrAidController = require("./csrAid.controller");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleGuard(["admin", "officer", "csr_partner"]),
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
  roleGuard(["admin", "officer"]),
  csrAidController.reviewAidProposal,
);

module.exports = router;