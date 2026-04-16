import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { statusBadge, formatCurrency, formatDate } from '../components/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(r => {
        setStats(r.data);
        setRecentOrders(r.data.recent_orders || r.data.stats?.recent_orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      setRecentOrders(prev => prev.filter(o => o.id !== id));
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete order'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!stats) return <div className="alert alert-error">Failed to load dashboard</div>;

  const { members, vendors, orders, disputes, revenue, memberships, recent_orders } = stats.stats || stats;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f0fe' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#1a56db"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <div className="stat-label">Total Members</div>
            <div className="stat-value">{members?.total || 0}</div>
            <div className="stat-sub">{members?.active || 0} active · {members?.pending || 0} pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#def7ec' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#057a55"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <div className="stat-label">Vendors</div>
            <div className="stat-value">{vendors?.total || 0}</div>
            <div className="stat-sub">{vendors?.active || 0} active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fdf6b2' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#c27803"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{orders?.total || 0}</div>
            <div className="stat-sub">{orders?.pending || 0} pending · {orders?.delivered || 0} delivered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fde8e8' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#c81e1e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <div className="stat-label">Open Disputes</div>
            <div className="stat-value">{disputes?.open || 0}</div>
            <div className="stat-sub">Requires attention</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f0fe' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#1a56db"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="stat-label">SITA Revenue (2%)</div>
            <div className="stat-value">{formatCurrency(revenue?.sita_commission_total || 0)}</div>
            <div className="stat-sub">Total commission earned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#e65100"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="stat-label">Expiring This Month</div>
            <div className="stat-value" style={{ color: '#e65100' }}>{memberships?.expiring_this_month || 0}</div>
            <div className="stat-sub">Annual memberships</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fde8e8' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#c81e1e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="stat-label">Expired Memberships</div>
            <div className="stat-value" style={{ color: '#c81e1e' }}>{memberships?.expired || 0}</div>
            <div className="stat-sub">Need renewal</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Orders</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Member / Hotel</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>No orders yet</td></tr>
              )}
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td>
                  <td>
                    <div>{o.member?.name}</div>
                    <div className="text-muted">{o.member?.hotel_name}</div>
                  </td>
                  <td>{o.vendor?.company_name}</td>
                  <td>{formatCurrency(o.total_amount)}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td className="text-muted">{formatDate(o.created_at)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
