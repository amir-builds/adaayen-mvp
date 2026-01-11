import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Clock, User, Briefcase } from "lucide-react";

const Creators = () => {
  const [creators, setCreators] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await api.get("/creators");
        // Handle both old (array) and new (object with pagination) response formats
        const creatorsArray = Array.isArray(res.data) ? res.data : (res.data?.creators || []);
        setCreators(creatorsArray);
      } catch (err) {
        console.error("Failed to load creators", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  const filtered = creators.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Talented Creators
          </h1>
          <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl">
            Connect with skilled designers and creators from around the world
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators by name or skills..."
              className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 shadow-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {filtered.length} {filtered.length === 1 ? "Creator" : "Creators"} Available
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No creators found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((creator) => (
              <Link
                to={`/creators/${creator._id}`}
                key={creator._id}
                className="block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Card Header with Profile */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={creator.profilePic || "/public/default-avatar.png"}
                        alt={creator.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                        {creator.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Creator</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 min-h-[60px]">
                    {creator.bio || "Passionate creator dedicated to bringing your vision to life with exceptional quality and attention to detail."}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">5.0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>0 projects</span>
                    </div>
                  </div>

                  {/* Tags/Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                      Design
                    </span>
                    <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded-md text-xs font-medium">
                      Fashion
                    </span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                      Textiles
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Member since {new Date(creator.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Bottom Border */}
                <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Creators;
