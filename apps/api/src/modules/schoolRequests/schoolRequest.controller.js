const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const schoolRequestService = require("./schoolRequest.service");

const listRequests = asyncHandler(async (req, res) => {
  const data = await schoolRequestService.listRequests({
    user: req.user,
    query: req.query,
  });

  return successResponse(res, {
    message: "School requests retrieved successfully",
    data,
  });
});

const createRequest = asyncHandler(async (req, res) => {
  const data = await schoolRequestService.createRequest({
    user: req.user,
    payload: req.body,
  });

  return successResponse(res, {
    statusCode: 201,
    message: "School request created successfully",
    data,
  });
});

const reviewRequest = asyncHandler(async (req, res) => {
  const data = await schoolRequestService.reviewRequest({
    user: req.user,
    id: req.params.id,
    payload: req.body,
  });

  return successResponse(res, {
    message: "School request reviewed successfully",
    data,
  });
});

const updateRequest = asyncHandler(async (req, res) => {
  const data = await schoolRequestService.updateRequest({
    user: req.user,
    id: req.params.id,
    payload: req.body,
  });

  return successResponse(res, {
    message: "School request updated successfully",
    data,
  });
});

const deleteRequest = asyncHandler(async (req, res) => {
  const data = await schoolRequestService.deleteRequest({
    user: req.user,
    id: req.params.id,
  });

  return successResponse(res, {
    message: "School request deleted successfully",
    data,
  });
});

module.exports = {
  createRequest,
  deleteRequest,
  listRequests,
  reviewRequest,
  updateRequest,
};
