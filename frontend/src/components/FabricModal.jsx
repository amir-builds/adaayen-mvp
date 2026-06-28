import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Minus, Plus, ZoomIn, Expand } from 'lucide-react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageHovered, setImageHovered] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Price parsing and formatting helpers
  const parsePrice = (val) => {
    if (typeof val === 'number') return val;
    const cleaned = String(val ?? '').replace(/[^0-9.-]+/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatPrice = (n) => {
    if (!n && n !== 0) return '';
    // If already a formatted string with currency, return as is
    if (typeof n === 'string' && n.includes('₹')) return n;
    // Convert to number and format
    const num = typeof n === 'number' ? n : parseFloat(n);
    if (isNaN(num)) return '';
    return `₹${num.toFixed(2)}`;
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
  const lightboxNext = useCallback(() => {
    if (!fabric) return;
    const imgs = Array.isArray(fabric.images) && fabric.images.length > 0 ? fabric.images : (fabric.imageUrl ? [fabric.imageUrl] : []);
    setLightboxIndex(prev => (prev + 1) % imgs.length);
  }, [fabric]);

  const lightboxPrev = useCallback(() => {
    if (!fabric) return;
    const imgs = Array.isArray(fabric.images) && fabric.images.length > 0 ? fabric.images : (fabric.imageUrl ? [fabric.imageUrl] : []);
    setLightboxIndex(prev => (prev - 1 + imgs.length) % imgs.length);
  }, [fabric]);

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (!fabric) return;
      if (lightboxOpen) {
        if (e.key === 'ArrowRight') lightboxNext();
        else if (e.key === 'ArrowLeft') lightboxPrev();
        else if (e.key === 'Escape') closeLightbox();
      } else {
        if (e.key === 'ArrowRight') onNextImage();
        else if (e.key === 'ArrowLeft') onPrevImage();
        else if (e.key === 'Escape') onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fabric, onNextImage, onPrevImage, onClose, lightboxOpen, lightboxNext, lightboxPrev]);

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
    const user = localStorage.getItem('creator');
    
    if (!token || !user) {
      showError('Please login to add items to cart');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    // Additional check - verify user object is valid
    try {
      JSON.parse(user);
    } catch {
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
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" ref={containerRef}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">{fabric.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={24} /></button>
        </div>

        <div className="md:flex">
          <div className="md:w-3/5 p-6">
            <div className="relative">
              {/* Main image — click to open lightbox */}
              <div
                className="h-96 rounded-xl bg-gray-100 relative overflow-hidden flex items-center justify-center"
                style={{ cursor: 'zoom-in' }}
                onClick={() => images.length > 0 && openLightbox(currentImageIndex)}
                onMouseEnter={() => setImageHovered(true)}
                onMouseLeave={() => setImageHovered(false)}
                title="Click to view full image"
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={`${fabric.name} - ${currentImageIndex + 1}`}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease',
                        transform: imageHovered ? 'scale(1.04)' : 'scale(1)',
                      }}
                      loading="lazy"
                    />
                    {/* Zoom hint overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: imageHovered ? 'rgba(0,0,0,0.08)' : 'transparent',
                        transition: 'background 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.55)',
                          color: '#fff',
                          borderRadius: '50%',
                          padding: '10px',
                          opacity: imageHovered ? 1 : 0,
                          transition: 'opacity 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ZoomIn size={22} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>

              <button onClick={(e) => { e.stopPropagation(); onPrevImage(); }} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg"><ChevronLeft size={24} /></button>
              <button onClick={(e) => { e.stopPropagation(); onNextImage(); }} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg"><ChevronRight size={24} /></button>

              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">{currentImageIndex + 1} / {images.length}</div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => onImageSelect(idx)}
                  aria-label={`Select image ${idx + 1}`}
                  className={`h-20 rounded-lg overflow-hidden transition-all duration-200 ${currentImageIndex === idx ? 'ring-4 ring-purple-600' : 'opacity-80 hover:opacity-100'}`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" loading="lazy" />
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

      {/* ══ Full-Screen Lightbox (Myntra / Amazon style) ══ */}
      {lightboxOpen && images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image viewer"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            userSelect: 'none',
          }}
          /* Touch swipe support for mobile */
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            const dy = e.changedTouches[0].clientY - touchStartY.current;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
              dx < 0 ? lightboxNext() : lightboxPrev();
            }
            touchStartX.current = null;
            touchStartY.current = null;
          }}
        >
          {/* ── Top bar ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              flexShrink: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px', lineHeight: 1.2 }}>
                {fabric.name}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginTop: '2px' }}>
                {lightboxIndex + 1} of {images.length}
              </span>
            </div>
            <button
              onClick={closeLightbox}
              aria-label="Close"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* ── Main image — fills entire screen ── */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${fabric.name} image ${lightboxIndex + 1}`}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                /* slight fade-in on image change */
                animation: 'lbFadeIn 0.2s ease',
              }}
            />

            {/* Prev arrow — hidden on very small screens, shown md+ */}
            {images.length > 1 && (
              <>
                <button
                  onClick={lightboxPrev}
                  aria-label="Previous image"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                  }}
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={lightboxNext}
                  aria-label="Next image"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                  }}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* ── Bottom: thumbnails (desktop) + dot indicators (mobile) ── */}
          <div
            style={{
              flexShrink: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
              padding: '12px 16px 20px',
            }}
          >
            {/* Dot indicators — always visible */}
            {images.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                    style={{
                      width: lightboxIndex === idx ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '9999px',
                      background: lightboxIndex === idx ? '#fff' : 'rgba(255,255,255,0.35)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.25s ease',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip — visible on md+ screens */}
            {images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                }}
                className="hidden-on-mobile"
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    style={{
                      flexShrink: 0,
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: lightboxIndex === idx ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                      opacity: lightboxIndex === idx ? 1 : 0.55,
                      transform: lightboxIndex === idx ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none',
                    }}
                  >
                    <img
                      src={img}
                      alt={`thumb ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '8px' }}>
              Swipe or use ← → keys &nbsp;·&nbsp; Tap outside to close
            </p>
          </div>

          {/* Keyframe for fade-in animation — injected once */}
          <style>{`
            @keyframes lbFadeIn { from { opacity: 0.4; } to { opacity: 1; } }
            @media (max-width: 640px) { .hidden-on-mobile { display: none !important; } }
          `}</style>
        </div>
      )}
    </>
  );
}