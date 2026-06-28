import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag, Clock, CheckCircle, Truck, MapPin, XCircle, RefreshCw } from 'lucide-react';
import api from '../utils/api';

const STATUS_CONFIG = {
  pending_payment:    { label: 'Pending Payment',    color: '#f59e0b', bg: '#fef3c7', icon: Clock },
  payment_confirmed:  { label: 'Payment Confirmed',  color: '#8b5cf6', bg: '#ede9fe', icon: CheckCircle },
  processing:         { label: 'Processing',         color: '#3b82f6', bg: '#dbeafe', icon: RefreshCw },
  packed:             { label: 'Packed',             color: '#0891b2', bg: '#cffafe', icon: Package },
  shipped:            { label: 'Shipped',            color: '#7c3aed', bg: '#ede9fe', icon: Truck },
  out_for_delivery:   { label: 'Out for Delivery',   color: '#d97706', bg: '#fef3c7', icon: Truck },
  delivered:          { label: 'Delivered',          color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
  cancelled:          { label: 'Cancelled',          color: '#dc2626', bg: '#fee2e2', icon: XCircle },
  refunded:           { label: 'Refunded',           color: '#6b7280', bg: '#f3f4f6', icon: RefreshCw },
  returned:           { label: 'Returned',           color: '#6b7280', bg: '#f3f4f6', icon: RefreshCw },
};

const formatPrice = (p) => `₹${Number(p || 0).toFixed(2)}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric'
});

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: '#f3f4f6', icon: Package };
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: cfg.bg, color: cfg.color,
        padding: '4px 10px', borderRadius: '9999px',
        fontSize: '12px', fontWeight: 600,
      }}
    >
      <Icon size={13} />
      {cfg.label}
    </span>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0', marginBottom: '16px', overflow: 'hidden'
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          padding: '16px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: '14px', fontFamily: 'monospace' }}>
              {order.orderNumber}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
            {formatDate(order.createdAt)} &nbsp;·&nbsp; {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '18px', color: '#111' }}>{formatPrice(order.total)}</p>
          <ChevronRight
            size={18}
            style={{
              color: '#9ca3af',
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s',
              marginTop: '4px',
            }}
          />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px' }}>
          {/* Items list */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '10px' }}>Items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '10px',
                    background: '#f3f4f6', overflow: 'hidden', flexShrink: 0
                  }}>
                    {(item.fabric?.imageUrl || item.fabric?.images?.[0]) && (
                      <img
                        src={item.fabric.imageUrl || item.fabric.images[0]}
                        alt={item.fabric?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: '#111', fontSize: '14px', margin: 0 }}>
                      {item.fabric?.name || 'Fabric'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>
                      {item.quantity}m × {formatPrice(item.pricePerMeter)}
                    </p>
                  </div>
                  <p style={{ fontWeight: 600, color: '#374151', fontSize: '14px', flexShrink: 0 }}>
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing summary */}
          <div style={{
            background: '#faf5ff', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a', marginBottom: '4px' }}>
              <span>Shipping</span><span>FREE</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '15px', fontWeight: 700, color: '#7c3aed',
              borderTop: '1px solid #e9d5ff', paddingTop: '8px', marginTop: '8px'
            }}>
              <span>Total Paid</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> Shipping Address
              </p>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>{order.shippingAddress.name}</p>
                <p style={{ margin: 0 }}>{order.shippingAddress.phone}</p>
                <p style={{ margin: 0 }}>{order.shippingAddress.street}</p>
                {order.shippingAddress.landmark && <p style={{ margin: 0 }}>{order.shippingAddress.landmark}</p>}
                <p style={{ margin: 0 }}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                </p>
              </div>
            </div>
          )}

          {/* Payment details */}
          {order.paymentDetails?.razorpayPaymentId && (
            <div style={{
              background: '#f9fafb', borderRadius: '8px', padding: '10px 14px',
              fontSize: '12px', color: '#6b7280'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Transaction ID</span>
                <span style={{ fontFamily: 'monospace', color: '#374151' }}>
                  {order.paymentDetails.razorpayPaymentId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Status</span>
                <span style={{ color: '#16a34a', fontWeight: 600, textTransform: 'capitalize' }}>
                  {order.paymentDetails.paymentStatus}
                </span>
              </div>
            </div>
          )}

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '10px' }}>Order Timeline</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[...order.timeline].reverse().map((event, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: i === 0 ? '#7c3aed' : '#d1d5db',
                      marginTop: '5px', flexShrink: 0
                    }} />
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                        {(STATUS_CONFIG[event.status]?.label || event.status).replace(/_/g, ' ')}
                      </p>
                      {event.note && (
                        <p style={{ margin: '1px 0 0', fontSize: '12px', color: '#9ca3af' }}>{event.note}</p>
                      )}
                      <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#d1d5db' }}>
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: '3px solid #7c3aed', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading your orders...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <XCircle size={48} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
          <h2 style={{ fontWeight: 700, color: '#111', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
          <Link to="/login" style={{
            background: '#7c3aed', color: '#fff', padding: '10px 24px',
            borderRadius: '9999px', fontWeight: 600, textDecoration: 'none', fontSize: '14px'
          }}>
            Login Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={26} style={{ color: '#7c3aed' }} />
            My Orders
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
          </p>
        </div>

        {orders.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '60px 24px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <ShoppingBag size={56} style={{ color: '#d8b4fe', margin: '0 auto 16px' }} />
            <h2 style={{ fontWeight: 700, color: '#374151', marginBottom: '8px' }}>No orders yet</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
              You haven't placed any orders. Start shopping!
            </p>
            <Link to="/shop" style={{
              background: '#7c3aed', color: '#fff', padding: '12px 28px',
              borderRadius: '9999px', fontWeight: 600, textDecoration: 'none', fontSize: '14px'
            }}>
              Shop Fabrics
            </Link>
          </div>
        ) : (
          <div>
            {orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/shop" style={{ color: '#7c3aed', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
