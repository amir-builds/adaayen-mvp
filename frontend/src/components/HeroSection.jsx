import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import api from '../utils/api';

// Default hero images - can be updated via admin panel later
const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1558769132-cb1aea3f5050?w=1920&q=80',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1920&q=80',
  'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1920&q=80',
  'https://images.unsplash.com/photo-1610032697745-c8e5f0ef3c40?w=1920&q=80'
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState(DEFAULT_HERO_IMAGES);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Fetch custom hero images from backend
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await api.get('/settings/hero-images');
        if (response.data.images && response.data.images.length > 0) {
          setHeroImages(response.data.images);
        }
      } catch (err) {
        // Use default images if API fails
        console.log('Using default hero images');
      }
    };
    fetchHeroImages();
  }, []);

  return (
    <section className="relative h-[400px] sm:h-[450px] md:h-96 overflow-hidden">
      {/* Background Images with Transition */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${image})` }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10">
        <div className="text-white max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Premium Fabrics Meet Creative Designs
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-purple-100">
            Buy quality fabrics. Get inspired by creators. Bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Link 
              to="/shop"
              className="bg-white text-purple-600 px-5 sm:px-6 py-2.5 sm:py-2 rounded-full font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ShoppingBag size={18} />
              Shop Fabrics
            </Link>
            <Link 
              to="/designs"
              className="border-2 border-white text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition text-center text-sm sm:text-base"
            >
              Browse Designs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}