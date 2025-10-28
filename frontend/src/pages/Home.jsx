import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FabricCarousel from '../components/FabricCarousel';
import FilterBar from '../components/FilterBar';
import FeedGrid from '../components/Feed/FeedGrid';
import FabricModal from '../components/FabricModal';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import { fabricData } from '../data/fabricData';
import { posts } from '../data/postsData';
import { createInterleavedFeed, filterFeed } from '../utils/observer';

export default function Home() {
  const [filter, setFilter] = useState('all');
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [postImageIndices, setPostImageIndices] = useState({});
  const [displayedItems, setDisplayedItems] = useState(8);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  // Create interleaved feed
  const interleavedFeed = createInterleavedFeed(fabricData, posts, 20);
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
      <Navbar />
      
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm">
        New fabrics in stock | Free delivery on orders above rupees 2000
      </div>

      <HeroSection />
      
      <FabricCarousel 
        fabricData={fabricData} 
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
      />

      <HowItWorks />
      
      <Footer />
    </div>
  );
}