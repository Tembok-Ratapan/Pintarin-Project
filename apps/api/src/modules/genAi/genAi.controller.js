const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const genAiService = require("./genAi.service");

const chat = asyncHandler(async (req, res) => {
  const data = await genAiService.askGemini({
    message: req.body?.message,
    context: req.body?.context,
    user: req.user,
  });

  return successResponse(res, {
    message: "Gen AI response generated successfully",
    data,
  });
});

module.exports = {
  chat,
};
