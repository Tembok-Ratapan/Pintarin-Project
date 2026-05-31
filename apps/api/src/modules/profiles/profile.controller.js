const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const profileService = require("./profile.service");

const getMyProfile = asyncHandler(async (req, res) => {
  const data = await profileService.getMyProfile(req.user);

  return successResponse(res, {
    message: "Profile retrieved successfully",
    data,
  });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const data = await profileService.updateMyProfile({
    user: req.user,
    payload: req.body,
  });

  return successResponse(res, {
    message: "Profile updated successfully",
    data,
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
};