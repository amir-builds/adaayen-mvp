import Fabric from "../models/Fabric.js";
import { deleteImagesFromMeta } from '../utils/cloudinary.js';

// ✅ CREATE FABRIC (Admin only)
export const createFabric = async (req, res) => {
  try {
    const { name, description, price, fabricType, color, inStock, specs } = req.body;
    // Support multiple uploaded images (req.files) while remaining backward-compatible
    const uploadedFiles = req.files || (req.file ? [req.file] : []);

    // Build both a simple images array (urls) for backward compat with frontend
    // and an imagesMeta array containing { url, public_id } for Cloudinary management
    const images = [];
    const imagesMeta = [];

    uploadedFiles.forEach((f) => {
      const url = f?.path || f?.secure_url || f?.url;
      const public_id = f?.filename || f?.public_id || f?.publicId || f?.public_id;
      if (url) images.push(url);
      imagesMeta.push({ url: url || null, public_id: public_id || null });
    });

    // If images array is empty but imagesMeta contains urls, populate images from imagesMeta
    if (images.length === 0 && imagesMeta.length > 0) {
      const fromMeta = imagesMeta.map(m => m.url).filter(Boolean);
      if (fromMeta.length > 0) images.push(...fromMeta);
    }

    // Fallback: allow passing imageUrl in body (backwards compatibility)
    if (images.length === 0 && req.body.imageUrl) {
      images.push(req.body.imageUrl);
    }

    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required. Please upload an image.' });
    }

    const imageUrl = images[0]; // primary image (for backward compatibility)

    const newFabric = new Fabric({
      name,
      description,
      price,
      fabricType,
      color,
      imageUrl,
      images,
      imagesMeta,
      inStock,
      specs
    });

    const savedFabric = await newFabric.save();

    res.status(201).json({
      message: "Fabric created successfully",
      fabric: savedFabric,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL FABRICS (Public)
export const getAllFabrics = async (req, res) => {
  try {
    const Post = (await import("../models/Post.js")).default;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100" 
      });
    }
    
    // Get total count for pagination metadata
    const totalFabrics = await Fabric.countDocuments();
    const totalPages = Math.ceil(totalFabrics / limit);
    
    // Fetch paginated fabrics
    const fabrics = await Fabric.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Add post count for each fabric
    const fabricsWithCount = await Promise.all(
      fabrics.map(async (fabric) => {
        const postCount = await Post.countDocuments({ fabric: fabric._id });
        return { ...fabric, designs: postCount };
      })
    );
    
    res.json({
      fabrics: fabricsWithCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalFabrics,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET FABRIC BY ID (Public)
export const getFabricById = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    
    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }
    
    res.json(fabric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE FABRIC (Admin only)
export const updateFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    
    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    // If a new image was uploaded, update imageUrl accordingly
    // If new images were uploaded, append them to the images array and update primary image if needed
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    const newUrls = [];
    const newMeta = [];

    uploadedFiles.forEach((f) => {
      const url = f?.path || f?.secure_url || f?.url;
      const public_id = f?.filename || f?.public_id || f?.publicId || f?.public_id;
      if (url) newUrls.push(url);
      newMeta.push({ url: url || null, public_id: public_id || null });
    });

    // If no explicit URLs but imagesMeta contains urls, derive newUrls
    if (newUrls.length === 0 && newMeta.length > 0) {
      const fromMeta = newMeta.map(m => m.url).filter(Boolean);
      if (fromMeta.length > 0) newUrls.push(...fromMeta);
    }

    if (newUrls.length > 0) {
      // append to existing images (legacy could be array of strings)
      fabric.images = Array.isArray(fabric.images) ? fabric.images.concat(newUrls) : newUrls;
      // append to imagesMeta (if schema previously lacked imagesMeta, this will create)
      fabric.imagesMeta = Array.isArray(fabric.imagesMeta) ? fabric.imagesMeta.concat(newMeta) : newMeta;
      // Ensure primary image exists
      if (!fabric.imageUrl && fabric.images.length > 0) {
        fabric.imageUrl = fabric.images[0];
      }
    }

    // Update other fields from body
    const updatable = ['name', 'description', 'price', 'fabricType', 'color', 'inStock', 'specs'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) fabric[field] = req.body[field];
    });

    const updatedFabric = await fabric.save();
    
    res.json({
      message: "Fabric updated successfully",
      fabric: updatedFabric
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE FABRIC (Admin only)
export const deleteFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    
    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    // Delete images from Cloudinary with proper verification
    let deletionWarnings = [];
    if (fabric.imagesMeta && fabric.imagesMeta.length > 0) {
      console.log(`🗑️ Deleting ${fabric.imagesMeta.length} images for fabric ${req.params.id}`);
      
      const deletionResult = await deleteImagesFromMeta(fabric.imagesMeta);
      
      if (deletionResult.failed > 0) {
        const failedImages = deletionResult.results
          .filter(r => !r.success)
          .map(r => r.publicId);
        
        console.error(`❌ Failed to delete ${deletionResult.failed} images:`, failedImages);
        deletionWarnings.push(`${deletionResult.failed} image(s) could not be deleted from cloud storage`);
      }
      
      console.log(`✅ Successfully deleted ${deletionResult.successful} of ${fabric.imagesMeta.length} images`);
    }

    // Delete fabric from database
    await Fabric.deleteOne({ _id: req.params.id });

    const response = { 
      message: "Fabric deleted successfully",
      imagesDeleted: fabric.imagesMeta?.length || 0
    };
    
    if (deletionWarnings.length > 0) {
      response.warnings = deletionWarnings;
    }

    res.json(response);
  } catch (error) {
    console.error('Error deleting fabric:', error);
    res.status(500).json({ message: error.message });
  }
};
