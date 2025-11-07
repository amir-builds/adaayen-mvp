import Creator from "../models/Creator.js";
import Post from "../models/Post.js";

// ✅ Get all creators (public)
export const getAllCreators = async (req, res) => {
  try {
    const creators = await Creator.find({ role: "creator" })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(creators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get creator by ID (public)
export const getCreatorById = async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id).select("-password");
    
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    
    res.json(creator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get own profile (protected)
export const getCreatorProfile = async (req, res) => {
  try {
    const creator = await Creator.findById(req.user.id).select("-password");
    
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    
    res.json(creator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update own profile (protected)
export const updateCreatorProfile = async (req, res) => {
  try {
    const creator = await Creator.findById(req.user.id);
    
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // Update only allowed fields
    creator.name = req.body.name || creator.name;
    creator.bio = req.body.bio || creator.bio;
    creator.profilePic = req.body.profilePic || creator.profilePic;

    const updated = await creator.save();
    
    // Return without password
    const { password, ...creatorData } = updated.toObject();
    res.json(creatorData);
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
