import React, { useState, useEffect } from 'react';
import { MdListAlt, MdClose, MdWarning, MdRefresh } from 'react-icons/md';
import api from '../services/api';

const STATUS_COLOR = { pending: 'warning', confirmed: 'primary', processing: 'primary', delivered: 'success', cancelled: 'danger' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/my-orders')
      .catch(() => api.get('/orders'))
      .then((res) => {
        const data = res.data?.orders || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      }).catch(() => setOrders([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId) => {
    setCancelling(true); setCancelError('');
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      setSelected(null);
      setShowCancelConfirm(false);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (order) => ['pending', 'confirmed'].includes(order.status);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-outline btn-sm" onClick={fetchOrders}><MdRefresh /> Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <MdListAlt style={{ fontSize: '3rem', color: '#BDBDBD' }} />
          <p style={{ color: '#9E9E9E', marginTop: 12 }}>No orders placed yet.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Market Total</th>
                  <th>Paid (SITA)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><code style={{ fontWeight: 700, color: '#1A237E' }}>#{order._id?.slice(-6).toUpperCase()}</code></td>
                    <td style={{ color: '#757575', fontSize: '0.85rem' }}>
                      {new Date(order.created_at || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td>₹{(order.market_total || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: '#1A237E' }}>₹{(order.total_payable || 0).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[order.status] || 'secondary'}`}>{order.status}</span></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => { setSelected(order); setCancelError(''); setShowCancelConfirm(false); }}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Order #{selected._id?.slice(-6).toUpperCase()}</span>
              <button className="modal-close" onClick={() => setSelected(null)}><MdClose /></button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className={`badge badge-${STATUS_COLOR[selected.status] || 'secondary'}`}>{selected.status?.toUpperCase()}</span>
              <span style={{ fontSize: '0.85rem', color: '#757575' }}>
                {new Date(selected.created_at || selected.createdAt).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, color: '#424242', marginBottom: 10, fontSize: '0.9rem' }}>Items Ordered</p>
              {selected.items?.map((item, i) => (
                <div key={i} style={styles.orderItem}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product_name || item.name}</p>
                    <p style={{ fontSize: '0.78rem', color: '#9E9E9E' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#1A237E' }}>₹{((item.sita_price || item.price) * item.quantity).toLocaleString('en-IN')}</p>
                    <p style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9E9E9E' }}>MRP ₹{(item.market_price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Market Total', val: `₹${(selected.market_total || 0).toLocaleString('en-IN')}`, strike: true },
                { label: 'SITA Price Total', val: `₹${(selected.sita_total || 0).toLocaleString('en-IN')}` },
                { label: 'Foundation Fee (2%)', val: `+₹${(selected.foundation_fee || 0).toLocaleString('en-IN')}` },
              ].map(({ label, val, strike }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#757575' }}>{label}</span>
                  <span style={strike ? { textDecoration: 'line-through', color: '#9E9E9E' } : {}}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#1A237E', fontSize: '1rem', marginTop: 4 }}>
                <span>Total Paid</span>
                <span>₹{(selected.total_payable || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#2E7D32' }}>
                <span>Total Savings</span>
                <span style={{ fontWeight: 700 }}>₹{((selected.market_total || 0) - (selected.sita_total || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {cancelError && <div className="alert alert-danger">{cancelError}</div>}

            {canCancel(selected) && !showCancelConfirm && (
              <button className="btn btn-danger btn-full" onClick={() => setShowCancelConfirm(true)}>
                Cancel Order
              </button>
            )}

            {showCancelConfirm && (
              <div className="alert alert-warning" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <MdWarning style={{ fontSize: '1.3rem', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.875rem' }}>
                    <strong>Cancellation Penalty:</strong> Cancelling a confirmed order may attract a penalty fee. This action cannot be undone. Are you sure?
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleCancel(selected._id)} disabled={cancelling}>
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCancelConfirm(false)}>
                    Keep Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  orderItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #F0F0F0' },
};
