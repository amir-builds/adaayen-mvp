// backend/routes/creatorRoutes.js
import express from "express";
import { getCreatorProfile, updateCreatorProfile } from "../controllers/creatorController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get logged-in creator's profile
router.get("/profile", protect, getCreatorProfile);

// Update profile info
router.put("/profile", protect, updateCreatorProfile);

export default router;
