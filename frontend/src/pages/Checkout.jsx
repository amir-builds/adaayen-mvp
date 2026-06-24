import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli',
  'Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { cart, getTotal } = useCart();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    country: 'India',
  });

  useEffect(() => {
    // Pre-fill name from logged-in user
    const user = JSON.parse(localStorage.getItem('creator') || '{}');
    if (user?.name) setAddress((a) => ({ ...a, name: user.name }));
  }, []);

  useEffect(() => {
    if (!cart || cart.items?.length === 0) {
      navigate('/cart');
    }
  }, [cart]);

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isAddressValid = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'postalCode'];
    return required.every((f) => address[f]?.trim());
  };

  const formatPrice = (p) => `₹${Number(p).toFixed(2)}`;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setError('');

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      return setError('Failed to load payment gateway. Check your internet connection.');
    }

    setPaying(true);
    try {
      // 1. Create Razorpay order on backend
      const { data } = await api.post('/orders/create-payment');
      const { orderId, amount, currency, keyId, user } = data;

      // 2. Open Razorpay checkout modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Adaayein',
        description: 'Fabric Purchase',
        image: 'https://adaayein.vercel.app/favicon.ico',
        order_id: orderId,
        handler: async (response) => {
          // 3. Verify payment on backend
          try {
            const verifyRes = await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: address,
            });
            navigate(`/order-success/${verifyRes.data.orderId}`, {
              state: { orderNumber: verifyRes.data.orderNumber },
            });
          } catch (err) {
            setPaying(false);
            const data = err.response?.data;
            setError(
              data?.debug_error
                ? `${data.message} (Debug: ${data.debug_error})`
                : data?.message || 'Payment received but order confirmation failed. Please contact support.'
            );
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone,
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setError('Payment cancelled. Your cart is intact.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setPaying(false);
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  if (!cart) return null;

  const total = getTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Shipping Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping Address</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handlePayNow} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input name="name" value={address.name} onChange={handleChange}
                      className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Ramesh Kumar" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input name="phone" value={address.phone} onChange={handleChange}
                      className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="10-digit mobile number" required
                      pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input name="street" value={address.street} onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="House no., building, street name" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (optional)</label>
                  <input name="landmark" value={address.landmark} onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Near temple, school, etc." />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input name="city" value={address.city} onChange={handleChange}
                      className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="City" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <select name="state" value={address.state} onChange={handleChange}
                      className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
                      required>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                    <input name="postalCode" value={address.postalCode} onChange={handleChange}
                      className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="6-digit PIN" required
                      pattern="[1-9][0-9]{5}" title="Enter a valid 6-digit PIN code"
                      maxLength={6} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paying || !isAddressValid()}
                  className="w-full bg-purple-600 text-white py-4 rounded-full font-bold text-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>🔒 Pay {formatPrice(total)}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {cart.items?.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.fabric?.imageUrl && (
                        <img src={item.fabric.imageUrl} alt={item.fabric.name}
                          className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.fabric?.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity}m × ₹{item.pricePerMeter}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatPrice(item.quantity * item.pricePerMeter)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-purple-600">{formatPrice(total)}</span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
                <p>🔒 Secured by Razorpay</p>
                <p>💳 Pay via UPI, Card, Net Banking, Wallet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
