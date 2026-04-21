import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import styles from './ProfilePage.module.css';

function fmt(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', hotel_name: '', hotel_address: '', city: '', state: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/members/profile');
        const m = res.data.member;
        setMember(m);
        localStorage.setItem('member_data', JSON.stringify(m));
        setForm({
          name: m.name || '',
          email: m.email || '',
          hotel_name: m.hotel_name || '',
          hotel_address: m.hotel_address || '',
          city: m.city || '',
          state: m.state || '',
        });
      } catch {
        const cached = (() => { try { return JSON.parse(localStorage.getItem('member_data') || '{}'); } catch { return {}; } })();
        setMember(cached);
        setForm({
          name: cached.name || '',
          email: cached.email || '',
          hotel_name: cached.hotel_name || '',
          hotel_address: cached.hotel_address || '',
          city: cached.city || '',
          state: cached.state || '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/members/profile', form);
      const updated = { ...member, ...form };
      setMember(updated);
      localStorage.setItem('member_data', JSON.stringify(updated));
      toast('Profile updated', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('member_token');
    localStorage.removeItem('member_data');
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
          <span className={styles.title}>My Profile</span>
          <div style={{ width: 40 }} />
        </div>
        <div className={styles.center}><div className={styles.spinner} /></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <div className={styles.headerCenter}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <span className={styles.title}>My Profile</span>
        </div>
        <button className={styles.saveBtn} onClick={saveProfile} disabled={saving}>
          {saving ? '...' : '💾'}
        </button>
      </div>

      <div className={styles.content}>
        {/* Avatar Card */}
        <div className={styles.avatarCard}>
          <div className={styles.avatar}>👤</div>
          <div className={styles.memberName}>{member?.name || '—'}</div>
          <div className={styles.memberPhone}>+91 {member?.phone || ''}</div>
          <div className={styles.badgeRow}>
            {member?.status && <StatusBadge status={member.status} />}
            {member?.membership_paid && (
              <span className={styles.memberBadge}>✅ Member</span>
            )}
          </div>
        </div>

        {/* Membership Status Card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Membership</div>
          <InfoRow label="Status" value={<StatusBadge status={member?.membership_status || 'pending'} />} />
          {member?.membership_expiry_date && (
            <InfoRow label="Expires" value={fmt(member.membership_expiry_date)} />
          )}
          {member?.gstin && <InfoRow label="GSTIN" value={member.gstin} />}
        </div>

        {/* KYC */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>KYC Status</div>
          <InfoRow label="Account Status" value={<StatusBadge status={member?.status || 'pending'} />} />
          <InfoRow label="Membership Paid" value={member?.membership_paid ? '✅ Yes' : '❌ No'} />
        </div>

        {/* Personal Details */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Personal Details</div>
          <Field label="Full Name" icon="👤" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Email" icon="✉️" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
        </div>

        {/* Business Details */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Business Details</div>
          <Field label="Hotel / Restaurant Name" icon="🏨" value={form.hotel_name} onChange={(v) => setForm({ ...form, hotel_name: v })} />
          <Field label="Business Address" icon="📍" value={form.hotel_address} onChange={(v) => setForm({ ...form, hotel_address: v })} multiline />
          <div className={styles.row2}>
            <Field label="City" icon="🏙️" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="State" icon="🗺️" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </div>
        </div>

        {/* Wallet */}
        <div className={styles.card}>
          <div className={styles.walletRow}>
            <span style={{ fontSize: 28 }}>👛</span>
            <div>
              <div style={{ fontWeight: 600 }}>SITA Wallet</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Store Credit</div>
            </div>
            <span className={styles.walletBal}>₹{parseFloat(member?.sita_wallet_balance || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Feedback & Contact */}
        <button
          className={styles.logoutBtn}
          style={{ background: '#E8F5E9', color: '#2E7D32', borderColor: '#A5D6A7' }}
          onClick={() => navigate('/feedback')}
        >
          💬 Give Feedback
        </button>
        <button
          className={styles.logoutBtn}
          style={{ background: '#E3F2FD', color: '#1565C0', borderColor: '#90CAF9' }}
          onClick={() => navigate('/contact')}
        >
          📞 Contact Us
        </button>

        {/* Logout */}
        <button className={styles.logoutBtn} onClick={() => setShowLogoutDialog(true)}>
          🚪 Logout
        </button>

        <div style={{ height: 32 }} />
      </div>

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3>Logout</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Are you sure you want to logout?</p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancel} onClick={() => setShowLogoutDialog(false)}>Cancel</button>
              <button className={styles.dialogLogout} onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--divider)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function Field({ label, icon, value, onChange, type = 'text', multiline = false }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{icon} {label}</label>
      {multiline ? (
        <textarea
          className={styles.fieldInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
        />
      ) : (
        <input
          className={styles.fieldInput}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
