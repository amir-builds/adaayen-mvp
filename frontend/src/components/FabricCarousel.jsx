import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

export default function FabricCarousel({ fabricData, onFabricClick }) {
  return (
    <section className="py-8 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Premium Fabrics on Offer</h3>
            <p className="text-sm text-gray-600 mt-1">Limited time deals on best quality fabrics</p>
          </div>
          <button className="text-purple-600 font-semibold text-sm hover:text-purple-800 flex items-center gap-1">
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="overflow-hidden">
          <div className="flex gap-4 animate-scroll">
            {[...fabricData, ...fabricData].map((fabric, idx) => (
              <div 
                key={`${fabric.id}-${idx}`}
                className="flex-shrink-0 w-64 group cursor-pointer"
                onClick={() => onFabricClick(fabric)}
              >
                <div className="h-64 rounded-lg relative overflow-hidden">
                  <img 
                    src={fabric.imageUrl}
                    alt={fabric.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    20% OFF
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="text-white" size={36} />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-gray-900 text-sm">{fabric.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{fabric.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-400 line-through text-xs">₹{parseInt(fabric.price.match(/\d+/)[0]) + 50}</span>
                    <span className="font-bold text-purple-600">{fabric.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  );
}