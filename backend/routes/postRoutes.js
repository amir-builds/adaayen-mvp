// backend/routes/postRoutes.js
import express from "express";
import {
  getAllPosts,
  getFeaturedPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPostsByCreator,
  toggleFeaturePost,
} from "../controllers/postController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// 🔓 Public routes
router.get("/", getAllPosts);                 // Get all posts
router.get("/featured", getFeaturedPosts);    // Get featured posts (for homepage)
router.get("/creator/:creatorId", getPostsByCreator); // Get all posts by a specific creator
router.get("/:id", getPostById);              // Get single post by ID

// 🔐 Protected routes (only logged-in users)
router.post("/", protect, createPost);        // Create a new post
router.put("/:id", protect, updatePost);      // Update own post
router.delete("/:id", protect, deletePost);   // Delete own post

// 🛠️ Admin-only route to mark/unmark posts as featured
router.patch("/:id/feature", protect, adminOnly, toggleFeaturePost);
// temporary route for testing
router.get("/test", (req, res) => res.send("✅ Posts route works"));


export default router;
