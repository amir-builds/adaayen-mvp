import mongoose from "mongoose";

const fabricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Cotton", "Silk", "Linen", "Denim", "Other"],
      default: "Other",
    },
    imageUrl: { type: String, required: true },
    inStock: { type: Boolean, default: true },

    // Link to creator (optional)
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Creator", required: false },
  },
  { timestamps: true }
);

export default mongoose.model("Fabric", fabricSchema);
