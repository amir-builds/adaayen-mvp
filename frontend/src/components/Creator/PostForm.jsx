import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, DollarSign } from "lucide-react";
import ImageUpload from "./ImageUpload";
import api from "../../utils/api";

const PostForm = ({ initial = {}, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    imageUrl: initial.imageUrl || "",
    price: initial.price || "",
    fabricLink: initial.fabricLink || "",
    fabricType: initial.fabricType || "",
    fabric: initial.fabric?._id || initial.fabric || "", // New: fabric ID
    _id: initial._id || undefined,
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [loadingFabrics, setLoadingFabrics] = useState(true);

  // Fetch fabrics on component mount
  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        const res = await api.get('/fabrics');
        setFabrics(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch fabrics:', err);
      } finally {
        setLoadingFabrics(false);
      }
    };
    fetchFabrics();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    // Pass both form data and uploaded images to parent
    onSubmit(form, uploadedImages);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {form._id ? "Edit Post" : "Create New Post"}
        </h3>
        <button
          onClick={onCancel}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={submit} className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Handwoven Silk Saree"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg (or upload images below)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              type="url"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide a URL or upload images below
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              Price (₹)
            </label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g., 5000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              type="number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Fabric (Recommended)
            </label>
            <select
              name="fabric"
              value={form.fabric}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="">-- Choose a fabric --</option>
              {loadingFabrics ? (
                <option disabled>Loading fabrics...</option>
              ) : (
                fabrics.map((fabric) => (
                  <option key={fabric._id} value={fabric._id}>
                    {fabric.name} - {fabric.fabricType} ({fabric.designs || 0} designs)
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the fabric used in this design to help users find it
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe your creation, materials used, and what makes it special..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fabric Link (Optional)
          </label>
          <input
            name="fabricLink"
            value={form.fabricLink}
            onChange={handleChange}
            placeholder="Link to fabric details or purchase page"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            type="url"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <ImageUpload
            images={uploadedImages}
            onChange={setUploadedImages}
            maxFiles={6}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            {form._id ? "Update Post" : "Create Post"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
