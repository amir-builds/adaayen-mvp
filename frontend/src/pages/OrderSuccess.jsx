import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (p) => `₹${Number(p).toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your order...</p>
      </div>
    );
  }

  const orderNumber = order?.orderNumber || state?.orderNumber || id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">

        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500">Thank you for shopping with Adaayein</p>
          <div className="mt-4 inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-mono font-bold text-lg">
            {orderNumber}
          </div>
        </div>

        {/* Order Items */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.fabric?.imageUrl && (
                      <img src={item.fabric.imageUrl} alt={item.fabric.name}
                        className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.fabric?.name || 'Fabric'}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity}m × {formatPrice(item.pricePerMeter)}
                    </p>
                  </div>
                  <p className="font-bold text-gray-800">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 pt-1">
                <span>Total Paid</span>
                <span className="text-purple-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order?.shippingAddress && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Shipping To</h2>
            <div className="text-gray-600 text-sm space-y-1">
              <p className="font-semibold text-gray-800 text-base">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.landmark && <p>{order.shippingAddress.landmark}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}</p>
            </div>
          </div>
        )}

        {/* Payment Info */}
        {order?.paymentDetails && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Payment</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Transaction ID</span>
              <span className="font-mono text-gray-800">{order.paymentDetails.razorpayPaymentId}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Status</span>
              <span className="text-green-600 font-semibold capitalize">{order.paymentDetails.paymentStatus}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/"
            className="flex-1 bg-purple-600 text-white py-3 rounded-full font-semibold text-center hover:bg-purple-700 transition"
          >
            Continue Shopping
          </Link>
          <Link
            to="/profile"
            className="flex-1 border-2 border-purple-600 text-purple-600 py-3 rounded-full font-semibold text-center hover:bg-purple-50 transition"
          >
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
