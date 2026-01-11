// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

/**
 * Delete a single image from Cloudinary with verification
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<{success: boolean, publicId: string, error?: string}>}
 */
export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return { success: false, publicId: null, error: 'No public_id provided' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    // Cloudinary returns { result: 'ok' } on success, { result: 'not found' } if already deleted
    if (result.result === 'ok') {
      console.log(`✅ Successfully deleted image: ${publicId}`);
      return { success: true, publicId };
    } else if (result.result === 'not found') {
      console.warn(`⚠️ Image not found (may already be deleted): ${publicId}`);
      return { success: true, publicId, warning: 'Image not found in Cloudinary' };
    } else {
      console.error(`❌ Failed to delete image: ${publicId}`, result);
      return { success: false, publicId, error: `Deletion failed: ${result.result}` };
    }
  } catch (error) {
    console.error(`❌ Error deleting image ${publicId}:`, error.message);
    return { success: false, publicId, error: error.message };
  }
};

/**
 * Delete multiple images from Cloudinary with detailed results
 * @param {Array<string>} publicIds - Array of public_ids to delete
 * @returns {Promise<{successful: number, failed: number, results: Array}>}
 */
export const deleteCloudinaryImages = async (publicIds) => {
  if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
    return { successful: 0, failed: 0, results: [] };
  }

  // Filter out null/undefined values
  const validPublicIds = publicIds.filter(Boolean);
  
  if (validPublicIds.length === 0) {
    return { successful: 0, failed: 0, results: [] };
  }

  console.log(`🗑️ Attempting to delete ${validPublicIds.length} images from Cloudinary...`);

  const results = await Promise.allSettled(
    validPublicIds.map(publicId => deleteCloudinaryImage(publicId))
  );

  const processedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        publicId: validPublicIds[index],
        error: result.reason?.message || 'Unknown error'
      };
    }
  });

  const successful = processedResults.filter(r => r.success).length;
  const failed = processedResults.filter(r => !r.success).length;

  console.log(`📊 Cloudinary deletion results: ${successful} successful, ${failed} failed`);

  return {
    successful,
    failed,
    results: processedResults
  };
};

/**
 * Delete images from imagesMeta array with detailed logging
 * @param {Array<{url: string, public_id: string}>} imagesMeta - Array of image metadata
 * @returns {Promise<{successful: number, failed: number, results: Array}>}
 */
export const deleteImagesFromMeta = async (imagesMeta) => {
  if (!imagesMeta || !Array.isArray(imagesMeta) || imagesMeta.length === 0) {
    return { successful: 0, failed: 0, results: [] };
  }

  const publicIds = imagesMeta
    .map(meta => meta?.public_id)
    .filter(Boolean);

  return await deleteCloudinaryImages(publicIds);
};

/**
 * Verify if an image exists in Cloudinary
 * @param {string} publicId - The public_id to verify
 * @returns {Promise<boolean>}
 */
export const verifyImageExists = async (publicId) => {
  if (!publicId) return false;

  try {
    const result = await cloudinary.api.resource(publicId);
    return !!result;
  } catch (error) {
    if (error.http_code === 404) {
      return false;
    }
    console.error(`Error verifying image ${publicId}:`, error.message);
    return false;
  }
};

/**
 * Get list of orphaned images in a specific folder
 * This can be used for cleanup scripts
 * @param {string} folder - Cloudinary folder path (e.g., 'adaayen/fabrics')
 * @returns {Promise<Array<{public_id: string, created_at: string, bytes: number}>>}
 */
export const getOrphanedImages = async (folder) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500
    });

    return result.resources.map(resource => ({
      public_id: resource.public_id,
      created_at: resource.created_at,
      bytes: resource.bytes,
      url: resource.secure_url
    }));
  } catch (error) {
    console.error(`Error fetching images from ${folder}:`, error.message);
    return [];
  }
};

/**
 * Delete old images (useful for cleanup)
 * @param {string} folder - Cloudinary folder path
 * @param {number} daysOld - Delete images older than this many days
 * @returns {Promise<{deleted: number, failed: number}>}
 */
export const deleteOldImages = async (folder, daysOld = 30) => {
  try {
    const images = await getOrphanedImages(folder);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldImages = images.filter(img => new Date(img.created_at) < cutoffDate);
    
    if (oldImages.length === 0) {
      console.log(`No images older than ${daysOld} days found in ${folder}`);
      return { deleted: 0, failed: 0 };
    }

    console.log(`Found ${oldImages.length} images older than ${daysOld} days in ${folder}`);
    
    const publicIds = oldImages.map(img => img.public_id);
    const result = await deleteCloudinaryImages(publicIds);

    return {
      deleted: result.successful,
      failed: result.failed
    };
  } catch (error) {
    console.error(`Error deleting old images from ${folder}:`, error.message);
    return { deleted: 0, failed: 0 };
  }
};
