import Fabric from "../models/Fabric.js";
import { v2 as cloudinary } from 'cloudinary';

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
    const fabrics = await Fabric.find().sort({ createdAt: -1 }).lean();
    
    // Add post count for each fabric
    const fabricsWithCount = await Promise.all(
      fabrics.map(async (fabric) => {
        const postCount = await Post.countDocuments({ fabric: fabric._id });
        return { ...fabric, designs: postCount };
      })
    );
    
    res.json(fabricsWithCount);
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

    // If imagesMeta exists, attempt to remove each file from Cloudinary
    try {
      const toDelete = (fabric.imagesMeta || []).map((m) => m?.public_id).filter(Boolean);
      if (toDelete.length > 0) {
        await Promise.all(
          toDelete.map(async (pid) => {
            try {
              await cloudinary.uploader.destroy(pid);
            } catch (err) {
              // log and continue
              console.error('Cloudinary delete failed for', pid, err?.message || err);
            }
          })
        );
      }
    } catch (err) {
      console.error('Error while deleting cloudinary images for fabric', req.params.id, err?.message || err);
    }

    await Fabric.deleteOne({ _id: req.params.id });

    res.json({ message: "Fabric deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
