import Creator from "../models/Creator.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Helper to generate JWT with role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
export const registerCreator = async (req, res) => {
  try {
    const { name, email, password, bio, role } = req.body;

    const existingUser = await Creator.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new user (password will be hashed by pre-save hook)
    const newCreator = new Creator({
      name,
      email,
      password,
      bio: bio || "",
      role: role || "creator", // Default to creator
    });

    await newCreator.save();

    // Generate JWT with role
    const token = generateToken(newCreator._id, newCreator.role);

    res.status(201).json({
      message: "Registration successful",
      token,
      creator: {
        id: newCreator._id,
        name: newCreator.name,
        email: newCreator.email,
        bio: newCreator.bio,
        role: newCreator.role, // Include role in response
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginCreator = async (req, res) => {
  try {
    const { email, password } = req.body;

    const creator = await Creator.findOne({ email });
    if (!creator) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, creator.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token with role
    const token = generateToken(creator._id, creator.role);

    res.status(200).json({
      message: "Login successful",
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        email: creator.email,
        bio: creator.bio,
        role: creator.role, // Include role
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get profile
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

// Update profile
export const updateCreatorProfile = async (req, res) => {
  try {
    const creator = await Creator.findById(req.user.id);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    creator.name = req.body.name || creator.name;
    creator.bio = req.body.bio || creator.bio;
    creator.profilePic = req.body.profilePic || creator.profilePic;

    const updated = await creator.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};