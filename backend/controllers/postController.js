import Post from "../models/Post.js";

// GET all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("creator", "name email profilePic");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET featured posts (for homepage)
export const getFeaturedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isFeatured: true })
      .populate("creator", "name email profilePic")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("creator", "name email profilePic");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE post
export const createPost = async (req, res) => {
  const { title, description, fabricType, fabricLink, imageUrl, price } = req.body;

  try {
    const newPost = new Post({
      creator: req.user.id,
      title,
      description,
      fabricType,
      fabricLink,
      imageUrl,
      price,
      isFeatured: false // New posts are not featured by default
    });

    const savedPost = await newPost.save();
    const populated = await savedPost.populate("creator", "name email profilePic");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updates = req.body;
    // Prevent creators from setting isFeatured themselves
    delete updates.isFeatured;
    
    Object.assign(post, updates);
    const updated = await post.save();
    const populated = await updated.populate("creator", "name email profilePic");
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET posts by creator
export const getPostsByCreator = async (req, res) => {
  try {
    const posts = await Post.find({ creator: req.params.creatorId })
      .populate("creator", "name email profilePic")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE feature post (Admin only)
export const toggleFeaturePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Toggle the featured status
    post.isFeatured = !post.isFeatured;
    const updated = await post.save();
    const populated = await updated.populate("creator", "name email profilePic");
    
    res.json({
      message: `Post ${updated.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      post: populated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};