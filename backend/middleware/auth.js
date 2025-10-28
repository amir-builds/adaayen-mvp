// middleware/auth.js
import jwt from "jsonwebtoken";
import Creator from "../models/Creator.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (includes role)
      req.user = await Creator.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      console.log("✅ User authenticated:", req.user.email, "| Role:", req.user.role);
      next();
    } catch (error) {
      console.error("❌ Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  console.log("🔍 Checking admin access for:", req.user.email, "| Role:", req.user.role);
  
  if (req.user && req.user.role === "admin") {
    console.log("✅ Admin access granted");
    next();
  } else {
    console.log("❌ Admin access denied");
    res.status(403).json({ 
      message: "Access denied: insufficient permissions",
      userRole: req.user?.role,
      requiredRole: "admin"
    });
  }
};