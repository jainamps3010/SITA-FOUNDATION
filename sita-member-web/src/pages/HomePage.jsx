import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import { useCart } from '../context/CartContext';
import StatusBadge from '../components/StatusBadge';
import styles from './HomePage.module.css';

function fmt(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function daysUntil(dt) {
  if (!dt) return -1;
  return Math.floor((new Date(dt) - Date.now()) / 86400000);
}

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { count } = useCart();
  const [member, setMember] = useState(() => {
    try { return JSON.parse(localStorage.getItem('member_data') || '{}'); } catch { return {}; }
  });
  const [renewing, setRenewing] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/members/profile');
      const m = res.data.member;
      setMember(m);
      localStorage.setItem('member_data', JSON.stringify(m));
    } catch {}
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const logout = () => {
    localStorage.removeItem('member_token');
    localStorage.removeItem('member_data');
    navigate('/');
  };

  const renewMembership = async () => {
    setRenewing(true);
    setShowRenewDialog(false);
    try {
      const res = await api.post('/members/renew-membership', {});
      if (res.data.member) {
        setMember(res.data.member);
        localStorage.setItem('member_data', JSON.stringify(res.data.member));
      }
      toast(res.data.message || 'Membership renewed successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Renewal failed', 'error');
    } finally {
      setRenewing(false);
    }
  };

  const ms = member.membership_status || 'pending';
  const expiry = member.membership_expiry_date;
  const days = daysUntil(expiry);
  const isExpired = ms === 'expired';
  const isExpiringSoon = ms === 'active' && days >= 0 && days <= 30;

  const quickActions = [
    { icon: '🏪', label: 'Marketplace', color: '#2196F3', path: '/marketplace' },
    { icon: '📋', label: 'My Orders', color: '#FF9800', path: '/orders' },
    { icon: '👛', label: 'Wallet', color: '#1A237E', path: '/wallet' },
    { icon: '👤', label: 'Profile', color: '#9C27B0', path: '/profile' },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <div className={styles.headerRight}>
            <button className={styles.cartBtn} onClick={() => navigate('/cart')}>
              🛒 {count > 0 && <span className={styles.badge}>{count}</span>}
            </button>
            <button className={styles.logoutBtn} onClick={logout}>Logout</button>
          </div>
        </div>
        <div className={styles.memberInfo}>
          <span className={styles.greeting}>Good morning,</span>
          <span className={styles.memberName}>{member.name || 'Member'}</span>
          {member.hotel_name && <span className={styles.hotelName}>{member.hotel_name}</span>}
        </div>
      </div>

      <div className={styles.content}>
        {/* Wallet Card */}
        <div className={styles.walletCard} onClick={() => navigate('/wallet')}>
          <div className={styles.walletLeft}>
            <span className={styles.walletIcon}>👛</span>
            <div>
              <div className={styles.walletLabel}>SITA Wallet Balance</div>
              <div className={styles.walletBalance}>₹{parseFloat(member.sita_wallet_balance || 0).toFixed(2)}</div>
              <div className={styles.walletSub}>Store Credit</div>
            </div>
          </div>
          <span className={styles.walletArrow}>›</span>
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Quick Actions</div>
          <div className={styles.actionsGrid}>
            {quickActions.map((a) => (
              <button key={a.path} className={styles.actionCard} onClick={() => navigate(a.path)}>
                <div className={styles.actionIcon} style={{ background: a.color + '1A' }}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                </div>
                <span className={styles.actionLabel}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Membership Status */}
        {member.membership_paid === false ? (
          <div className={styles.membershipCard}>
            <div className={styles.membershipRow}>
              <div className={styles.membershipIconBox} style={{ background: '#FFF8E1' }}>⏳</div>
              <div>
                <div className={styles.membershipTitle}>Membership Pending</div>
                <div className={styles.membershipSub}>Complete annual membership payment to order</div>
              </div>
            </div>
          </div>
        ) : isExpired ? (
          <div className={styles.membershipCard} style={{ background: '#FFEBEE', border: '1px solid #FFCDD2' }}>
            <div className={styles.membershipRow}>
              <span style={{ fontSize: 20 }}>❌</span>
              <div style={{ flex: 1 }}>
                <div className={styles.membershipTitle} style={{ color: '#C62828' }}>Membership Expired — Renew Now</div>
                {expiry && <div className={styles.membershipSub} style={{ color: '#C62828' }}>Expired on {fmt(expiry)}</div>}
              </div>
            </div>
            <button
              className={styles.renewBtn}
              style={{ background: '#C62828' }}
              onClick={() => setShowRenewDialog(true)}
              disabled={renewing}
            >
              {renewing ? 'Processing...' : 'Renew Membership  •  ₹5,000'}
            </button>
          </div>
        ) : isExpiringSoon ? (
          <div className={styles.membershipCard} style={{ background: '#FFF8E1', border: '1px solid #FFE082' }}>
            <div className={styles.membershipRow}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div className={styles.membershipTitle} style={{ color: '#E65100' }}>Renew Soon — {days} day{days === 1 ? '' : 's'} left</div>
                {expiry && <div className={styles.membershipSub} style={{ color: '#E65100' }}>Expires on {fmt(expiry)}</div>}
              </div>
            </div>
            <button
              className={styles.renewBtn}
              style={{ background: 'transparent', color: '#E65100', border: '1.5px solid #E65100' }}
              onClick={() => setShowRenewDialog(true)}
              disabled={renewing}
            >
              {renewing ? 'Processing...' : 'Renew Membership  •  ₹5,000'}
            </button>
          </div>
        ) : ms === 'active' ? (
          <div className={styles.membershipCard}>
            <div className={styles.membershipRow}>
              <div className={styles.membershipIconBox} style={{ background: '#E8F5E9' }}>✅</div>
              <div style={{ flex: 1 }}>
                <div className={styles.membershipTitle}>Membership Active</div>
                {expiry && <div className={styles.membershipSub}>Expires: {fmt(expiry)}  •  {days} day{days === 1 ? '' : 's'} left</div>}
              </div>
              <StatusBadge status="active" />
            </div>
          </div>
        ) : null}

        {/* Browse Marketplace */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Browse Marketplace</span>
            <button className={styles.seeAll} onClick={() => navigate('/marketplace')}>See All</button>
          </div>
          <button className={styles.exploreBtn} onClick={() => navigate('/marketplace')}>
            🛍️ Explore Products
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', path: '/home' },
          { icon: '🏪', label: 'Market', path: '/marketplace' },
          { icon: '📋', label: 'Orders', path: '/orders' },
          { icon: '👤', label: 'Profile', path: '/profile' },
        ].map((n) => (
          <button
            key={n.path}
            className={`${styles.navItem} ${location.pathname === n.path ? styles.navActive : ''}`}
            onClick={() => navigate(n.path)}
          >
            <span className={styles.navIcon}>{n.icon}</span>
            <span className={styles.navLabel}>{n.label}</span>
          </button>
        ))}
      </nav>

      {/* Renew Dialog */}
      {showRenewDialog && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3>Renew Membership</h3>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Annual membership renewal fee:</p>
            <div style={{ fontSize: 32, fontWeight: 800, margin: '8px 0' }}>₹5,000</div>
            <div className={styles.warningBox}>
              ⚠️ This fee is non-refundable and covers marketplace access for 1 year from today.
            </div>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancel} onClick={() => setShowRenewDialog(false)}>Cancel</button>
              <button className={styles.dialogConfirm} onClick={renewMembership}>Pay ₹5,000</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
