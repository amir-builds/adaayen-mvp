import React, { useState, useEffect } from 'react';
import PostCard from '../components/Feed/PostCard';
import PostModal from '../components/PostModal';
import api from '../utils/api';
import { Filter } from 'lucide-react';

export default function AllDesigns() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postImageIndices, setPostImageIndices] = useState({});
  const [filterType, setFilterType] = useState('all'); // all, featured

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/posts');
        const data = res.data || [];
        setPosts(data);
        setFilteredPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (filterType === 'featured') {
      setFilteredPosts(posts.filter(p => p.isFeatured));
    } else {
      setFilteredPosts(posts);
    }
  }, [filterType, posts]);

  const openPostModal = (post) => {
    setSelectedPost(post);
  };

  const closePostModal = () => {
    setSelectedPost(null);
  };

  const nextPostImage = (postId, imagesLength) => {
    setPostImageIndices(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % imagesLength
    }));
  };

  const prevPostImage = (postId, imagesLength) => {
    setPostImageIndices(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + imagesLength) % imagesLength
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            All Designs
          </h1>
          <p className="text-gray-600 mb-6">
            Explore creative designs from talented creators
          </p>

          {/* Filter Buttons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter size={20} />
              <span className="font-medium">Filter:</span>
            </div>
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Designs ({posts.length})
            </button>
            <button
              onClick={() => setFilterType('featured')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filterType === 'featured'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Featured ({posts.filter(p => p.isFeatured).length})
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No designs found</h3>
            <p className="text-gray-500">
              {filterType === 'featured' 
                ? 'No featured designs at the moment' 
                : 'Be the first to create a design!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map(post => {
              const postId = post._id || post.id;
              const imageIndex = postImageIndices[postId] || 0;
              const imagesLength = post.images?.length || 1;
              
              return (
                <PostCard
                  key={postId}
                  post={post}
                  imageIndex={imageIndex}
                  onNextImage={() => nextPostImage(postId, imagesLength)}
                  onPrevImage={() => prevPostImage(postId, imagesLength)}
                  onClick={() => openPostModal(post)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        post={selectedPost}
        onClose={closePostModal}
      />
    </div>
  );
}
