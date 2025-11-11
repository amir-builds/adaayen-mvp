import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PostCard from '../components/Feed/PostCard';
import PostModal from '../components/PostModal';
import api from '../utils/api';

export default function FabricDesigns() {
  const { fabricId } = useParams();
  const navigate = useNavigate();
  const [fabric, setFabric] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postImageIndices, setPostImageIndices] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch fabric details
        const fabricRes = await api.get(`/fabrics/${fabricId}`);
        setFabric(fabricRes.data);

        // Fetch all posts and filter by this fabric
        const postsRes = await api.get('/posts');
        const allPosts = postsRes.data || [];
        
        // Filter posts that use this fabric
        const fabricPosts = allPosts.filter(p => {
          return p.fabric?._id === fabricId || p.fabric?.id === fabricId || p.fabric === fabricId;
        });

        setPosts(fabricPosts);
      } catch (err) {
        console.error('Failed to fetch fabric designs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fabricId]);

  const openPostModal = (post) => {
    setSelectedPost(post);
  };

  const closePostModal = () => {
    setSelectedPost(null);
  };

  // Post image navigation handlers
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          {fabric && (
            <div className="flex items-start gap-6">
              <img
                src={fabric.imageUrl || fabric.images?.[0]}
                alt={fabric.name}
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Designs Made with {fabric.name}
                </h1>
                <p className="text-gray-600 mb-2">{fabric.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>₹{typeof fabric.price === 'number' ? fabric.price.toFixed(2) : fabric.price}</span>
                  <span>•</span>
                  <span>{posts.length} {posts.length === 1 ? 'Design' : 'Designs'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No designs yet</h3>
            <p className="text-gray-500">
              Be the first creator to design something beautiful with this fabric!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map(post => {
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
