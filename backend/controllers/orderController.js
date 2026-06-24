import Razorpay from 'razorpay';
import crypto from 'crypto';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment variables!');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Step 1: Create Razorpay order ───────────────────────────────────────────
// Called when user clicks "Pay Now" — returns order_id to open checkout modal
export const createPaymentOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.fabric');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Verify all items are still in stock
    for (const item of cart.items) {
      if (!item.fabric || !item.fabric.inStock) {
        return res.status(400).json({
          message: `"${item.fabric?.name || 'A fabric'}" is no longer available.`,
        });
      }
    }

    // Receipt must be ≤ 40 chars for Razorpay
    const receipt = `rcpt_${Date.now()}`;

    // Calculate total in paise (Razorpay uses smallest currency unit)
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.pricePerMeter,
      0
    );
    const amountInPaise = Math.round(subtotal * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({ message: 'Order amount must be at least ₹1.' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
      },
    });

    res.status(200).json({
      orderId: razorpayOrder.id,       // razorpay order_id for the modal
      amount: razorpayOrder.amount,    // in paise
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Failed to initiate payment. Please try again.' });
  }
};

// ─── Step 2: Verify payment & save order ─────────────────────────────────────
// Called after Razorpay checkout modal succeeds
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details.' });
    }

    // ✅ Verify HMAC signature — this is the critical security step
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Get cart to build order items
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.fabric');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found.' });
    }

    const orderItems = cart.items.map((item) => ({
      fabric: item.fabric._id,
      quantity: item.quantity,
      pricePerMeter: item.pricePerMeter,
      totalPrice: item.quantity * item.pricePerMeter,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

    // Create order in DB
    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      subtotal,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      total: subtotal,
      status: 'payment_confirmed',
      shippingAddress,
      paymentDetails: {
        method: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        transactionId: razorpay_payment_id,
        paymentStatus: 'completed',
        paidAt: new Date(),
      },
      timeline: [{
        status: 'payment_confirmed',
        timestamp: new Date(),
        note: 'Payment received via Razorpay',
      }],
    });

    await order.save();

    // Clear the cart after successful order
    cart.items = [];
    cart.status = 'converted';
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    // Return detailed error for debugging — remove before final production
    res.status(500).json({
      message: 'Order confirmation failed. Contact support if amount was debited.',
      debug_error: error?.message || String(error),
      debug_name: error?.name,
    });
  }
};

// ─── Get my orders ────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.fabric', 'name imageUrl fabricType color')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get single order ─────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    }).populate('items.fabric', 'name imageUrl images fabricType color');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
