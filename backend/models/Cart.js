import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  fabric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fabric",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.5,
    default: 1,
  },
  pricePerMeter: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
    // Cart status and metadata
    status: {
      type: String,
      enum: ['active', 'abandoned', 'converted'],
      default: 'active'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expireAfterSeconds: 0 }
    }
  },
  { timestamps: true }
);

// Virtual for calculating cart total
cartSchema.virtual("total").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity * item.pricePerMeter, 0);
});

// Ensure virtuals are included in JSON
cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

export default mongoose.model("Cart", cartSchema);
