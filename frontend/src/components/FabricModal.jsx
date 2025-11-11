import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function FabricModal({ 
  fabric, 
  currentImageIndex, 
  onClose, 
  onNextImage, 
  onPrevImage,
  onImageSelect,
  onViewAll 
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const { success, error: showError } = useToast();

  // Quantity state (must be before early return)
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Price parsing and formatting helpers
  const parsePrice = (val) => {
    if (typeof val === 'number') return val;
    const cleaned = String(val ?? '').replace(/[^0-9.-]+/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatPrice = (val) => {
    const n = parsePrice(val);
    return `$${n.toFixed(2)}`;
  };

  // Memoized values (must be before early return)
  const pricePerMeter = useMemo(() => fabric ? parsePrice(fabric.price) : 0, [fabric]);

  const quantityOptions = useMemo(() => {
    const opts = [];
    for (let i = 0.5; i <= 10; i += 0.5) {
      opts.push(+(i.toFixed(1)));
    }
    return opts;
  }, []);

  const totalPrice = useMemo(() => pricePerMeter * quantity, [pricePerMeter, quantity]);

  // Effects (must be before early return)
  useEffect(() => {
    const handleKey = (e) => {
      if (!fabric) return;
      if (e.key === 'ArrowRight') onNextImage();
      if (e.key === 'ArrowLeft') onPrevImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fabric, onNextImage, onPrevImage, onClose]);

  // Early return AFTER all hooks
  if (!fabric) return null;

  const images = Array.isArray(fabric.images) && fabric.images.length > 0 ? fabric.images : (fabric.imageUrl ? [fabric.imageUrl] : []);

  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(10, +(prev + 0.5).toFixed(1)));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(0.5, +(prev - 0.5).toFixed(1)));
  };

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showError('Please login to add items to cart');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    // Validate fabric ID (support both _id from backend and id from UI)
    const fabricId = fabric._id || fabric.id;
    if (!fabric || !fabricId) {
      showError('Invalid fabric. Please try again.');
      return;
    }

    setAddingToCart(true);
    try {
      const result = await addItem(fabricId, quantity);
      if (result.success) {
        // Show success feedback
        success(`Added ${quantity}m of ${fabric.name} to cart!`);
      } else {
        // Show specific error from backend
        showError(result.message || 'Failed to add to cart. Please try again.');
      }
    } catch (err) {
      console.error('Cart error:', err.message);
      showError(err.message || 'Unable to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" ref={containerRef}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">{fabric.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={24} /></button>
        </div>

        <div className="md:flex">
          <div className="md:w-3/5 p-6">
            <div className="relative">
              <div className="h-96 rounded-xl bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {images.length > 0 ? (
                  <img src={images[currentImageIndex]} alt={`${fabric.name} - ${currentImageIndex + 1}`} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>

              <button onClick={onPrevImage} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg"><ChevronLeft size={24} /></button>
              <button onClick={onNextImage} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg"><ChevronRight size={24} /></button>

              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">{currentImageIndex + 1} / {images.length}</div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => onImageSelect(idx)} aria-label={`Select image ${idx + 1}`} className={`h-20 rounded-lg overflow-hidden ${currentImageIndex === idx ? 'ring-4 ring-purple-600' : 'opacity-80 hover:opacity-100'}`}>
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="md:w-2/5 p-6 border-l">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Price per meter</p>
              <p className="text-4xl font-bold text-purple-600 mb-2">{formatPrice(fabric.price)}</p>
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{fabric.inStock ? 'In Stock' : 'Out of Stock'}</div>
            </div>

            <p className="text-gray-700 mb-6">{fabric.fullDescription}</p>

            <div className="flex flex-wrap gap-2 mb-6">{(fabric.tags || []).map((tag, i) => (<span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">{tag}</span>))}</div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Width:</span><span className="font-medium">{fabric.specs?.width || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Weight:</span><span className="font-medium">{fabric.specs?.weight || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Care:</span><span className="font-medium">{fabric.specs?.care || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Composition:</span><span className="font-medium">{fabric.specs?.composition || '-'}</span></div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Designs made with this</p>
                  <p className="text-2xl font-bold text-purple-600">{fabric.designs || 0}</p>
                </div>
                <button 
                  onClick={() => onViewAll && onViewAll(fabric)}
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-1 hover:underline"
                >
                  View All →
                </button>
              </div>
            </div>

            {/* Quantity selector and calculator */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Select Quantity (meters)</label>
              <div className="flex items-center gap-3 mb-4">
                <button 
                  onClick={decrementQuantity}
                  aria-label="Decrease quantity"
                  className="p-2 rounded-full border border-purple-300 hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 0.5}
                >
                  <Minus size={18} className="text-purple-700" />
                </button>
                <select 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {quantityOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt} m</option>
                  ))}
                </select>
                <button 
                  onClick={incrementQuantity}
                  aria-label="Increase quantity"
                  className="p-2 rounded-full border border-purple-300 hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity >= 10}
                >
                  <Plus size={18} className="text-purple-700" />
                </button>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                <span className="text-sm font-medium text-gray-700">Total Price:</span>
                <span className="text-2xl font-bold text-purple-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart || !fabric.inStock}
                className="w-full bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                {addingToCart ? 'Adding...' : `Add to Cart (${quantity}m)`}
              </button>
              <button 
                onClick={() => navigate('/cart')}
                className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-full hover:bg-purple-50 transition font-semibold"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}