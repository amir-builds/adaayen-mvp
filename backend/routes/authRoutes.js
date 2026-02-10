import express from "express";
import { registerUser, loginUser, verifyEmail, resendVerification, getUserProfile, updateUserProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    // ✅ STRONG PASSWORD REQUIREMENTS
    body("password")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/).withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character (!@#$%^&* etc.)"),
    // ✅ Validate role if provided (must be 'customer' or 'creator')
    body("role").optional().isIn(['customer', 'creator']).withMessage("Role must be 'customer' or 'creator'"),
  ],
  validate,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  loginUser
);

// ✅ PROFILE ROUTES
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// ✅ EMAIL VERIFICATION ROUTES
router.get("/verify-email/:token", verifyEmail);

router.post(
  "/resend-verification", 
  [
    body("email").isEmail().withMessage("Valid email required"),
  ],
  validate,
  resendVerification
);

export default router;
