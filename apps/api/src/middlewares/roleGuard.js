const roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User role is missing.",
      });
    }

    if (userRole === "admin") {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have access to this resource.",
      });
    }

    return next();
  };
};

module.exports = roleGuard;