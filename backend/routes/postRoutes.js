import express from "express";
import {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPostsByCreator,
  getPostsByFabric,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/creator/:creatorId", getPostsByCreator);
router.get("/fabric/:fabricId", getPostsByFabric);

// Protected
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
