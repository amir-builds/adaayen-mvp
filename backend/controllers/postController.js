import Post from "../models/Post.js";
import { deleteImagesFromMeta } from '../utils/cloudinary.js';

// GET all posts (with optional fabric filter)
export const getAllPosts = async (req, res) => {
  try {
    const { fabric, featured, page: pageParam, limit: limitParam } = req.query;
    const query = {};
    
    // Filter by fabric if provided
    if (fabric) {
      query.fabric = fabric;
    }
    
    // Filter by featured status if provided
    if (featured !== undefined) {
      query.isFeatured = featured === 'true';
    }
    
    // Pagination parameters
    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 20;
    const skip = (page - 1) * limit;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100" 
      });
    }
    
    // Get total count for pagination metadata
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    
    const posts = await Post.find(query)
      .populate("creator", "name email profilePic")
      .populate("fabric", "name fabricType color price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET featured posts (for homepage)
export const getFeaturedPosts = async (req, res) => {
  try {
    const { page: pageParam, limit: limitParam } = req.query;
    
    // Pagination parameters (smaller limit for featured posts)
    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 10;
    const skip = (page - 1) * limit;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-50" 
      });
    }
    
    // Get total count
    const totalPosts = await Post.countDocuments({ isFeatured: true });
    const totalPages = Math.ceil(totalPosts / limit);
    
    const posts = await Post.find({ isFeatured: true })
      .populate("creator", "name email profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("creator", "name email profilePic")
      .populate("fabric", "name fabricType color price");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE post
export const createPost = async (req, res) => {
  const { title, description, fabric, fabricType, fabricLink, imageUrl, price } = req.body;

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
      fabric: fabric || null, // New: fabric reference
      fabricType,
      fabricLink,
      imageUrl: primaryImageUrl,
      images,
      imagesMeta,
      price,
      isFeatured: false // New posts are not featured by default
    });

    const savedPost = await newPost.save();
    const populated = await savedPost.populate([
      { path: "creator", select: "name email profilePic" },
      { path: "fabric", select: "name fabricType color price" }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating post:', err.message);
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

    // Delete images from Cloudinary with proper verification
    let deletionWarnings = [];
    if (post.imagesMeta && post.imagesMeta.length > 0) {
      console.log(`🗑️ Deleting ${post.imagesMeta.length} images for post ${req.params.id}`);
      
      const deletionResult = await deleteImagesFromMeta(post.imagesMeta);
      
      if (deletionResult.failed > 0) {
        const failedImages = deletionResult.results
          .filter(r => !r.success)
          .map(r => r.publicId);
        
        console.error(`❌ Failed to delete ${deletionResult.failed} images:`, failedImages);
        deletionWarnings.push(`${deletionResult.failed} image(s) could not be deleted from cloud storage`);
      }
      
      console.log(`✅ Successfully deleted ${deletionResult.successful} of ${post.imagesMeta.length} images`);
    }

    // Delete post from database
    await post.deleteOne();
    
    const response = { 
      message: "Post deleted successfully",
      imagesDeleted: post.imagesMeta?.length || 0
    };
    
    if (deletionWarnings.length > 0) {
      response.warnings = deletionWarnings;
    }
    
    res.json(response);
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET posts by creator
export const getPostsByCreator = async (req, res) => {
  try {
    const { page: pageParam, limit: limitParam } = req.query;
    
    // Pagination parameters
    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 20;
    const skip = (page - 1) * limit;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100" 
      });
    }
    
    const query = { creator: req.params.creatorId };
    
    // Get total count
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    
    const posts = await Post.find(query)
      .populate("creator", "name email profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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