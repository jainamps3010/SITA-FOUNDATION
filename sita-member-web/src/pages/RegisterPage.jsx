import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import styles from './RegisterPage.module.css';

const CATEGORIES = [
  'Hotels & Restaurants',
  'Caterers',
  'Religious Ann-Kshetra',
  'Bhojan Shala',
  'Tea Post / Small Cafes',
  'NGOs / Charitable Institutions',
];

const DOC_FIELDS = [
  { key: 'business_reg_certificate', label: 'Business Registration Certificate' },
  { key: 'fssai_license', label: 'FSSAI License' },
  { key: 'establishment_front_photo', label: 'Establishment Front Photo' },
  { key: 'billing_counter_photo', label: 'Billing Counter Photo' },
  { key: 'kitchen_photo', label: 'Kitchen Photo' },
  { key: 'menu_card_photo', label: 'Menu Card Photo' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', business_name: '', category: '', gst_number: '',
  });

  const [files, setFiles] = useState({
    business_reg_certificate: null,
    fssai_license: null,
    establishment_front_photo: null,
    billing_counter_photo: null,
    kitchen_photo: null,
    menu_card_photo: null,
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    if (!form.name.trim()) { toast('Full name is required', 'error'); return false; }
    if (!/^\d{10}$/.test(form.phone)) { toast('Enter a valid 10-digit mobile number', 'error'); return false; }
    if (!form.business_name.trim()) { toast('Business name is required', 'error'); return false; }
    if (!form.category) { toast('Please select a category', 'error'); return false; }
    return true;
  };

  const handleFileChange = (field, file) => setFiles(f => ({ ...f, [field]: file }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('mobile', form.phone);
      fd.append('business_name', form.business_name.trim());
      fd.append('category', form.category);
      if (form.email.trim()) fd.append('email', form.email.trim());
      if (form.gst_number.trim()) fd.append('gst_number', form.gst_number.trim());
      DOC_FIELDS.forEach(({ key }) => {
        if (files[key]) fd.append(key, files[key]);
      });

      await api.post('/auth/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 409) {
        toast('This mobile number is already registered.', 'error');
      } else {
        toast(err.response?.data?.message || 'Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <img src="/logo.png" alt="SITA Foundation" className={styles.logo} onError={e => { e.target.style.display = 'none'; }} />
          <h1 className={styles.welcome}>Application Submitted!</h1>
          <p className={styles.sub}>We&apos;ll review within 24–48 hours</p>
        </div>
        <div className={styles.form}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Application Under Review</h2>
            <p className={styles.successText}>
              Your registration has been submitted successfully. Our team will verify your documents within 24–48 hours.
            </p>
            <p className={styles.successNote}>
              Once approved, you can log in with OTP to complete your membership payment and get access.
            </p>
            <button className={styles.btnPrimary} onClick={() => navigate('/')}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src="/logo.png" alt="SITA Foundation" className={styles.logo} onError={e => { e.target.style.display = 'none'; }} />
        <h1 className={styles.welcome}>New Member Registration</h1>
        <p className={styles.sub}>Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Document Upload'}</p>
      </div>

      <div className={styles.stepBar}>
        <div className={`${styles.stepItem} ${styles.active}`}>
          <div className={`${styles.stepCircle} ${step > 1 ? styles.done : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <span>Basic Info</span>
        </div>
        <div className={`${styles.stepLine} ${step >= 2 ? styles.doneLine : ''}`} />
        <div className={`${styles.stepItem} ${step >= 2 ? styles.active : ''}`}>
          <div className={`${styles.stepCircle} ${step >= 2 ? styles.activeCircle : styles.inactiveCircle}`}>
            2
          </div>
          <span>Documents</span>
        </div>
      </div>

      <div className={styles.form}>
        {step === 1 ? (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Full Name *</label>
              <input className={styles.inputFull} placeholder="Your full name" value={form.name} onChange={e => setField('name', e.target.value)} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Mobile Number *</label>
              <div className={styles.inputRow}>
                <span className={styles.prefix}>+91</span>
                <input
                  className={styles.input}
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.inputFull} type="email" placeholder="email@example.com (optional)" value={form.email} onChange={e => setField('email', e.target.value)} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Business Name *</label>
              <input className={styles.inputFull} placeholder="Hotel / Restaurant / Establishment name" value={form.business_name} onChange={e => setField('business_name', e.target.value)} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Category *</label>
              <select className={styles.inputFull} value={form.category} onChange={e => setField('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>GST Number</label>
              <input
                className={styles.inputFull}
                placeholder="GSTIN (optional)"
                value={form.gst_number}
                onChange={e => setField('gst_number', e.target.value.toUpperCase())}
                maxLength={15}
              />
            </div>

            <button className={styles.btnPrimary} onClick={() => { if (validateStep1()) setStep(2); }}>
              Next: Upload Documents →
            </button>
            <button className={styles.btnLink} onClick={() => navigate('/')}>
              Already a member? Login
            </button>
          </>
        ) : (
          <>
            <div className={styles.infoBox}>
              <span className={styles.infoIcon}>📎</span>
              <p>Upload clear photos or scans. Accepted: JPG, PNG, PDF (max 10 MB each).</p>
            </div>

            {DOC_FIELDS.map(({ key, label }) => (
              <div key={key} className={styles.field}>
                <label className={styles.label}>{label}</label>
                <label htmlFor={key} className={`${styles.fileLabel} ${files[key] ? styles.fileLabelDone : ''}`}>
                  <input
                    type="file"
                    id={key}
                    accept="image/*,.pdf"
                    className={styles.fileHidden}
                    onChange={e => handleFileChange(key, e.target.files[0] || null)}
                  />
                  {files[key] ? (
                    <>
                      <span className={styles.fileCheck}>✓</span>
                      <span className={styles.fileName}>{files[key].name}</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.fileUploadIcon}>📤</span>
                      <span>Choose file</span>
                    </>
                  )}
                </label>
              </div>
            ))}

            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button className={styles.btnLink} onClick={() => setStep(1)}>
              ← Back to Basic Info
            </button>
          </>
        )}
      </div>
    </div>
  );
}
