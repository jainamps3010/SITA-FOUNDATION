import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { agentPhone, agentName, logout } = useAuth()

  const displayName = agentName || `+91 ${agentPhone}`

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <img src="/logo.png" alt="SITA" className="header-logo" />
        <div className="header-title">SITA Foundation</div>
        <button
          className="btn btn-ghost"
          style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8 }}
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
        >
          Logout
        </button>
      </header>

      <div className="page-content">
        {/* Welcome */}
        <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--primary) 0%, #283593 100%)', color: 'white' }}>
          <div className="card-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                👤
              </div>
              <div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Welcome back,</div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{displayName}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Survey Agent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          <button
            className="btn btn-saffron btn-full btn-lg"
            style={{ padding: '18px 24px', fontSize: 16, borderRadius: 14, gap: 12 }}
            onClick={() => navigate('/new-entity')}
          >
            <span style={{ fontSize: 22 }}>📋</span>
            Start New Survey
          </button>
          <button
            className="btn btn-outline btn-full btn-lg"
            style={{ padding: '18px 24px', fontSize: 16, borderRadius: 14, gap: 12 }}
            onClick={() => navigate('/my-surveys')}
          >
            <span style={{ fontSize: 22 }}>📊</span>
            My Surveys
          </button>
        </div>

        {/* Info card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>ℹ️</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>How It Works</span>
            </div>
            {[
              ['1', 'Fill entity details (Hotel, Restaurant, etc.)'],
              ['2', 'Add consumption data – scan invoice or enter manually'],
              ['3', 'Submit and your survey is saved instantly'],
            ].map(([num, text]) => (
              <div key={num} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {num}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', paddingTop: 3 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Us */}
        <div className="card">
          <div className="card-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>📞</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>Contact Us</span>
            </div>
            <a
              href="mailto:chairman@sita.foundation"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--divider)', textDecoration: 'none', color: 'var(--text-primary)' }}
            >
              <span style={{ fontSize: 18 }}>✉️</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>EMAIL</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>chairman@sita.foundation</div>
              </div>
            </a>
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>PHONE</div>
              {['7069924365', '7069824365'].map(num => (
                <a
                  key={num}
                  href={`tel:${num}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', textDecoration: 'none', color: 'var(--text-primary)' }}
                >
                  <span style={{ fontSize: 16 }}>📱</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{num.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
