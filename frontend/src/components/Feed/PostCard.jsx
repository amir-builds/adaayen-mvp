import React from 'react';
import { Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PostCard({ post, imageIndex, onNextImage, onPrevImage }) {
  return (
    <div className="bg-white overflow-hidden group cursor-pointer">
      <div className="relative">
        <div className={`h-80 ${post.images[imageIndex]} flex items-center justify-center text-white relative overflow-hidden`}>
          <div className="text-7xl">👗</div>
          
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
            {post.fabricName}
          </div>
          
          <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110">
            <Heart size={18} className="text-gray-700" />
          </button>
          
          {post.images.length > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="py-3">
        <p className="font-semibold text-gray-900 text-sm mb-1">{post.creator}</p>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Heart size={14} />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} />
            {post.comments}
          </span>
        </div>
      </div>
    </div>
  );
}