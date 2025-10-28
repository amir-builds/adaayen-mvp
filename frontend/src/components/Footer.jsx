import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adaayien
            </h3>
            <p className="text-gray-400 text-sm">Premium fabrics meet creative designs. Your one-stop fabric marketplace.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <p className="hover:text-white cursor-pointer">All Fabrics</p>
              <p className="hover:text-white cursor-pointer">New Arrivals</p>
              <p className="hover:text-white cursor-pointer">Best Sellers</p>
              <p className="hover:text-white cursor-pointer">Sale</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <p className="hover:text-white cursor-pointer">Shipping Info</p>
              <p className="hover:text-white cursor-pointer">Returns</p>
              <p className="hover:text-white cursor-pointer">FAQs</p>
              <p className="hover:text-white cursor-pointer">Contact Us</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <p className="hover:text-white cursor-pointer">Instagram</p>
              <p className="hover:text-white cursor-pointer">Pinterest</p>
              <p className="hover:text-white cursor-pointer">WhatsApp</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          © 2025 Adaayien. All rights reserved. | Premium Fabric Marketplace
        </div>
      </div>
    </footer>
  );
}