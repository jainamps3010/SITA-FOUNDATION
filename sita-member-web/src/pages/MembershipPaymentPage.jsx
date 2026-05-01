import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import styles from './MembershipPaymentPage.module.css';

const BANK_DETAILS = [
  { label: 'Bank', value: 'THE SURAT DISTRICT CO-OPERATIVE BANK LTD.' },
  { label: 'Account Name', value: 'SANTANI IDEAL TAG AGRO FOUNDATION' },
  { label: 'Account No.', value: '007712103002069' },
  { label: 'IFSC Code', value: 'SDCB0000077' },
  { label: 'Amount', value: '₹5,000', copyValue: '5000' },
];

export default function MembershipPaymentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [utr, setUtr] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const copy = (value, label) => {
    navigator.clipboard.writeText(value).then(() => {
      toast(`${label} copied!`, 'success');
    });
  };

  const handleSubmit = async () => {
    if (!utr.trim()) { toast('Enter UTR / Transaction ID', 'error'); return; }
    if (!agreed) { toast('Please confirm the non-refundable declaration', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.post('/members/submit-payment', { utr_number: utr.trim(), amount: 5000 });
      if (res.data.member) {
        const existing = JSON.parse(localStorage.getItem('member_data') || '{}');
        localStorage.setItem('member_data', JSON.stringify({ ...existing, ...res.data.member }));
      }
      toast('Payment submitted! Admin will verify within 24 hours.', 'success');
      navigate('/home');
    } catch (err) {
      toast(err.response?.data?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>Pay Membership Fee</h1>
        <div />
      </div>

      <div className={styles.content}>
        {/* Amount Banner */}
        <div className={styles.amountBanner}>
          <p className={styles.amountLabel}>Annual Membership Fee</p>
          <p className={styles.amountValue}>₹5,000</p>
          <p className={styles.amountNote}>Non-Refundable • Valid 1 Year</p>
        </div>

        {/* Bank Details */}
        <div className={styles.bankCard}>
          <div className={styles.bankHeader}>
            <span className={styles.bankIcon}>🏦</span>
            <span>Bank Transfer Details</span>
          </div>
          <div className={styles.bankRows}>
            {BANK_DETAILS.map(({ label, value, copyValue }) => (
              <div key={label} className={styles.bankRow}>
                <div className={styles.bankRowLeft}>
                  <span className={styles.bankRowLabel}>{label}</span>
                  <span className={styles.bankRowValue}>{value}</span>
                </div>
                <button
                  className={styles.copyBtn}
                  onClick={() => copy(copyValue || value, label)}
                  title={`Copy ${label}`}
                >
                  📋
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.instructionBox}>
          <p className={styles.instructionTitle}>How to Pay</p>
          <ol className={styles.instructionList}>
            <li>Transfer ₹5,000 to the bank account above via NEFT / IMPS / UPI</li>
            <li>Save your UTR / Transaction ID from the payment confirmation</li>
            <li>Enter the UTR below and submit</li>
            <li>Admin will verify your payment within 24 hours</li>
          </ol>
        </div>

        {/* UTR Input */}
        <div className={styles.field}>
          <label className={styles.label}>UTR / Transaction ID *</label>
          <input
            className={styles.inputFull}
            placeholder="Enter UTR number from bank receipt"
            value={utr}
            onChange={e => setUtr(e.target.value)}
          />
        </div>

        {/* Non-refundable checkbox */}
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
          />
          <span className={styles.checkLabel}>
            I understand that the ₹5,000 membership fee is <strong>strictly non-refundable</strong> and cannot be cancelled once paid.
          </span>
        </label>

        {/* Submit */}
        <button
          className={styles.btnPrimary}
          onClick={handleSubmit}
          disabled={loading || !agreed || !utr.trim()}
        >
          {loading ? 'Submitting...' : 'Submit Payment'}
        </button>

        <p className={styles.footerNote}>
          After submission, your account will remain in review until admin confirms the payment.
        </p>
      </div>
    </div>
  );
}
