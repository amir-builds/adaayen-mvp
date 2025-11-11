import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, loading, loadCart, updateItem, removeItem, clearCartItems, getTotal } = useCart();
  const navigate = useNavigate();
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (fabricId, newQuantity) => {
    if (newQuantity < 0.5) return;
    setUpdatingItem(fabricId);
    await updateItem(fabricId, newQuantity);
    setUpdatingItem(null);
  };

  const handleRemoveItem = async (fabricId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeItem(fabricId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await clearCartItems();
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₹0.00';
    return `₹${Number(price).toFixed(2)}`;
  };  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading cart...</div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart size={32} />
              Shopping Cart
            </h1>
            {!isEmpty && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Start adding fabrics to your cart!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition font-semibold"
            >
              Browse Fabrics
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-sm p-6 flex gap-4"
                >
                  {/* Image */}
                  <div className="w-32 h-32 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.fabric?.imageUrl || item.fabric?.images?.[0] ? (
                      <img
                        src={item.fabric.imageUrl || item.fabric.images[0]}
                        alt={item.fabric.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.fabric?.name || 'Fabric'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.fabric?.fabricType} • {item.fabric?.color}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.fabric._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {formatPrice(item.pricePerMeter)} per meter
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.fabric._id, item.quantity - 0.5)}
                          disabled={updatingItem === item.fabric._id || item.quantity <= 0.5}
                          className="p-1.5 rounded-full border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg font-medium min-w-[4rem] text-center">
                          {item.quantity} m
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.fabric._id, item.quantity + 0.5)}
                          disabled={updatingItem === item.fabric._id}
                          className="p-1.5 rounded-full border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">
                          {formatPrice(item.quantity * item.pricePerMeter)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cart.items.length})</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-purple-600">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 transition font-semibold mb-3"
                  onClick={() => alert('Checkout coming soon!')}
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-full hover:bg-purple-50 transition font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
