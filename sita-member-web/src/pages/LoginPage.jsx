import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const sendOtp = async () => {
    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      toast('Enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/member/send-otp', { phone: mobile });
      setOtpSent(true);
      toast(res.data.message || `OTP sent to +91 ${mobile}`, 'success');
      if (res.data.dev_otp) setOtp(String(res.data.dev_otp));
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to send OTP';
      if (status === 404) {
        toast('This number is not registered. Register as a new member below.', 'warning');
      } else {
        toast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast('Enter the 6-digit OTP', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/member/verify-otp', { phone: mobile, otp });
      localStorage.setItem('member_token', res.data.token);
      localStorage.setItem('member_data', JSON.stringify(res.data.member));
      toast('Login successful!', 'success');
      const member = res.data.member;
      if (member.status === 'active' && !member.membership_paid) {
        navigate('/membership-payment');
      } else {
        navigate('/home');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img
          src="/logo.png"
          alt="SITA Foundation"
          className={styles.logo}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 className={styles.welcome}>Welcome Back</h1>
        <p className={styles.sub}>Login with your registered mobile number</p>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Mobile Number</label>
          <div className={styles.inputRow}>
            <span className={styles.prefix}>+91</span>
            <input
              className={styles.input}
              type="tel"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              disabled={otpSent}
            />
          </div>
        </div>

        {!otpSent ? (
          <>
            <label className={styles.rememberRow}>
              <input
                type="checkbox"
                className={styles.rememberCheck}
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span className={styles.rememberLabel}>Remember Me</span>
            </label>
            <button className={styles.btnPrimary} onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <div className={styles.field} style={{ marginTop: 16 }}>
              <label className={styles.label}>OTP</label>
              <input
                className={styles.inputFull}
                type="tel"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
              />
            </div>
            <button className={styles.btnPrimary} onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              className={styles.btnLink}
              onClick={() => { setOtpSent(false); setOtp(''); }}
            >
              Change number
            </button>
          </>
        )}

        <button className={styles.btnRegister} onClick={() => navigate('/register')}>
          New Member? Register Here
        </button>

        <div className={styles.infoBox}>
          <span className={styles.infoIcon}>ℹ️</span>
          <p>Only pre-approved SITA Foundation members can login. Contact your account manager for access.</p>
        </div>
      </div>
    </div>
  );
}
