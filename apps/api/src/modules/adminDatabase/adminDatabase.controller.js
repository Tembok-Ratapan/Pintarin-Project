const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const adminDatabaseService = require("./adminDatabase.service");

const getReqMeta = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

const listTables = asyncHandler(async (req, res) => {
  return successResponse(res, {
    message: "Admin database tables retrieved successfully",
    data: adminDatabaseService.listTables(),
  });
});

const listRecords = asyncHandler(async (req, res) => {
  const data = await adminDatabaseService.listRecords({
    tableKey: req.params.tableKey,
    query: req.query,
  });

  return successResponse(res, {
    message: "Admin database records retrieved successfully",
    data,
  });
});

const getRecord = asyncHandler(async (req, res) => {
  const data = await adminDatabaseService.getRecord({
    tableKey: req.params.tableKey,
    id: req.params.id,
  });

  return successResponse(res, {
    message: "Admin database record retrieved successfully",
    data,
  });
});

const createRecord = asyncHandler(async (req, res) => {
  const data = await adminDatabaseService.createRecord({
    user: req.user,
    tableKey: req.params.tableKey,
    payload: req.body,
    reqMeta: getReqMeta(req),
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Admin database record created successfully",
    data,
  });
});

const updateRecord = asyncHandler(async (req, res) => {
  const data = await adminDatabaseService.updateRecord({
    user: req.user,
    tableKey: req.params.tableKey,
    id: req.params.id,
    payload: req.body,
    reqMeta: getReqMeta(req),
  });

  return successResponse(res, {
    message: "Admin database record updated successfully",
    data,
  });
});

const deleteRecord = asyncHandler(async (req, res) => {
  const data = await adminDatabaseService.deleteRecord({
    user: req.user,
    tableKey: req.params.tableKey,
    id: req.params.id,
    reqMeta: getReqMeta(req),
  });

  return successResponse(res, {
    message: "Admin database record deleted successfully",
    data,
  });
});

module.exports = {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  listTables,
  updateRecord,
};
