import React from 'react';
import { Link } from 'react-router-dom';
import './HowItWorks.css';

const steps = [
  {
    num: '01',
    icon: '📝',
    title: 'Register as a Member',
    desc: 'Visit the SITA website or download the app. Fill in your hotel/restaurant details — name, address, GSTIN, contact info. Registration takes less than 5 minutes.',
    details: ['Hotel/Restaurant name & address', 'GSTIN & PAN details', 'Owner contact details', 'Type of establishment'],
    duration: '5 minutes',
  },
  {
    num: '02',
    icon: '✅',
    title: 'KYC Verification',
    desc: 'Our team reviews your submitted documents to verify your identity and business legitimacy. This ensures only genuine hospitality businesses access SITA prices.',
    details: ['GSTIN verification', 'Address proof upload', 'Business license (if applicable)', 'Photo ID of proprietor'],
    duration: '24-48 hours',
  },
  {
    num: '03',
    icon: '🛍️',
    title: 'Browse & Select Products',
    desc: 'Once approved, access the full SITA product catalogue. Compare market prices vs SITA special prices. Filter by category, brand, packaging size, or price.',
    details: ['800+ products across 6 categories', 'Side-by-side market vs SITA price', 'Vendor rating & reviews', 'Minimum order quantities shown'],
    duration: 'Anytime',
  },
  {
    num: '04',
    icon: '📦',
    title: 'Place Bulk Order',
    desc: 'Add products to your cart and place your order. Choose your preferred delivery date. Pay securely via UPI, NEFT, or credit/debit card. Order confirmation received instantly.',
    details: ['Minimum order ₹2,000', 'Multiple payment modes', 'Invoice generated automatically', 'Order tracking via app'],
    duration: 'Under 10 minutes',
  },
  {
    num: '05',
    icon: '🚚',
    title: 'Direct Delivery',
    desc: 'Your order is picked directly from the vendor and delivered to your premises. No third-party warehousing. Fresh products, verified quality, on-time delivery guaranteed.',
    details: ['Delivery within 24-48 hours', 'Real-time tracking in app', 'Quality-checked at dispatch', 'Free delivery on orders ₹5,000+'],
    duration: '24-48 hours',
  },
];

const faqs = [
  {
    q: 'Who is eligible to join SITA Foundation?',
    a: 'Any registered hotel, restaurant, dhaba, catering company, or food service business in India can join. You need a valid GSTIN to complete KYC.',
  },
  {
    q: 'Is there a membership fee?',
    a: 'Yes, there is a one-time non-refundable membership fee. Please visit our Membership page for current pricing. This fee covers KYC processing and platform access.',
  },
  {
    q: 'What is the minimum order quantity?',
    a: 'The minimum order value is ₹2,000. Individual product minimums vary by category — for example, cooking oil is typically sold in 15L or 30L packs.',
  },
  {
    q: 'How is the delivery done?',
    a: 'Products are delivered directly from verified vendors to your premises. Delivery is typically within 24-48 hours of order confirmation. For orders above ₹5,000, delivery is free.',
  },
  {
    q: "Can I return products if I'm unhappy?",
    a: "Yes. If a product is damaged or doesn't match the description, you can raise a return request within 24 hours of delivery. Our team will resolve it within 48 hours.",
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
              {['Register', 'KYC', 'Browse', 'Order', 'Delivery'].map((s, i) => (
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
