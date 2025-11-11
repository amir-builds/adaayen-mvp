// Utility function to create interleaved feed
// Pattern: 1 post per row, rest filled with fabrics (1 post + 3 fabrics per 4 items)
export const createInterleavedFeed = (fabricData, posts, repeatCount = 20) => {
  const interleavedFeed = [];
  
  if (fabricData.length === 0) return interleavedFeed;
  
  let fabricIndex = 0;
  let postIndex = 0;
  
  // Create feed with 1 post randomly placed in each row of 4
  for (let row = 0; row < repeatCount; row++) {
    // Random position for post in this row (0-3)
    const postPosition = Math.floor(Math.random() * 4);
    
    for (let col = 0; col < 4; col++) {
      // Place post at random position, fabrics elsewhere
      if (col === postPosition && posts.length > 0) {
        interleavedFeed.push({ 
          type: 'post', 
          data: Object.assign({}, posts[postIndex % posts.length], { uniqueId: `p-${row}-${col}` })
        });
        postIndex++;
      } else {
        interleavedFeed.push({ 
          type: 'fabric', 
          data: Object.assign({}, fabricData[fabricIndex % fabricData.length], { uniqueId: `f-${row}-${col}` })
        });
        fabricIndex++;
      }
    }
  }
  
  return interleavedFeed;
};

// Utility function to filter feed
export const filterFeed = (interleavedFeed, filter) => {
  if (filter === 'all') return interleavedFeed;
  if (filter === 'fabrics') return interleavedFeed.filter(item => item.type === 'fabric');
  if (filter === 'posts') return interleavedFeed.filter(item => item.type === 'post');
  
  // Filter by specific fabric ID - show only posts that use this fabric
  return interleavedFeed.filter(item => {
    if (item.type !== 'post') return false;
    const post = item.data;
    // Check if post's fabric matches the filter (fabric ID or _id)
    return post.fabric?._id === filter || post.fabric?.id === filter || post.fabric === filter;
  });
};