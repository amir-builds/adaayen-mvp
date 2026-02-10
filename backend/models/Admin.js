import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // Reference to base User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ===== ADMIN ROLE & PERMISSIONS =====
    adminRole: {
      type: String,
      enum: ['super_admin', 'content_moderator', 'inventory_manager', 'customer_support'],
      required: true
    },
    permissions: [{
      type: String,
      enum: [
        // User Management
        'manage_users', 'view_users', 'ban_users', 'verify_creators',
        
        // Content Management
        'manage_posts', 'feature_posts', 'moderate_content', 'manage_reports',
        
        // Inventory Management
        'manage_fabrics', 'manage_inventory', 'manage_orders', 'view_sales',
        
        // Platform Settings
        'manage_settings', 'view_analytics', 'manage_admins', 'system_config',
        
        // Financial
        'view_revenue', 'manage_payments', 'export_data',
        
        // Marketing
        'manage_promotions', 'send_notifications', 'manage_newsletters'
      ]
    }],

    // ===== ADMIN PROFILE =====
    department: {
      type: String,
      enum: ['operations', 'marketing', 'customer_service', 'technical', 'business'],
      required: true
    },
    employeeId: {
      type: String,
      unique: true,
      trim: true
    },

    // ===== ADMIN ACTIVITY =====
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    totalActions: {
      type: Number,
      default: 0
    },
    actionHistory: [{
      action: {
        type: String,
        required: true
      },
      targetType: {
        type: String,
        enum: ['user', 'post', 'fabric', 'order', 'creator', 'setting', 'other']
      },
      targetId: mongoose.Schema.Types.ObjectId,
      details: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String
    }],

    // ===== ADMIN STATUS =====
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },

    // ===== ADMIN SETTINGS =====
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      dashboard: {
        defaultView: {
          type: String,
          enum: ['overview', 'users', 'content', 'inventory', 'analytics'],
          default: 'overview'
        },
        refreshInterval: {
          type: Number,
          default: 30 // seconds
        }
      }
    },

    // ===== SECURITY =====
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 8 // hours
    },
    
    // ===== ADMIN STATS =====
    stats: {
      usersManaged: { type: Number, default: 0 },
      postsModerated: { type: Number, default: 0 },
      fabricsAdded: { type: Number, default: 0 },
      reportsResolved: { type: Number, default: 0 }
    }
  },
  { 
    timestamps: true,
    collection: 'admins'
  }
);

// ===== INDEXES =====
adminSchema.index({ user: 1 });
adminSchema.index({ adminRole: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ isActive: 1, status: 1 });
adminSchema.index({ employeeId: 1 });
adminSchema.index({ 'actionHistory.timestamp': -1 });

// ===== METHODS =====
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

adminSchema.methods.logAction = function(action, targetType, targetId, details, ipAddress) {
  // Add to action history
  this.actionHistory.unshift({
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    timestamp: new Date()
  });

  // Keep only last 1000 actions
  if (this.actionHistory.length > 1000) {
    this.actionHistory = this.actionHistory.slice(0, 1000);
  }

  this.totalActions += 1;
  this.lastActiveAt = new Date();

  return this.save();
};

// Update admin stats
adminSchema.methods.updateStats = function(statType, increment = 1) {
  if (this.stats[statType] !== undefined) {
    this.stats[statType] += increment;
    return this.save();
  }
  return Promise.resolve(this);
};

// Check if admin has required role for action
adminSchema.methods.canPerformAction = function(requiredRole, requiredPermission) {
  const roleHierarchy = {
    'super_admin': 4,
    'content_moderator': 3,
    'inventory_manager': 2,
    'customer_support': 1
  };

  const hasRequiredRole = roleHierarchy[this.adminRole] >= roleHierarchy[requiredRole];
  const hasPermission = this.hasPermission(requiredPermission);

  return hasRequiredRole && hasPermission;
};

export default mongoose.model("Admin", adminSchema);