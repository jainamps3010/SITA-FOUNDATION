import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { statusBadge, formatDate, formatCurrency, Pagination } from '../components/utils';

const BACKEND_URL = 'http://localhost:3000';

const CATEGORIES = {
  hotels_restaurants:  { label: 'Hotels & Restaurants',          color: '#1565C0', bg: '#E3F2FD' },
  caterers:            { label: 'Caterers',                       color: '#2E7D32', bg: '#E8F5E9' },
  religious_annkshetra:{ label: 'Religious Ann-Kshetra',          color: '#6A1B9A', bg: '#F3E5F5' },
  bhojan_shala:        { label: 'Bhojan Shala',                   color: '#E65100', bg: '#FBE9E7' },
  tea_post_cafe:       { label: 'Tea Post / Cafe',                color: '#00695C', bg: '#E0F2F1' },
  ngo_charitable:      { label: 'NGOs / Charitable',              color: '#37474F', bg: '#ECEFF1' },
};

const categoryBadge = (cat) => {
  if (!cat) return <span style={{ color: '#9ca3af' }}>—</span>;
  const c = CATEGORIES[cat];
  if (!c) return <span className="badge badge-gray">{cat}</span>;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
      fontWeight: 600, color: c.color, background: c.bg, whiteSpace: 'nowrap',
    }}>{c.label}</span>
  );
};

/** Resolve any stored URL (relative or absolute) to a full http:// URL */
const fullUrl = (url) =>
  !url ? null : url.startsWith('http') ? url : `${BACKEND_URL}${url}`;

const isPdf = (url) => url && url.toLowerCase().endsWith('.pdf');

/** Open a document in a new browser tab — more reliable than <a target="_blank"> */
const openDoc = (url) => {
  const href = fullUrl(url);
  if (href) window.open(href, '_blank', 'noopener,noreferrer');
};

/**
 * DocCard — clickable card for a single uploaded document.
 * Shows a thumbnail for images, a PDF icon for PDFs, and "Not uploaded" when missing.
 * If an image URL turns out to contain a PDF (wrong extension), imgFailed state
 * switches it to the document-icon view so the "View" button still works.
 */
