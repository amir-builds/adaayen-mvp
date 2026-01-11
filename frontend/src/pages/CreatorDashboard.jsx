import React, { useEffect, useState } from "react";
import api from "../utils/api";
import PostForm from "../components/Creator/PostForm";
import { User, Briefcase, Plus, Edit, Trash2, Image, TrendingUp, Eye, Heart } from "lucide-react";

const CreatorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes, statsRes] = await Promise.all([
          api.get("/creators/profile"),
          api.get("/creators/profile").then(p => api.get(`/posts/creator/${p.data._id}`)),
          api.get("/creators/stats")
        ]);
        
        setProfile(profileRes.data);
        // Handle both old (array) and new (object with pagination) response formats
        const postsArray = Array.isArray(postsRes.data) ? postsRes.data : (postsRes.data?.posts || []);
        setPosts(postsArray);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load dashboard. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { name, bio, profilePic } = e.target.elements;
      const res = await api.put("/creators/profile", {
        name: name.value,
        bio: bio.value,
        profilePic: profilePic.value,
      });
      setProfile(res.data);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrUpdatePost = async (postData, uploadedImages = []) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append text fields
      Object.keys(postData).forEach(key => {
        if (postData[key] !== undefined && postData[key] !== null && key !== '_id') {
          formData.append(key, postData[key]);
        }
      });
      
      // Append images
      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      if (postData._id) {
        const res = await api.put(`/posts/${postData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setPosts((prev) => prev.map((p) => (p._id === res.data._id ? res.data : p)));
        setEditingPost(null);
        alert("✅ Post updated successfully!");
      } else {
        const res = await api.post(`/posts`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setPosts((prev) => [res.data, ...prev]);
        setEditingPost(null);
        alert("✅ Post created successfully!");
      }
    } catch (err) {
      console.error('Error saving post:', err.message);
      const errorMsg = err.response?.data?.message || err.message || "Failed to save post";
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      alert("✅ Post deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.profilePic || "/public/default-avatar.png"}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold">Creator Dashboard</h1>
              <p className="text-purple-100 mt-1">Welcome back, {profile.name}!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || posts.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Featured Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.featuredPosts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.recentPosts || 0}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profile Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.profileCompletion || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200 mb-6">
          <div className="flex gap-1 px-2 pt-2">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === "posts"
                  ? "bg-white text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              My Posts
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === "profile"
                  ? "bg-white text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Profile Settings
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    name="name"
                    defaultValue={profile.name}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture URL</label>
                  <input
                    name="profilePic"
                    defaultValue={profile.profilePic}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={profile.bio}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={6}
                  placeholder="Tell the world about yourself and your work..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Your Posts ({posts.length})
              </h2>
              <button
                onClick={() => setEditingPost({})}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>

            {editingPost && (
              <div className="mb-6">
                <PostForm
                  initial={editingPost}
                  onCancel={() => setEditingPost(null)}
                  onSubmit={handleCreateOrUpdatePost}
                />
              </div>
            )}

            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Image className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-6">Start sharing your work with the world!</p>
                <button
                  onClick={() => setEditingPost({})}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={post.imageUrl || "/public/default-image.png"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.isFeatured && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{post.description}</p>

                      {post.price && (
                        <div className="text-purple-600 font-semibold mb-3">₹{post.price}</div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPost(post)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
