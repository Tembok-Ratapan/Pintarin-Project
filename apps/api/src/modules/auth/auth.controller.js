const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const authService = require("./auth.service");

const login = asyncHandler(async (req, res) => {
  const data = await authService.login({
    identifier: req.body.identifier,
    password: req.body.password,
  });

  return successResponse(res, {
    message: "Login successful",
    data,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user.id);

  return successResponse(res, {
    message: "Authenticated user retrieved successfully",
    data,
  });
});

const logout = asyncHandler(async (req, res) => {
  return successResponse(res, {
    message: "Logout successful. Please remove token on client side.",
    data: null,
  });
});

module.exports = {
  login,
  getMe,
  logout,
};
