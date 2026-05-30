const { errorResponse } = require('../utils/apiResponse')
const { ROLES } = require('../constants/roles')

const roleGuard = (allowedRoles = []) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Unauthorized. Please login first.',
      })
    }

    const isAllowed = roles.includes(req.user.role)
    const isAdmin = req.user.role === ROLES.ADMIN

    if (!isAllowed && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Forbidden. You do not have permission to access this resource.',
      })
    }

    next()
  }
}

module.exports = roleGuard