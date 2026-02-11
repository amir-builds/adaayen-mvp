import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    // ===== CORE IDENTITY =====
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true,
      minlength: 8
    },
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    role: { 
      type: String, 
      enum: ["customer", "creator", "admin"], 
      required: true
    },

    // ===== EMAIL VERIFICATION =====
    emailVerified: { 
      type: Boolean, 
      default: false 
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // ===== ACCOUNT SECURITY =====
    isActive: {
      type: Boolean,
      default: true
    },
    failedLoginAttempts: { 
      type: Number, 
      default: 0 
    },
    lockedUntil: Date,
    lastLogin: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // ===== PROFILE BASICS =====
    profilePic: { 
      type: String, 
      default: "" 
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    },

    // ===== PREFERENCES =====
    preferences: {
      newsletter: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' }
    }
  },
  { 
    timestamps: true,
    // Optimize queries by role
    collection: 'users'
  }
);

// ===== INDEXES FOR PERFORMANCE =====
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, role: 1 });

// ===== SECURITY METHODS =====
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12); // Higher salt rounds for production
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isAccountLocked = function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

// Increment failed login attempts
userSchema.methods.incrementFailedAttempts = function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  }
  
  return this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedAttempts = function() {
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model("User", userSchema);