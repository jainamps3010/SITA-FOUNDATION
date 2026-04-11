import React from 'react';
import { Link } from 'react-router-dom';
import './Membership.css';

const benefits = [
  { icon: '💰', title: 'Wholesale Pricing', desc: 'Access SITA member prices — up to 30% below market rates on 800+ products.' },
  { icon: '✅', title: 'Verified Vendors Only', desc: 'All vendors are KYC-verified. No fake listings, no quality surprises.' },
  { icon: '🚚', title: 'Direct Delivery', desc: 'Free delivery on orders above ₹5,000. Products come straight from vendor to your door.' },
  { icon: '📱', title: 'Mobile App Access', desc: 'Order, track, and manage procurement from your Android or iOS device.' },
  { icon: '📊', title: 'Monthly Reports', desc: 'Detailed spend analytics every month. Know exactly where your procurement money goes.' },
  { icon: '🤝', title: 'Dedicated Support', desc: 'Assigned account manager to handle all queries, returns, and special orders.' },
  { icon: '🆕', title: 'New Products First', desc: 'Members get early access to new product listings and special vendor deals.' },
  { icon: '🏷️', title: 'Negotiated Contracts', desc: 'SITA negotiates annual rate contracts with vendors — locked-in prices for the year.' },
];

const steps = [
  { num: '1', title: 'Fill the Application', desc: 'Submit your hotel/restaurant details online or visit our office.' },
  { num: '2', title: 'Pay Membership Fee', desc: 'Pay the one-time non-refundable fee via UPI, NEFT, or cheque.' },
  { num: '3', title: 'Complete KYC', desc: 'Upload your GSTIN, address proof, and photo ID for verification.' },
  { num: '4', title: 'Get Approved', desc: "KYC typically approved within 24-48 hours. You're in!" },
];

const faqs = [
  { q: 'Is the membership fee refundable?', a: 'No. The membership fee is a one-time, non-refundable administrative fee that covers KYC processing, onboarding, and platform access.' },
  { q: 'How long is the membership valid?', a: 'The membership is annual and must be renewed each year. Renewal fees may be lower than the initial fee.' },
  { q: 'Can I have multiple outlets under one membership?', a: 'Yes. You can add up to 3 outlet addresses under one membership. Additional outlets are available at a nominal per-outlet fee.' },
  { q: 'What documents do I need for KYC?', a: 'GSTIN certificate, PAN card (business), address proof of premises, and photo ID of the proprietor/director.' },
  { q: 'Can I cancel my membership?', a: 'You can cancel at any time, but the membership fee is non-refundable. All unpaid orders must be settled before cancellation.' },
];

export default function Membership() {
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Exclusive Access</span>
          <h1>SITA Membership</h1>
          <p>Join India's most trusted B2B procurement network for the hospitality industry.</p>
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
                <span className="fee-num">2,999</span>
                <span className="fee-period">/ year</span>
              </div>
              <div className="fee-note">
                ⚠️ One-time non-refundable registration fee. Annual renewal required.
              </div>
              <ul className="fee-includes">
                <li>✓ Access to 800+ wholesale products</li>
                <li>✓ SITA member pricing (up to 30% off)</li>
                <li>✓ Mobile app access (Android & iOS)</li>
                <li>✓ Up to 3 delivery addresses</li>
                <li>✓ Monthly procurement reports</li>
                <li>✓ Dedicated account manager</li>
                <li>✓ Priority customer support</li>
                <li>✓ Early access to new products</li>
              </ul>
              <Link to="/contact" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Apply for Membership
              </Link>
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
                  <li>🏨 Hotels & Resorts</li>
                  <li>🍽️ Restaurants & Dhabas</li>
                  <li>🎂 Catering Companies</li>
                  <li>🧑‍🍳 Cloud Kitchens</li>
                  <li>🏕️ Canteens & Food Courts</li>
                </ul>
                <p className="eligibility-note">Must have a valid GSTIN to complete KYC verification.</p>
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
            <h2>Ready to Join 500+ Hoteliers?</h2>
            <p>Apply today and start saving on your procurement within 48 hours.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn-primary">Apply Now</Link>
              <Link to="/how-it-works" className="btn-secondary">Learn How It Works</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
