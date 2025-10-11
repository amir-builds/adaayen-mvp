import Post from "../models/Post.js";

// GET all posts (populate creator + fabric)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("creator", "name email profilePic")
      .populate("fabric");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("creator", "name email profilePic")
      .populate("fabric");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE post
export const createPost = async (req, res) => {
  const { title, description, fabric, fabricType, imageUrl, price } = req.body;

  try {
    const newPost = new Post({
      creator: req.user.id,
      title,
      description,
      fabric: fabric || null,
      fabricType: fabricType || (fabric ? undefined : "Other"),
      imageUrl,
      price,
    });

    const savedPost = await newPost.save();
    const populated = await savedPost
      .populate("creator", "name email profilePic")
      .populate("fabric");
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
    Object.assign(post, updates);
    const updated = await post.save();

    const populated = await updated
      .populate("creator", "name email profilePic")
      .populate("fabric");
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
      .populate("creator", "name email")
      .populate("fabric");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET posts by fabric
export const getPostsByFabric = async (req, res) => {
  try {
    const posts = await Post.find({ fabric: req.params.fabricId })
      .populate("creator", "name email")
      .populate("fabric");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
