const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const schoolService = require("./school.service");

const listSchools = asyncHandler(async (req, res) => {
  const data = await schoolService.listSchools({
    query: req.query,
  });

  return successResponse(res, {
    message: "Schools retrieved successfully",
    data,
  });
});

module.exports = {
  listSchools,
};