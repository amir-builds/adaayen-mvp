import User from "../models/User.js";
import Customer from "../models/Customer.js";
import CreatorProfile from "../models/CreatorProfile.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService.js';
import { validateEmailDomain, isValidEmailDomain } from '../utils/emailValidation.js';

// Helper to generate JWT with role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, bio, role } = req.body;

    const existingUser = await User.findOne({ email });
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
    const newUser = new User({
      name,
      email,
      password,
      role: userRole, // Only 'customer' or 'creator', never 'admin'
      emailVerified: false, // ✅ Account starts unverified
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await newUser.save();

    // Create role-specific profile
    let roleSpecificData = null;
    if (userRole === 'customer') {
      roleSpecificData = await Customer.create({ user: newUser._id });
    } else if (userRole === 'creator') {
      roleSpecificData = await CreatorProfile.create({ 
        user: newUser._id,
        bio: bio || ""
      });
    }

    // ✅ Send verification email (don't block registration if email fails)
    const emailResult = await sendVerificationEmail(newUser, verificationToken);
    
    if (!emailResult.success) {
      console.error('❌ Failed to send verification email:', emailResult.error);
      // Continue registration even if email fails - user can request resend later
    }

    // ✅ DON'T generate JWT token yet - user must verify email first
    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      emailSent: emailResult.success,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        emailVerified: false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).json({ 
        message: "Account temporarily locked due to too many failed attempts. Try again later." 
      });
    }

    // ✅ Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email address before logging in. Check your inbox for verification link.",
        emailVerified: false 
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // ✅ Increment failed login attempts
      await user.incrementFailedAttempts();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Reset failed attempts on successful login
    await user.resetFailedAttempts();

    // Fetch role-specific data
    let roleData = null;
    if (user.role === 'customer') {
      roleData = await Customer.findOne({ user: user._id });
    } else if (user.role === 'creator') {
      roleData = await CreatorProfile.findOne({ user: user._id });
    } else if (user.role === 'admin') {
      roleData = await Admin.findOne({ user: user._id });
    }

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        profilePic: user.profilePic
      },
      roleData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch role-specific data
    let roleData = null;
    if (user.role === 'customer') {
      roleData = await Customer.findOne({ user: user._id }).populate('wishlist.fabric');
    } else if (user.role === 'creator') {
      roleData = await CreatorProfile.findOne({ user: user._id });
    } else if (user.role === 'admin') {
      roleData = await Admin.findOne({ user: user._id });
    }

    res.json({ user, roleData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update base user fields
    user.name = req.body.name || user.name;
    user.profilePic = req.body.profilePic || user.profilePic;
    user.phone = req.body.phone || user.phone;
    
    await user.save();

    // Update role-specific data
    if (user.role === 'creator' && req.body.bio !== undefined) {
      await CreatorProfile.findOneAndUpdate(
        { user: user._id },
        { 
          bio: req.body.bio,
          specialization: req.body.specialization || undefined,
          experience: req.body.experience || undefined,
          'location.city': req.body.city || undefined,
          'location.state': req.body.state || undefined,
          'socialLinks': req.body.socialLinks || undefined
        },
        { new: true }
      );
    } else if (user.role === 'customer') {
      await Customer.findOneAndUpdate(
        { user: user._id },
        {
          preferredFabricTypes: req.body.preferredFabricTypes || undefined,
          'priceRange': req.body.priceRange || undefined
        },
        { new: true }
      );
    }

    // Fetch updated profile
    let roleData = null;
    if (user.role === 'customer') {
      roleData = await Customer.findOne({ user: user._id });
    } else if (user.role === 'creator') {
      roleData = await CreatorProfile.findOne({ user: user._id });
    } else if (user.role === 'admin') {
      roleData = await Admin.findOne({ user: user._id });
    }

    res.json({ user, roleData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EMAIL VERIFICATION ENDPOINTS

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Determine frontend URL based on environment
    const getFrontendURL = () => {
      if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:5173';
      }
      return process.env.FRONTEND_URL || 'http://localhost:5173';
    };
    
    const frontendURL = getFrontendURL();
    
    if (!token) {
      // Redirect to frontend with error
      return res.redirect(`${frontendURL}/?verification=error&message=missing-token`);
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(`${frontendURL}/?verification=error&message=invalid-token`);
    }

    // ✅ Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // ✅ Generate JWT token now that email is verified
    const jwtToken = generateToken(user._id, user.role);

    // Redirect to frontend with success and token
    res.redirect(`${frontendURL}/?verification=success&token=${jwtToken}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: true
    }))}`);
  } catch (error) {
    console.error("Email verification error:", error);
    // Redirect to frontend with error
    const frontendURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/?verification=error&message=server-error`);
  }
};

// Resend Verification Email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(user, verificationToken);
    
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