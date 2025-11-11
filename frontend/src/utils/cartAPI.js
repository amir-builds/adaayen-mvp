import api from './api';

// Get user's cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// Add item to cart
export const addToCart = async (fabricId, quantity = 1) => {
  // Ensure quantity is sent as a number
  const payload = { 
    fabricId, 
    quantity: Number(quantity) 
  };
  console.log('Adding to cart:', payload);
  const response = await api.post('/cart', payload);
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (fabricId, quantity) => {
  const response = await api.put('/cart', { fabricId, quantity });
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (fabricId) => {
  const response = await api.delete(`/cart/${fabricId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};
