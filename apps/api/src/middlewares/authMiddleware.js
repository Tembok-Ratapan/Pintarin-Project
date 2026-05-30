const jwt = require('jsonwebtoken')
const env = require('../config/env')
const { errorResponse } = require('../utils/apiResponse')
const authRepository = require('../modules/auth/auth.repository')

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Unauthorized. Token is required.',
      })
    }

    const token = authHeader.split(' ')[1]

    const payload = jwt.verify(token, env.jwt.secret)

    const user = await authRepository.findUserById(payload.id)

    if (!user || !user.is_active) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Unauthorized. User is inactive or not found.',
      })
    }

    req.user = user
    next()
  } catch (error) {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Unauthorized. Invalid or expired token.',
    })
  }
}

module.exports = authMiddleware