const DocCard = ({ url, label }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const href = fullUrl(url);

  if (!href) {
    return (
      <div style={{
        border: '1px dashed #d1d5db', borderRadius: 8, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f9fafb', minHeight: 56,
      }}>
        <span style={{ fontSize: 18 }}>📄</span>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Not uploaded</div>
        </div>
      </div>
    );
  }

  // Treat as document (PDF icon) if: extension is .pdf OR image failed to render
  const showAsDocument = isPdf(url) || imgFailed;

  return (
    <div
      onClick={() => openDoc(url)}
      title={`Open ${label} in new tab`}
      style={{
        border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
        cursor: 'pointer', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
    >
      {/* Preview area */}
      {showAsDocument ? (
        <div style={{
          height: 72, background: '#fef2f2',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ fontSize: 28 }}>📑</span>
          <span style={{ fontSize: 10, color: '#b91c1c', fontWeight: 600 }}>PDF — Click to View</span>
        </div>
      ) : (
        <div style={{ height: 72, background: '#f3f4f6', overflow: 'hidden' }}>
          <img
            src={href}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '6px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid #f3f4f6',
      }}>
        <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>{label}</span>
        <span style={{
          fontSize: 10, color: '#1A237E', fontWeight: 700,
          background: '#e8f0fe', borderRadius: 4, padding: '2px 6px',
        }}>View ↗</span>
      </div>
    </div>
  );
};

// Returns days remaining until expiry. Negative = expired.
const daysUntilExpiry = (expiryDateStr) => {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
};

const membershipStatusBadge = (m) => {
  const ms = m.membership_status;
  if (!m.membership_paid) return <span className="badge badge-warning">Unpaid</span>;
  if (ms === 'expired' || (m.membership_expiry_date && daysUntilExpiry(m.membership_expiry_date) < 0)) {
    return <span className="badge badge-danger">Expired</span>;
  }
  if (ms === 'cancelled' || m.membership_active === false) {
    return <span className="badge badge-danger">Cancelled</span>;
  }
  const days = daysUntilExpiry(m.membership_expiry_date);
  if (days !== null && days <= 30) {
    return <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:600, color:'#92400e', background:'#fef3c7' }}>Expiring Soon</span>;
  }
  return <span className="badge badge-success">Active</span>;
};

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending_payments'
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [membershipStatusFilter, setMembershipStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // 'detail' | 'reject' | 'wallet' | 'rejectPayment'
  const [rejectReason, setRejectReason] = useState('');
  const [paymentRejectReason, setPaymentRejectReason] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletDesc, setWalletDesc] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (activeTab === 'pending_payments') {
      params.payment_status = 'pending_verification';
    } else {
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (membershipFilter !== '') params.membership_paid = membershipFilter;
      if (membershipStatusFilter) params.membership_status = membershipStatusFilter;
      if (categoryFilter) params.category = categoryFilter;
    }
    api.get('/admin/members', { params })
      .then(r => { setMembers(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter, membershipFilter, membershipStatusFilter, categoryFilter, activeTab]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const verifyPayment = async (member) => {
    if (!window.confirm(`Verify payment of ₹5,000 from "${member.name}" (UTR: ${member.utr_number})?`)) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/members/${member.id}/verify-payment`);
      setMsg({ type: 'success', text: 'Payment verified and membership activated' });
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const openRejectPayment = (member) => {
    setSelected(member);
    setPaymentRejectReason('');
    setModal('rejectPayment');
  };

  const rejectPayment = async () => {
    if (!paymentRejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/members/${selected.id}/reject-payment`, { reason: paymentRejectReason });
      setMsg({ type: 'success', text: 'Payment rejected' });
      setModal(null); setPaymentRejectReason(''); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const openDetail = async (member) => {
    const r = await api.get(`/admin/members/${member.id}`);
    setSelected(r.data.member);
    setModal('detail');
  };

  const approve = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/members/${id}/approve`);
      setMsg({ type: 'success', text: 'Member approved' });
      setModal(null); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/members/${selected.id}/reject`, { reason: rejectReason });
      setMsg({ type: 'success', text: 'Member rejected' });
      setModal(null); setRejectReason(''); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const removeMember = async (id, name) => {
    if (!window.confirm(`Remove member "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/members/${id}`);
      setMsg({ type: 'success', text: 'Member removed' });
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to remove' }); }
  };

  const markMembershipPaid = async (member) => {
    if (!window.confirm(`Mark membership as paid for "${member.name}"? This will charge ₹5,000 and cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/members/${member.id}/membership/mark-paid`);
      setMsg({ type: 'success', text: 'Membership marked as paid' });
      if (modal === 'detail') {
        const r = await api.get(`/admin/members/${member.id}`);
        setSelected(r.data.member);
      }
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const cancelMembership = async (member) => {
    if (!window.confirm(`Are you sure you want to cancel this member's membership?`)) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/members/${member.id}/cancel-membership`);
      setMsg({ type: 'success', text: 'Membership cancelled successfully' });
      if (modal === 'detail') {
        const r = await api.get(`/admin/members/${member.id}`);
        setSelected(r.data.member);
      }
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to cancel membership' }); }
    finally { setActionLoading(false); }
  };

  const revokeMembership = async (member) => {
    if (!window.confirm(`Revoke membership cancellation for "${member.name}"? This will restore their active membership.`)) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/members/${member.id}/revoke-membership`);
      setMsg({ type: 'success', text: 'Membership cancellation revoked' });
      if (modal === 'detail') {
        const r = await api.get(`/admin/members/${member.id}`);
        setSelected(r.data.member);
      }
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to revoke' }); }
    finally { setActionLoading(false); }
  };

  const extendMembership = async (member) => {
    if (!window.confirm(`Extend membership for "${member.name}" by 1 year? This is non-refundable.`)) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/members/${member.id}/extend-membership`);
      setMsg({ type: 'success', text: 'Membership extended by 1 year' });
      if (modal === 'detail') {
        const r = await api.get(`/admin/members/${member.id}`);
        setSelected(r.data.member);
      }
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to extend' }); }
    finally { setActionLoading(false); }
  };

  const openWallet = (member) => {
    setSelected(member);
    setWalletAmount('');
    setWalletDesc('');
    setModal('wallet');
  };

  const creditWallet = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/members/${selected.id}/wallet/credit`, { amount: walletAmount, reason: walletDesc });
      setMsg({ type: 'success', text: `₹${walletAmount} credited to wallet` });
      setModal(null); setWalletAmount(''); setWalletDesc(''); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const debitWallet = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/members/${selected.id}/wallet/debit`, { amount: walletAmount, reason: walletDesc });
      setMsg({ type: 'success', text: `₹${walletAmount} deducted from wallet` });
      setModal(null); setWalletAmount(''); setWalletDesc(''); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  return (
    <>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Members ({pagination?.total || 0})</h3>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', padding: '0 20px' }}>
          {[
            { key: 'all', label: 'All Members' },
            { key: 'pending_payments', label: '🕐 Pending Payments' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #1A237E' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 700 : 400,
                color: activeTab === tab.key ? '#1A237E' : '#6b7280',
                fontSize: '14px',
                marginBottom: '-2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'all' && (
          <div className="card-body" style={{ paddingBottom: 0 }}>
            <div className="filters">
              <input className="filter-input" placeholder="Search name, hotel, phone..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
              <select className="filter-select" value={membershipFilter} onChange={e => { setMembershipFilter(e.target.value); setPage(1); }}>
                <option value="">All Membership</option>
                <option value="true">Paid</option>
                <option value="false">Unpaid</option>
              </select>
              <select className="filter-select" value={membershipStatusFilter} onChange={e => { setMembershipStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
              <select className="filter-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : activeTab === 'pending_payments' ? (
            <table>
              <thead><tr>
                <th>Member Name</th><th>Phone</th><th>UTR / Transaction ID</th>
                <th>Amount</th><th>Submitted On</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {members.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                    No pending payments
                  </td></tr>
                )}
                {members.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      <div className="text-muted">{m.hotel_name}</div>
                    </td>
                    <td>{m.phone}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1A237E' }}>
                        {m.utr_number || '—'}
                      </span>
                    </td>
                    <td><strong>₹5,000</strong></td>
                    <td className="text-muted">{m.payment_submitted_at ? formatDate(m.payment_submitted_at) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => verifyPayment(m)}
                          disabled={actionLoading}
                        >
                          Verify Payment
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openRejectPayment(m)}
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead><tr>
                <th>Name / Hotel</th><th>Phone</th><th>City</th><th>Category</th>
                <th>Membership</th><th>Expiry Date</th><th>Days Left</th>
                <th>Wallet</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {members.length === 0 && <tr><td colSpan={11} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No members found</td></tr>}
                {members.map(m => {
                  const days = daysUntilExpiry(m.membership_expiry_date);
                  return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      <div className="text-muted">{m.hotel_name}</div>
                    </td>
                    <td>{m.phone}</td>
                    <td className="text-muted">{m.city || '—'}</td>
                    <td>{categoryBadge(m.category)}</td>
                    <td>{membershipStatusBadge(m)}</td>
                    <td className="text-muted">
                      {m.membership_expiry_date ? formatDate(m.membership_expiry_date) : '—'}
                    </td>
                    <td>
                      {days === null ? '—' : days < 0
                        ? <span style={{ color: '#c81e1e', fontWeight: 600 }}>Expired</span>
                        : days <= 30
                        ? <span style={{ color: '#92400e', fontWeight: 600 }}>{days}d</span>
                        : <span style={{ color: '#059669' }}>{days}d</span>}
                    </td>
                    <td>{formatCurrency(m.sita_wallet_balance)}</td>
                    <td>{statusBadge(m.status)}</td>
                    <td className="text-muted">{formatDate(m.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openDetail(m)}>View</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: '#059669' }} onClick={() => openWallet(m)}>Wallet</button>
                        {m.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => approve(m.id)}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setSelected(m); setModal('reject'); }}>Reject</button>
                          </>
                        )}
                        {m.payment_status === 'pending_verification' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => verifyPayment(m)} disabled={actionLoading}>Verify Pay</button>
                            <button className="btn btn-danger btn-sm" onClick={() => openRejectPayment(m)} disabled={actionLoading}>Reject Pay</button>
                          </>
                        )}
                        {m.membership_paid && m.membership_active !== false && (
                          <button className="btn btn-ghost btn-sm" style={{ color: '#1A237E' }} onClick={() => extendMembership(m)}>Extend +1yr</button>
                        )}
                        {m.status === 'active' && m.membership_paid && m.membership_active !== false && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelMembership(m)}>Cancel</button>
                        )}
                        {m.membership_active === false && (
                          <button className="btn btn-success btn-sm" onClick={() => revokeMembership(m)}>Revoke</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.id, m.name)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: '12px 20px' }}>
          <Pagination pagination={pagination} onPage={setPage} />
        </div>
      </div>

      {/* Detail Modal */}
      {modal === 'detail' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{selected.name}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

              {/* Basic Info */}
              <div className="detail-grid">
                <div className="detail-item"><label>Phone</label><span>{selected.phone}</span></div>
                <div className="detail-item"><label>Email</label><span>{selected.email || '—'}</span></div>
                <div className="detail-item"><label>Business Name</label><span>{selected.hotel_name}</span></div>
                <div className="detail-item"><label>Category</label><span>{categoryBadge(selected.category)}</span></div>
                <div className="detail-item"><label>Status</label><span>{statusBadge(selected.status)}</span></div>
                <div className="detail-item"><label>GST / GSTIN</label><span>{selected.gst_number || selected.gstin || '—'}</span></div>
                <div className="detail-item"><label>City</label><span>{selected.city || '—'}</span></div>
                <div className="detail-item"><label>District</label><span>{selected.district || '—'}</span></div>
                <div className="detail-item"><label>State</label><span>{selected.state || '—'}</span></div>
                <div className="detail-item"><label>Pincode</label><span>{selected.pincode || '—'}</span></div>
                <div className="detail-item">
                  <label>Membership</label>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {membershipStatusBadge(selected)}
                    {selected.membership_expiry_date && (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>
                        Expires: {formatDate(selected.membership_expiry_date)}
                        {(() => { const d = daysUntilExpiry(selected.membership_expiry_date); return d !== null ? ` (${d < 0 ? 'Expired' : d + 'd left'})` : ''; })()}
                      </span>
                    )}
                    {selected.membership_paid_at && (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Last paid: {formatDate(selected.membership_paid_at)}</span>
                    )}
                  </span>
                </div>
                <div className="detail-item"><label>Wallet Balance</label><span>{formatCurrency(selected.sita_wallet_balance)}</span></div>
                <div className="detail-item"><label>Joined</label><span>{formatDate(selected.created_at)}</span></div>
              </div>

              {/* Documents */}
              <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '10px' }}>
                  📄 KYC Documents
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <DocCard url={selected.business_reg_certificate_url} label="GST / Business Reg. Cert" />
                  <DocCard url={selected.fssai_license_url} label="FSSAI License" />
                </div>
              </div>

              {/* Establishment Photos */}
              <div style={{ marginTop: '14px', borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '10px' }}>
                  📸 Establishment Photos
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { url: selected.establishment_front_photo_url, label: 'Front View' },
                    { url: selected.billing_counter_photo_url,     label: 'Billing Counter' },
                    { url: selected.kitchen_photo_url,             label: 'Kitchen' },
                    { url: selected.menu_card_photo_url,           label: 'Menu Card' },
                  ].map(({ url, label }) => (
                    <DocCard key={label} url={url} label={label} />
                  ))}
                </div>
              </div>

              {/* GPS Location */}
              {selected.latitude && selected.longitude && (
                <div style={{ marginTop: '14px', borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                    📍 GPS Location
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: '#4b5563', fontFamily: 'monospace' }}>
                      {parseFloat(selected.latitude).toFixed(5)}, {parseFloat(selected.longitude).toFixed(5)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#1A237E', textDecoration: 'underline' }}>
                      View on Google Maps ↗
                    </a>
                    {selected.geo_timestamp && (
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        Captured {formatDate(selected.geo_timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {selected.rejection_reason && (
                <div className="alert alert-error" style={{ marginTop: '14px' }}>
                  <strong>Rejection reason:</strong> {selected.rejection_reason}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selected.status === 'pending' && (
                <>
                  <button className="btn btn-success" onClick={() => approve(selected.id)} disabled={actionLoading}>Approve</button>
                  <button className="btn btn-danger" onClick={() => setModal('reject')} disabled={actionLoading}>Reject</button>
                </>
              )}
              {!selected.membership_paid && selected.membership_active !== false && (
                <button className="btn btn-success" onClick={() => markMembershipPaid(selected)} disabled={actionLoading}>Mark Annual Fee Paid</button>
              )}
              {selected.membership_paid && selected.membership_active !== false && (
                <button className="btn btn-ghost" style={{ color: '#1A237E', border: '1px solid #1A237E' }} onClick={() => extendMembership(selected)} disabled={actionLoading}>Extend +1 Year</button>
              )}
              {selected.status === 'active' && selected.membership_paid && selected.membership_active !== false && (
                <button className="btn btn-danger" onClick={() => cancelMembership(selected)} disabled={actionLoading}>Cancel Membership</button>
              )}
              {selected.membership_active === false && (
                <button className="btn btn-success" onClick={() => revokeMembership(selected)} disabled={actionLoading}>Revoke Cancellation</button>
              )}
              <button className="btn btn-ghost" onClick={() => { setWalletAmount(''); setWalletDesc(''); setModal('wallet'); }}>Wallet</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modal === 'reject' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Member</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px', color: '#4b5563' }}>Rejecting <strong>{selected.name}</strong> from {selected.hotel_name}</p>
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea className="form-control" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Provide a reason..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={reject} disabled={actionLoading || !rejectReason.trim()}>Confirm Reject</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {modal === 'rejectPayment' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Payment</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '8px', color: '#4b5563' }}>
                Rejecting payment from <strong>{selected.name}</strong>
              </p>
              <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '13px' }}>
                UTR: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1A237E' }}>{selected.utr_number}</span>
              </p>
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={paymentRejectReason}
                  onChange={e => setPaymentRejectReason(e.target.value)}
                  placeholder="e.g. UTR not found, amount mismatch..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={rejectPayment} disabled={actionLoading || !paymentRejectReason.trim()}>
                Confirm Reject
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {modal === 'wallet' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Wallet — {selected.name}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: '#4b5563' }}>
                Current balance: <strong style={{ fontSize: '16px' }}>{formatCurrency(selected.sita_wallet_balance)}</strong>
              </p>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" className="form-control" min="1" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <input type="text" className="form-control" value={walletDesc} onChange={e => setWalletDesc(e.target.value)} placeholder="Enter reason..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={creditWallet} disabled={actionLoading || !walletAmount || !walletDesc}>
                Add to Wallet
              </button>
              <button className="btn btn-danger" onClick={debitWallet} disabled={actionLoading || !walletAmount || !walletDesc}>
                Deduct from Wallet
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
