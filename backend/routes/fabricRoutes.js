import express from "express";
import {
  getAllFabrics,
  getFabricById,
  createFabric,
  updateFabric,
  deleteFabric,
} from "../controllers/fabricController.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Get all fabrics
router.get("/", asyncHandler(getAllFabrics));

// Get fabric by ID
router.get("/:id", asyncHandler(getFabricById));

// Create new fabric (protected + validated)
router.post(
  "/",
  protect,
  [
    body("name").notEmpty().withMessage("Fabric name is required"),
    body("fabricType").notEmpty().withMessage("Fabric type is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
  ],
  validate,
  asyncHandler(createFabric)
);

// Update fabric (protected + validated)
router.put(
  "/:id",
  protect,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
  ],
  validate,
  asyncHandler(updateFabric)
);

// Delete fabric (protected)
router.delete("/:id", protect, asyncHandler(deleteFabric));

export default router;
