// controllers/adminController.js
import Post from "../models/Post.js";
import Creator from "../models/Creator.js";

// GET all posts (admin view - includes non-featured)
export const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("creator", "name email profilePic")
      .sort({ createdAt: -1 });
    
    res.json({
      total: posts.length,
      featured: posts.filter(p => p.isFeatured).length,
      posts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Feature/Unfeature a post
export const setFeatureStatus = async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isFeatured = isFeatured;
    const updated = await post.save();
    const populated = await updated.populate("creator", "name email profilePic");

    res.json({
      message: `Post ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      post: populated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all creators (admin view)
export const getAllCreators = async (req, res) => {
  try {
    const creators = await Creator.find().select("-password");
    res.json(creators);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete any post (admin privilege)
export const deletePostAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully by admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};