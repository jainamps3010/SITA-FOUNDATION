import React, { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import StepBar from '../components/StepBar'

const STEPS = ['Entity Details', 'Consumption', 'Submit']
const CATEGORIES = ['Oils', 'Grains', 'Spices', 'Gas', 'Cleaning']
const UNITS = ['Kg', 'Liters', 'Bags', 'Cylinders']

const PREDEFINED = {
  Oils: [
    { name: 'Sunflower Oil', unit: 'Liters' },
    { name: 'Mustard Oil', unit: 'Liters' },
    { name: 'Groundnut Oil', unit: 'Liters' },
    { name: 'Coconut Oil', unit: 'Liters' },
    { name: 'Palm Oil', unit: 'Liters' },
    { name: 'Refined Soya Oil', unit: 'Liters' },
    { name: 'Vanaspati / Dalda', unit: 'Kg' },
  ],
  Grains: [
    { name: 'Wheat Flour (Atta)', unit: 'Kg' },
    { name: 'Rice', unit: 'Kg' },
    { name: 'Toor Dal', unit: 'Kg' },
    { name: 'Moong Dal', unit: 'Kg' },
    { name: 'Chana Dal', unit: 'Kg' },
    { name: 'Urad Dal', unit: 'Kg' },
    { name: 'Sugar', unit: 'Kg' },
    { name: 'Salt', unit: 'Kg' },
    { name: 'Maida', unit: 'Kg' },
    { name: 'Sooji / Rava', unit: 'Kg' },
    { name: 'Poha', unit: 'Kg' },
    { name: 'Besan', unit: 'Kg' },
  ],
  Spices: [
    { name: 'Red Chili Powder', unit: 'Kg' },
    { name: 'Turmeric Powder', unit: 'Kg' },
    { name: 'Coriander Powder', unit: 'Kg' },
    { name: 'Cumin Seeds (Jeera)', unit: 'Kg' },
    { name: 'Garam Masala', unit: 'Kg' },
    { name: 'Black Pepper', unit: 'Kg' },
    { name: 'Mustard Seeds', unit: 'Kg' },
    { name: 'Fenugreek (Methi)', unit: 'Kg' },
  ],
  Gas: [
    { name: 'LPG Cylinder (14.2 Kg)', unit: 'Cylinders' },
    { name: 'Commercial LPG (19 Kg)', unit: 'Cylinders' },
    { name: 'Industrial Gas Cylinder', unit: 'Cylinders' },
  ],
  Cleaning: [
    { name: 'Washing Powder', unit: 'Kg' },
    { name: 'Dish Soap (Vim/Exo)', unit: 'Kg' },
    { name: 'Broom / Jhadu', unit: 'Bags' },
    { name: 'Phenyl', unit: 'Liters' },
    { name: 'Floor Cleaner', unit: 'Liters' },
    { name: 'Hand Wash', unit: 'Liters' },
  ],
}

const CAT_ICONS = { Oils: '🫙', Grains: '🌾', Spices: '🌶️', Gas: '🔥', Cleaning: '🧹' }

function newEntry(name = '', unit = 'Kg') {
  return { id: Math.random().toString(36).slice(2), name, brand: '', monthly_qty: '', unit, price: '', active: false }
}

function buildInitialProducts() {
  const state = {}
  for (const cat of CATEGORIES) {
    state[cat] = PREDEFINED[cat].map(p => newEntry(p.name, p.unit))
  }
  return state
}

export default function ConsumptionPage() {
  const { entityId } = useParams()
  const navigate = useNavigate()

  const [mode, setMode] = useState(null) // null | 'scan' | 'manual'
  const [activeCat, setActiveCat] = useState('Oils')
  const [products, setProducts] = useState(buildInitialProducts)
  const [photos, setPhotos] = useState([]) // { file, preview }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileRef = useRef()

  // Photo handlers
  const addPhotos = (files) => {
    const remaining = 10 - photos.length
    const toAdd = Array.from(files).slice(0, remaining).map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
    }))
    setPhotos(p => [...p, ...toAdd])
  }

  const removePhoto = (i) => {
    setPhotos(p => {
      URL.revokeObjectURL(p[i].preview)
      return p.filter((_, idx) => idx !== i)
    })
  }

  // Product handlers
  const updateEntry = (cat, id, field, value) => {
    setProducts(prev => ({
      ...prev,
      [cat]: prev[cat].map(e => e.id === id ? { ...e, [field]: value } : e),
    }))
  }

  const toggleEntry = (cat, id) => {
    setProducts(prev => ({
      ...prev,
      [cat]: prev[cat].map(e => e.id === id ? { ...e, active: !e.active } : e),
    }))
  }

  const addCustomProduct = (cat) => {
    setProducts(prev => ({
      ...prev,
      [cat]: [...prev[cat], { ...newEntry(), active: true }],
    }))
  }

  const removeEntry = (cat, id) => {
    setProducts(prev => ({
      ...prev,
      [cat]: prev[cat].filter(e => e.id !== id),
    }))
  }

  const allActive = () => {
    return CATEGORIES.flatMap(cat =>
      products[cat]
        .filter(e => e.active && e.name.trim())
        .map(e => ({ ...e, category: cat }))
    )
  }

  const totalActive = allActive().length

  // Submit
  const handleSubmit = async () => {
    if (mode === 'manual' && totalActive === 0) {
      setError('Please select at least one product before submitting.')
      return
    }
    setError('')
    setLoading(true)
    try {
      let invoicePhotosUrls = []

      // Upload photos if any
      if (photos.length > 0) {
        const fd = new FormData()
        photos.forEach(p => fd.append('photos', p.file))
        const uploadRes = await api.post('/survey/upload-invoice-photos', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        invoicePhotosUrls = uploadRes.data.invoice_photos_urls || []
      }

      // Build products array
      let productsPayload = []
      if (mode === 'manual') {
        productsPayload = allActive().map(e => ({
          product_name: e.name.trim(),
          brand: e.brand.trim(),
          category: e.category,
          monthly_quantity: Number(e.monthly_qty) || 0,
          annual_quantity: (Number(e.monthly_qty) || 0) * 12,
          unit: e.unit,
          price_per_unit: Number(e.price) || 0,
        }))
      } else {
        // Scan mode: need at least a dummy product to satisfy backend
        productsPayload = [{
          product_name: 'Invoice Products',
          brand: '',
          category: 'Grains',
          monthly_quantity: 0,
          annual_quantity: 0,
          unit: 'Kg',
          price_per_unit: 0,
        }]
      }

      const body = {
        entity_id: entityId,
        products: productsPayload,
        ...(invoicePhotosUrls.length > 0 && { invoice_photos_urls: invoicePhotosUrls }),
      }

      await api.post('/survey/consumption', body)
      setSuccess(true)
      setTimeout(() => navigate('/', { replace: true }), 2200)
    } catch (e) {
      const msg = e.response?.data?.message
      setError(msg || 'Failed to submit survey. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="page" style={{ justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)', marginBottom: 8 }}>Survey Submitted!</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Returning to home…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="header">
        <button className="header-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img src="/logo.png" alt="SITA" className="header-logo" />
        <div className="header-title">Consumption Data</div>
      </header>

      <StepBar current={2} steps={STEPS} />

      <div className="page-content">
        {/* Entity ID indicator */}
        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span>✅</span>
          <span style={{ fontSize: 13 }}>Entity created • ID: <code style={{ fontSize: 11 }}>{entityId?.slice(0, 8)}…</code></span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Mode toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'scan' ? 'active' : ''}`}
            onClick={() => setMode('scan')}
          >
            <div className="mode-btn-icon">📸</div>
            <div className="mode-btn-label">Scan Invoice</div>
          </button>
          <button
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            <div className="mode-btn-icon">✏️</div>
            <div className="mode-btn-label">Add Manually</div>
          </button>
        </div>

        {/* ── SCAN MODE ─────────────────────────────────── */}
        {mode === 'scan' && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>Invoice / Bill Photos</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{photos.length}/10</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                Upload photos of invoices/bills (optional). Up to 10 photos.
              </p>

              {photos.length > 0 && (
                <div className="photo-grid" style={{ marginBottom: 12 }}>
                  {photos.map((p, i) => (
                    <div key={i} className="photo-thumb">
                      <img src={p.preview} alt={`Photo ${i + 1}`} />
                      <button className="photo-remove" onClick={() => removePhoto(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 10 && (
                <>
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => { addPhotos(e.target.files); e.target.value = '' }}
                  />
                  <button
                    className="btn btn-saffron btn-full"
                    style={{ gap: 8 }}
                    onClick={() => fileRef.current.click()}
                  >
                    <span style={{ fontSize: 18 }}>📷</span>
                    Add Photo
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MANUAL MODE ───────────────────────────────── */}
        {mode === 'manual' && (
          <div style={{ marginBottom: 16 }}>
            {/* Category tabs */}
            <div className="cat-tabs">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`cat-tab ${activeCat === cat ? 'active' : ''}`}
                  onClick={() => setActiveCat(cat)}
                >
                  {CAT_ICONS[cat]} {cat}
                  {products[cat].filter(e => e.active).length > 0 && (
                    <span style={{
                      marginLeft: 6, background: activeCat === cat ? 'rgba(255,255,255,0.3)' : 'var(--secondary)',
                      color: 'white', borderRadius: 10, padding: '0px 6px', fontSize: 11
                    }}>
                      {products[cat].filter(e => e.active).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Products list */}
            {products[activeCat].map(entry => (
              <ProductRow
                key={entry.id}
                entry={entry}
                onToggle={() => toggleEntry(activeCat, entry.id)}
                onChange={(f, v) => updateEntry(activeCat, entry.id, f, v)}
                onRemove={() => removeEntry(activeCat, entry.id)}
                isCustom={!PREDEFINED[activeCat].some(p => p.name === entry.name)}
              />
            ))}

            <button
              className="btn btn-outline btn-full"
              style={{ marginTop: 8 }}
              onClick={() => addCustomProduct(activeCat)}
            >
              + Add Custom Product
            </button>

            {totalActive > 0 && (
              <div className="alert alert-success" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✅</span>
                <span style={{ fontSize: 13 }}>{totalActive} product{totalActive !== 1 ? 's' : ''} selected across all categories</span>
              </div>
            )}
          </div>
        )}

        {/* ── BILL PHOTOS (both modes) ───────────────────── */}
        {mode === 'manual' && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Add Bill Photo <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(Optional)</span></span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{photos.length}/10 photos added</span>
              </div>

              {photos.length > 0 && (
                <div className="photo-grid" style={{ marginBottom: 10 }}>
                  {photos.map((p, i) => (
                    <div key={i} className="photo-thumb">
                      <img src={p.preview} alt={`Bill ${i + 1}`} />
                      <button className="photo-remove" onClick={() => removePhoto(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 10 && (
                <>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    style={{ display: 'none' }}
                    id="bill-photo-input"
                    onChange={e => { addPhotos(e.target.files); e.target.value = '' }}
                  />
                  <label htmlFor="bill-photo-input">
                    <span
                      className="btn btn-full"
                      style={{ background: '#FF6600', color: 'white', borderRadius: 8, padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}
                    >
                      <span>📷</span> Add Photo
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        {mode && (
          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 8 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : '✓ Submit Survey'}
          </button>
        )}

        {!mode && (
          <div className="empty-state" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>☝️</div>
            <p>Select a mode to get started</p>
            <small>Choose Scan Invoice to upload photos, or Add Manually to enter products.</small>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductRow({ entry, onToggle, onChange, onRemove, isCustom }) {
  const annual = (Number(entry.monthly_qty) || 0) * 12

  return (
    <div className={`product-row ${entry.active ? 'active' : ''}`}>
      <div className="product-row-header" onClick={onToggle}>
        <div style={{
          width: 20, height: 20, borderRadius: 5, border: `2px solid ${entry.active ? 'var(--primary)' : 'var(--divider)'}`,
          background: entry.active ? 'var(--primary)' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {entry.active && <span style={{ color: 'white', fontSize: 12, lineHeight: 1 }}>✓</span>}
        </div>
        <span className="product-row-name">{entry.name || 'Custom Product'}</span>
        {isCustom && (
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '2px 4px', fontSize: 16 }}
          >×</button>
        )}
      </div>

      {entry.active && (
        <div className="product-row-body">
          {entry.name === '' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Product Name *</label>
              <input
                className="form-input"
                placeholder="Enter product name"
                value={entry.name}
                onChange={e => onChange('name', e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}

          <div>
            <label className="form-label">Brand</label>
            <input
              className="form-input"
              placeholder="e.g. Fortune"
              value={entry.brand}
              onChange={e => onChange('brand', e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Unit</label>
            <select className="form-select" value={entry.unit} onChange={e => onChange('unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Monthly Qty</label>
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="0"
              value={entry.monthly_qty}
              onChange={e => onChange('monthly_qty', e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Price / Unit (₹)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={entry.price}
              onChange={e => onChange('price', e.target.value)}
            />
          </div>

          {annual > 0 && (
            <div className="product-annual">
              Annual Qty: <strong>{annual} {entry.unit}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
