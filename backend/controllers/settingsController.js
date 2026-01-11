import Settings from '../models/Settings.js';
import { v2 as cloudinary } from 'cloudinary';

// Get hero images
export const getHeroImages = async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'hero-images' });
    
    if (!settings) {
      // Return default empty array if not configured
      return res.json({ images: [] });
    }
    
    res.json({ images: settings.value || [] });
  } catch (error) {
    console.error('Error fetching hero images:', error);
    res.status(500).json({ message: 'Failed to fetch hero images' });
  }
};

// Update hero images (Admin only)
export const updateHeroImages = async (req, res) => {
  try {
    const files = req.files;
    const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
    
    let imageUrls = [...existingImages];
    
    // Upload new images to Cloudinary
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => 
        cloudinary.uploader.upload(file.path, {
          folder: 'adaayen/hero',
          transformation: [
            { width: 1920, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        })
      );
      
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(result => result.secure_url);
      imageUrls = [...imageUrls, ...newUrls];
    }
    
    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { key: 'hero-images' },
      { value: imageUrls },
      { upsert: true, new: true }
    );
    
    res.json({ 
      message: 'Hero images updated successfully',
      images: settings.value 
    });
  } catch (error) {
    console.error('Error updating hero images:', error);
    res.status(500).json({ message: 'Failed to update hero images' });
  }
};

// Delete a hero image (Admin only)
export const deleteHeroImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    const settings = await Settings.findOne({ key: 'hero-images' });
    
    if (!settings) {
      return res.status(404).json({ message: 'Hero images not configured' });
    }
    
    // Remove the image URL from the array
    const updatedImages = settings.value.filter(url => url !== imageUrl);
    settings.value = updatedImages;
    await settings.save();
    
    // Try to delete from Cloudinary if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`adaayen/hero/${publicId}`);
      } catch (err) {
        console.warn('Failed to delete from Cloudinary:', err);
      }
    }
    
    res.json({ 
      message: 'Hero image deleted successfully',
      images: updatedImages 
    });
  } catch (error) {
    console.error('Error deleting hero image:', error);
    res.status(500).json({ message: 'Failed to delete hero image' });
  }
};
