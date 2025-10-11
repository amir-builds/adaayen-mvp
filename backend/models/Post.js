import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Creator", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    // Backward compatibility field
    fabricType: { 
      type: String, 
      enum: ["Cotton", "Silk", "Linen", "Denim", "Other"], 
      default: "Other" 
    },

    // New relational field
    fabric: { type: mongoose.Schema.Types.ObjectId, ref: "Fabric", required: false },

    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

postSchema.index({ creator: 1 });

export default mongoose.model("Post", postSchema);
