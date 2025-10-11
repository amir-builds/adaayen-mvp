import Creator from "../models/Creator.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Register (Signup)
export const registerCreator = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    const existingUser = await Creator.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const newCreator = new Creator({ name, email, password, bio });
    await newCreator.save();

    const token = jwt.sign({ id: newCreator._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, creator: newCreator });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginCreator = async (req, res) => {
  try {
    const { email, password } = req.body;

    const creator = await Creator.findOne({ email });
    if (!creator) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, creator.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: creator._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, creator });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
