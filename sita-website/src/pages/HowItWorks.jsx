import React from 'react';
import { Link } from 'react-router-dom';
import './HowItWorks.css';

const steps = [
  {
    num: '01',
    icon: '📝',
    title: 'Register as a Member',
    desc: 'Visit the SITA website and fill in your hotel/restaurant details. Registration takes less than 5 minutes.',
    details: [
      'Hotel/Restaurant name & address',
      'GSTIN & PAN details',
      'Owner contact details',
      'Type of establishment',
    ],
    duration: '5 minutes',
  },
  {
    num: '02',
    icon: '✅',
    title: 'KYC Verification',
    desc: 'Our team reviews your submitted documents to verify your identity and business. Only genuine pure vegetarian Hindu hospitality establishments are approved.',
    details: [
      'GSTIN verification',
      'FSSAI license verification',
      'Address proof upload',
      'Photo ID of proprietor',
    ],
    duration: '24–48 hours',
  },
  {
    num: '03',
    icon: '💳',
    title: 'Pay Annual Membership Fee',
    desc: 'Exclusive membership pricing available upon application approval. Contact us at chairman@sita.foundation for details.',
    details: [
      'Membership fee details will be announced soon',
      'Non-refundable once paid',
      'Valid for 1 year from activation',
      'One outlet per membership',
    ],
    duration: 'Instant',
  },
  {
    num: '04',
    icon: '🛍️',
    title: 'Access the Marketplace',
    desc: 'Once activated, access the full SITA product catalogue. Browse by category, compare member prices, and view product details.',
    details: [
      'Products across 5 categories',
      'Exclusive SITA member pricing',
      'Verified vendor listings',
      'Minimum order quantities shown',
    ],
    duration: 'Anytime',
  },
  {
    num: '05',
    icon: '🚚',
    title: 'Order & Receive Delivery',
    desc: 'Place bulk orders and receive delivery directly at your premises. Products come straight from verified vendors — no warehousing middlemen.',
    details: [
      'Delivery within 24–48 hours',
      'Real-time tracking in Android app',
      'Quality-checked at dispatch',
      'Direct vendor-to-kitchen delivery',
    ],
    duration: '24–48 hours',
  },
];

const faqs = [
  {
    q: 'Who is eligible to join SITA Foundation?',
    a: 'Only pure vegetarian Hindu establishments are eligible. Your establishment must have a valid GST registration and a valid FSSAI license to complete KYC verification.',
  },
  {
    q: 'What is the membership fee?',
    a: 'Exclusive membership pricing is available upon application approval. Contact us at chairman@sita.foundation for details.',
  },
  {
    q: 'Can I cover multiple outlets under one membership?',
    a: 'No. SITA membership covers only ONE outlet per membership. Each additional outlet requires a separate membership application and fee.',
  },
  {
    q: 'What is the minimum order quantity?',
    a: 'Minimum order quantities vary by product and vendor. Individual product minimums are shown on each product listing in the member catalogue.',
  },
  {
    q: 'How is the delivery done?',
    a: 'Products are delivered directly from verified vendors to your premises. Delivery is typically within 24–48 hours of order confirmation.',
  },
];

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Simple & Transparent</span>
          <h1>How SITA Works</h1>
          <p>From registration to delivery — a seamless procurement experience in 5 steps.</p>
        </div>
      </div>

      {/* Steps */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="tag">The Process</span>
            <h2>Your Journey with SITA Foundation</h2>
          </div>
          <div className="hiw-steps">
            {steps.map((s, i) => (
              <div key={s.num} className={`hiw-step ${i % 2 === 1 ? 'reverse' : ''}`}>
                <div className="hiw-step-visual">
                  <div className="hiw-icon-wrap">
                    <div className="hiw-num">{s.num}</div>
                    <div className="hiw-icon">{s.icon}</div>
                  </div>
                  {i < steps.length - 1 && <div className="hiw-connector" />}
                </div>
                <div className="hiw-step-content card">
                  <div className="hiw-duration">⏱ {s.duration}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <ul className="hiw-details">
                    {s.details.map((d) => (
                      <li key={d}>
                        <span className="check">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Banner */}
      <section className="section hiw-overview-section">
        <div className="container">
          <div className="hiw-banner">
            <h2>From Registration to Delivery — All in One Place</h2>
            <div className="hiw-flow">
              {['Register', 'KYC', 'Pay Fee', 'Marketplace', 'Order'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flow-step">
                    <div className="flow-circle">{i + 1}</div>
                    <span>{s}</span>
                  </div>
                  {i < 4 && <div className="flow-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>
            <Link to="/membership" className="btn-primary" style={{ marginTop: 32 }}>
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="tag">FAQ</span>
            <h2>Frequently Asked Questions</h2>
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
    </div>
  );
}
