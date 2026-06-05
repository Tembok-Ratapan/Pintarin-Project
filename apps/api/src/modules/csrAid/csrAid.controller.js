const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const csrAidService = require("./csrAid.service");

const listAidProposals = asyncHandler(async (req, res) => {
  const data = await csrAidService.listAidProposals({
    user: req.user,
    query: req.query,
  });

  return successResponse(res, {
    message: "CSR aid proposals retrieved successfully",
    data,
  });
});

const createAidProposal = asyncHandler(async (req, res) => {
  const data = await csrAidService.createAidProposal({
    user: req.user,
    payload: req.body,
  });

  return successResponse(res, {
    statusCode: 201,
    message: "CSR aid proposal created successfully",
    data,
  });
});

const reviewAidProposal = asyncHandler(async (req, res) => {
  const data = await csrAidService.reviewAidProposal({
    user: req.user,
    id: req.params.id,
    payload: req.body,
  });

  return successResponse(res, {
    message: "CSR aid proposal reviewed successfully",
    data,
  });
});

const decideRecommendation = asyncHandler(async (req, res) => {
  const data = await csrAidService.decideRecommendation({
    user: req.user,
    id: req.params.id,
    payload: req.body,
  });

  return successResponse(res, {
    message: "CSR recommendation decision saved successfully",
    data,
  });
});

module.exports = {
  createAidProposal,
  decideRecommendation,
  listAidProposals,
  reviewAidProposal,
};
