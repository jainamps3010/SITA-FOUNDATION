import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import StepBar from '../components/StepBar'

const ENTITY_TYPES = [
  'Hotel',
  'Restaurant',
  'Resort',
  'Caterer',
  'Annakshetra',
  'Temple Kitchen',
]

const STEPS = ['Entity Details', 'Consumption', 'Submit']

export default function NewEntityPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    entity_name: '',
    owner_name: '',
    mobile: '',
    entity_type: '',
    address: '',
    pincode: '',
    district: '',
    state: '',
    taluka: '',
  })
  const [loading, setLoading] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fetchPincode = async (pin) => {
    if (pin.length !== 6) return
    setPincodeLoading(true)
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (data?.[0]?.Status === 'Success') {
        const po = data[0].PostOffice?.[0]
        if (po) {
          setForm(f => ({
            ...f,
            district: po.District || f.district,
            state: po.State || f.state,
            taluka: po.Block || po.Division || f.taluka,
          }))
        }
      }
    } catch {
      // ignore pincode lookup failure
    } finally {
      setPincodeLoading(false)
    }
  }

  const handleGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const addr = data.address || {}
          const district = addr.state_district || addr.county || addr.city || ''
          const state = addr.state || ''
          const taluka = addr.county || addr.suburb || addr.town || ''
          const pincode = addr.postcode || ''
          const address = [addr.road, addr.suburb, addr.city || addr.town, district]
            .filter(Boolean).join(', ')
          setForm(f => ({
            ...f,
            address: address || f.address,
            district: district || f.district,
            state: state || f.state,
            taluka: taluka || f.taluka,
            pincode: pincode || f.pincode,
          }))
        } catch {
          setError('Could not fetch address from coordinates.')
        } finally {
          setGpsLoading(false)
        }
      },
      err => {
        setGpsLoading(false)
        setError('GPS access denied. Please enable location access.')
      },
      { timeout: 10000 }
    )
  }

  const validate = () => {
    if (!form.entity_name.trim()) return 'Entity name is required.'
    if (!form.owner_name.trim()) return 'Owner name is required.'
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return 'Enter a valid 10-digit mobile number.'
    if (!form.entity_type) return 'Please select an entity type.'
    if (!form.address.trim()) return 'Address is required.'
    if (!form.district.trim()) return 'District is required.'
    if (!form.taluka.trim()) return 'Taluka is required.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/survey/entity', {
        entity_name: form.entity_name.trim(),
        owner_name: form.owner_name.trim(),
        mobile: form.mobile,
        entity_type: form.entity_type,
        address: form.address.trim(),
        district: form.district.trim(),
        taluka: form.taluka.trim(),
      })
      const entityId = res.data.data.id
      navigate(`/consumption/${entityId}`, { replace: true })
    } catch (e) {
      const msg = e.response?.data?.message
      setError(msg || 'Failed to create entity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <button className="header-back" onClick={() => navigate('/')}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img src="/logo.png" alt="SITA" className="header-logo" />
        <div className="header-title">New Entity</div>
      </header>

      <StepBar current={1} steps={STEPS} />

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="card-pad">
            {/* Entity Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>🏢</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Entity Information</span>
            </div>

            <div className="form-group">
              <label className="form-label">Entity Name *</label>
              <input className="form-input" placeholder="e.g. Shree Ram Bhojanshala" value={form.entity_name} onChange={e => set('entity_name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Owner / Manager Name *</label>
              <input className="form-input" placeholder="e.g. Ramesh Patel" value={form.owner_name} onChange={e => set('owner_name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Mobile *</label>
              <input className="form-input" type="tel" maxLength={10} placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>

            <div className="form-group">
              <label className="form-label">Entity Type *</label>
              <select className="form-select" value={form.entity_type} onChange={e => set('entity_type', e.target.value)}>
                <option value="">Select type…</option>
                {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="divider" />

            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>📍</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Location</span>
              </div>
              <button
                className="btn btn-outline"
                style={{ padding: '7px 14px', fontSize: 13, borderRadius: 8 }}
                onClick={handleGps}
                disabled={gpsLoading}
              >
                {gpsLoading ? <span className="spinner spinner-dark" style={{ width: 14, height: 14 }} /> : '📡'}
                &nbsp;Auto-detect GPS
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <textarea
                className="form-input"
                placeholder="Street, area, city…"
                rows={3}
                value={form.address}
                onChange={e => set('address', e.target.value)}
                style={{ resize: 'vertical', minHeight: 76 }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type="tel"
                    maxLength={6}
                    placeholder="e.g. 395001"
                    value={form.pincode}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                      set('pincode', v)
                      fetchPincode(v)
                    }}
                  />
                  {pincodeLoading && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                      <span className="spinner spinner-dark" style={{ width: 14, height: 14 }} />
                    </span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" placeholder="Auto-filled" value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">District *</label>
                <input className="form-input" placeholder="e.g. Surat" value={form.district} onChange={e => set('district', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Taluka *</label>
                <input className="form-input" placeholder="e.g. Surat City" value={form.taluka} onChange={e => set('taluka', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn btn-saffron btn-full btn-lg"
          style={{ marginTop: 20 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : <>Next: Consumption Data →</>}
        </button>
      </div>
    </div>
  )
}
