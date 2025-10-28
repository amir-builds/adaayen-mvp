import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function FabricCard({ fabric, onClick }) {
  return (
    <div 
      className="bg-white overflow-hidden group cursor-pointer"
      onClick={() => onClick(fabric)}
    >
      <div className={`h-80 ${fabric.texture} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-center">
            <Sparkles className="mx-auto mb-2 text-white" size={40} />
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        
        <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110">
          <Heart size={18} className="text-gray-700" />
        </button>
      </div>

      <div className="py-3">
        <h3 className="font-bold text-gray-900 mb-1 text-base">{fabric.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{fabric.description}</p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-900">{fabric.price}</p>
          <p className="text-xs text-gray-500">{fabric.designs} designs</p>
        </div>
      </div>
    </div>
  );
}