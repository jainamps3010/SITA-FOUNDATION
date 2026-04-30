import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const CAT_COLORS = {
  Oils: '#FF8F00', Grains: '#558B2F', Spices: '#C62828',
  Gas: '#0277BD', Cleaning: '#6A1B9A',
}

export default function MySurveysPage() {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [lightbox, setLightbox] = useState(null) // url

  useEffect(() => {
    api.get('/survey/my-surveys')
      .then(r => setSurveys(r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load surveys.'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id)

  const getPhotos = (s) => {
    const out = []
    if (s.invoice_photos_urls?.length) out.push(...s.invoice_photos_urls)
    else if (s.invoice_photo_url) out.push(s.invoice_photo_url)
    return out
  }

  return (
    <div className="page">
      <header className="header">
        <button className="header-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img src="/logo.png" alt="SITA" className="header-logo" />
        <div className="header-title">My Surveys</div>
      </header>

      <div className="page-content">
        {/* Lightbox */}
        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(null)}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>
            <img src={lightbox} alt="Invoice" onClick={e => e.stopPropagation()} />
          </div>
        )}

        {loading && (
          <div className="loading-center">
            <span className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && surveys.length === 0 && !error && (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p>No surveys yet</p>
            <small>Start a new survey from the home screen.</small>
            <button className="btn btn-saffron" style={{ marginTop: 20 }} onClick={() => navigate('/new-entity')}>
              + Start New Survey
            </button>
          </div>
        )}

        {surveys.map(s => {
          const photos = getPhotos(s)
          const isOpen = expandedId === s.id
          const categoryGroups = {}
          for (const p of (s.products || [])) {
            if (!categoryGroups[p.category]) categoryGroups[p.category] = []
            categoryGroups[p.category].push(p)
          }

          return (
            <div key={s.id} className="survey-card" onClick={() => toggle(s.id)}>
              <div className="survey-card-header">
                <div style={{ flex: 1 }}>
                  <div className="survey-card-title">{s.entity_name}</div>
                  <div className="survey-card-meta">
                    <span style={{ marginRight: 10 }}>{s.entity_type}</span>
                    <span style={{ marginRight: 10 }}>📍 {s.district}</span>
                  </div>
                  <div className="survey-card-meta" style={{ marginTop: 4 }}>
                    <span>📅 {formatDate(s.survey_date)}</span>
                    <span style={{ marginLeft: 10 }}>📦 {s.products_count} products</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className="badge badge-success">✓ Synced</span>
                  {photos.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>📷 {photos.length}</span>
                  )}
                  <span style={{ fontSize: 18, color: 'var(--text-secondary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                </div>
              </div>

              {isOpen && (
                <div className="survey-detail" onClick={e => e.stopPropagation()}>
                  {/* Photos */}
                  {photos.length > 0 && (
                    <div style={{ padding: '12px 0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bill Photos</div>
                      <div className="survey-photos">
                        {photos.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="survey-photo-thumb"
                            onClick={() => setLightbox(url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entity details */}
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', color: 'var(--text-secondary)' }}>
                      <div><span style={{ fontWeight: 600 }}>Owner:</span> {s.owner_name}</div>
                      <div><span style={{ fontWeight: 600 }}>District:</span> {s.district}</div>
                      <div><span style={{ fontWeight: 600 }}>Taluka:</span> {s.taluka}</div>
                      <div><span style={{ fontWeight: 600 }}>Type:</span> {s.entity_type}</div>
                    </div>
                    {s.address && <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}><span style={{ fontWeight: 600 }}>Address:</span> {s.address}</div>}
                  </div>

                  {/* Products by category */}
                  {Object.entries(categoryGroups).map(([cat, prods]) => (
                    <div key={cat} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: CAT_COLORS[cat] || '#888', display: 'inline-block' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[cat] || '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat}</span>
                      </div>
                      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--divider)' }}>
                        {prods.map((p, idx) => (
                          <div key={p.id} style={{
                            padding: '10px 14px',
                            background: idx % 2 === 0 ? 'white' : '#fafafa',
                            borderBottom: idx < prods.length - 1 ? '1px solid var(--divider)' : 'none',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.product_name}</div>
                                {p.brand && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.brand}</div>}
                              </div>
                              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
                                <div>{p.monthly_quantity} {p.unit}/mo</div>
                                {p.price_per_unit > 0 && <div>₹{p.price_per_unit}/{p.unit}</div>}
                              </div>
                            </div>
                            {p.annual_quantity > 0 && (
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                                Annual: {p.annual_quantity} {p.unit}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {(!s.products || s.products.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                      No product details available
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
