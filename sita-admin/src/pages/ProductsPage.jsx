import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate, formatCurrency, Pagination } from '../components/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvedFilter, setApprovedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (approvedFilter !== '') params.approved = approvedFilter;
    api.get('/admin/products', { params })
      .then(r => { setProducts(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, approvedFilter]);

  const approve = async (id) => {
    try {
      await api.put(`/admin/products/${id}/approve`);
      setMsg({ type: 'success', text: 'Product approved' });
      load();
    } catch (e) { setMsg({ type: 'error', text: 'Failed to approve' }); }
  };

  const reject = async (id) => {
    if (!window.confirm('Reject this product?')) return;
    try {
      await api.put(`/admin/products/${id}/reject`);
      setMsg({ type: 'success', text: 'Product rejected' });
      load();
    } catch (e) { setMsg({ type: 'error', text: 'Failed to reject' }); }
  };

  const removeProduct = async (id, name) => {
    if (!window.confirm(`Remove product "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setMsg({ type: 'success', text: 'Product removed' });
      load();
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to remove' }); }
  };

  return (
    <>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Products ({pagination?.total || 0})</h3>
        </div>
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters">
            <select className="filter-select" value={approvedFilter} onChange={e => { setApprovedFilter(e.target.value); setPage(1); }}>
              <option value="">All Products</option>
              <option value="false">Pending Approval</option>
              <option value="true">Approved</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            <table>
              <thead><tr>
                <th>Product</th><th>Vendor</th><th>Category</th>
                <th>Price</th><th>MOQ</th><th>Approved</th><th>Added</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {products.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No products found</td></tr>}
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div className="text-muted">{p.sku || '—'}</div>
                    </td>
                    <td>
                      <div>{p.vendor?.company_name}</div>
                      <div className="text-muted">{p.vendor?.status}</div>
                    </td>
                    <td><span className="badge badge-gray">{p.category?.replace('_', ' ')}</span></td>
                    <td>{formatCurrency(p.price_per_unit)} / {p.unit}</td>
                    <td>{p.moq} {p.unit}</td>
                    <td>{p.approved ? <span className="badge badge-success">Yes</span> : <span className="badge badge-warning">Pending</span>}</td>
                    <td className="text-muted">{formatDate(p.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!p.approved && <button className="btn btn-success btn-sm" onClick={() => approve(p.id)}>Approve</button>}
                        {p.approved && <button className="btn btn-danger btn-sm" onClick={() => reject(p.id)}>Reject</button>}
                        <button className="btn btn-danger btn-sm" onClick={() => removeProduct(p.id, p.name)}>Remove</button>
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
    </>
  );
}
