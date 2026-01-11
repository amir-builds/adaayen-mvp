import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Star } from 'lucide-react';
import ImageUpload from '../components/Creator/ImageUpload';

// Reusable form for create & update
function FabricForm({ initial = {}, onCancel, onSaved }) {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [price, setPrice] = useState(initial.price || '');
  const [fabricType, setFabricType] = useState(initial.fabricType || '');
  const [color, setColor] = useState(initial.color || '');
  const [inStock, setInStock] = useState(initial.inStock ?? true);
  // Specifications
  const [width, setWidth] = useState(initial.specs?.width || '');
  const [weight, setWeight] = useState(initial.specs?.weight || '');
  const [care, setCare] = useState(initial.specs?.care || '');
  const [composition, setComposition] = useState(initial.specs?.composition || '');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('price', price);
      fd.append('fabricType', fabricType);
      fd.append('color', color);
      fd.append('inStock', inStock);
      // Add specifications
      fd.append('specs[width]', width);
      fd.append('specs[weight]', weight);
      fd.append('specs[care]', care);
      fd.append('specs[composition]', composition);
      files.forEach((f) => fd.append('images', f));

      let res;
      if (initial._id) {
        res = await api.put(`/fabrics/${initial._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/fabrics', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      onSaved(res.data.fabric || res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-red-600">{error}</div>}
      <input className="w-full border px-2 py-2 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <select className="w-full border px-2 py-2 rounded bg-white" value={fabricType} onChange={(e) => setFabricType(e.target.value)} required>
        <option value="">-- Select Fabric Type --</option>
        <option value="Cotton">Cotton</option>
        <option value="Silk">Silk</option>
        <option value="Linen">Linen</option>
        <option value="Denim">Denim</option>
        <option value="Wool">Wool</option>
        <option value="Polyester">Polyester</option>
        <option value="Net">Net</option>
        <option value="Velvet">Velvet</option>
        <option value="Chiffon">Chiffon</option>
        <option value="Georgette">Georgette</option>
        <option value="Crepe">Crepe</option>
        <option value="Satin">Satin</option>
        <option value="Organza">Organza</option>
        <option value="Rayon">Rayon</option>
        <option value="Muslin">Muslin</option>
        <option value="Other">Other</option>
      </select>
      <input className="w-full border px-2 py-2 rounded" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price (per meter)</label>
        <input className="w-full border px-2 py-2 rounded" placeholder="e.g., 125.50" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>
      <textarea className="w-full border px-2 py-2 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      
      {/* Specifications Section */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Fabric Specifications</h3>
        <div className="grid grid-cols-2 gap-3">
          <input 
            className="w-full border px-2 py-2 rounded" 
            placeholder="Width (e.g., 44 inches)" 
            value={width} 
            onChange={(e) => setWidth(e.target.value)} 
          />
          <input 
            className="w-full border px-2 py-2 rounded" 
            placeholder="Weight (e.g., 150 GSM)" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
          />
          <input 
            className="w-full border px-2 py-2 rounded" 
            placeholder="Care (e.g., Dry clean only)" 
            value={care} 
            onChange={(e) => setCare(e.target.value)} 
          />
          <input 
            className="w-full border px-2 py-2 rounded" 
            placeholder="Composition (e.g., 100% Cotton)" 
            value={composition} 
            onChange={(e) => setComposition(e.target.value)} 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In Stock</label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Images (you can add multiple)</label>
        <ImageUpload
          images={files}
          onChange={setFiles}
          maxFiles={6}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const [fabrics, setFabrics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [activeTab, setActiveTab] = useState('fabrics');
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  
  // Hero images state
  const [heroImages, setHeroImages] = useState([]);
  const [heroFiles, setHeroFiles] = useState([]);
  const [heroLoading, setHeroLoading] = useState(false);

  const fetchFabrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fabrics');
      const data = Array.isArray(res.data) ? res.data : res.data.fabrics || res.data;
      setFabrics(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load fabrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await api.get('/admin/posts');
      const data = res.data.posts || res.data || [];
      setPosts(Array.isArray(data) ? data : []);
      setPostsError(null);
    } catch (err) {
      setPostsError(err.response?.data?.message || err.message || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch hero images
  const fetchHeroImages = async () => {
    try {
      const res = await api.get('/settings/hero-images');
      setHeroImages(res.data.images || []);
    } catch (err) {
      console.error('Failed to load hero images:', err);
    }
  };

  // Upload hero images
  const uploadHeroImages = async () => {
    if (heroFiles.length === 0) {
      alert('Please select images first');
      return;
    }
    setHeroLoading(true);
    try {
      const fd = new FormData();
      fd.append('existingImages', JSON.stringify(heroImages));
      heroFiles.forEach((file) => fd.append('images', file));
      
      const res = await api.put('/settings/hero-images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setHeroImages(res.data.images || []);
      setHeroFiles([]);
      alert('✅ Hero images updated successfully!');
    } catch (err) {
      alert('❌ Failed to upload images: ' + (err.response?.data?.message || err.message));
    } finally {
      setHeroLoading(false);
    }
  };

  // Delete hero image
  const deleteHeroImage = async (imageUrl) => {
    if (!confirm('Delete this hero image?')) return;
    setHeroLoading(true);
    try {
      const res = await api.delete('/settings/hero-images', {
        data: { imageUrl }
      });
      setHeroImages(res.data.images || []);
      alert('✅ Image deleted successfully!');
    } catch (err) {
      alert('❌ Failed to delete image: ' + (err.response?.data?.message || err.message));
    } finally {
      setHeroLoading(false);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'settings') {
      fetchHeroImages();
    }
  }, [activeTab]);

  const onDelete = async (id) => {
    if (!confirm('Delete this fabric?')) return;
    try {
      await api.delete(`/fabrics/${id}`);
      setFabrics((s) => s.filter((f) => f._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const onSaved = (fabric) => {
    setFabrics((prev) => {
      const idx = prev.findIndex((p) => p._id === fabric._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = fabric;
        return copy;
      }
      return [fabric, ...prev];
    });
    setEditing(null);
    setShowNew(false);
    try {
      window.dispatchEvent(new CustomEvent('fabric:created', { detail: fabric }));
    } catch (e) {
      /* ignore */
    }
  };

  const toggleFeaturePost = async (postId, currentStatus) => {
    try {
      await api.patch(`/admin/posts/${postId}/feature`, { isFeatured: !currentStatus });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, isFeatured: !currentStatus } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update post');
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          {activeTab === 'fabrics' && (
            <button onClick={() => { setEditing(null); setShowNew(true); }} className="bg-green-600 text-white px-3 py-2 rounded">Add Fabric</button>
          )}
          <button onClick={activeTab === 'fabrics' ? fetchFabrics : fetchPosts} className="px-3 py-2 border rounded">Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('fabrics')}
          className={`pb-2 px-4 font-semibold transition ${activeTab === 'fabrics' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Fabrics
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-2 px-4 font-semibold transition ${activeTab === 'posts' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-4 font-semibold transition ${activeTab === 'settings' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Settings
        </button>
      </div>

      {/* FABRICS TAB */}
      {activeTab === 'fabrics' && (
        <>
          {showNew && (
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Add new fabric</h2>
              <FabricForm initial={{}} onCancel={() => setShowNew(false)} onSaved={onSaved} />
            </div>
          )}

          {editing && (
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Edit fabric</h2>
              <FabricForm initial={editing} onCancel={() => setEditing(null)} onSaved={onSaved} />
            </div>
          )}

          {loading ? (
            <div>Loading fabrics...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fabrics.map((f) => (
                <div key={f._id} className="bg-white p-4 rounded shadow">
                  <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center">
                    {f.images && f.images[0] ? (
                      <img src={f.images[0]} alt={f.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-gray-400">No image</div>
                    )}
                  </div>
                  <h3 className="font-semibold">{f.name}</h3>
                  <div className="text-sm text-gray-600">{f.fabricType} • {f.color}</div>
                  <div className="mt-2 font-medium">₹{f.price}</div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setEditing(f); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1 border rounded">Edit</button>
                    <button onClick={() => onDelete(f._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <>
          {postsLoading ? (
            <div>Loading posts...</div>
          ) : postsError ? (
            <div className="text-red-600">{postsError}</div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-gray-600">No posts found</div>
              ) : (
                posts.map((post) => (
                  <div key={post._id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
                    <div className="flex gap-4">
                      {/* Post image */}
                      <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {post.images && post.images[0] ? (
                          <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-400 text-xs">No image</div>
                        )}
                      </div>

                      {/* Post info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">By {post.creator?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{post.description?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{post.images?.length || 0} images</span>
                          {post.tags && post.tags.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{post.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 justify-center items-end">
                        <button
                          onClick={() => toggleFeaturePost(post._id, post.isFeatured)}
                          className={`flex items-center gap-2 px-3 py-2 rounded transition ${
                            post.isFeatured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={post.isFeatured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star size={16} fill={post.isFeatured ? 'currentColor' : 'none'} />
                          <span className="text-sm font-semibold">{post.isFeatured ? 'Featured' : 'Feature'}</span>
                        </button>
                        <button
                          onClick={() => deletePost(post._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Hero Banner Settings</h2>
          
          {/* Current Hero Images */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Current Hero Images ({heroImages.length})</h3>
            {heroImages.length === 0 ? (
              <p className="text-gray-500">No hero images configured. Using default images.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {heroImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Hero ${index + 1}`} 
                      className="w-full h-40 object-cover rounded"
                    />
                    <button
                      onClick={() => deleteHeroImage(url)}
                      disabled={heroLoading}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload New Images */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Add New Hero Images</h3>
            <ImageUpload
              images={heroFiles}
              onChange={setHeroFiles}
              maxFiles={10}
            />
            <button
              onClick={uploadHeroImages}
              disabled={heroLoading || heroFiles.length === 0}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {heroLoading ? 'Uploading...' : 'Upload Images'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Recommended: 1920x600px landscape images. Images will auto-rotate every 5 seconds on the homepage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
