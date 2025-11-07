import Post from "../models/Post.js";
import { v2 as cloudinary } from 'cloudinary';

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
    // Handle multiple uploaded images (similar to fabric controller)
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    
    const images = [];
    const imagesMeta = [];

    uploadedFiles.forEach((f) => {
      const url = f?.path || f?.secure_url || f?.url;
      const public_id = f?.filename || f?.public_id || f?.publicId;
      if (url) images.push(url);
      imagesMeta.push({ url: url || null, public_id: public_id || null });
    });

    // If images array is empty but imagesMeta contains urls, populate images from imagesMeta
    if (images.length === 0 && imagesMeta.length > 0) {
      const fromMeta = imagesMeta.map(m => m.url).filter(Boolean);
      if (fromMeta.length > 0) images.push(...fromMeta);
    }

    // Fallback: allow passing imageUrl in body (backwards compatibility)
    let primaryImageUrl = imageUrl;
    if (images.length === 0 && imageUrl) {
      images.push(imageUrl);
    } else if (images.length > 0) {
      primaryImageUrl = images[0];
    }

    if (!primaryImageUrl && images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required. Please upload an image or provide an image URL.' });
    }

    const newPost = new Post({
      creator: req.user.id,
      title,
      description,
      fabricType,
      fabricLink,
      imageUrl: primaryImageUrl,
      images,
      imagesMeta,
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

    // Handle new uploaded images
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    const newUrls = [];
    const newMeta = [];

    uploadedFiles.forEach((f) => {
      const url = f?.path || f?.secure_url || f?.url;
      const public_id = f?.filename || f?.public_id || f?.publicId;
      if (url) newUrls.push(url);
      newMeta.push({ url: url || null, public_id: public_id || null });
    });

    if (newUrls.length === 0 && newMeta.length > 0) {
      const fromMeta = newMeta.map(m => m.url).filter(Boolean);
      if (fromMeta.length > 0) newUrls.push(...fromMeta);
    }

    if (newUrls.length > 0) {
      // Append to existing images
      post.images = Array.isArray(post.images) ? post.images.concat(newUrls) : newUrls;
      post.imagesMeta = Array.isArray(post.imagesMeta) ? post.imagesMeta.concat(newMeta) : newMeta;
      // Update primary image if not set
      if (!post.imageUrl && post.images.length > 0) {
        post.imageUrl = post.images[0];
      }
    }

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

    // Delete images from Cloudinary if they exist
    try {
      const toDelete = (post.imagesMeta || []).map((m) => m?.public_id).filter(Boolean);
      if (toDelete.length > 0) {
        await Promise.all(
          toDelete.map(async (pid) => {
            try {
              await cloudinary.uploader.destroy(pid);
            } catch (err) {
              console.error('Cloudinary delete failed for', pid, err?.message || err);
            }
          })
        );
      }
    } catch (err) {
      console.error('Error while deleting cloudinary images for post', req.params.id, err?.message || err);
    }

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