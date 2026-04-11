import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { statusBadge, formatDate, formatCurrency, Pagination } from '../components/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/orders', { params })
      .then(r => { setOrders(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const openDetail = async (order) => {
    const r = await api.get(`/admin/orders/${order.id}`);
    setSelected(r.data.order);
    setNewStatus(r.data.order.status);
    setModal('detail');
  };

  const removeOrder = async (id, orderNumber) => {
    if (!window.confirm(`Remove order "${orderNumber}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      setMsg({ type: 'success', text: 'Order removed' });
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to remove' }); }
  };

  const updateStatus = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/orders/${selected.id}/status`, { status: newStatus });
      setMsg({ type: 'success', text: 'Order status updated' });
      setModal(null); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  return (
    <>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Orders ({pagination?.total || 0})</h3>
        </div>
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters">
            <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            <table>
              <thead><tr>
                <th>Order #</th><th>Member / Hotel</th><th>Vendor</th>
                <th>Total</th><th>SITA 2%</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No orders found</td></tr>}
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.order_number}</strong></td>
                    <td>
                      <div>{o.member?.name}</div>
                      <div className="text-muted">{o.member?.hotel_name}</div>
                    </td>
                    <td>{o.vendor?.company_name}</td>
                    <td>{formatCurrency(o.total_amount)}</td>
                    <td style={{ color: '#057a55', fontWeight: 600 }}>{formatCurrency(o.sita_commission)}</td>
                    <td>{statusBadge(o.status)}</td>
                    <td className="text-muted">{formatDate(o.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openDetail(o)}>View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeOrder(o.id, o.order_number)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: '12px 20px' }}>
          <Pagination pagination={pagination} onPage={setPage} />
        </div>
      </div>

      {modal === 'detail' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>Order {selected.order_number}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid" style={{ marginBottom: '16px' }}>
                <div className="detail-item"><label>Member</label><span>{selected.member?.name}</span></div>
                <div className="detail-item"><label>Hotel</label><span>{selected.member?.hotel_name}</span></div>
                <div className="detail-item"><label>Vendor</label><span>{selected.vendor?.company_name}</span></div>
                <div className="detail-item"><label>Status</label><span>{statusBadge(selected.status)}</span></div>
                <div className="detail-item"><label>Total Amount</label><span style={{ fontWeight: 600 }}>{formatCurrency(selected.total_amount)}</span></div>
                <div className="detail-item"><label>SITA Commission (2%)</label><span style={{ color: '#057a55', fontWeight: 600 }}>{formatCurrency(selected.sita_commission)}</span></div>
                <div className="detail-item"><label>Vendor Amount (98%)</label><span>{formatCurrency(selected.vendor_amount)}</span></div>
                <div className="detail-item"><label>Payment</label><span>{selected.payment_method} · {statusBadge(selected.payment_status)}</span></div>
                <div className="detail-item"><label>Delivery OTP Verified</label><span>{selected.delivery_otp_verified ? '✅ Yes' : '❌ No'}</span></div>
                <div className="detail-item"><label>Date</label><span>{formatDate(selected.created_at)}</span></div>
              </div>

              {selected.delivery_address && (
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '12px', color: '#6b7280' }}>DELIVERY ADDRESS</strong>
                  <p style={{ marginTop: '4px' }}>{selected.delivery_address}</p>
                </div>
              )}

              {selected.items?.length > 0 && (
                <div>
                  <strong style={{ fontSize: '12px', color: '#6b7280' }}>ORDER ITEMS</strong>
                  <table style={{ marginTop: '8px', width: '100%' }}>
                    <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                    <tbody>
                      {selected.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity} {item.product_unit}</td>
                          <td>{formatCurrency(item.unit_price)}</td>
                          <td>{formatCurrency(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!['delivered', 'cancelled', 'disputed'].includes(selected.status) && (
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label">Update Status</label>
                  <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {!['delivered', 'cancelled', 'disputed'].includes(selected.status) && (
                <button className="btn btn-primary" onClick={updateStatus} disabled={actionLoading || newStatus === selected.status}>Update Status</button>
              )}
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
