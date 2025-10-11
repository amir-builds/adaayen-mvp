// backend/controllers/creatorController.js
import Creator from "../models/Creator.js";

// Get profile
export const getCreatorProfile = async (req, res) => {
  try {
    const creator = await Creator.findById(req.user.id).select("-password");
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    res.json(creator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
export const updateCreatorProfile = async (req, res) => {
  try {
    const creator = await Creator.findById(req.user.id);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    const { name, bio, profilePic } = req.body;
    if (name) creator.name = name;
    if (bio) creator.bio = bio;
    if (profilePic) creator.profilePic = profilePic;

    await creator.save();
    res.json(creator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
