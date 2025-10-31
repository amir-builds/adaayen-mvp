import Fabric from "../models/Fabric.js";

// ✅ CREATE FABRIC (Admin only)
export const createFabric = async (req, res) => {
  try {
    const { name, description, price, fabricType, color, inStock } = req.body;
    // Support multiple uploaded images (req.files) while remaining backward-compatible
    const uploadedFiles = req.files || (req.file ? [req.file] : []);

    const images = uploadedFiles
      .map((f) => f?.path || f?.secure_url || f?.url)
      .filter(Boolean);

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
      inStock
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
    const fabrics = await Fabric.find().sort({ createdAt: -1 });
    res.json(fabrics);
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
    const newImages = uploadedFiles.map((f) => f?.path || f?.secure_url || f?.url).filter(Boolean);
    if (newImages.length > 0) {
      fabric.images = Array.isArray(fabric.images) ? fabric.images.concat(newImages) : newImages;
      // Ensure primary image exists
      if (!fabric.imageUrl && fabric.images.length > 0) {
        fabric.imageUrl = fabric.images[0];
      }
    }

    // Update other fields from body
    const updatable = ['name', 'description', 'price', 'fabricType', 'color', 'inStock'];
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

    await Fabric.deleteOne({ _id: req.params.id });

    res.json({ message: "Fabric deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
