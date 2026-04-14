import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { statusBadge, formatDate, formatCurrency, Pagination } from '../components/utils';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
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
    api.get('/admin/members', { params })
      .then(r => { setMembers(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter, membershipFilter]);
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

  const creditWallet = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/members/${selected.id}/wallet/credit`, { amount: walletAmount, description: walletDesc });
      setMsg({ type: 'success', text: `₹${walletAmount} credited to wallet` });
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
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            <table>
              <thead><tr>
                <th>Name / Hotel</th><th>Phone</th><th>City</th>
                <th>Membership</th><th>Wallet</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {members.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No members found</td></tr>}
                {members.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      <div className="text-muted">{m.hotel_name}</div>
                    </td>
                    <td>{m.phone}</td>
                    <td className="text-muted">{m.city || '—'}</td>
                    <td>
                      {m.membership_active === false
                        ? <span className="badge badge-danger">Membership Cancelled</span>
                        : m.membership_paid
                        ? <span className="badge badge-success">Paid</span>
                        : <span className="badge badge-warning">Unpaid</span>}
                    </td>
                    <td>{formatCurrency(m.sita_wallet_balance)}</td>
                    <td>{statusBadge(m.status)}</td>
                    <td className="text-muted">{formatDate(m.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openDetail(m)}>View</button>
                        {m.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => approve(m.id)}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setSelected(m); setModal('reject'); }}>Reject</button>
                          </>
                        )}
                        {m.status === 'active' && m.membership_paid && m.membership_active !== false && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelMembership(m)}>Cancel Membership</button>
                        )}
                        {m.membership_active === false && (
                          <button className="btn btn-success btn-sm" onClick={() => revokeMembership(m)}>Revoke</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.id, m.name)}>Remove</button>
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

      {/* Detail Modal */}
      {modal === 'detail' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{selected.name}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Phone</label><span>{selected.phone}</span></div>
                <div className="detail-item"><label>Email</label><span>{selected.email || '—'}</span></div>
                <div className="detail-item"><label>Hotel Name</label><span>{selected.hotel_name}</span></div>
                <div className="detail-item"><label>Status</label><span>{statusBadge(selected.status)}</span></div>
                <div className="detail-item"><label>City</label><span>{selected.city || '—'}</span></div>
                <div className="detail-item"><label>State</label><span>{selected.state || '—'}</span></div>
                <div className="detail-item"><label>GSTIN</label><span>{selected.gstin || '—'}</span></div>
                <div className="detail-item">
                  <label>Membership</label>
                  <span>
                    {selected.membership_active === false
                      ? <span className="badge badge-danger">Membership Cancelled</span>
                      : selected.membership_paid
                      ? <>✅ Paid {selected.membership_paid_at && <span style={{ color: '#6b7280', fontSize: '12px' }}>on {formatDate(selected.membership_paid_at)}</span>}</>
                      : '❌ Unpaid'}
                  </span>
                </div>
                <div className="detail-item"><label>Wallet Balance</label><span>{formatCurrency(selected.sita_wallet_balance)}</span></div>
                <div className="detail-item"><label>Joined</label><span>{formatDate(selected.created_at)}</span></div>
              </div>
              {selected.rejection_reason && (
                <div className="alert alert-error" style={{ marginTop: '12px' }}>
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
                <button className="btn btn-success" onClick={() => markMembershipPaid(selected)} disabled={actionLoading}>Mark Membership Paid</button>
              )}
              {selected.status === 'active' && selected.membership_paid && selected.membership_active !== false && (
                <button className="btn btn-danger" onClick={() => cancelMembership(selected)} disabled={actionLoading}>Cancel Membership</button>
              )}
              {selected.membership_active === false && (
                <button className="btn btn-success" onClick={() => revokeMembership(selected)} disabled={actionLoading}>Revoke Cancellation</button>
              )}
              <button className="btn btn-ghost" onClick={() => setModal('wallet')}>Credit Wallet</button>
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

      {/* Wallet Credit Modal */}
      {modal === 'wallet' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Credit SITA Wallet</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px', color: '#4b5563' }}>Current balance: <strong>{formatCurrency(selected.sita_wallet_balance)}</strong></p>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" className="form-control" min="1" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <input type="text" className="form-control" value={walletDesc} onChange={e => setWalletDesc(e.target.value)} placeholder="Reason for credit..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={creditWallet} disabled={actionLoading || !walletAmount || !walletDesc}>Credit Wallet</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
