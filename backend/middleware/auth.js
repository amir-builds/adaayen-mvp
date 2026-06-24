// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: "Account deactivated" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Access denied: insufficient permissions",
      userRole: req.user?.role,
      requiredRole: "admin"
    });
  }
};

// Role-based access control
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        message: "Access denied: insufficient permissions",
        userRole: req.user?.role,
        requiredRoles: allowedRoles
      });
    }
  };
};

// Creator only middleware
export const creatorOnly = requireRole(['creator']);

// Customer only middleware
export const customerOnly = requireRole(['customer']);

// Creator or Admin middleware
export const creatorOrAdmin = requireRole(['creator', 'admin']);