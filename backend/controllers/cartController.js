import Cart from "../models/Cart.js";
import Fabric from "../models/Fabric.js";

// ✅ GET USER'S CART
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.fabric");
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADD ITEM TO CART
export const addToCart = async (req, res) => {
  try {
    const { fabricId, quantity } = req.body;

    if (!fabricId) {
      return res.status(400).json({ message: "Fabric ID is required" });
    }

    const parsedQuantity = parseFloat(quantity) || 1;
    if (parsedQuantity < 0.5) {
      return res.status(400).json({ message: "Minimum quantity is 0.5 meters" });
    }

    // Verify fabric exists
    const fabric = await Fabric.findById(fabricId);
    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    if (!fabric.inStock) {
      return res.status(400).json({ message: "This fabric is currently out of stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.fabric.toString() === fabricId
    );

    if (existingItemIndex > -1) {
      // Update quantity if already exists
      cart.items[existingItemIndex].quantity += parsedQuantity;
    } else {
      // Add new item
      cart.items.push({
        fabric: fabricId,
        quantity: parsedQuantity,
        pricePerMeter: fabric.price,
      });
    }

    await cart.save();
    await cart.populate("items.fabric");

    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { fabricId, quantity } = req.body;

    if (!fabricId) {
      return res.status(400).json({ message: "Fabric ID is required" });
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0.5) {
      return res.status(400).json({ message: "Invalid quantity. Minimum is 0.5 meters" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.fabric.toString() === fabricId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = parsedQuantity;
    await cart.save();
    await cart.populate("items.fabric");

    res.json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ REMOVE ITEM FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { fabricId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.fabric.toString() !== fabricId
    );

    await cart.save();
    await cart.populate("items.fabric");

    res.json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CLEAR ENTIRE CART
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
