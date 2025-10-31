import React, { useState } from 'react';
import api from '../../utils/api';

const FabricUploadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    fabricType: 'Other',
    color: '',
    inStock: true,
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fabricTypes = ["Cotton", "Silk", "Linen", "Denim", "Wool", "Polyester", "Other"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file (match backend default)
      const MAX_FILES = 6;

      // filter out files that are too large and notify user
      const tooLarge = files.filter((f) => f.size > MAX_FILE_SIZE);
      if (tooLarge.length > 0) {
        setError(`Some files exceed the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit and were not added.`);
      }

      const acceptable = files.filter((f) => f.size <= MAX_FILE_SIZE);
      // Append new acceptable files but cap total to MAX_FILES
      const combined = images.concat(acceptable).slice(0, MAX_FILES);
      setImages(combined);
      const previews = combined.map((f) => URL.createObjectURL(f));
      setPreview(previews);
      if (combined.length >= MAX_FILES && acceptable.length < files.length) {
        setError(`Only up to ${MAX_FILES} files are allowed. Extra files were ignored.`);
      }
    }
  };

  const removeImage = (index) => {
    setError(null);
    // Revoke object URL for the preview to avoid memory leaks
    const url = preview[index];
    if (url) URL.revokeObjectURL(url);
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = preview.filter((_, i) => i !== index);
    setImages(newImages);
    setPreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      // Append images (multiple)
      if (images && images.length > 0) {
        images.forEach((file) => {
          formDataToSend.append('images', file);
        });
      }
      // Append other form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await api.post('/fabrics', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form on success
      setFormData({
        name: '',
        description: '',
        price: '',
        fabricType: 'Other',
        color: '',
        inStock: true,
      });
      // Revoke object URLs
      preview.forEach((url) => URL.revokeObjectURL(url));
      setImages([]);
      setPreview([]);
      
      // Show success message or redirect
      alert('Fabric added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading fabric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Fabric</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fabric Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fabric Type</label>
          <select
            name="fabricType"
            value={formData.fabricType}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {fabricTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            multiple
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {preview && preview.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {preview.map((p, idx) => (
                <div key={idx} className="relative">
                  <img src={p} alt={`Preview ${idx + 1}`} className="h-32 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">In Stock</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Adding Fabric...' : 'Add Fabric'}
        </button>
      </form>
    </div>
  );
};

export default FabricUploadForm;