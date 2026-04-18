import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdShoppingCart, MdSavings, MdCardMembership, MdAccountBalanceWallet,
  MdStorefront, MdListAlt, MdWarning
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/members/profile').catch(() => ({ data: null })),
      api.get('/members/dashboard').catch(() => ({ data: null })),
      api.get('/orders/my-orders').catch(() =>
        api.get('/orders').catch(() => ({ data: [] }))
      ),
    ]).then(([profileRes, dashRes, ordersRes]) => {
      const p = profileRes.data?.member || profileRes.data;
      if (p && p._id) {
        setProfile(p);
        // Keep auth context and localStorage fresh
        localStorage.setItem('member_data', JSON.stringify(p));
        login(p, token);
      }
      setStats(dashRes.data);
      const orders = ordersRes.data?.orders || ordersRes.data || [];
      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use fresh profile from backend, fall back to context user
  const member = profile || user || {};

  const calcDaysLeft = () => {
    if (!member?.membership_expiry) return null;
    return Math.ceil((new Date(member.membership_expiry) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const days = calcDaysLeft();
  const membershipExpired = days !== null && days <= 0;
  const membershipSoon = days !== null && days > 0 && days <= 30;

  const statusColor = (s) => {
    const m = { pending: 'warning', confirmed: 'primary', delivered: 'success', cancelled: 'danger', processing: 'primary' };
    return m[s] || 'secondary';
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div>
          <p style={styles.bannerSub}>Welcome back,</p>
          <h2 style={styles.bannerName}>{member?.name || 'Member'}</h2>
          <p style={styles.bannerMeta}>Member ID: {member?.member_id || String(member?.id || '').slice(-6).toUpperCase() || '—'}</p>
        </div>
        <div style={styles.bannerRight}>
          <div style={styles.memberBadge}>
            <MdCardMembership style={{ fontSize: '1.3rem' }} />
            {membershipExpired ? 'Expired' : 'Active Member'}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {membershipExpired && (
        <div className="alert alert-danger">
          <MdWarning /> Your membership has expired.
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/membership')}>View Details</button>
        </div>
      )}
      {membershipSoon && (
        <div className="alert alert-warning">
          <MdWarning /> Membership expires in {days} day{days !== 1 ? 's' : ''}.
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', background: '#FF8F00', color: '#fff' }} onClick={() => navigate('/membership')}>View</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8EAF6' }}>
            <MdAccountBalanceWallet style={{ color: '#1A237E', fontSize: '1.5rem' }} />
          </div>
          <div className="stat-info">
            <h3>₹{(member?.sita_wallet_balance ?? member?.wallet_balance ?? 0).toLocaleString('en-IN')}</h3>
            <p>Wallet Balance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF8E1' }}>
            <MdShoppingCart style={{ color: '#FF8F00', fontSize: '1.5rem' }} />
          </div>
          <div className="stat-info">
            <h3>{loading ? '—' : (stats?.total_orders ?? recentOrders.length)}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9' }}>
            <MdSavings style={{ color: '#2E7D32', fontSize: '1.5rem' }} />
          </div>
          <div className="stat-info">
            <h3>₹{(stats?.total_savings || 0).toLocaleString('en-IN')}</h3>
            <p>Total Savings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FCE4EC' }}>
            <MdCardMembership style={{ color: '#C62828', fontSize: '1.5rem' }} />
          </div>
          <div className="stat-info">
            <h3>{days !== null ? (days <= 0 ? 'Expired' : `${days}d`) : '—'}</h3>
            <p>Membership</p>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Membership Card */}
        <div className="card">
          <div className="card-title"><MdCardMembership /> Membership Status</div>
          <div style={styles.membershipBody}>
            <span className={`badge badge-${membershipExpired ? 'danger' : 'success'}`}>
              {membershipExpired ? '● Expired' : '● Active'}
            </span>
            <div style={styles.memberDetail}>
              <span style={styles.mdLabel}>Expiry Date</span>
              <span style={styles.mdValue}>
                {member?.membership_expiry
                  ? new Date(member.membership_expiry).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : 'N/A'}
              </span>
            </div>
            <div style={styles.memberDetail}>
              <span style={styles.mdLabel}>Plan</span>
              <span style={styles.mdValue}>{member?.membership_plan || 'Annual'}</span>
            </div>
            <button className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/membership')}>
              View Membership Details
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title"><MdStorefront /> Quick Actions</div>
          <div style={styles.quickActions}>
            {[
              { icon: <MdStorefront />, label: 'Shop Now', path: '/marketplace', bg: '#E8EAF6', color: '#1A237E' },
              { icon: <MdShoppingCart />, label: 'View Cart', path: '/cart', bg: '#FFF8E1', color: '#FF8F00' },
              { icon: <MdListAlt />, label: 'My Orders', path: '/orders', bg: '#E8F5E9', color: '#2E7D32' },
              { icon: <MdAccountBalanceWallet />, label: 'Wallet', path: '/wallet', bg: '#FCE4EC', color: '#C62828' },
            ].map((a) => (
              <button key={a.path} style={{ ...styles.quickBtn, background: a.bg }} onClick={() => navigate(a.path)}>
                <span style={{ ...styles.quickIcon, color: a.color }}>{a.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: a.color }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span><MdListAlt /> Recent Orders</span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/orders')}>View All</button>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : recentOrders.length === 0 ? (
          <div style={styles.empty}>
            <MdShoppingCart style={{ fontSize: '2.5rem', color: '#BDBDBD' }} />
            <p>No orders yet. Start shopping!</p>
            <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order ID</th><th>Items</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td><code>#{o._id?.slice(-6).toUpperCase()}</code></td>
                    <td>{o.items?.length || 0} item(s)</td>
                    <td>₹{(o.total_payable || 0).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${statusColor(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
    borderRadius: 12, padding: '24px 28px', color: '#fff',
    marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  bannerSub: { fontSize: '0.875rem', opacity: 0.8, marginBottom: 4 },
  bannerName: { fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 },
  bannerMeta: { fontSize: '0.8rem', opacity: 0.7 },
  bannerRight: { textAlign: 'right' },
  memberBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,143,0,0.2)', border: '1px solid rgba(255,143,0,0.4)',
    color: '#FF8F00', padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: '0.875rem',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 0 },
  membershipBody: { display: 'flex', flexDirection: 'column', gap: 12 },
  memberDetail: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mdLabel: { fontSize: '0.85rem', color: '#757575' },
  mdValue: { fontSize: '0.9rem', fontWeight: 600, color: '#212121' },
  quickActions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  quickBtn: {
    border: 'none', borderRadius: 10, padding: '14px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    transition: 'transform 0.15s', cursor: 'pointer',
  },
  quickIcon: { fontSize: '1.5rem' },
  empty: { textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#9E9E9E' },
};
