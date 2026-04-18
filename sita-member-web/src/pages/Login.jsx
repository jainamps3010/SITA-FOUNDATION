import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return setError('Enter a valid 10-digit mobile number.');
    }
    setLoading(true); setError(''); setDevOtp('');
    try {
      // Member auth uses /auth/member/send-otp with field name "phone"
      const res = await api.post('/auth/member/send-otp', { phone });
      console.log('send-otp response:', res.data);
      setSuccess('OTP sent to +91 ' + phone);
      // Show dev OTP on screen if backend returns it (development mode)
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp);
      setStep('otp');
    } catch (err) {
      console.error('send-otp error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    // Backend requires exactly 6 digits
    if (otp.length !== 6) {
      return setError('Enter the 6-digit OTP received on your mobile.');
    }
    setLoading(true); setError('');
    try {
      // Member auth uses /auth/member/verify-otp with fields "phone" and "otp"
      const res = await api.post('/auth/member/verify-otp', { phone, otp });
      console.log('verify-otp response:', res.data);

      const { token, member } = res.data;
      if (!token) throw new Error('No token in response');

      // Save to localStorage
      localStorage.setItem('member_token', token);
      localStorage.setItem('member_data', JSON.stringify(member));

      // Set axios default header for all subsequent requests in this session
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

      // Update React auth context
      login(member, token);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('verify-otp error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Invalid OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left hero panel */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <img src="/logo.png" alt="SITA Foundation" height="100" style={styles.logo} />
          <h1 style={styles.brandName}>SITA Foundation</h1>
          <p style={styles.tagline}>Santani Ideal Tag Agro Foundation</p>
          <div style={styles.features}>
            {[
              'Exclusive member pricing on daily essentials',
              'Real-time order tracking and savings',
              'Secure wallet-based transactions',
              'Same account as your mobile app',
            ].map((f) => (
              <div key={f} style={styles.feature}>
                <span style={styles.featureDot}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login card */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <img src="/logo.png" alt="SITA Foundation" height="72" style={{ marginBottom: 14 }} />
            <h2 style={styles.cardTitle}>Member Login</h2>
            <p style={styles.cardSubtitle}>Access your SITA Foundation member portal</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {devOtp && (
            <div className="alert alert-warning" style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: 2 }}>
              Dev OTP: <strong>{devOtp}</strong>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div style={styles.phoneRow}>
                  <span style={styles.phonePrefix}>+91</span>
                  <input
                    className="form-input"
                    style={{ borderLeft: 'none', borderRadius: '0 8px 8px 0' }}
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
              </div>
              <button
                className="btn btn-primary btn-full"
                type="submit"
                disabled={loading || phone.length !== 10}
                style={{ marginTop: 8, padding: '12px' }}
              >
                {loading ? <><span className="spinner spinner-sm" /> Sending OTP...</> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={styles.otpInfo}>
                <span>OTP sent to <strong>+91 {phone}</strong></span>
                <button
                  type="button"
                  style={styles.changeBtn}
                  onClick={() => { setStep('phone'); setOtp(''); setError(''); setSuccess(''); setDevOtp(''); }}
                >
                  Change
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Enter 6-digit OTP</label>
                <input
                  className="form-input"
                  style={{ fontSize: '1.8rem', letterSpacing: '12px', textAlign: 'center', fontWeight: 700 }}
                  type="tel"
                  maxLength={6}
                  placeholder="——————"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
              <button
                className="btn btn-primary btn-full"
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{ marginTop: 8, padding: '12px' }}
              >
                {loading ? <><span className="spinner spinner-sm" /> Verifying...</> : 'Verify & Login'}
              </button>
              <button
                type="button"
                style={styles.resendBtn}
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            </form>
          )}

          <p style={styles.helpText}>
            Not a member? Contact SITA Foundation office to register.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #1A237E 0%, #283593 60%, #1565C0 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 48px',
  },
  leftContent: { color: '#fff', maxWidth: 440 },
  logo: { display: 'block', marginBottom: 20, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' },
  brandName: { fontSize: '2rem', fontWeight: 800, marginBottom: 6 },
  tagline: { fontSize: '0.95rem', opacity: 0.8, marginBottom: 32 },
  features: { display: 'flex', flexDirection: 'column', gap: 14 },
  feature: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.95rem', opacity: 0.9 },
  featureDot: { color: '#FF8F00', fontWeight: 700, flexShrink: 0, marginTop: 2 },
  right: {
    width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 32px', background: '#F5F5F5',
  },
  card: {
    background: '#fff', borderRadius: 14, padding: '36px 32px',
    boxShadow: '0 4px 24px rgba(26,35,126,0.12)', width: '100%',
  },
  cardHeader: { textAlign: 'center', marginBottom: 28 },
  cardTitle: { fontSize: '1.4rem', fontWeight: 800, color: '#1A237E', marginBottom: 6 },
  cardSubtitle: { fontSize: '0.875rem', color: '#757575' },
  phoneRow: { display: 'flex' },
  phonePrefix: {
    display: 'flex', alignItems: 'center', padding: '10px 12px',
    background: '#F5F5F5', border: '1.5px solid #E0E0E0', borderRight: 'none',
    borderRadius: '8px 0 0 8px', fontSize: '0.95rem', fontWeight: 600, color: '#424242',
  },
  otpInfo: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#E8EAF6', borderRadius: 8, padding: '10px 14px',
    marginBottom: 16, fontSize: '0.875rem', color: '#1A237E',
  },
  changeBtn: { background: 'none', border: 'none', color: '#FF8F00', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' },
  resendBtn: {
    width: '100%', marginTop: 12, background: 'none', border: 'none',
    color: '#1A237E', fontSize: '0.875rem', fontWeight: 600, padding: '8px',
    textDecoration: 'underline', cursor: 'pointer',
  },
  helpText: { fontSize: '0.8rem', color: '#9E9E9E', textAlign: 'center', marginTop: 20 },
};
