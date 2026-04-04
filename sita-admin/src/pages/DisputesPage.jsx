import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { statusBadge, formatDate, formatCurrency, Pagination } from '../components/utils';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // 'detail' | 'resolve' | 'reject'
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundToWallet, setRefundToWallet] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/disputes', { params })
      .then(r => { setDisputes(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

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

  const resetForm = () => { setResolution(''); setRefundAmount(''); setRefundToWallet(true); };

  const reasonLabel = {
    wrong_item: 'Wrong Item', damaged_item: 'Damaged Item', short_quantity: 'Short Quantity',
    non_delivery: 'Non Delivery', quality_issue: 'Quality Issue', overcharged: 'Overcharged', other: 'Other'
  };

  return (
    <>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Disputes ({pagination?.total || 0})</h3>
        </div>
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters">
            <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
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
              <h3>Dispute — {selected.order?.order_number}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
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
            </div>
            {['open', 'investigating'].includes(selected.status) && (
              <div className="modal-footer">
                <button className="btn btn-success" onClick={resolve} disabled={actionLoading || !resolution.trim()}>Resolve</button>
                <button className="btn btn-danger" onClick={rejectDispute} disabled={actionLoading || !resolution.trim()}>Reject Dispute</button>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              </div>
            )}
            {!['open', 'investigating'].includes(selected.status) && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
