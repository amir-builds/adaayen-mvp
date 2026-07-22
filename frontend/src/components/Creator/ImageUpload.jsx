import { useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

/**
 * ImageUpload
 *
 * Props:
 *  - images        {File[]}   – new files selected by the user (controlled by parent)
 *  - onChange      {fn}       – called with the updated File[] whenever files change
 *  - maxFiles      {number}   – maximum total images (existing + new)
 *  - existingImages {string[]} – URLs of already-saved images (edit mode)
 *  - onExistingChange {fn}    – called with the updated string[] of kept existing URLs
 */
const ImageUpload = ({
  images = [],
  onChange,
  maxFiles = 6,
  existingImages = [],
  onExistingChange,
}) => {
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const totalCount = existingImages.length + previews.length;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const afterAdd = existingImages.length + previews.length + files.length;

    if (afterAdd > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed (${existingImages.length} existing + ${previews.length} new)`);
      return;
    }

    setError('');

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(file.name);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(file.name);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onChange(updatedPreviews.map((p) => p.file));
  };

  // Remove a newly-added file (not yet saved)
  const removeNewImage = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange(updated.map((p) => p.file));
  };

  // Remove an existing saved image
  const removeExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    if (onExistingChange) onExistingChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
          <Upload className="w-5 h-5" />
          <span>Upload Images</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <span className="text-sm text-gray-500">
          {totalCount}/{maxFiles} images
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Existing Images (from DB) */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Current Images — hover to remove
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-300 hover:border-red-400 transition-colors">
                  <img
                    src={url}
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove this image"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-blue-500 mt-1 truncate">Saved #{index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Image Previews */}
      {previews.length > 0 && (
        <div>
          {existingImages.length > 0 && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              New Images to Upload
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={`new-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-colors">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">{preview.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {existingImages.length === 0 && previews.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload up to {maxFiles} images (max 10MB each)
          </p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, WebP. Maximum file size: 10MB
      </p>
    </div>
  );
};

export default ImageUpload;
