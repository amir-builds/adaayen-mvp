import React, { useState, useEffect } from 'react';
import { getAllFabrics } from '../utils/fabricAPI';
import FabricModal from '../components/FabricModal';
import { Sparkles, Filter } from 'lucide-react';

// Fabric categories with descriptions and images
const fabricCategories = [
  { 
    name: 'Cotton', 
    description: 'Natural, breathable comfort',
    image: 'https://cdn.pixabay.com/photo/2017/08/07/15/36/fabric-2604063_1280.jpg',
    gradient: 'from-blue-400 to-blue-600'
  },
  { 
    name: 'Silk', 
    description: 'Luxury and elegance',
    image: 'https://cdn.pixabay.com/photo/2016/02/19/10/56/silk-1209077_1280.jpg',
    gradient: 'from-purple-400 to-purple-600'
  },
  { 
    name: 'Linen', 
    description: 'Cool and crisp',
    image: 'https://cdn.pixabay.com/photo/2017/08/07/15/36/fabric-2604063_1280.jpg',
    gradient: 'from-green-400 to-green-600'
  },
  { 
    name: 'Denim', 
    description: 'Casual durability',
    image: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400',
    gradient: 'from-indigo-400 to-indigo-600'
  },
  { 
    name: 'Wool', 
    description: 'Warm and cozy',
    image: 'https://images.unsplash.com/photo-1608241402706-6f5e6e1f2f1e?w=400',
    gradient: 'from-orange-400 to-orange-600'
  },
  { 
    name: 'Polyester', 
    description: 'Easy care, versatile',
    image: 'https://cdn.pixabay.com/photo/2017/08/07/15/36/fabric-2604063_1280.jpg',
    gradient: 'from-pink-400 to-pink-600'
  },
  { 
    name: 'Chiffon', 
    description: 'Sheer and flowing',
    image: 'https://cdn.pixabay.com/photo/2016/02/19/10/56/silk-1209077_1280.jpg',
    gradient: 'from-teal-400 to-teal-600'
  },
  { 
    name: 'Velvet', 
    description: 'Rich and plush',
    image: 'https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=400',
    gradient: 'from-red-400 to-red-600'
  },
  { 
    name: 'Net', 
    description: 'Delicate and decorative',
    image: 'https://cdn.pixabay.com/photo/2017/08/07/15/36/fabric-2604063_1280.jpg',
    gradient: 'from-cyan-400 to-cyan-600'
  },
  { 
    name: 'Georgette', 
    description: 'Lightweight drape',
    image: 'https://cdn.pixabay.com/photo/2016/02/19/10/56/silk-1209077_1280.jpg',
    gradient: 'from-rose-400 to-rose-600'
  },
  { 
    name: 'Crepe', 
    description: 'Textured elegance',
    image: 'https://cdn.pixabay.com/photo/2017/08/07/15/36/fabric-2604063_1280.jpg',
    gradient: 'from-violet-400 to-violet-600'
  },
  { 
    name: 'Satin', 
    description: 'Smooth and lustrous',
    image: 'https://cdn.pixabay.com/photo/2016/02/19/10/56/silk-1209077_1280.jpg',
    gradient: 'from-amber-400 to-amber-600'
  },
];

export default function ShopFabrics() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch fabrics from API
  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        setLoading(true);
        const data = await getAllFabrics(currentPage, 50); // Fetch 50 items per page
        // Handle both old (array) and new (object with pagination) response formats
        if (Array.isArray(data)) {
          setFabrics(data);
          setPagination(null);
        } else {
          setFabrics(data.fabrics || []);
          setPagination(data.pagination || null);
        }
      } catch (err) {
        console.error('Failed to fetch fabrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFabrics();
  }, [currentPage]);

  // Filter fabrics by category
  const filteredFabrics = selectedCategory === 'All' 
    ? fabrics 
    : fabrics.filter(f => f.fabricType === selectedCategory);

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
    if (selectedFabric && selectedFabric.images) {
      setCurrentImageIndex(prev => 
        prev === selectedFabric.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedFabric && selectedFabric.images) {
      setCurrentImageIndex(prev => 
        prev === 0 ? selectedFabric.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Categories */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Shop Premium Fabrics</h1>
            <p className="text-purple-100 text-lg">
              Discover quality fabrics for your creative projects
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {/* All Category */}
            <button
              onClick={() => setSelectedCategory('All')}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                selectedCategory === 'All' 
                  ? 'ring-4 ring-white shadow-2xl scale-105' 
                  : 'hover:scale-105 shadow-lg'
              }`}
            >
              <div className={`h-32 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center`}>
                <div className="text-center">
                  <Filter className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">All Fabrics</p>
                  <p className="text-white text-xs opacity-90">{fabrics.length} items</p>
                </div>
              </div>
            </button>

            {fabricCategories.map((category) => {
              const count = fabrics.filter(f => f.fabricType === category.name).length;
              if (count === 0) return null; // Hide categories with no fabrics
              
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                    selectedCategory === category.name 
                      ? 'ring-4 ring-white shadow-2xl scale-105' 
                      : 'hover:scale-105 shadow-lg'
                  }`}
                >
                  <div className={`h-32 bg-gradient-to-br ${category.gradient} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition-opacity"></div>
                    <div className="text-center relative z-10">
                      <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-white font-bold text-sm">{category.name}</p>
                      <p className="text-white text-xs opacity-90">{count} items</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Category Info */}
          {selectedCategory !== 'All' && (
            <div className="text-center">
              <p className="text-white text-lg">
                Showing <span className="font-bold">{filteredFabrics.length}</span> {selectedCategory} fabric{filteredFabrics.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Fabrics Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading fabrics...</p>
            </div>
          ) : filteredFabrics.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No fabrics found in this category.</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
              >
                View All Fabrics
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFabrics.map((fabric) => (
                <div
                  key={fabric._id}
                  onClick={() => openFabricModal(fabric)}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Fabric Image */}
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={fabric.imageUrl || fabric.images?.[0] || 'https://via.placeholder.com/400'}
                      alt={fabric.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {fabric.inStock ? (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        In Stock
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Fabric Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{fabric.name}</h3>
                      <span className="text-purple-600 font-bold text-lg whitespace-nowrap ml-2">
                        ₹{typeof fabric.price === 'number' ? fabric.price.toFixed(2) : fabric.price}/m
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                        {fabric.fabricType}
                      </span>
                      {fabric.color && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {fabric.color}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {fabric.description}
                    </p>

                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  pagination.hasPrevPage
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  pagination.hasNextPage
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Fabric Modal */}
      <FabricModal
        fabric={selectedFabric}
        currentImageIndex={currentImageIndex}
        onClose={closeFabricModal}
        onNextImage={nextImage}
        onPrevImage={prevImage}
        onImageSelect={setCurrentImageIndex}
      />
    </div>
  );
}
