import mongoose from "mongoose";

const fabricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    fabricType: {  // Changed from 'category' to 'fabricType'
      type: String,
      enum: ["Cotton", "Silk", "Linen", "Denim", "Wool", "Polyester", "Other"],
      default: "Other",
    },
    color: { type: String },  // Added color field
  imageUrl: { type: String }, // primary image (kept for backward compatibility)
  images: { type: [String], default: [] }, // multiple images
    // New: store metadata for each uploaded image (url + cloudinary public_id)
    imagesMeta: {
      type: [
        {
          url: { type: String },
          public_id: { type: String },
        },
      ],
      default: [],
    },
    inStock: { type: Boolean, default: true },

    // Removed creator field (only admin manages fabrics)
  },
  { timestamps: true }
);

export default mongoose.model("Fabric", fabricSchema);
