import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/* ==============================
   🔐 PROTECTED ROUTES (Authenticated users only)
============================== */

// Get user's cart
router.get("/", protect, asyncHandler(getCart));

// Add item to cart
router.post(
  "/",
  protect,
  [
    body("fabricId").notEmpty().withMessage("Fabric ID is required"),
    body("quantity")
      .optional()
      .isNumeric()
      .withMessage("Quantity must be a number")
      .custom(val => parseFloat(val) >= 0.5)
      .withMessage("Quantity must be at least 0.5 meters"),
  ],
  validate,
  asyncHandler(addToCart)
);

// Update cart item quantity
router.put(
  "/",
  protect,
  [
    body("fabricId").notEmpty().withMessage("Fabric ID is required"),
    body("quantity")
      .isNumeric()
      .withMessage("Quantity must be a number")
      .custom(val => parseFloat(val) >= 0.5)
      .withMessage("Quantity must be at least 0.5 meters"),
  ],
  validate,
  asyncHandler(updateCartItem)
);

// Remove item from cart
router.delete("/:fabricId", protect, asyncHandler(removeFromCart));

// Clear entire cart
router.delete("/", protect, asyncHandler(clearCart));

export default router;
