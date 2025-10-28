// Utility function to create interleaved feed
export const createInterleavedFeed = (fabricData, posts, repeatCount = 20) => {
  const interleavedFeed = [];
  
  for (let i = 0; i < Math.max(fabricData.length, posts.length) * repeatCount; i++) {
    const fabricIndex = i % fabricData.length;
    const postIndex = i % posts.length;
    
    if (i % 2 === 0) {
      interleavedFeed.push({ 
        type: 'fabric', 
        data: { ...fabricData[fabricIndex], uniqueId: `f-${i}` } 
      });
    } else {
      interleavedFeed.push({ 
        type: 'post', 
        data: { ...posts[postIndex], uniqueId: `p-${i}` } 
      });
    }
  }
  
  return interleavedFeed;
};

// Utility function to filter feed
export const filterFeed = (interleavedFeed, filter) => {
  if (filter === 'all') return interleavedFeed;
  if (filter === 'fabrics') return interleavedFeed.filter(item => item.type === 'fabric');
  if (filter === 'posts') return interleavedFeed.filter(item => item.type === 'post');
  return interleavedFeed;
};