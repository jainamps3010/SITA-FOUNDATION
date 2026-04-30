import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate, Pagination } from '../components/utils';

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function SurveyPhotosPage() {
  const [surveys, setSurveys] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [district, setDistrict] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, entityName } | 'bulk'
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (district) params.district = district;
    if (entityType) params.entity_type = entityType;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    api.get('/admin/survey-photos', { params })
      .then(r => { setSurveys(r.data.data); setPagination(r.data.pagination); setSelectedIds(new Set()); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, district, entityType, dateFrom, dateTo]);

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteOne = async () => {
    if (!confirmDelete || confirmDelete === 'bulk') return;
    setDeleting(true);
    try {
      await api.delete(`/admin/survey-photos/${confirmDelete.id}`);
      setSurveys(prev => prev.map(s =>
        s.id === confirmDelete.id ? { ...s, invoice_photo_url: null, invoice_photos_urls: null } : s
      ));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(confirmDelete.id); return n; });
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete photo.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteBulk = async () => {
    if (confirmDelete !== 'bulk') return;
    const ids = [...selectedIds];
    setDeleting(true);
    try {
      await api.delete('/admin/survey-photos/bulk', { data: { ids } });
      setSurveys(prev => prev.map(s =>
        ids.includes(s.id) ? { ...s, invoice_photo_url: null, invoice_photos_urls: null } : s
      ));
      setSelectedIds(new Set());
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete photos.');
    } finally {
      setDeleting(false);
    }
  };

  const getPhotos = (s) => {
    const photos = [];
    if (s.invoice_photos_urls && s.invoice_photos_urls.length > 0) {
      photos.push(...s.invoice_photos_urls);
    } else if (s.invoice_photo_url) {
      photos.push(s.invoice_photo_url);
    }
    return photos;
  };

  return (
    <>
      {/* Floating Delete Selected button */}
      {selectedIds.size > 0 && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 8000, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <button
            style={{
              background: '#e53935', color: 'white', border: 'none',
              borderRadius: 32, padding: '14px 28px', fontWeight: 700,
              fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(229,57,53,0.45)',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'transform 0.1s'
            }}
            onClick={() => setConfirmDelete('bulk')}
          >
            <TrashIcon /> Delete Selected ({selectedIds.size})
          </button>
          <button
            style={{
              background: 'white', color: '#555', border: 'none',
              borderRadius: 32, padding: '14px 20px', fontWeight: 600,
              fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 420, width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#b71c1c' }}>Delete Photo</h3>
            <p style={{ margin: '0 0 20px', color: '#444', lineHeight: 1.5 }}>
              {confirmDelete === 'bulk'
                ? `Delete ${selectedIds.size} selected photo${selectedIds.size === 1 ? '' : 's'}? This cannot be undone.`
                : `Delete this survey photo? The invoice photo for "${confirmDelete.entityName}" will be permanently removed.`}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >Cancel</button>
              <button
                style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 8,
                         padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                onClick={confirmDelete === 'bulk' ? handleDeleteBulk : handleDeleteOne}
                disabled={deleting}
              >{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setLightbox(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt="Invoice"
              style={{ maxWidth: '90vw', maxHeight: '82vh', borderRadius: 8, objectFit: 'contain', display: 'block' }}
            />
            {lightbox.total > 1 && (
              <div style={{
                position: 'absolute', bottom: -36, left: 0, right: 0,
                textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12
              }}>
                Photo {lightbox.index + 1} of {lightbox.total} — {lightbox.entity}
              </div>
            )}
            {lightbox.total === 1 && (
              <div style={{
                position: 'absolute', bottom: -36, left: 0, right: 0,
                textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12
              }}>
                {lightbox.entity} — {lightbox.date}
              </div>
            )}
            {lightbox.total > 1 && lightbox.index > 0 && (
              <button
                onClick={() => setLightbox(lb => ({ ...lb, url: lb.photos[lb.index - 1], index: lb.index - 1 }))}
                style={{
                  position: 'absolute', left: -44, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                  border: 'none', color: 'white', cursor: 'pointer', fontSize: 20, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >‹</button>
            )}
            {lightbox.total > 1 && lightbox.index < lightbox.total - 1 && (
              <button
                onClick={() => setLightbox(lb => ({ ...lb, url: lb.photos[lb.index + 1], index: lb.index + 1 }))}
                style={{
                  position: 'absolute', right: -44, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                  border: 'none', color: 'white', cursor: 'pointer', fontSize: 20, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >›</button>
            )}
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: -16, right: -16, width: 32, height: 32,
                borderRadius: '50%', background: 'white', border: 'none',
                cursor: 'pointer', fontWeight: 700, fontSize: 16
              }}
            >×</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Survey Photos ({pagination?.total || 0})</h3>
        </div>

        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters" style={{ flexWrap: 'wrap', gap: 8 }}>
            <input
              className="filter-select"
              placeholder="Filter by district"
              value={district}
              onChange={e => { setDistrict(e.target.value); setPage(1); }}
            />
            <select
              className="filter-select"
              value={entityType}
              onChange={e => { setEntityType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="Hotel">Hotel</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Resort">Resort</option>
              <option value="Caterer">Caterer</option>
              <option value="Annakshetra">Annakshetra</option>
              <option value="Temple Kitchen">Temple Kitchen</option>
            </select>
            <input type="date" className="filter-select" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
            <input type="date" className="filter-select" value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }} />
            {(district || entityType || dateFrom || dateTo) && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setDistrict(''); setEntityType(''); setDateFrom(''); setDateTo(''); setPage(1); }}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : surveys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>No surveys found</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16
            }}>
              {surveys.map(s => {
                const checked = selectedIds.has(s.id);
                const photos = getPhotos(s);
                const hasPhotos = photos.length > 0;
                const primaryPhoto = photos[0] || null;
                return (
                  <div
                    key={s.id}
                    style={{
                      borderRadius: 12,
                      border: checked ? '2px solid #e53935' : '2px solid #e8e8e8',
                      background: checked ? '#fff8f8' : '#fff',
                      overflow: 'hidden',
                      boxShadow: checked
                        ? '0 4px 16px rgba(229,57,53,0.15)'
                        : '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'border 0.15s, box-shadow 0.15s',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Primary photo area with overlaid checkbox */}
                    <div style={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
                      {hasPhotos ? (
                        <img
                          src={primaryPhoto}
                          alt="Invoice"
                          onClick={() => setLightbox({
                            url: primaryPhoto, photos,
                            index: 0, total: photos.length,
                            entity: s.entity_name, date: formatDate(s.survey_date)
                          })}
                          style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', cursor: 'pointer'
                          }}
                        />
                      ) : (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: '#f5f5f5', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          flexDirection: 'column', gap: 6, color: '#bbb'
                        }}>
                          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span style={{ fontSize: 11 }}>No photo</span>
                        </div>
                      )}

                      {/* Photo count badge */}
                      {photos.length > 1 && (
                        <div style={{
                          position: 'absolute', bottom: 8, left: 8,
                          background: 'rgba(0,0,0,0.6)', color: 'white',
                          borderRadius: 10, padding: '2px 8px',
                          fontSize: 11, fontWeight: 600
                        }}>
                          {photos.length} photos
                        </div>
                      )}

                      {/* Checkbox — top right corner */}
                      <div
                        onClick={() => toggleOne(s.id)}
                        style={{
                          position: 'absolute', top: 8, right: 8,
                          width: 28, height: 28, borderRadius: 6,
                          background: checked ? '#e53935' : 'rgba(255,255,255,0.92)',
                          border: checked ? '2px solid #e53935' : '2px solid rgba(0,0,0,0.18)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                          transition: 'background 0.15s, border 0.15s',
                          zIndex: 2,
                          userSelect: 'none',
                          minWidth: 28, minHeight: 28
                        }}
                      >
                        {checked && <CheckIcon />}
                      </div>
                    </div>

                    {/* Thumbnail strip for multiple photos */}
                    {photos.length > 1 && (
                      <div style={{ display: 'flex', gap: 4, padding: '6px 8px 0', overflowX: 'auto' }}>
                        {photos.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Photo ${idx + 1}`}
                            onClick={() => setLightbox({
                              url, photos, index: idx,
                              total: photos.length,
                              entity: s.entity_name, date: formatDate(s.survey_date)
                            })}
                            style={{
                              width: 44, height: 44, borderRadius: 6,
                              objectFit: 'cover', cursor: 'pointer', flexShrink: 0,
                              border: '2px solid #e8e8e8'
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Card body */}
                    <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1a237e',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.entity_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {formatDate(s.survey_date)}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.agent_id}
                      </div>
                    </div>

                    {/* Delete button */}
                    {hasPhotos && (
                      <div style={{ padding: '0 12px 10px' }}>
                        <button
                          onClick={() => setConfirmDelete({ id: s.id, entityName: s.entity_name })}
                          style={{
                            width: '100%', background: 'none',
                            border: '1px solid #e53935', color: '#e53935',
                            borderRadius: 6, padding: '5px 0', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 5, fontSize: 12, fontWeight: 600
                          }}
                        >
                          <TrashIcon /> Delete Photos
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="card-footer">
            <Pagination pagination={pagination} onPage={setPage} />
          </div>
        )}
      </div>
    </>
  );
}
