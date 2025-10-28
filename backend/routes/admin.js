// routes/admin.js
import express from "express";
import {
  getAllPostsAdmin,
  setFeatureStatus,
  getAllCreators,
  deletePostAdmin
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Admin routes
router.get("/posts", getAllPostsAdmin);                    // Get all posts with stats
router.patch("/posts/:id/feature", setFeatureStatus);      // Feature/unfeature a post
router.delete("/posts/:id", deletePostAdmin);              // Delete any post
router.get("/creators", getAllCreators);                   // Get all creators

export default router;