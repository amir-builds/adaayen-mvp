import express from "express";
import {
  getAllFabrics,
  getFabricById,
  createFabric,
  updateFabric,
  deleteFabric,
} from "../controllers/fabricController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* ==============================
   🔓 PUBLIC ROUTES
============================== */

// Get all fabrics
router.get("/", asyncHandler(getAllFabrics));

// Get single fabric by ID
router.get("/:id", asyncHandler(getFabricById));

/* ==============================
   🔐 ADMIN-ONLY ROUTES
============================== */

// Add new fabric
router.post(
  "/",
  protect,
  adminOnly,
  // Accept multiple images under field name 'images' (max controlled by MAX_FILES env var)
  upload.array('images', parseInt(process.env.MAX_FILES, 10) || 6), // Add upload middleware
  [
    body("name").notEmpty().withMessage("Fabric name is required"),
    body("fabricType").notEmpty().withMessage("Fabric type is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
  ],
  validate,
  asyncHandler(createFabric)
);

// Update fabric
router.put(
  "/:id",
  protect,
  adminOnly,
  // Allow uploading new images when updating a fabric
  upload.array('images', parseInt(process.env.MAX_FILES, 10) || 6),
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
  ],
  validate,
  asyncHandler(updateFabric)
);

// Delete fabric
router.delete("/:id", protect, adminOnly, asyncHandler(deleteFabric));

export default router;
