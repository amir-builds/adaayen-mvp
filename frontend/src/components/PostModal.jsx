import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, User, Mail, Heart, Share2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PostModal({ post, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!post) return null;

  const images = post.images || (post.imageUrl ? [post.imageUrl] : []);
  const creator = post.creator;
  const creatorName = typeof creator === 'string' ? creator : creator?.name || 'Unknown Creator';
  const creatorId = typeof creator === 'object' ? creator?._id : null;
  const creatorProfilePic = typeof creator === 'object' ? creator?.profilePic : null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
          <h3 className="text-xl font-bold text-white truncate">{post.title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row max-h-[calc(90vh-80px)]">
          {/* Left Side - Image Gallery */}
          <div className="md:w-2/3 bg-gray-900 relative flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={post.title}
                  className="max-h-[500px] w-full object-contain"
                />
                
                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                    >
                      <ChevronLeft size={24} className="text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                    >
                      <ChevronRight size={24} className="text-gray-800" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition ${
                            idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-white text-center">No images available</div>
            )}
          </div>

          {/* Right Side - Details & Creator Info */}
          <div className="md:w-1/3 overflow-y-auto">
            {/* Creator Info Card */}
            <div className="p-6 border-b bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center gap-4 mb-4">
                {creatorProfilePic ? (
                  <img
                    src={creatorProfilePic}
                    alt={creatorName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-600"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-800">{creatorName}</h4>
                  <p className="text-sm text-gray-600">Textile Creator</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {creatorId && (
                  <Link
                    to={`/creators/${creatorId}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                  >
                    <User size={18} />
                    View Profile
                  </Link>
                )}
                <button
                  onClick={handleShare}
                  className="px-4 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Post Details */}
            <div className="p-6 space-y-4">
              {/* Description */}
              {post.description && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">About this Design</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">{post.description}</p>
                </div>
              )}

              {/* Price */}
              {post.price && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-700 font-medium">Price</span>
                  <span className="text-2xl font-bold text-green-600">₹{post.price}</span>
                </div>
              )}

              {/* Fabric Details */}
              {post.fabric && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <ExternalLink size={16} />
                    Fabric Used
                  </h5>
                  <p className="text-purple-700 font-medium">
                    {typeof post.fabric === 'string' ? post.fabric : post.fabric?.name || 'View in feed'}
                  </p>
                  {post.fabricType && (
                    <p className="text-sm text-gray-600 mt-1">Type: {post.fabricType}</p>
                  )}
                </div>
              )}

              {/* Fabric Link */}
              {post.fabricLink && (
                <a
                  href={post.fabricLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition text-center"
                >
                  <span className="text-blue-600 font-medium">View Fabric Details →</span>
                </a>
              )}

              {/* Featured Badge */}
              {post.isFeatured && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-300">
                  <span className="text-2xl">⭐</span>
                  <span className="font-semibold text-orange-700">Featured Design</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
