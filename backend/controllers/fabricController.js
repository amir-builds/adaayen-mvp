import Fabric from "../models/Fabric.js";

// ✅ CREATE FABRIC (Admin only)
export const createFabric = async (req, res) => {
  try {
    const { name, description, price, fabricType, color, imageUrl, inStock } = req.body;

    const newFabric = new Fabric({
      name,
      description,
      price,
      fabricType,
      color,
      imageUrl,
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

    // Update fields
    Object.assign(fabric, req.body);
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
