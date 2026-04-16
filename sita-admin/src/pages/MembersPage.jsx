import React, { useState, useEffect } from 'react';
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

const docLink = (url, label) => {
  if (!url) return <span style={{ color: '#9ca3af' }}>Not uploaded</span>;
  const full = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  return (
    <a href={full} target="_blank" rel="noopener noreferrer"
       style={{ color: '#1A237E', textDecoration: 'underline', fontSize: '13px' }}>
      {label} ↗
    </a>
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
  const [modal, setModal] = useState(null); // 'detail' | 'reject' | 'wallet'
  const [rejectReason, setRejectReason] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletDesc, setWalletDesc] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (membershipFilter !== '') params.membership_paid = membershipFilter;
    if (membershipStatusFilter) params.membership_status = membershipStatusFilter;
    if (categoryFilter) params.category = categoryFilter;
    api.get('/admin/members', { params })
      .then(r => { setMembers(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter, membershipFilter, membershipStatusFilter, categoryFilter]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

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
        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
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
                  📄 Documents
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ color: '#6b7280' }}>Business Reg. Cert: </span>
                    {docLink(selected.business_reg_certificate_url, 'View')}
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ color: '#6b7280' }}>FSSAI License: </span>
                    {docLink(selected.fssai_license_url, 'View')}
                  </div>
                </div>
              </div>

              {/* Photos */}
              {(selected.establishment_front_photo_url || selected.billing_counter_photo_url ||
                selected.kitchen_photo_url || selected.menu_card_photo_url) && (
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
                    ].map(({ url, label }) => url ? (
                      <a key={label} href={url.startsWith('http') ? url : `${BACKEND_URL}${url}`}
                         target="_blank" rel="noopener noreferrer"
                         style={{ display: 'block', textDecoration: 'none' }}>
                        <img
                          src={url.startsWith('http') ? url : `${BACKEND_URL}${url}`}
                          alt={label}
                          style={{ width: '100%', height: '72px', objectFit: 'cover',
                                   borderRadius: '6px', border: '1px solid #e5e7eb' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>
                          {label}
                        </div>
                      </a>
                    ) : (
                      <div key={label} style={{ height: '72px', background: '#f9fafb',
                           borderRadius: '6px', border: '1px dashed #d1d5db',
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           fontSize: '10px', color: '#9ca3af' }}>
                        {label}<br/>Not uploaded
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
