import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import styles from './FeedbackPage.module.css';

const CATEGORIES = ['Product Quality', 'Delivery Issue', 'App Problem', 'Pricing Issue', 'Other'];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ category: '', description: '', order_id: '', rating: 0 });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.category) e.category = 'Please select a category';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Please describe your feedback (min 20 characters)';
    if (!form.rating) e.rating = 'Please provide a rating';
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.post('/members/feedback', {
        category: form.category,
        description: form.description.trim(),
        order_id: form.order_id.trim() || undefined,
        rating: form.rating,
      });
      setDone(true);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <span className={styles.title}>Feedback</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        {done ? (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h2>Thank You!</h2>
            <p>Thank you for your feedback! We will review it shortly.</p>
            <button className={styles.backBtn} onClick={() => navigate('/home')}>Back to Home</button>
          </div>
        ) : (
          <>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Rate Your Experience</div>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    className={`${styles.star} ${s <= (hoverRating || form.rating) ? styles.starFilled : ''}`}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => set('rating', s)}
                  >★</button>
                ))}
              </div>
              {errors.rating && <div className={styles.err}>{errors.rating}</div>}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Category *</div>
              <select
                className={`${styles.input} ${errors.category ? styles.inputError : ''}`}
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <div className={styles.err}>{errors.category}</div>}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Description *</div>
              <textarea
                className={`${styles.input} ${errors.description ? styles.inputError : ''}`}
                rows={5}
                placeholder="Please describe your feedback in detail (min 20 characters)..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
              <div className={styles.charCount}>{form.description.length} / 20 min</div>
              {errors.description && <div className={styles.err}>{errors.description}</div>}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Order ID <span className={styles.optional}>(optional)</span></div>
              <input
                className={styles.input}
                type="text"
                placeholder="e.g. ORD-2024-001 (if related to a specific order)"
                value={form.order_id}
                onChange={e => set('order_id', e.target.value)}
              />
            </div>

            <button className={styles.submitBtn} onClick={submit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </>
        )}
      </div>

      <nav className={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', path: '/home' },
          { icon: '🏪', label: 'Market', path: '/marketplace' },
          { icon: '📋', label: 'Orders', path: '/orders' },
          { icon: '👤', label: 'Profile', path: '/profile' },
        ].map((n) => (
          <button key={n.path} className={styles.navItem} onClick={() => navigate(n.path)}>
            <span className={styles.navIcon}>{n.icon}</span>
            <span className={styles.navLabel}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
