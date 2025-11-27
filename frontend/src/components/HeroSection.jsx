import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-[400px] sm:h-[450px] md:h-96 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
        }}></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
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