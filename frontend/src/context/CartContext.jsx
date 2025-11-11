import React, { createContext, useContext, useState, useEffect } from 'react';
import * as cartAPI from '../utils/cartAPI';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart when user is authenticated
  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.getCart();
      setCart(data);
    } catch (err) {
      // If user not authenticated or cart doesn't exist, set empty cart
      if (err.response?.status === 401) {
        setCart(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (fabricId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure quantity is a number
      const numQuantity = Number(quantity);
      if (isNaN(numQuantity) || numQuantity < 0.5) {
        throw new Error('Invalid quantity. Must be at least 0.5 meters');
      }
      
      const data = await cartAPI.addToCart(fabricId, numQuantity);
      setCart(data.cart);
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Cart error:', err.message);
      
      // Handle validation errors (422)
      let message;
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Show first validation error
        message = err.response.data.errors[0]?.msg || err.response.data.message;
      } else {
        message = err.response?.data?.message || err.message || 'Failed to add item to cart';
      }
      
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateItem = async (fabricId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.updateCartItem(fabricId, quantity);
      setCart(data.cart);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (fabricId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.removeFromCart(fabricId);
      setCart(data.cart);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.clearCart();
      setCart(data.cart);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Get cart item count
  const getItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Get cart total
  const getTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.quantity * item.pricePerMeter), 0);
  };

  const value = {
    cart,
    loading,
    error,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    getItemCount,
    getTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
