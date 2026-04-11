import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { statusBadge, formatDate, Pagination } from '../components/utils';

const CATEGORIES = ['food_beverages', 'housekeeping', 'linen_laundry', 'amenities', 'equipment', 'technology', 'furniture', 'other'];

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // 'detail' | 'reject' | 'add'
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '', company_name: '', category: 'food_beverages', gstin: '', city: '', state: '' });

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/vendors', { params })
      .then(r => { setVendors(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const openDetail = async (vendor) => {
    const r = await api.get(`/admin/vendors/${vendor.id}`);
    setSelected(r.data.vendor); setModal('detail');
  };

  const approve = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/vendors/${id}/approve`);
      setMsg({ type: 'success', text: 'Vendor approved' });
      setModal(null); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const reject = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/vendors/${selected.id}/reject`, { reason: rejectReason });
      setMsg({ type: 'success', text: 'Vendor rejected' });
      setModal(null); setRejectReason(''); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  const removeVendor = async (id, name) => {
    if (!window.confirm(`Remove vendor "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/vendors/${id}`);
      setMsg({ type: 'success', text: 'Vendor removed' });
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to remove' }); }
  };

  const addVendor = async () => {
    setActionLoading(true);
    try {
      await api.post('/admin/vendors', newVendor);
      setMsg({ type: 'success', text: 'Vendor created' });
      setModal(null); load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' }); }
    finally { setActionLoading(false); }
  };

  return (
    <>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Vendors ({pagination?.total || 0})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>+ Add Vendor</button>
        </div>
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters">
            <input className="filter-input" placeholder="Search name, company..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            <table>
              <thead><tr>
                <th>Company</th><th>Category</th><th>Contact</th>
                <th>City</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {vendors.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No vendors found</td></tr>}
                {vendors.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{v.company_name}</div>
                      <div className="text-muted">{v.name}</div>
                    </td>
                    <td><span className="badge badge-gray">{v.category?.replace('_', ' ')}</span></td>
                    <td>
                      <div>{v.phone}</div>
                      <div className="text-muted">{v.email}</div>
                    </td>
                    <td className="text-muted">{v.city || '—'}</td>
                    <td>{statusBadge(v.status)}</td>
                    <td className="text-muted">{formatDate(v.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openDetail(v)}>View</button>
                        {v.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => approve(v.id)}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setSelected(v); setModal('reject'); }}>Reject</button>
                          </>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => removeVendor(v.id, v.company_name)}>Remove</button>
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
              <h3>{selected.company_name}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Contact Person</label><span>{selected.name}</span></div>
                <div className="detail-item"><label>Status</label><span>{statusBadge(selected.status)}</span></div>
                <div className="detail-item"><label>Email</label><span>{selected.email}</span></div>
                <div className="detail-item"><label>Phone</label><span>{selected.phone}</span></div>
                <div className="detail-item"><label>Category</label><span>{selected.category?.replace('_', ' ')}</span></div>
                <div className="detail-item"><label>GSTIN</label><span>{selected.gstin || '—'}</span></div>
                <div className="detail-item"><label>City</label><span>{selected.city || '—'}</span></div>
                <div className="detail-item"><label>State</label><span>{selected.state || '—'}</span></div>
                <div className="detail-item"><label>Products</label><span>{selected.products?.length || 0} listed</span></div>
              </div>
            </div>
            <div className="modal-footer">
              {selected.status === 'pending' && (
                <>
                  <button className="btn btn-success" onClick={() => approve(selected.id)} disabled={actionLoading}>Approve</button>
                  <button className="btn btn-danger" onClick={() => setModal('reject')} disabled={actionLoading}>Reject</button>
                </>
              )}
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
              <h3>Reject Vendor</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea className="form-control" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={reject} disabled={actionLoading || !rejectReason.trim()}>Reject</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {modal === 'add' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>Add New Vendor</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-control" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Company Name *</label><input className="form-control" value={newVendor.company_name} onChange={e => setNewVendor({ ...newVendor, company_name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={newVendor.email} onChange={e => setNewVendor({ ...newVendor, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={newVendor.phone} onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Category *</label>
                  <select className="form-control" value={newVendor.category} onChange={e => setNewVendor({ ...newVendor, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">GSTIN</label><input className="form-control" value={newVendor.gstin} onChange={e => setNewVendor({ ...newVendor, gstin: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-control" value={newVendor.city} onChange={e => setNewVendor({ ...newVendor, city: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">State</label><input className="form-control" value={newVendor.state} onChange={e => setNewVendor({ ...newVendor, state: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={addVendor} disabled={actionLoading}>Create Vendor</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
