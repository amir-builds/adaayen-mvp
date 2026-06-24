import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, verifyOTP, resendVerification, getUserProfile, updateUserProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Strict limiter for login — 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP limiter — 5 attempts per 10 min (matches OTP expiry window)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: "Too many verification attempts. Please request a new code." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register limiter — 5 registrations per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Too many accounts created from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Resend limiter — 3 resends per 10 min
const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { message: "Too many resend requests. Please wait before requesting another code." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post(
  "/register",
  registerLimiter,
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
  loginLimiter,
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
router.post("/verify-otp", otpLimiter, verifyOTP);

router.post(
  "/resend-verification",
  resendLimiter,
  [body("email").isEmail().withMessage("Valid email required")],
  validate,
  resendVerification
);

// ✅ PASSWORD RESET ROUTES
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/forgot-password',
  forgotLimiter,
  [body('email').isEmail().withMessage('Valid email required')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').notEmpty().withMessage('OTP required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Must contain a number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Must contain a special character'),
  ],
  validate,
  resetPassword
);

export default router;
