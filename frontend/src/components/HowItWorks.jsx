import React from 'react';
import { ShoppingBag, ShoppingCart, Scissors } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">How Adaayien Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-semibold mb-2">Browse Fabrics & Designs</h4>
            <p className="text-gray-600">Discover premium fabrics and see what creators make with them</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-semibold mb-2">Order Your Fabric</h4>
            <p className="text-gray-600">Select quality fabrics at the best prices, delivered to you</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-semibold mb-2">Connect with Creators</h4>
            <p className="text-gray-600">Get your fabric stitched into beautiful designs</p>
          </div>
        </div>
      </div>
    </section>
  );
}