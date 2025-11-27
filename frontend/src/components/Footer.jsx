import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adaayien
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">Premium fabrics meet creative designs. Your one-stop fabric marketplace.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Shop</h4>
            <div className="space-y-1.5 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
              <p className="hover:text-white cursor-pointer">All Fabrics</p>
              <p className="hover:text-white cursor-pointer">New Arrivals</p>
              <p className="hover:text-white cursor-pointer">Best Sellers</p>
              <p className="hover:text-white cursor-pointer">Sale</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
            <div className="space-y-1.5 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
              <p className="hover:text-white cursor-pointer">Shipping Info</p>
              <p className="hover:text-white cursor-pointer">Returns</p>
              <p className="hover:text-white cursor-pointer">FAQs</p>
              <p className="hover:text-white cursor-pointer">Contact Us</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Connect</h4>
            <div className="space-y-1.5 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
              <p className="hover:text-white cursor-pointer">Instagram</p>
              <p className="hover:text-white cursor-pointer">Pinterest</p>
              <p className="hover:text-white cursor-pointer">WhatsApp</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          © 2025 Adaayien. All rights reserved. | Premium Fabric Marketplace
        </div>
      </div>
    </footer>
  );
}