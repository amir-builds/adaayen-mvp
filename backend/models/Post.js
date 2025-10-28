// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    creator: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Creator", 
      required: true 
    },

    title: { 
      type: String, 
      required: true, 
      trim: true 
    },

    description: { 
      type: String, 
      trim: true 
    },

    // Optional field for fabric info
    fabricType: { 
      type: String, 
      trim: true, 
      default: "Other" 
    },

    fabricLink: { 
      type: String, 
      trim: true 
    },

    imageUrl: { 
      type: String, 
      required: true 
    },

    price: { 
      type: Number 
    },

    // 👇 New field — admin can set this for homepage
    isFeatured: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// For faster lookup of creator’s posts
postSchema.index({ creator: 1 });

export default mongoose.model("Post", postSchema);
