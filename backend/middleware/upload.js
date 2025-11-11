import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Dynamically set folder based on route
    const folder = req.baseUrl?.includes('posts') ? 'adaayen/posts' : 'adaayen/fabrics';
    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    };
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Create the multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // Allow configuring max file size (MB) and max files via env vars
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024, // default 10MB per file
    files: parseInt(process.env.MAX_FILES, 10) || 6,
  }
});

export default upload;