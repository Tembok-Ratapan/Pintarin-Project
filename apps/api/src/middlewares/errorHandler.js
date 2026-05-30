const { errorResponse } = require('../utils/apiResponse')

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500

  if (process.env.NODE_ENV !== 'test') {
    console.error(err)
  }

  return errorResponse(res, {
    statusCode,
    message: statusCode === 500 ? 'Internal server error' : err.message,
    errors: process.env.NODE_ENV === 'development' ? err.stack : null,
  })
}

module.exports = errorHandler