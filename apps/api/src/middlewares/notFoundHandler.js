const { errorResponse } = require('../utils/apiResponse')

const notFoundHandler = (req, res) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
  })
}

module.exports = notFoundHandler