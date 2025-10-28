import React from 'react';
import { ShoppingCart, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Adaayien
            </h1>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Home</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Shop Fabrics</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Creators</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">About</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <ShoppingCart size={20} className="text-gray-700" />
            </button>
            <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition">
              <User size={18} />
              <span className="hidden sm:inline">Login</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}