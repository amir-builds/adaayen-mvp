import express from "express";
import { registerCreator, loginCreator } from "../controllers/authController.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Min 6 characters password"),
  ],
  validate,
  registerCreator
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  loginCreator
);

export default router;
