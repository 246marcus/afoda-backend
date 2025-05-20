const checkRole = (roles) => {
  return (req, res, next) => {
    // ✅ Checks if user and role are defined
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied - user has no role assigned",
      });
    }

    // ✅ Checks if the role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied - requires one of these roles: ${roles.join(
          ", "
        )}`,
      });
    }

    // ✅ Grants access
    next();
  };
};
