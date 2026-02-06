import Creator from "../models/Creator.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService.js';
import { validateEmailDomain, isValidEmailDomain } from '../utils/emailValidation.js';

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

    // ✅ SECURITY: Validate email domain to prevent fake/disposable emails
    console.log(`🔍 Validating email domain for: ${email}`);
    const emailValidation = await validateEmailDomain(email);
    console.log(`📧 Email validation result:`, emailValidation);
    
    if (!emailValidation.valid) {
      console.log(`❌ Email validation failed: ${emailValidation.error}`);
      return res.status(400).json({ 
        message: `Registration failed: ${emailValidation.error}`,
        type: 'INVALID_EMAIL_DOMAIN'
      });
    }
    console.log(`✅ Email validation passed for: ${email}`);

    // ✅ SECURITY: Only allow 'customer' or 'creator' roles
    // 'admin' role can ONLY be set during initial setup, not via registration
    const allowedRoles = ['customer', 'creator'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    // ✅ Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user (password will be hashed by pre-save hook)
    const newCreator = new Creator({
      name,
      email,
      password,
      bio: bio || "",
      role: userRole, // Only 'customer' or 'creator', never 'admin'
      emailVerified: false, // ✅ Account starts unverified
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await newCreator.save();

    // ✅ Send verification email (don't block registration if email fails)
    const emailResult = await sendVerificationEmail(newCreator, verificationToken);
    
    if (!emailResult.success) {
      console.error('❌ Failed to send verification email:', emailResult.error);
      // Continue registration even if email fails - user can request resend later
    }

    // ✅ DON'T generate JWT token yet - user must verify email first
    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      emailSent: emailResult.success,
      creator: {
        id: newCreator._id,
        name: newCreator.name,
        email: newCreator.email,
        role: newCreator.role,
        emailVerified: false,
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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Check if account is locked
    if (creator.lockedUntil && creator.lockedUntil > new Date()) {
      return res.status(403).json({ 
        message: "Account temporarily locked due to too many failed attempts. Try again later." 
      });
    }

    // ✅ Check if email is verified
    if (!creator.emailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email address before logging in. Check your inbox for verification link.",
        emailVerified: false 
      });
    }

    const isMatch = await bcrypt.compare(password, creator.password);
    if (!isMatch) {
      // ✅ Increment failed login attempts
      creator.failedLoginAttempts = (creator.failedLoginAttempts || 0) + 1;
      
      if (creator.failedLoginAttempts >= 5) {
        creator.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        creator.failedLoginAttempts = 0;
        await creator.save();
        return res.status(403).json({ 
          message: "Account locked due to too many failed attempts. Try again in 15 minutes." 
        });
      }
      
      await creator.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Reset failed attempts on successful login
    creator.failedLoginAttempts = 0;
    creator.lockedUntil = null;
    creator.lastLogin = new Date();
    await creator.save();

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
        role: creator.role,
        emailVerified: creator.emailVerified,
        lastLogin: creator.lastLogin,
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

// ✅ EMAIL VERIFICATION ENDPOINTS

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const creator = await Creator.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() } // Token not expired
    });

    if (!creator) {
      return res.status(400).json({ 
        message: "Invalid or expired verification token. Please request a new verification email." 
      });
    }

    // ✅ Mark email as verified
    creator.emailVerified = true;
    creator.emailVerificationToken = undefined;
    creator.emailVerificationExpires = undefined;
    await creator.save();

    // ✅ Generate JWT token now that email is verified
    const jwtToken = generateToken(creator._id, creator.role);

    res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      verified: true,
      token: jwtToken,
      creator: {
        id: creator._id,
        name: creator.name,
        email: creator.email,
        role: creator.role,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Email verification failed. Please try again." });
  }
};

// Resend Verification Email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const creator = await Creator.findOne({ email });
    if (!creator) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (creator.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    creator.emailVerificationToken = verificationToken;
    creator.emailVerificationExpires = verificationExpires;
    await creator.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(creator, verificationToken);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        message: "Failed to send verification email. Please try again." 
      });
    }

    res.status(200).json({
      message: "Verification email sent successfully. Please check your inbox.",
      emailSent: true,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Failed to resend verification email" });
  }
};