import express from "express";
import { registerUser, loginUser, verifyOTP, resendVerification, getUserProfile, updateUserProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/).withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character (!@#$%^&* etc.)"),
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

// ✅ OTP VERIFICATION ROUTES
router.post("/verify-otp", verifyOTP);

router.post(
  "/resend-verification",
  [body("email").isEmail().withMessage("Valid email required")],
  validate,
  resendVerification
);

export default router;
