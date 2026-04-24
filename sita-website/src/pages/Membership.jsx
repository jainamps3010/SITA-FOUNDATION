import React from 'react';
import { Link } from 'react-router-dom';
import './Membership.css';

const benefits = [
  { icon: '💰', title: 'Wholesale Pricing', desc: 'Access SITA member prices — significant savings below market rates across product categories.' },
  { icon: '✅', title: 'Verified Vendors Only', desc: 'All vendors are KYC-verified. No fake listings, no quality surprises.' },
  { icon: '🚚', title: 'Direct Delivery', desc: 'Products delivered straight from vendor to your premises — no warehousing middlemen.' },
  { icon: '📱', title: 'Android App Access', desc: 'Order, track, and manage procurement from your Android device anytime.' },
  { icon: '📊', title: 'Monthly Reports', desc: 'Detailed spend analytics every month. Know exactly where your procurement money goes.' },
  { icon: '🤝', title: 'Dedicated Support', desc: 'Our team handles all queries, order issues, and special requests for members.' },
  { icon: '🏷️', title: 'Negotiated Contracts', desc: 'SITA negotiates annual rate contracts with vendors — locked-in prices for the year.' },
  { icon: '🆕', title: 'New Products First', desc: 'Members get early access to new product listings and special vendor deals.' },
];

const steps = [
  { num: '1', title: 'Fill the Application', desc: 'Submit your hotel/restaurant details and documents online or visit our office.' },
  { num: '2', title: 'KYC Verification', desc: 'Our team verifies your GST, FSSAI license, and business documents within 24-48 hours.' },
  { num: '3', title: 'Pay Membership Fee', desc: 'Pay the ₹5,000 annual non-refundable fee via UPI, NEFT, or bank transfer.' },
  { num: '4', title: 'Get Access', desc: 'Membership activated immediately. Start ordering from the marketplace.' },
];

const faqs = [
  { q: 'Is the membership fee refundable?', a: 'No. The membership fee of ₹5,000 is strictly non-refundable. It is an annual administrative fee covering KYC processing, onboarding, and platform access.' },
  { q: 'How long is the membership valid?', a: 'Membership is valid for 1 year from the date of activation. Renewal is required annually at ₹5,000 per year.' },
  { q: 'Can I cover multiple outlets under one membership?', a: 'No. SITA membership covers only ONE outlet per membership. Each additional outlet requires a separate membership.' },
  { q: 'What documents do I need for KYC?', a: 'Valid GST registration certificate, valid FSSAI license, PAN card (business), address proof of premises, and photo ID of the proprietor/director.' },
  { q: 'Who is eligible to apply?', a: 'Only pure vegetarian Hindu establishments are eligible. Your establishment must hold a valid GST registration and a valid FSSAI license to complete KYC verification.' },
];

