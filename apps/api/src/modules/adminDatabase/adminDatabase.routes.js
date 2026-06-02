const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");
const roleGuard = require("../../middlewares/roleGuard");
const { roleGroups } = require("../../constants/permissions");
const adminDatabaseController = require("./adminDatabase.controller");

const router = express.Router();

router.use(authMiddleware, roleGuard(roleGroups.ADMIN_ONLY));

router.get("/tables", adminDatabaseController.listTables);
router.get("/:tableKey", adminDatabaseController.listRecords);
router.get("/:tableKey/:id", adminDatabaseController.getRecord);
router.post("/:tableKey", adminDatabaseController.createRecord);
router.patch("/:tableKey/:id", adminDatabaseController.updateRecord);
router.delete("/:tableKey/:id", adminDatabaseController.deleteRecord);

module.exports = router;
