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
  { num: '3', title: 'Pay Membership Fee', desc: 'Exclusive membership pricing available upon application approval. Contact us for details.' },
  { num: '4', title: 'Get Access', desc: 'Membership activated immediately. Start ordering from the marketplace.' },
];

const faqs = [
  { q: 'Is the membership fee refundable?', a: 'The membership fee is strictly non-refundable once paid. It is an annual administrative fee covering KYC processing, onboarding, and platform access.' },
  { q: 'How long is the membership valid?', a: 'Membership is valid for 1 year from the date of activation. Renewal is required annually. Contact us at chairman@sita.foundation for current fee details.' },
  { q: 'Can I cover multiple outlets under one membership?', a: 'No. SITA membership covers only ONE outlet per membership. Each additional outlet requires a separate membership.' },
  { q: 'What documents do I need for KYC?', a: 'Valid GST registration certificate, valid FSSAI license, PAN card (business), address proof of premises, and photo ID of the proprietor/director.' },
  { q: 'Who is eligible to apply?', a: 'Only pure vegetarian Hindu establishments are eligible. Your establishment must hold a valid GST registration and a valid FSSAI license to complete KYC verification.' },
];

export default function Membership() {
  const [openFaq, setOpenFaq] = React.useState(null);

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
              <p style={{ color: '#FF8F00', fontWeight: 'bold', margin: '16px 0', fontSize: '1rem', lineHeight: '1.6' }}>
                💰 Membership fee details will be announced soon.<br />
                Contact us at <a href="mailto:chairman@sita.foundation" style={{ color: '#FF8F00' }}>chairman@sita.foundation</a> for more information.
              </p>
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
              <a href="https://member.sita.foundation/register" target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Apply for Membership
              </a>
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
              <a href="https://member.sita.foundation/register" target="_blank" rel="noreferrer" className="btn-primary">Apply Now</a>
              <Link to="/how-it-works" className="btn-secondary">Learn How It Works</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