export default function Membership() {
  const [openFaq, setOpenFaq] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [inquiryForm, setInquiryForm] = React.useState({ name: '', mobile: '', business_name: '', city: '' });
  const [inquirySubmitted, setInquirySubmitted] = React.useState(false);
  const [inquiryErrors, setInquiryErrors] = React.useState({});

  const validateInquiry = () => {
    const e = {};
    if (!inquiryForm.name.trim()) e.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(inquiryForm.mobile.replace(/\s/g, ''))) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!inquiryForm.business_name.trim()) e.business_name = 'Business name is required';
    if (!inquiryForm.city.trim()) e.city = 'City is required';
    return e;
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    const errs = validateInquiry();
    if (Object.keys(errs).length > 0) { setInquiryErrors(errs); return; }
    setInquirySubmitted(true);
  };

  const handleInquiryChange = (field, value) => {
    setInquiryForm(f => ({ ...f, [field]: value }));
    if (inquiryErrors[field]) setInquiryErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  const closeModal = () => {
    setShowModal(false);
    setInquirySubmitted(false);
    setInquiryForm({ name: '', mobile: '', business_name: '', city: '' });
    setInquiryErrors({});
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Exclusive Access</span>
          <h1>SITA Membership</h1>
          <p>Join India's trusted B2B procurement network for pure vegetarian hospitality establishments.</p>
        </div>
      </div>

      {/* Benefits */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="tag">Member Benefits</span>
            <h2>What You Get as a SITA Member</h2>
            <p>Everything you need to reduce procurement costs and streamline your hotel operations.</p>
          </div>
          <div className="grid-2 benefits-grid">
            {benefits.map((b) => (
              <div key={b.title} className="benefit-card card">
                <div className="benefit-icon">{b.icon}</div>
                <div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Card */}
      <section className="section fee-section">
        <div className="container">
          <div className="fee-grid">
            <div className="fee-card">
              <div className="fee-header">
                <div className="fee-badge">Annual Membership</div>
                <h2>SITA Business<br />Member Plan</h2>
              </div>
              <div className="fee-amount">
                <span className="fee-currency">₹</span>
                <span className="fee-num">5,000</span>
                <span className="fee-period">/ year</span>
              </div>
              <div className="fee-note">
                ⚠️ Annual Fee — Strictly Non-Refundable
              </div>
              <ul className="fee-includes">
                <li>✓ Access to wholesale product catalogue</li>
                <li>✓ SITA member pricing on all products</li>
                <li>✓ Android app access</li>
                <li>✓ One outlet covered per membership</li>
                <li>✓ Monthly procurement reports</li>
                <li>✓ Dedicated support team</li>
                <li>✓ Early access to new products</li>
                <li>✓ Annual vendor rate contracts</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setShowModal(true)}>
                Apply for Membership
              </button>
            </div>

            <div className="fee-info">
              <h3>How to Join</h3>
              <div className="join-steps">
                {steps.map((s) => (
                  <div key={s.num} className="join-step">
                    <div className="join-num">{s.num}</div>
                    <div>
                      <div className="join-title">{s.title}</div>
                      <div className="join-desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="eligibility-box">
                <h4>Who Can Apply?</h4>
                <ul>
                  <li>🛕 Only Hindu establishments</li>
                  <li>🥗 Pure Vegetarian outlets only</li>
                  <li>📋 Valid GST registration required</li>
                  <li>🏥 Valid FSSAI license required</li>
                  <li>🏨 Only ONE outlet per membership</li>
                </ul>
              </div>

              <div className="eligibility-box" style={{ marginTop: 16, background: '#fff3e0', borderColor: '#ff9800' }}>
                <h4 style={{ color: '#e65100' }}>⚠️ Important Notes</h4>
                <ul>
                  <li>Membership fee is strictly Non-Refundable</li>
                  <li>You cannot cancel your membership once paid</li>
                  <li>Only one outlet is covered per membership</li>
                  <li>Membership is valid for 1 year from date of activation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="tag">FAQ</span>
            <h2>Membership Questions Answered</h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="faq-toggle">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div className="mem-cta">
            <h2>Ready to Get Started?</h2>
            <p>Apply today and start accessing wholesale prices within 48 hours of KYC approval.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>Apply Now</button>
              <Link to="/how-it-works" className="btn-secondary">Learn How It Works</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Inquiry Modal */}
      {showModal && (
        <div className="mem-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="mem-modal">
            <button className="mem-modal-close" onClick={closeModal}>✕</button>
            {inquirySubmitted ? (
              <div className="mem-modal-success">
                <div className="mem-modal-success-icon">✅</div>
                <h3>Thank You!</h3>
                <p>Our team will contact you within 24 hours to guide you through the membership process.</p>
                <button className="btn-primary" style={{ marginTop: 16, cursor: 'pointer' }} onClick={closeModal}>Close</button>
              </div>
            ) : (
              <>
                <h3 className="mem-modal-title">Apply for Membership</h3>
                <p className="mem-modal-sub">Fill in your details and our team will reach out within 24 hours.</p>
                <form onSubmit={handleInquirySubmit} className="mem-modal-form" noValidate>
                  <div className="mem-modal-field">
                    <label>Full Name *</label>
                    <input type="text" placeholder="Your full name" value={inquiryForm.name} onChange={e => handleInquiryChange('name', e.target.value)} className={inquiryErrors.name ? 'error' : ''} />
                    {inquiryErrors.name && <span className="err">{inquiryErrors.name}</span>}
                  </div>
                  <div className="mem-modal-field">
                    <label>Mobile Number *</label>
                    <input type="tel" placeholder="10-digit mobile number" value={inquiryForm.mobile} onChange={e => handleInquiryChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} className={inquiryErrors.mobile ? 'error' : ''} maxLength={10} />
                    {inquiryErrors.mobile && <span className="err">{inquiryErrors.mobile}</span>}
                  </div>
                  <div className="mem-modal-field">
                    <label>Business Name *</label>
                    <input type="text" placeholder="Hotel / Restaurant name" value={inquiryForm.business_name} onChange={e => handleInquiryChange('business_name', e.target.value)} className={inquiryErrors.business_name ? 'error' : ''} />
                    {inquiryErrors.business_name && <span className="err">{inquiryErrors.business_name}</span>}
                  </div>
                  <div className="mem-modal-field">
                    <label>City *</label>
                    <input type="text" placeholder="Your city" value={inquiryForm.city} onChange={e => handleInquiryChange('city', e.target.value)} className={inquiryErrors.city ? 'error' : ''} />
                    {inquiryErrors.city && <span className="err">{inquiryErrors.city}</span>}
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, cursor: 'pointer' }}>
                    Submit Inquiry →
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
