import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { formatDate, formatCurrency, Pagination } from '../components/utils';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'oils',              label: 'Oils' },
  { value: 'grains',            label: 'Grains' },
  { value: 'spices',            label: 'Spices' },
  { value: 'gas',               label: 'Gas' },
  { value: 'cleaning_supplies', label: 'Cleaning Supplies' },
  { value: 'food_beverages',    label: 'Food & Beverages' },
  { value: 'housekeeping',      label: 'Housekeeping' },
  { value: 'linen_laundry',     label: 'Linen & Laundry' },
  { value: 'amenities',         label: 'Amenities' },
  { value: 'equipment',         label: 'Equipment' },
  { value: 'technology',        label: 'Technology' },
  { value: 'furniture',         label: 'Furniture' },
  { value: 'other',             label: 'Other' },
];

const UNITS = ['Kg', 'Liters', 'Bags', 'Cylinders', 'Tins', 'Piece', 'Dozen', 'Carton'];

const EMPTY_FORM = {
  name: '', category: '', vendor_id: '', market_price: '',
  price_per_unit: '', unit: '', stock_quantity: '', moq: '1', description: '', sku: '',
};

// ── Modal ────────────────────────────────────────────────────────────────────

function ProductModal({ mode, initial, vendors, onClose, onSaved }) {
  const [form, setForm]       = useState(initial || EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        name:           form.name.trim(),
        category:       form.category,
        vendor_id:      form.vendor_id,
        unit:           form.unit,
        price_per_unit: parseFloat(form.price_per_unit),
        moq:            parseInt(form.moq) || 1,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        description:    form.description.trim() || undefined,
        sku:            form.sku.trim() || undefined,
      };
      if (form.market_price) body.market_price = parseFloat(form.market_price);

      if (mode === 'add') {
        await api.post('/admin/products', body);
      } else {
        await api.put(`/admin/products/${initial.id}`, body);
      }
      onSaved();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? msgs.map(e => e.msg).join(' · ') : (err.response?.data?.message || 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'add' ? 'Add Product' : 'Edit Product';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580, width: '100%' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'grid', gap: '14px' }}>
            {error && (
              <div className="alert alert-error" style={{ margin: 0 }}>
                {error}
              </div>
            )}

            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">Product Name <span style={{ color: 'red' }}>*</span></label>
              <input
                className="form-control"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Refined Sunflower Oil"
                required
              />
            </div>

            {/* Category + Vendor (2-col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category <span style={{ color: 'red' }}>*</span></label>
                <select className="form-control" value={form.category} onChange={set('category')} required>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Vendor <span style={{ color: 'red' }}>*</span></label>
                <select className="form-control" value={form.vendor_id} onChange={set('vendor_id')} required>
                  <option value="">Select vendor…</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.company_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Market Price + SITA Special Price (2-col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Market Price (₹)</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.market_price}
                  onChange={set('market_price')}
                  placeholder="MRP / market price"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SITA Special Price (₹) <span style={{ color: 'red' }}>*</span></label>
                <input
                  className="form-control"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price_per_unit}
                  onChange={set('price_per_unit')}
                  placeholder="Price members pay"
                  required
                />
              </div>
            </div>

            {/* Unit + Stock Quantity + MOQ (3-col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Unit <span style={{ color: 'red' }}>*</span></label>
                <select className="form-control" value={form.unit} onChange={set('unit')} required>
                  <option value="">Select unit…</option>
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stock Qty</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={set('stock_quantity')}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min. Order Qty</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={form.moq}
                  onChange={set('moq')}
                  placeholder="1"
                />
              </div>
            </div>

            {/* SKU */}
            <div className="form-group">
              <label className="form-label">SKU (optional)</label>
              <input
                className="form-control"
                value={form.sku}
                onChange={set('sku')}
                placeholder="Vendor SKU / product code"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="Product details, brand, specifications…"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (mode === 'add' ? 'Add Product' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts]         = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [vendors, setVendors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [approvedFilter, setApprovedFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const [msg, setMsg]                   = useState(null);
  const [modal, setModal]               = useState(null); // null | 'add' | { mode:'edit', product }

  // Load vendors once for the dropdown
  useEffect(() => {
    api.get('/admin/vendors', { params: { limit: 200, status: 'active' } })
      .then(r => setVendors(r.data.data || []))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (approvedFilter !== '') params.approved = approvedFilter;
    api.get('/admin/products', { params })
      .then(r => { setProducts(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, approvedFilter]);

  useEffect(() => { load(); }, [load]);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleSaved = (successMsg) => {
    setModal(null);
    flash('success', successMsg || 'Product saved');
    load();
  };

  const approve = async (id) => {
    try {
      await api.put(`/admin/products/${id}/approve`);
      flash('success', 'Product approved — now visible in catalog');
      load();
    } catch { flash('error', 'Failed to approve'); }
  };

  const reject = async (id) => {
    if (!window.confirm('Reject and hide this product?')) return;
    try {
      await api.put(`/admin/products/${id}/reject`);
      flash('success', 'Product rejected');
      load();
    } catch { flash('error', 'Failed to reject'); }
  };

  const removeProduct = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      flash('success', 'Product deleted');
      load();
    } catch (e) { flash('error', e.response?.data?.message || 'Failed to delete'); }
  };

  const openEdit = (product) => {
    setModal({
      mode: 'edit',
      product: {
        ...EMPTY_FORM,
        id:             product.id,
        name:           product.name           || '',
        category:       product.category       || '',
        vendor_id:      product.vendor_id      || '',
        market_price:   product.market_price   ?? '',
        price_per_unit: product.price_per_unit ?? '',
        unit:           product.unit           || '',
        stock_quantity: product.stock_quantity ?? '',
        moq:            product.moq            ?? 1,
        description:    product.description    || '',
        sku:            product.sku            || '',
      }
    });
  };

  const categoryLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val?.replace(/_/g, ' ') || '—';

  return (
    <>
      {msg && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)} style={{ cursor: 'pointer' }}>
          {msg.text}
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Products ({pagination?.total || 0})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            + Add Product
          </button>
        </div>

        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters">
            <select
              className="filter-select"
              value={approvedFilter}
              onChange={e => { setApprovedFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Products</option>
              <option value="false">Pending Approval</option>
              <option value="true">Approved</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading
            ? <div className="loading"><div className="spinner" /></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Market Price</th>
                    <th>SITA Price</th>
                    <th>Unit</th>
                    <th>Stock</th>
                    <th>MOQ</th>
                    <th>Approved</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                        No products found
                      </td>
                    </tr>
                  )}
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        {p.sku && <div className="text-muted" style={{ fontSize: 12 }}>SKU: {p.sku}</div>}
                      </td>
                      <td>
                        <div>{p.vendor?.company_name || '—'}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{p.vendor?.status}</div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{categoryLabel(p.category)}</span>
                      </td>
                      <td className="text-muted">
                        {p.market_price ? formatCurrency(p.market_price) : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(p.price_per_unit)}
                      </td>
                      <td>{p.unit || '—'}</td>
                      <td>
                        <span style={{ color: p.stock_quantity === 0 ? '#dc2626' : 'inherit' }}>
                          {p.stock_quantity ?? 0}
                        </span>
                      </td>
                      <td>{p.moq} {p.unit}</td>
                      <td>
                        {p.approved
                          ? <span className="badge badge-success">Approved</span>
                          : <span className="badge badge-warning">Pending</span>}
                      </td>
                      <td className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(p.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(p)}
                          >
                            Edit
                          </button>
                          {!p.approved && (
                            <button className="btn btn-success btn-sm" onClick={() => approve(p.id)}>
                              Approve
                            </button>
                          )}
                          {p.approved && (
                            <button className="btn btn-warning btn-sm" onClick={() => reject(p.id)}>
                              Reject
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => removeProduct(p.id, p.name)}
                          >
                            Delete
                          </button>
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

      {/* Add modal */}
      {modal === 'add' && (
        <ProductModal
          mode="add"
          initial={EMPTY_FORM}
          vendors={vendors}
          onClose={() => setModal(null)}
          onSaved={() => handleSaved('Product added — pending admin approval')}
        />
      )}

      {/* Edit modal */}
      {modal?.mode === 'edit' && (
        <ProductModal
          mode="edit"
          initial={modal.product}
          vendors={vendors}
          onClose={() => setModal(null)}
          onSaved={() => handleSaved('Product updated successfully')}
        />
      )}
    </>
  );
}
