import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Navbar is provided at the app root (in App.jsx). Do not import here to avoid duplicate navbars.
import HeroSection from '../components/HeroSection';
import FabricCarousel from '../components/FabricCarousel';
import FilterBar from '../components/FilterBar';
import FeedGrid from '../components/Feed/FeedGrid';
import FabricModal from '../components/FabricModal';
import PostModal from '../components/PostModal';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import { fabricData as localFabricData } from '../data/fabricData';
import { posts } from '../data/postsData';
import { createInterleavedFeed, filterFeed } from '../utils/observer';
import { getAllFabrics } from '../utils/fabricAPI';
import api from '../utils/api';
import { Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [postImageIndices, setPostImageIndices] = useState({});
  const [displayedItems, setDisplayedItems] = useState(8);
  const [loading, setLoading] = useState(false);
  const [apiPosts, setApiPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const observerTarget = useRef(null);

  // Fabrics state (start with local fallback)
  const [fabrics, setFabrics] = useState(localFabricData);

  // Fetch fabrics from API
  useEffect(() => {
    let mounted = true;
    const fetchFabrics = async () => {
      try {
        const data = await getAllFabrics();
        if (mounted && Array.isArray(data)) {
          // Normalize backend fabric shape to UI-friendly shape
          const mapped = data.map(f => ({
            _id: f._id, // Keep original MongoDB _id for cart/API operations
            id: f._id || f.id, // Also provide id for compatibility
            name: f.name,
            // UI expects an images array; use imageUrl as single image
            images: f.images || (f.imageUrl ? [f.imageUrl] : []),
            // price in UI is shown as string with currency
            price: typeof f.price === 'number' ? `₹${f.price}` : f.price || '',
            description: f.description || '',
            fullDescription: f.description || f.fullDescription || '',
            tags: f.tags || [],
            specs: f.specs || { width: 'N/A', weight: 'N/A', care: 'N/A', composition: 'N/A' },
            designs: f.designs || 0,
            inStock: f.inStock !== undefined ? f.inStock : true,
            color: f.color || '',
            fabricType: f.fabricType || '',
            imageUrl: f.imageUrl || (f.images && f.images[0]) || ''
          }));

          setFabrics(mapped);
        }
      } catch (err) {
        // keep local fallback if API fails
        console.warn('Failed to fetch fabrics, using local data', err.message || err);
      }
    };
    fetchFabrics();

    // Listen for fabrics created in admin and prepend to list
    const onCreated = (e) => {
      const f = e?.detail;
      if (!f) return;
      const mapped = {
        _id: f._id, // Keep original MongoDB _id
        id: f._id || f.id,
        name: f.name,
        images: f.images || (f.imageUrl ? [f.imageUrl] : []),
        price: typeof f.price === 'number' ? `₹${f.price}` : f.price || '',
        description: f.description || '',
        fullDescription: f.description || f.fullDescription || '',
        tags: f.tags || [],
        specs: f.specs || { width: 'N/A', weight: 'N/A', care: 'N/A', composition: 'N/A' },
        designs: f.designs || 0,
        inStock: f.inStock !== undefined ? f.inStock : true,
        color: f.color || '',
        fabricType: f.fabricType || '',
        imageUrl: f.imageUrl || (f.images && f.images[0]) || ''
      };
      setFabrics(prev => [mapped, ...prev]);
    };
    window.addEventListener('fabric:created', onCreated);
    return () => { mounted = false; window.removeEventListener('fabric:created', onCreated); };
  }, []);

  // Fetch all posts from API
  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        const data = res.data || [];
        if (mounted && Array.isArray(data)) {
          // Map posts from API - preserve full creator object for modal
          const mappedPosts = data.map(p => ({
            ...p,
            type: 'post',
            id: p._id,
            images: p.images || (p.imageUrl ? [p.imageUrl] : []),
            // Keep full creator object, don't convert to string
            creator: p.creator
          }));
          setApiPosts(mappedPosts);
        }
      } catch (err) {
        console.warn('Failed to fetch posts from API, using local data', err.message || err);
        // Fallback to local data if API fails
        setApiPosts(posts);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
    return () => { mounted = false; };
  }, []);

  // Show only featured posts on homepage
  const featuredPosts = apiPosts.filter(p => p.isFeatured);
  
  const interleavedFeed = createInterleavedFeed(fabrics, featuredPosts, 20);
  const filteredFeed = filterFeed(interleavedFeed, filter);
  const visibleFeed = filteredFeed.slice(0, displayedItems);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && displayedItems < filteredFeed.length) {
          setLoading(true);
          setTimeout(() => {
            setDisplayedItems(prev => Math.min(prev + 12, filteredFeed.length));
            setLoading(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, displayedItems, filteredFeed.length]);

  // Reset displayed items when filter changes
  useEffect(() => {
    setDisplayedItems(12);
  }, [filter]);

  // Fabric modal handlers
  const openFabricModal = (fabric) => {
    setSelectedFabric(fabric);
    setCurrentImageIndex(0);
  };

  const closeFabricModal = () => {
    setSelectedFabric(null);
    setCurrentImageIndex(0);
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
  };

  const closePostModal = () => {
    setSelectedPost(null);
  };

  const viewFabricDesigns = (fabric) => {
    // Navigate to dedicated fabric designs page
    const fabricId = fabric.id || fabric._id;
    navigate(`/fabric/${fabricId}/designs`);
  };

  const nextImage = () => {
    if (selectedFabric) {
      setCurrentImageIndex((prev) => 
        prev === selectedFabric.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedFabric) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedFabric.images.length - 1 : prev - 1
      );
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
  {/* Navbar is rendered by App; kept out of page to avoid duplicate navbars */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm">
        New fabrics in stock | Free delivery on orders above rupees 2000
      </div>

      <HeroSection />
      
      <FabricCarousel 
        fabricData={fabrics} 
        onFabricClick={openFabricModal} 
      />
      
      <FilterBar 
        filter={filter} 
        setFilter={setFilter} 
      />
      
      <FeedGrid
        visibleFeed={visibleFeed}
        loading={loading}
        displayedItems={displayedItems}
        filteredFeedLength={filteredFeed.length}
        onFabricClick={openFabricModal}
        onPostClick={openPostModal}
        postImageIndices={postImageIndices}
        onNextPostImage={nextPostImage}
        onPrevPostImage={prevPostImage}
        observerTarget={observerTarget}
      />

      <FabricModal
        fabric={selectedFabric}
        currentImageIndex={currentImageIndex}
        onClose={closeFabricModal}
        onNextImage={nextImage}
        onPrevImage={prevImage}
        onImageSelect={setCurrentImageIndex}
        onViewAll={viewFabricDesigns}
      />
      
      <PostModal
        post={selectedPost}
        onClose={closePostModal}
      />
      
      <HowItWorks />
      <Footer />
    </div>
  );
}