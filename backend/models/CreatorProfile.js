import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema({
  instagram: { type: String, trim: true },
  youtube: { type: String, trim: true },
  pinterest: { type: String, trim: true },
  website: { type: String, trim: true },
  facebook: { type: String, trim: true },
  other: { type: String, trim: true }
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalShares: { type: Number, default: 0 },
  totalFollowers: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const creatorSchema = new mongoose.Schema(
  {
    // Reference to base User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ===== CREATOR PROFILE =====
    bio: { 
      type: String, 
      maxlength: 500,
      trim: true,
      default: "" 
    },
    specialization: [{
      type: String,
      enum: [
        'Traditional Wear', 'Western Wear', 'Fusion Wear', 
        'Casual Wear', 'Formal Wear', 'Kids Wear', 
        'Home Decor', 'Accessories', 'Embroidery', 
        'Tailoring', 'Pattern Making', 'Styling', 'Other'
      ]
    }],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert', 'professional'],
      default: 'beginner'
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true }
    },

    // ===== CREATOR VERIFICATION =====
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_applied'],
      default: 'not_applied'
    },
    verificationSubmittedAt: Date,
    verificationDocuments: [{
      type: { 
        type: String, 
        enum: ['id_proof', 'portfolio', 'certificate', 'other'] 
      },
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],

    // ===== SOCIAL PRESENCE =====
    socialLinks: socialLinksSchema,
    
    // ===== PORTFOLIO STATS =====
    analytics: analyticsSchema,
    
    // ===== CREATOR PERFORMANCE =====
    totalPosts: { type: Number, default: 0 },
    featuredPosts: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    
    // ===== CREATOR STATUS =====
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'banned'],
      default: 'active'
    },
    
    // ===== FEATURED CREATOR =====
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredUntil: Date,
    featuredOrder: { type: Number, default: 0 },
    
    // ===== CONTENT PREFERENCES =====
    contentCategories: [{
      type: String,
      enum: [
        "Cotton", "Silk", "Linen", "Denim", "Wool", 
        "Polyester", "Net", "Velvet", "Chiffon", 
        "Georgette", "Crepe", "Satin", "Organza", 
        "Rayon", "Muslin", "Other"
      ]
    }],
    
    // ===== CREATOR TIER =====
    tier: {
      type: String,
      enum: ['starter', 'rising', 'established', 'star'],
      default: 'starter'
    },

    // ===== COLLABORATION =====
    collaborationSettings: {
      openToCollaboration: { type: Boolean, default: true },
      preferredBrands: [String],
      minimumFollowers: { type: Number, default: 0 },
      rates: {
        postRate: Number,
        videoRate: Number,
        storyRate: Number
      }
    }
  },
  { 
    timestamps: true,
    collection: 'creators'
  }
);

// ===== INDEXES =====
creatorSchema.index({ user: 1 });
creatorSchema.index({ isVerified: 1 });
creatorSchema.index({ isFeatured: 1, featuredOrder: 1 });
creatorSchema.index({ 'analytics.totalFollowers': -1 });
creatorSchema.index({ tier: 1 });
creatorSchema.index({ status: 1 });
creatorSchema.index({ specialization: 1 });

// ===== METHODS =====
creatorSchema.methods.updateAnalytics = function(viewsInc = 0, likesInc = 0, sharesInc = 0) {
  this.analytics.totalViews += viewsInc;
  this.analytics.totalLikes += likesInc;
  this.analytics.totalShares += sharesInc;
  this.analytics.lastUpdated = new Date();
  
  // Calculate engagement rate
  if (this.analytics.totalFollowers > 0) {
    this.analytics.engagementRate = 
      ((this.analytics.totalLikes + this.analytics.totalShares) / 
       this.analytics.totalFollowers) * 100;
  }
  
  return this.save();
};

// Update creator tier based on performance
creatorSchema.methods.updateTier = function() {
  const followers = this.analytics.totalFollowers;
  const posts = this.totalPosts;
  const featured = this.featuredPosts;
  
  if (followers >= 100000 && featured >= 10) {
    this.tier = 'star';
  } else if (followers >= 50000 && featured >= 5) {
    this.tier = 'established';
  } else if (followers >= 10000 && posts >= 20) {
    this.tier = 'rising';
  } else {
    this.tier = 'starter';
  }
  
  return this.save();
};

// Set featured creator with expiry
creatorSchema.methods.setFeatured = function(durationDays = 30, order = 0) {
  this.isFeatured = true;
  this.featuredUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
  this.featuredOrder = order;
  
  return this.save();
};

// Check if featured status has expired
creatorSchema.methods.checkFeaturedExpiry = function() {
  if (this.isFeatured && this.featuredUntil && this.featuredUntil < new Date()) {
    this.isFeatured = false;
    this.featuredUntil = undefined;
    return this.save();
  }
  return Promise.resolve(this);
};

export default mongoose.model("Creator", creatorSchema);