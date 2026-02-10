import User from "../models/User.js";
import CreatorProfile from "../models/CreatorProfile.js";
import Post from "../models/Post.js";

// ✅ Get all creators (public)
export const getAllCreators = async (req, res) => {
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
    
    const query = { role: "creator", isActive: true };
    
    // Get total count
    const totalCreators = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCreators / limit);

    // Find users with creator role and populate creator profile data
    const creatorUsers = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Populate creator profiles for each user
    const creatorsWithProfiles = await Promise.all(
      creatorUsers.map(async (user) => {
        const profile = await CreatorProfile.findOne({ user: user._id });
        return {
          ...user.toObject(),
          profile
        };
      })
    );
    
    res.json({
      creators: creatorsWithProfiles,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCreators,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get creator by ID (public)
export const getCreatorById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user || user.role !== 'creator') {
      return res.status(404).json({ message: "Creator not found" });
    }
    
    const profile = await CreatorProfile.findOne({ user: user._id });
    
    res.json({
      ...user.toObject(),
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get own profile (protected)
export const getCreatorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role !== 'creator') {
      return res.status(403).json({ message: "Access denied. Creator role required." });
    }
    
    const profile = await CreatorProfile.findOne({ user: user._id });
    
    res.json({
      ...user.toObject(),
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update own profile (protected)
export const updateCreatorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role !== 'creator') {
      return res.status(403).json({ message: "Access denied. Creator role required." });
    }

    // Update base user fields
    user.name = req.body.name || user.name;
    user.profilePic = req.body.profilePic || user.profilePic;
    user.phone = req.body.phone || user.phone;
    
    await user.save();
    
    // Update creator profile fields
    const profileUpdate = {};
    if (req.body.bio !== undefined) profileUpdate.bio = req.body.bio;
    if (req.body.specialization !== undefined) profileUpdate.specialization = req.body.specialization;
    if (req.body.experience !== undefined) profileUpdate.experience = req.body.experience;
    if (req.body.location !== undefined) profileUpdate.location = req.body.location;
    if (req.body.socialLinks !== undefined) profileUpdate.socialLinks = req.body.socialLinks;
    
    const profile = await CreatorProfile.findOneAndUpdate(
      { user: user._id },
      profileUpdate,
      { new: true }
    );
    
    res.json({
      ...user.toObject(),
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get creator dashboard stats (protected)
export const getCreatorStats = async (req, res) => {
  try {
    const creatorId = req.user.id;
    
    // Get post count
    const totalPosts = await Post.countDocuments({ creator: creatorId });
    
    // Get featured posts count
    const featuredPosts = await Post.countDocuments({ 
      creator: creatorId, 
      isFeatured: true 
    });
    
    // Get recent posts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPosts = await Post.countDocuments({
      creator: creatorId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate profile completion percentage
    const creator = await Creator.findById(creatorId);
    let profileCompletion = 0;
    if (creator.name) profileCompletion += 25;
    if (creator.bio && creator.bio.length > 20) profileCompletion += 25;
    if (creator.profilePic) profileCompletion += 25;
    if (creator.email) profileCompletion += 25;
    
    res.json({
      totalPosts,
      featuredPosts,
      recentPosts,
      profileCompletion,
      totalViews: 0, // Placeholder for future analytics
      totalLikes: 0, // Placeholder for future analytics
      memberSince: creator.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
