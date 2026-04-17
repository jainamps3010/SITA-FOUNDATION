import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { formatDate } from '../components/utils';

const CATEGORIES = ['Oils', 'Grains', 'Spices', 'Gas', 'Cleaning'];
const ENTITY_TYPES = ['Hotel', 'Restaurant', 'Resort', 'Caterer', 'Annakshetra', 'Temple Kitchen'];

function exportCSV(rows) {
  const headers = ['Entity', 'Type', 'District', 'Taluka', 'Agent', 'Product', 'Brand',
                   'Category', 'Monthly Qty', 'Annual Qty', 'Unit', 'Price/Unit', 'Survey Date'];
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      `"${r.entity_name || ''}"`, r.entity_type || '', r.district || '', r.taluka || '',
      r.agent_id || '', `"${r.product_name || ''}"`, `"${r.brand || ''}"`,
      r.category || '', r.monthly_quantity, r.annual_quantity, r.unit || '',
      r.price_per_unit, `"${formatDate(r.survey_date)}"`
    ].join(','))
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `survey-data-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SurveyDataPage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');
  const [entityType, setEntityType] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modal, setModal] = useState(null); // { entityId, entityName }
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { entityId, entityName } or 'bulk'
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (district) params.district = district;
    if (entityType) params.entity_type = entityType;
    if (category) params.category = category;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    api.get('/admin/survey-data', { params })
      .then(r => { setRows(r.data.data); setSummary(r.data.summary); setSelectedIds(new Set()); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [district, entityType, category, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const clearFilters = () => {
    setDistrict(''); setEntityType(''); setCategory('');
    setDateFrom(''); setDateTo('');
  };

  // Unique entity ids in current rows
  const uniqueEntityIds = [...new Set(rows.map(r => r.entity_id))];
  const allSelected = uniqueEntityIds.length > 0 && uniqueEntityIds.every(id => selectedIds.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(uniqueEntityIds));
    }
  };

  const toggleEntity = (entityId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  };

  const handleDeleteSingle = async () => {
    if (!confirmDelete || confirmDelete === 'bulk') return;
    setDeleting(true);
    try {
      await api.delete(`/admin/survey/${confirmDelete.entityId}`);
      setRows(prev => prev.filter(r => r.entity_id !== confirmDelete.entityId));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(confirmDelete.entityId); return n; });
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete survey.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteBulk = async () => {
    if (confirmDelete !== 'bulk') return;
    setDeleting(true);
    const ids = [...selectedIds];
    try {
      await api.delete('/admin/survey/bulk', { data: { ids } });
      setRows(prev => prev.filter(r => !ids.includes(r.entity_id)));
      setSelectedIds(new Set());
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete surveys.');
    } finally {
      setDeleting(false);
    }
  };

  const modalRows = modal ? rows.filter(r => r.entity_id === modal.entityId) : [];

  return (
    <>
      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 420, width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#b71c1c' }}>Delete Survey</h3>
            <p style={{ margin: '0 0 20px', color: '#444', lineHeight: 1.5 }}>
              {confirmDelete === 'bulk'
                ? `Are you sure you want to delete ${selectedIds.size} selected ${selectedIds.size === 1 ? 'entity' : 'entities'}? This will permanently delete all consumption data for these surveys.`
                : `Are you sure you want to delete the survey for "${confirmDelete.entityName}"? This will delete all consumption data for this entity survey.`}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >Cancel</button>
              <button
                className="btn btn-sm"
                style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 8,
                         padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
                onClick={confirmDelete === 'bulk' ? handleDeleteBulk : handleDeleteSingle}
                disabled={deleting}
              >{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Entity Detail Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680,
                        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1a237e' }}>{modal.entityName}</h3>
                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{modalRows.length} products recorded</div>
              </div>
              <button onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                  <tr>
                    {['Product', 'Category', 'Monthly Qty', 'Annual Qty', 'Unit', 'Price/Unit'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12,
                                          fontWeight: 700, color: '#555', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modalRows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{r.product_name}</div>
                        {r.brand && <div style={{ fontSize: 11, color: '#aaa' }}>{r.brand}</div>}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge badge-info">{r.category}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{r.monthly_quantity}</td>
                      <td style={{ padding: '10px 14px', color: '#888' }}>{r.annual_quantity}</td>
                      <td style={{ padding: '10px 14px' }}>{r.unit}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>₹{r.price_per_unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1a237e' }}>{summary?.total_entities ?? '—'}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Entities Surveyed</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#00897b' }}>{summary?.total_products ?? '—'}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Products Collected</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e65100', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {summary?.top_product ?? '—'}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Top Product by Demand</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>Survey Data ({rows.length} records)</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {selectedIds.size > 0 && (
              <button
                className="btn btn-sm"
                style={{ background: '#e53935', color: 'white', border: 'none', padding: '8px 16px',
                         borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setConfirmDelete('bulk')}
              >
                Delete Selected ({selectedIds.size})
              </button>
            )}
            <button
              className="btn btn-sm"
              style={{ background: '#00897b', color: 'white', border: 'none', padding: '8px 16px',
                       borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              disabled={rows.length === 0}
              onClick={() => exportCSV(rows)}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters" style={{ flexWrap: 'wrap', gap: 8 }}>
            <input className="filter-select" placeholder="District" value={district}
              onChange={e => setDistrict(e.target.value)} />
            <select className="filter-select" value={entityType} onChange={e => setEntityType(e.target.value)}>
              <option value="">All Types</option>
              {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" className="filter-select" value={dateFrom}
              onChange={e => setDateFrom(e.target.value)} />
            <input type="date" className="filter-select" value={dateTo}
              onChange={e => setDateTo(e.target.value)} />
            {(district || entityType || category || dateFrom || dateTo) && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>No data found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Entity</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Monthly Qty</th>
                  <th>Annual Qty</th>
                  <th>Unit</th>
                  <th>Price/Unit</th>
                  <th>Agent</th>
                  <th>Survey Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isFirstForEntity = i === 0 || rows[i - 1].entity_id !== r.entity_id;
                  return (
                    <tr key={i} style={selectedIds.has(r.entity_id) ? { background: '#fff3f3' } : {}}>
                      <td>
                        {isFirstForEntity && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(r.entity_id)}
                            onChange={() => toggleEntity(r.entity_id)}
                            style={{ cursor: 'pointer' }}
                          />
                        )}
                      </td>
                      <td>
                        <button
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                   textAlign: 'left', color: '#1a237e', fontWeight: 600 }}
                          onClick={() => setModal({ entityId: r.entity_id, entityName: r.entity_name })}
                        >
                          {r.entity_name}
                        </button>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{r.entity_type} · {r.district}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.product_name}</div>
                        {r.brand && <div style={{ fontSize: 11, color: '#aaa' }}>{r.brand}</div>}
                      </td>
                      <td><span className="badge badge-info">{r.category}</span></td>
                      <td style={{ fontWeight: 700 }}>{r.monthly_quantity}</td>
                      <td style={{ color: '#888' }}>{r.annual_quantity}</td>
                      <td>{r.unit}</td>
                      <td style={{ fontWeight: 600 }}>₹{r.price_per_unit}</td>
                      <td style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>{r.agent_id}</td>
                      <td style={{ fontSize: 13 }}>{formatDate(r.survey_date)}</td>
                      <td>
                        {isFirstForEntity && (
                          <button
                            style={{ background: 'none', border: '1px solid #e53935', color: '#e53935',
                                     borderRadius: 6, padding: '3px 10px', fontSize: 12,
                                     fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => setConfirmDelete({ entityId: r.entity_id, entityName: r.entity_name })}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
