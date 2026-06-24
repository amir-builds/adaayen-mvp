import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';

const router = express.Router();

// Rate limit payment creation — prevent spam
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many payment requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// All order routes require authentication
router.use(protect);

router.post('/create-payment', paymentLimiter, createPaymentOrder);
router.post('/verify-payment', paymentLimiter, verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
