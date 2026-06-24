import User from "../models/User.js";
import Customer from "../models/Customer.js";
import CreatorProfile from "../models/CreatorProfile.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';
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

    // ✅ Generate 6-digit OTP (expires in 10 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Create new user (password will be hashed by pre-save hook)
    const newUser = new User({
      name,
      email,
      password,
      role: userRole,
      emailVerified: false,
      emailOTP: otp,
      emailOTPExpires: otpExpires,
    });

    await newUser.save();

    // Create role-specific profile with error handling
    let roleSpecificData = null;
    try {
      if (userRole === 'customer') {
        roleSpecificData = await Customer.create({ user: newUser._id });
      } else if (userRole === 'creator') {
        roleSpecificData = await CreatorProfile.create({ 
          user: newUser._id,
          bio: bio || ""
        });
      }
    } catch (profileError) {
      // If profile creation fails, delete the user to prevent orphaned records
      console.error('❌ Profile creation failed:', profileError);
      await User.findByIdAndDelete(newUser._id);
      throw new Error('Registration failed during profile creation. Please try again.');
    }

    // ✅ Send OTP email
    const emailResult = await sendOTPEmail(newUser, otp);
    if (!emailResult.success) {
      console.error('❌ Failed to send OTP email:', emailResult.error);
    }

    res.status(201).json({
      message: "Registration successful! Please enter the 6-digit code sent to your email.",
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

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (!user.emailOTP || !user.emailOTPExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (new Date() > user.emailOTPExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.emailOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // ✅ Mark verified and clear OTP
    user.emailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    // ✅ Generate JWT and return user
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Email verified successfully! Welcome to Adaayein.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// Resend OTP
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate fresh OTP
    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailResult = await sendOTPEmail(user, otp);
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.status(200).json({
      message: 'A new verification code has been sent to your email.',
      emailSent: true,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};
