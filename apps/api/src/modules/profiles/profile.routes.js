const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const profileController = require("./profile.controller");

const router = express.Router();

router.get("/me", authMiddleware, profileController.getMyProfile);
router.patch("/me", authMiddleware, profileController.updateMyProfile);

module.exports = router;