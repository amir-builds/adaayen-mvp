import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

// Lightweight placeholder until backend implementation
const fabricPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='320' viewBox='0 0 400 320'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3EFabric Image%3C/text%3E%3C/svg%3E";

// Optimized fabric images (only loaded when needed)
const fabricImages = [
  "https://images.pexels.com/photos/4622424/pexels-photo-4622424.jpeg?auto=compress&cs=tinysrgb&w=400&h=320&fit=crop",
  "https://images.pexels.com/photos/6766608/pexels-photo-6766608.jpeg?auto=compress&cs=tinysrgb&w=400&h=320&fit=crop",
  "https://images.pexels.com/photos/5867230/pexels-photo-5867230.jpeg?auto=compress&cs=tinysrgb&w=400&h=320&fit=crop",
  "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400&h=320&fit=crop",
  "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400&h=320&fit=crop",
  "https://images.pexels.com/photos/6801651/pexels-photo-6801651.jpeg?auto=compress&cs=tinysrgb&w=400&h=320&fit=crop"
];

export default function FabricCard({ fabric, onClick }) {
  const [selected, setSelected] = useState(0);
  const imgs = Array.isArray(fabric.images) && fabric.images.length > 0 ? fabric.images : (fabric.imageUrl ? [fabric.imageUrl] : [fabricImages[0]]);

  return (
    <div 
      className="bg-white overflow-hidden group cursor-pointer"
      onClick={() => onClick(fabric)}
    >
      <div className="h-80 relative overflow-hidden">
        <img 
          src={imgs[selected] || (fabric.imageUrl ? fabric.imageUrl : fabricPlaceholder)} 
          alt={fabric.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fabricPlaceholder;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-center">
            <Sparkles className="mx-auto mb-2 text-white" size={40} />
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        
        <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110">
          <Heart size={18} className="text-gray-700" />
        </button>
        {/* Thumbnails row (show when multiple images) */}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 justify-center">
            {imgs.map((src, idx) => (
              <button key={idx} onClick={(ev) => { ev.stopPropagation(); setSelected(idx); }} className={`w-10 h-10 rounded overflow-hidden border ${selected===idx? 'ring-2 ring-purple-500': 'ring-0'}`}>
                <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" loading="lazy" onError={(e)=>{e.target.onerror=null;e.target.src=fabricPlaceholder}} />
              </button>
            ))}
          </div>
        )}
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