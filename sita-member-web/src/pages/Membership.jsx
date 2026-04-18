import React, { useState, useEffect } from 'react';
import {
  MdCardMembership, MdCalendarToday, MdTimer, MdPhone, MdEmail, MdInfo
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Membership() {
  const { user } = useAuth();
  const [member, setMember] = useState(null);

  useEffect(() => {
    api.get('/members/profile').then((res) => {
      const m = res.data?.member || res.data;
      if (m && m._id) setMember(m);
    }).catch(() => {});
  }, []);

  const data = member || user || {};

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const startDate = data.membership_start || data.created_at || data.createdAt;
  const expiryDate = data.membership_expiry;

  const calcDaysLeft = () => {
    if (!expiryDate) return null;
    return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calcDaysLeft();
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isPending = data.membership_status === 'pending';
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

  const statusConfig = () => {
    if (isPending) return { label: 'Pending', color: '#F57F17', bg: '#FFF8E1', border: '#FFE082' };
    if (isExpired) return { label: 'Expired', color: '#C62828', bg: '#FFEBEE', border: '#FFCDD2' };
    return { label: 'Active', color: '#2E7D32', bg: '#E8F5E9', border: '#C8E6C9' };
  };

  const status = statusConfig();

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.headerIcon}>
            <MdCardMembership style={{ fontSize: '2rem', color: '#1A237E' }} />
          </div>
          <div>
            <h2 style={styles.headerTitle}>Membership Details</h2>
            <p style={styles.headerSub}>{data.membership_plan || 'Annual Membership'}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ ...styles.statusBadge, background: status.bg, border: `1.5px solid ${status.border}` }}>
          <span style={{ ...styles.statusDot, background: status.color }} />
          <span style={{ ...styles.statusLabel, color: status.color }}>{status.label}</span>
        </div>

        {/* Date Details */}
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <div style={styles.detailIcon}>
              <MdCalendarToday style={{ color: '#1A237E', fontSize: '1.1rem' }} />
            </div>
            <div>
              <p style={styles.detailLabel}>Start Date</p>
              <p style={styles.detailValue}>{fmt(startDate)}</p>
            </div>
          </div>

          <div style={styles.detailItem}>
            <div style={styles.detailIcon}>
              <MdCalendarToday style={{ color: '#FF8F00', fontSize: '1.1rem' }} />
            </div>
            <div>
              <p style={styles.detailLabel}>Expiry Date</p>
              <p style={styles.detailValue}>{fmt(expiryDate)}</p>
            </div>
          </div>

          <div style={styles.detailItem}>
            <div style={styles.detailIcon}>
              <MdTimer style={{ color: isExpired ? '#C62828' : isExpiringSoon ? '#F57F17' : '#2E7D32', fontSize: '1.1rem' }} />
            </div>
            <div>
              <p style={styles.detailLabel}>Days Remaining</p>
              <p style={{ ...styles.detailValue, color: isExpired ? '#C62828' : isExpiringSoon ? '#F57F17' : '#212121' }}>
                {daysLeft === null ? '—' : isExpired ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div style={styles.detailItem}>
            <div style={styles.detailIcon}>
              <MdCardMembership style={{ color: '#1A237E', fontSize: '1.1rem' }} />
            </div>
            <div>
              <p style={styles.detailLabel}>Member Since</p>
              <p style={styles.detailValue}>{fmt(data.created_at || data.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Countdown — only when active */}
        {!isExpired && daysLeft !== null && (
          <div style={styles.countdownBox(isExpiringSoon)}>
            <MdInfo style={{ flexShrink: 0 }} />
            {isExpiringSoon
              ? `Your membership expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Please contact us to renew.`
              : `${daysLeft} days remaining in your current membership.`}
          </div>
        )}

        {/* Expired message */}
        {isExpired && (
          <div style={styles.expiredBox}>
            <p style={styles.expiredTitle}>Membership Expired</p>
            <p style={styles.expiredText}>
              Your membership has expired. Please contact SITA Foundation to renew your membership and continue enjoying exclusive member benefits.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <div style={styles.contactSection}>
          <p style={styles.contactTitle}>Contact SITA Foundation</p>
          <div style={styles.contactGrid}>
            <a href="tel:+919876543210" style={styles.contactItem}>
              <div style={{ ...styles.contactIcon, background: '#E8EAF6' }}>
                <MdPhone style={{ color: '#1A237E', fontSize: '1.1rem' }} />
              </div>
              <div>
                <p style={styles.contactLabel}>Phone</p>
                <p style={styles.contactValue}>+91 98765 43210</p>
              </div>
            </a>
            <a href="mailto:info@sitafoundation.in" style={styles.contactItem}>
              <div style={{ ...styles.contactIcon, background: '#FFF8E1' }}>
                <MdEmail style={{ color: '#FF8F00', fontSize: '1.1rem' }} />
              </div>
              <div>
                <p style={styles.contactLabel}>Email</p>
                <p style={styles.contactValue}>info@sitafoundation.in</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'center', padding: '8px 0' },
  card: {
    background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(26,35,126,0.10)',
    padding: '32px', width: '100%', maxWidth: 560,
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  headerIcon: {
    width: 56, height: 56, borderRadius: 14,
    background: '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#1A237E', marginBottom: 3 },
  headerSub: { fontSize: '0.85rem', color: '#757575' },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '10px 20px', borderRadius: 24, marginBottom: 24,
  },
  statusDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  statusLabel: { fontWeight: 800, fontSize: '1rem' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 },
  detailItem: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    background: '#F9F9F9', borderRadius: 10, padding: '14px',
  },
  detailIcon: {
    width: 36, height: 36, borderRadius: 8,
    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  detailLabel: { fontSize: '0.72rem', color: '#9E9E9E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' },
  detailValue: { fontSize: '0.95rem', fontWeight: 700, color: '#212121' },
  countdownBox: (soon) => ({
    display: 'flex', gap: 10, alignItems: 'center',
    padding: '12px 16px', borderRadius: 10, marginBottom: 20,
    background: soon ? '#FFF8E1' : '#E8F5E9',
    color: soon ? '#F57F17' : '#2E7D32',
    fontSize: '0.875rem', fontWeight: 500,
    border: `1px solid ${soon ? '#FFE082' : '#C8E6C9'}`,
  }),
  expiredBox: {
    background: '#FFEBEE', border: '1px solid #FFCDD2',
    borderRadius: 10, padding: '16px 20px', marginBottom: 20,
  },
  expiredTitle: { fontWeight: 700, color: '#C62828', marginBottom: 6 },
  expiredText: { fontSize: '0.875rem', color: '#B71C1C', lineHeight: 1.6 },
  contactSection: { borderTop: '1px solid #F0F0F0', paddingTop: 20 },
  contactTitle: { fontSize: '0.85rem', fontWeight: 600, color: '#757575', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.3px' },
  contactGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  contactItem: {
    display: 'flex', gap: 12, alignItems: 'center',
    background: '#F9F9F9', borderRadius: 10, padding: '12px 14px',
    textDecoration: 'none',
  },
  contactIcon: {
    width: 36, height: 36, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  contactLabel: { fontSize: '0.72rem', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 },
  contactValue: { fontSize: '0.82rem', fontWeight: 700, color: '#212121' },
};
