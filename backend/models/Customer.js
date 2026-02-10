import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

const customerSchema = new mongoose.Schema(
  {
    // Reference to base User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ===== SHOPPING PROFILE =====
    addresses: [addressSchema],
    
    // ===== PURCHASE HISTORY =====
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // ===== CUSTOMER TIER =====
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    
    // ===== FAVORITES & WISHLIST =====
    favoriteCreators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator"
    }],
    wishlist: [{
      fabric: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fabric",
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // ===== SHOPPING PREFERENCES =====
    preferredFabricTypes: [{
      type: String,
      enum: [
        "Cotton", "Silk", "Linen", "Denim", "Wool", 
        "Polyester", "Net", "Velvet", "Chiffon", 
        "Georgette", "Crepe", "Satin", "Organza", 
        "Rayon", "Muslin", "Other"
      ]
    }],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 }
    },

    // ===== ANALYTICS =====
    lastPurchase: Date,
    averageOrderValue: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    collection: 'customers'
  }
);

// ===== INDEXES =====
customerSchema.index({ user: 1 });
customerSchema.index({ tier: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ 'wishlist.fabric': 1 });

// ===== METHODS =====
customerSchema.methods.addToWishlist = function(fabricId) {
  const exists = this.wishlist.find(item => 
    item.fabric.toString() === fabricId.toString()
  );
  
  if (!exists) {
    this.wishlist.push({
      fabric: fabricId,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

customerSchema.methods.removeFromWishlist = function(fabricId) {
  this.wishlist = this.wishlist.filter(item => 
    item.fabric.toString() !== fabricId.toString()
  );
  
  return this.save();
};

// Update customer tier based on total spent
customerSchema.methods.updateTier = function() {
  if (this.totalSpent >= 100000) {
    this.tier = 'platinum';
  } else if (this.totalSpent >= 50000) {
    this.tier = 'gold';
  } else if (this.totalSpent >= 20000) {
    this.tier = 'silver';
  } else {
    this.tier = 'bronze';
  }
  
  return this.save();
};

export default mongoose.model("Customer", customerSchema);