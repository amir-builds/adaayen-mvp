// backend/controllers/fabricController.js
import Fabric from "../models/Fabric.js";
import Creator from "../models/Creator.js";

// ✅ CREATE FABRIC
export const createFabric = async (req, res) => {
  try {
    const newFabric = new Fabric({ ...req.body, creator: req.user.id });
    const savedFabric = await newFabric.save();

    // Link fabric to creator
    const creator = await Creator.findById(req.user.id);
    if (creator) {
      creator.fabrics = creator.fabrics || [];
      creator.fabrics.push(savedFabric._id);
      await creator.save();
    }

    res.status(201).json({
      message: "Fabric created successfully",
      fabric: savedFabric,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL FABRICS
export const getAllFabrics = async (req, res) => {
  try {
    const fabrics = await Fabric.find().populate("creator", "name email");
    res.json(fabrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET FABRIC BY ID
export const getFabricById = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id).populate("creator", "name email");
    if (!fabric) return res.status(404).json({ message: "Fabric not found" });
    res.json(fabric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE FABRIC
export const updateFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ message: "Fabric not found" });

    // Check ownership
    if (fabric.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(fabric, req.body);
    const updatedFabric = await fabric.save();
    res.json(updatedFabric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE FABRIC
export const deleteFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return res.status(404).json({ message: "Fabric not found" });

    // Check ownership
    if (fabric.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Fabric.deleteOne({ _id: req.params.id });

    // Remove from creator
    await Creator.findByIdAndUpdate(req.user.id, {
      $pull: { fabrics: fabric._id },
    });

    res.json({ message: "Fabric deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
