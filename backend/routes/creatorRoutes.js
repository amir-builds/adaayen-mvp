import express from "express";
import {
  getAllCreators,
  getCreatorById,
  getCreatorProfile,
  updateCreatorProfile,
  getCreatorStats,
} from "../controllers/creatorController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ✅ Protected routes FIRST (more specific)
router.get("/profile", protect, getCreatorProfile);
router.put("/profile", protect, updateCreatorProfile);
router.get("/stats", protect, getCreatorStats);

// ✅ Public routes AFTER (less specific)
router.get("/", getAllCreators);           // Get all creators
router.get("/:id", getCreatorById);        // Get creator by ID

export default router;
