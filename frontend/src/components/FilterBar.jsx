import React from 'react';

export default function FilterBar({ filter, setFilter }) {
  return (
    <div className="sticky top-16 z-40 bg-white border-b shadow-sm py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Discover & Shop</h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('fabrics')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium transition ${
                filter === 'fabrics'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">Fabrics Only</span>
              <span className="sm:hidden">Fabrics</span>
            </button>
            <button
              onClick={() => setFilter('posts')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium transition ${
                filter === 'posts'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">Designs Only</span>
              <span className="sm:hidden">Designs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}