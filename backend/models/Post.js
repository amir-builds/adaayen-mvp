// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    creator: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",  // Now references User model instead of Creator
      required: true 
    },

    title: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200
    },

    description: { 
      type: String, 
      trim: true,
      maxlength: 1000
    },

    // Reference to Fabric model
    fabric: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fabric",
      required: false
    },

    // Legacy fields - kept for backward compatibility
    fabricType: { 
      type: String, 
      trim: true, 
      default: "Other" 
    },

    fabricLink: { 
      type: String, 
      trim: true 
    },

    // Enhanced image handling
    imageUrl: { 
      type: String, 
      required: true 
    },
    images: { 
      type: [String], 
      default: [] 
    },
    imagesMeta: {
      type: [
        {
          url: { type: String },
          public_id: { type: String },
        },
      ],
      default: [],
    },

    // Pricing information
    price: { 
      type: Number,
      min: 0
    },

    // Admin controls
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    featuredAt: Date,
    featuredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    // Post analytics
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Content moderation
    status: {
      type: String,
      enum: ['draft', 'published', 'under_review', 'rejected', 'archived'],
      default: 'published'
    },
    moderationNotes: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    // SEO and discoverability
    tags: [{ 
      type: String, 
      trim: true,
      lowercase: true 
    }],
    category: {
      type: String,
      enum: [
        'Traditional Wear', 'Western Wear', 'Fusion Wear', 
        'Casual Wear', 'Formal Wear', 'Kids Wear', 
        'Home Decor', 'Accessories', 'Other'
      ],
      default: 'Other'
    }
  },
  { timestamps: true }
);

// For faster lookup of creator's posts
postSchema.index({ creator: 1 });
// For faster lookup of fabric's posts
postSchema.index({ fabric: 1 });

export default mongoose.model("Post", postSchema);
