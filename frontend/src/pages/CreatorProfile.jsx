import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import CreatorHeader from "../components/Creator/CreatorHeader";
import CreatorTabs from "../components/Creator/CreatorTabs";
import CreatorPosts from "../components/Creator/CreatorPosts";
import CreatorAbout from "../components/Creator/CreatorAbout";

const CreatorProfile = () => {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get(`/creators/${id}`),
          api.get(`/posts/creator/${id}`),
        ]);
        setCreator(cRes.data);
        // Handle both old (array) and new (object with pagination) response formats
        const postsArray = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.posts || []);
        setPosts(postsArray);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Creator not found</h2>
          <p className="text-gray-500">This creator profile doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <CreatorHeader creator={creator} postCount={posts.length} />

        {/* Tabs & Content */}
        <div className="mt-6">
          <CreatorTabs active={activeTab} onChange={setActiveTab} />

          <div className="mt-6">
            {activeTab === "posts" && <CreatorPosts posts={posts} />}
            {activeTab === "about" && <CreatorAbout creator={creator} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;