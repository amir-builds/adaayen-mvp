import React from 'react';
import FabricCard from './FabricCard';
import PostCard from './PostCard';

export default function FeedGrid({ 
  visibleFeed, 
  loading, 
  displayedItems, 
  filteredFeedLength,
  onFabricClick,
  postImageIndices,
  onNextPostImage,
  onPrevPostImage,
  observerTarget 
}) {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleFeed.map((item, index) => (
            <div key={item.data.uniqueId || index}>
              {item.type === 'fabric' ? (
                <FabricCard 
                  fabric={item.data} 
                  onClick={onFabricClick}
                />
              ) : (
                <PostCard
                  post={item.data}
                  imageIndex={postImageIndices[item.data.id] || 0}
                  onNextImage={() => onNextPostImage(item.data.id, item.data.images.length)}
                  onPrevImage={() => onPrevPostImage(item.data.id, item.data.images.length)}
                />
              )}
            </div>
          ))}
        </div>
        
        <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
          {loading && displayedItems < filteredFeedLength && (
            <div className="flex items-center gap-2 text-purple-600">
              <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Loading more...</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}