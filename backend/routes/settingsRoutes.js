import express from 'express';
import { getHeroImages, updateHeroImages, deleteHeroImage } from '../controllers/settingsController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public route - get hero images
router.get('/hero-images', getHeroImages);

// Admin routes - update/delete hero images
router.put('/hero-images', protect, adminOnly, upload.array('images', 10), updateHeroImages);
router.delete('/hero-images', protect, adminOnly, deleteHeroImage);

export default router;
