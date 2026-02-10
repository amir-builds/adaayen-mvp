import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  fabric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fabric",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.5,
  },
  pricePerMeter: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  landmark: String
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    // ===== ORDER IDENTIFICATION =====
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    
    // ===== CUSTOMER INFO =====
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    // ===== ORDER ITEMS =====
    items: [orderItemSchema],
    
    // ===== PRICING =====
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    
    // ===== ORDER STATUS =====
    status: {
      type: String,
      enum: [
        'pending_payment',
        'payment_confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded',
        'returned'
      ],
      default: 'pending_payment'
    },
    
    // ===== SHIPPING DETAILS =====
    shippingAddress: shippingAddressSchema,
    
    // ===== SHIPPING TRACKING =====
    shippingDetails: {
      carrier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
      shippingMethod: {
        type: String,
        enum: ['standard', 'express', 'overnight'],
        default: 'standard'
      }
    },
    
    // ===== PAYMENT DETAILS =====
    paymentDetails: {
      method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'cod', 'bank_transfer'],
        required: true
      },
      transactionId: String,
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      paidAt: Date,
      refundedAt: Date,
      refundAmount: {
        type: Number,
        default: 0
      }
    },
    
    // ===== ORDER TIMELINE =====
    timeline: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }],
    
    // ===== CUSTOMER COMMUNICATION =====
    notes: String,
    customerNotes: String,
    
    // ===== CANCELLATION & RETURNS =====
    cancellation: {
      reason: String,
      cancelledAt: Date,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      refundStatus: {
        type: String,
        enum: ['not_applicable', 'pending', 'completed'],
        default: 'not_applicable'
      }
    },
    
    returnRequest: {
      requested: { type: Boolean, default: false },
      reason: String,
      requestedAt: Date,
      status: {
        type: String,
        enum: ['not_requested', 'pending', 'approved', 'rejected', 'completed'],
        default: 'not_requested'
      }
    }
  },
  { 
    timestamps: true,
    collection: 'orders'
  }
);

// ===== INDEXES =====
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentDetails.paymentStatus': 1 });
orderSchema.index({ 'shippingDetails.trackingNumber': 1 });

// ===== PRE-SAVE MIDDLEWARE =====
orderSchema.pre('save', function(next) {
  // Generate order number if not exists
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ADY${timestamp}${random}`;
  }
  
  // Add to timeline when status changes
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`
    });
  }
  
  next();
});

// ===== METHODS =====
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy
  });
  
  return this.save();
};

orderSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.total = this.subtotal + this.shippingCost + this.tax - this.discount;
  return this.total;
};

export default mongoose.model("Order", orderSchema);