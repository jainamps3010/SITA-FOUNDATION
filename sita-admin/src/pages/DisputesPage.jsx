import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { statusBadge, formatDate, formatCurrency, Pagination } from '../components/utils';

const TABS = [
  { key: 'disputes', label: 'Disputes' },
  { key: 'feedback', label: 'Feedback' },
];

function StarRating({ rating }) {
  return (
    <span style={{ fontSize: 16, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#FF8F00' : '#e0e0e0' }}>★</span>
      ))}
    </span>
  );
}

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState('disputes');
  const [disputes, setDisputes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundToWallet, setRefundToWallet] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20, type: activeTab === 'feedback' ? 'feedback' : 'dispute' };
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/disputes', { params })
      .then(r => { setDisputes(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); setStatusFilter(''); }, [activeTab]);
  useEffect(() => { load(); }, [page, statusFilter, activeTab]);

  const openDetail = async (dispute) => {
    const r = await api.get(`/admin/disputes/${dispute.id}`);
    setSelected(r.data.dispute);
    setModal('detail');
  };

  const resolve = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/disputes/${selected.id}/resolve`, {
        resolution,
        refund_amount: refundAmount || 0,
        refund_to_wallet: refundToWallet
      });
      setMsg({ type: 'success', text: 'Dispute resolved' });
      setModal(null); resetForm(); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const rejectDispute = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/disputes/${selected.id}/reject`, { resolution });
      setMsg({ type: 'success', text: 'Dispute rejected' });
      setModal(null); resetForm(); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const markReviewed = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/disputes/${id}/mark-reviewed`);
      setMsg({ type: 'success', text: 'Marked as reviewed' });
      setModal(null); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const markResolved = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/disputes/${id}/resolve`, { resolution: 'Resolved by admin', refund_amount: 0 });
      setMsg({ type: 'success', text: 'Marked as resolved' });
      setModal(null); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const resetForm = () => { setResolution(''); setRefundAmount(''); setRefundToWallet(true); };

  const reasonLabel = {
    wrong_item: 'Wrong Item', damaged_item: 'Damaged Item', short_quantity: 'Short Quantity',
    non_delivery: 'Non Delivery', quality_issue: 'Quality Issue', overcharged: 'Overcharged', other: 'Other'
  };

  const isFeedback = activeTab === 'feedback';

  return (
    <>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3>{isFeedback ? 'Member Feedback' : 'Disputes'} ({pagination?.total || 0})</h3>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 20px' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '12px 20px',
                fontWeight: 600,
                fontSize: 14,
                background: 'none',
                borderBottom: activeTab === t.key ? '2px solid #1A237E' : '2px solid transparent',
                color: activeTab === t.key ? '#1A237E' : '#6b7280',
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters">
            <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="open">Open</option>
              {!isFeedback && <option value="investigating">Investigating</option>}
              {isFeedback && <option value="reviewed">Reviewed</option>}
              <option value="resolved">Resolved</option>
              {!isFeedback && <option value="rejected">Rejected</option>}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            isFeedback ? (
              <table>
                <thead><tr>
                  <th>Member / Hotel</th><th>Category</th><th>Rating</th>
                  <th>Description</th><th>Order ID</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {disputes.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No feedback found</td></tr>}
                  {disputes.map(d => (
                    <tr key={d.id}>
                      <td>
                        <div>{d.member?.name}</div>
                        <div className="text-muted">{d.member?.hotel_name}</div>
                      </td>
                      <td><span className="badge badge-info">{d.category}</span></td>
                      <td><StarRating rating={d.rating || 0} /></td>
                      <td style={{ maxWidth: 240 }}>
                        <div style={{ fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                          {d.description}
                        </div>
                      </td>
                      <td className="text-muted">{d.order?.order_number || '—'}</td>
                      <td>{statusBadge(d.status)}</td>
                      <td className="text-muted">{formatDate(d.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openDetail(d)}>View</button>
                          {(d.status === 'open') && (
                            <button className="btn btn-primary btn-sm" onClick={() => markReviewed(d.id)} disabled={actionLoading}>Reviewed</button>
                          )}
                          {(d.status === 'open' || d.status === 'reviewed') && (
                            <button className="btn btn-success btn-sm" onClick={() => markResolved(d.id)} disabled={actionLoading}>Resolved</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead><tr>
                  <th>Order #</th><th>Member / Hotel</th><th>Vendor</th>
                  <th>Reason</th><th>Order Value</th><th>Status</th><th>Raised</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {disputes.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No disputes found</td></tr>}
                  {disputes.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.order?.order_number}</strong></td>
                      <td>
                        <div>{d.member?.name}</div>
                        <div className="text-muted">{d.member?.hotel_name}</div>
                      </td>
                      <td>{d.vendor?.company_name}</td>
                      <td><span className="badge badge-warning">{reasonLabel[d.reason] || d.reason}</span></td>
                      <td>{formatCurrency(d.order?.total_amount)}</td>
                      <td>{statusBadge(d.status)}</td>
                      <td className="text-muted">{formatDate(d.created_at)}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openDetail(d)}>
                          {d.status === 'open' || d.status === 'investigating' ? 'Resolve' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
        <div style={{ padding: '12px 20px' }}>
          <Pagination pagination={pagination} onPage={setPage} />
        </div>
      </div>

      {/* Detail / Resolve Modal */}
      {modal === 'detail' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{selected.type === 'feedback' ? 'Feedback Detail' : `Dispute — ${selected.order?.order_number}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {selected.type === 'feedback' ? (
                <>
                  <div className="detail-grid" style={{ marginBottom: '16px' }}>
                    <div className="detail-item"><label>Member</label><span>{selected.member?.name}</span></div>
                    <div className="detail-item"><label>Hotel</label><span>{selected.member?.hotel_name}</span></div>
                    <div className="detail-item"><label>Category</label><span>{selected.category}</span></div>
                    <div className="detail-item"><label>Rating</label><span><StarRating rating={selected.rating || 0} /></span></div>
                    <div className="detail-item"><label>Status</label><span>{statusBadge(selected.status)}</span></div>
                    {selected.order && <div className="detail-item"><label>Order</label><span>{selected.order?.order_number}</span></div>}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ fontSize: '12px', color: '#6b7280' }}>FEEDBACK</strong>
                    <p style={{ marginTop: '6px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px' }}>{selected.description}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-grid" style={{ marginBottom: '16px' }}>
                    <div className="detail-item"><label>Member</label><span>{selected.member?.name}</span></div>
                    <div className="detail-item"><label>Hotel</label><span>{selected.member?.hotel_name}</span></div>
                    <div className="detail-item"><label>Vendor</label><span>{selected.vendor?.company_name}</span></div>
                    <div className="detail-item"><label>Status</label><span>{statusBadge(selected.status)}</span></div>
                    <div className="detail-item"><label>Reason</label><span>{reasonLabel[selected.reason]}</span></div>
                    <div className="detail-item"><label>Order Value</label><span>{formatCurrency(selected.order?.total_amount)}</span></div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ fontSize: '12px', color: '#6b7280' }}>MEMBER DESCRIPTION</strong>
                    <p style={{ marginTop: '6px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px' }}>{selected.description}</p>
                  </div>
                  {selected.status === 'resolved' && (
                    <div className="alert alert-success">
                      <strong>Resolution:</strong> {selected.resolution}
                      {selected.refund_amount && <div>Refund: {formatCurrency(selected.refund_amount)} {selected.refund_to_wallet ? '→ SITA Wallet' : ''}</div>}
                    </div>
                  )}
                  {selected.status === 'rejected' && (
                    <div className="alert alert-error">
                      <strong>Rejection reason:</strong> {selected.resolution}
                    </div>
                  )}
                  {['open', 'investigating'].includes(selected.status) && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Resolution Notes *</label>
                        <textarea className="form-control" rows={3} value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe the resolution..." />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Refund Amount (₹)</label>
                          <input type="number" className="form-control" min="0" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder="0" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Refund Method</label>
                          <select className="form-control" value={refundToWallet} onChange={e => setRefundToWallet(e.target.value === 'true')}>
                            <option value="true">Credit to SITA Wallet</option>
                            <option value="false">External Refund</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              {selected.type === 'feedback' && selected.status === 'open' && (
                <>
                  <button className="btn btn-primary" onClick={() => markReviewed(selected.id)} disabled={actionLoading}>Mark Reviewed</button>
                  <button className="btn btn-success" onClick={() => markResolved(selected.id)} disabled={actionLoading}>Mark Resolved</button>
                </>
              )}
              {selected.type === 'feedback' && selected.status === 'reviewed' && (
                <button className="btn btn-success" onClick={() => markResolved(selected.id)} disabled={actionLoading}>Mark Resolved</button>
              )}
              {selected.type !== 'feedback' && ['open', 'investigating'].includes(selected.status) && (
                <>
                  <button className="btn btn-success" onClick={resolve} disabled={actionLoading || !resolution.trim()}>Resolve</button>
                  <button className="btn btn-danger" onClick={rejectDispute} disabled={actionLoading || !resolution.trim()}>Reject Dispute</button>
                </>
              )}
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
