import React from 'react';

export default function FilterBar({ filter, setFilter }) {
  return (
    <div className="sticky top-16 z-40 bg-white border-b shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Discover & Shop</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('fabrics')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filter === 'fabrics'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Fabrics Only
            </button>
            <button
              onClick={() => setFilter('posts')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filter === 'posts'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Designs Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}