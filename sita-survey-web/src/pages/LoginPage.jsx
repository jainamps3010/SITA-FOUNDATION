import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const ERROR_MESSAGES = {
  NOT_REGISTERED: 'Access denied. Contact SITA Foundation admin to register your account.',
  BLOCKED: 'Your account has been blocked. Please contact SITA Foundation.',
  PENDING: 'Your account is pending approval. Please contact SITA Foundation admin.',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const startCooldown = () => {
    let s = 60
    setCooldown(s)
    const t = setInterval(() => {
      s -= 1
      setCooldown(s)
      if (s <= 0) clearInterval(t)
    }, 1000)
  }

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone, role: 'survey_agent' })
      setStep('otp')
      startCooldown()
    } catch (e) {
      const code = e.response?.data?.code
      const msg = e.response?.data?.message
      setError(ERROR_MESSAGES[code] || msg || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp })
      const { token, driver } = res.data
      login(token, phone, driver?.name || '')
      navigate('/', { replace: true })
    } catch (e) {
      const msg = e.response?.data?.message
      setError(msg || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ background: 'linear-gradient(160deg, #1A237E 0%, #283593 60%, #3949AB 100%)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo + branding */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/logo.png"
            alt="SITA Foundation"
            style={{ width: 90, height: 90, borderRadius: 20, objectFit: 'cover', marginBottom: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
          />
          <div style={{ color: 'white', fontSize: 24, fontWeight: 800, letterSpacing: '-0.3px' }}>SITA Foundation</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>Survey Agent Portal</div>
        </div>

        <div className="card">
          <div className="card-pad">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--primary)' }}>
              {step === 'phone' ? 'Sign In' : 'Enter OTP'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {step === 'phone'
                ? 'Enter your registered mobile number'
                : `OTP sent to +91 ${phone}`}
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            {step === 'phone' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '11px 12px', background: '#f5f5f5', border: '1.5px solid var(--divider)', borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>+91</span>
                    <input
                      className="form-input"
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 10}
                >
                  {loading ? <span className="spinner" /> : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">6-Digit OTP</label>
                  <input
                    className="form-input"
                    type="tel"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                    autoFocus
                    style={{ fontSize: 22, letterSpacing: 8, textAlign: 'center' }}
                  />
                </div>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  style={{ marginBottom: 12 }}
                >
                  {loading ? <span className="spinner" /> : 'Verify OTP'}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 13, padding: '4px 0' }}
                    onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                  >
                    ← Change number
                  </button>
                  {cooldown > 0 ? (
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Resend in {cooldown}s</span>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 13, padding: '4px 0', color: 'var(--primary)' }}
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 24 }}>
          © 2026 SITA Foundation. All rights reserved.
        </p>
      </div>
    </div>
  )
}
