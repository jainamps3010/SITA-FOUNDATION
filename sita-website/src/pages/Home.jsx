import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  {
    icon: '🏷️',
    title: 'Wholesale Prices',
    desc: 'Access bulk rates directly from verified vendors — significant savings vs market price.',
  },
  {
    icon: '✅',
    title: 'Verified Vendors',
    desc: 'Every supplier is KYC-verified and quality-checked before listing on our platform.',
  },
  {
    icon: '🚚',
    title: 'Direct Delivery',
    desc: 'Products delivered straight to your hotel or restaurant kitchen — no middlemen.',
  },
  {
    icon: '📱',
    title: 'Android App',
    desc: 'Order anytime, anywhere with our Android app. Track your orders in real time.',
  },
  {
    icon: '📊',
    title: 'Spend Analytics',
    desc: 'Monthly reports on your procurement spending. Make smarter buying decisions.',
  },
  {
    icon: '🤝',
    title: 'Dedicated Support',
    desc: "A dedicated support team for every member. We're here when you need us.",
  },
];

const categories = [
  { icon: '🛢️', name: 'Cooking Oils' },
  { icon: '🌾', name: 'Grains & Rice' },
  { icon: '🌶️', name: 'Spices & Masalas' },
  { icon: '🔥', name: 'Gas & Fuel' },
  { icon: '🧴', name: 'Cleaning Supplies' },
];

const steps = [
  { num: '01', title: 'Register', desc: 'Sign up with your hotel/restaurant details and required documents.' },
  { num: '02', title: 'KYC Approval', desc: 'Submit GST, FSSAI and other documents for verification.' },
  { num: '03', title: 'Pay Annual Fee', desc: 'Pay the ₹5,000 annual membership fee (non-refundable).' },
  { num: '04', title: 'Access Marketplace', desc: 'Browse and order products at exclusive SITA member prices.' },
  { num: '05', title: 'Order & Receive', desc: 'Place bulk orders and receive delivery directly at your premises.' },
];

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <h1>
            SITA <span className="accent">Business Terminal</span>
          </h1>
          <p className="hero-tagline">
            B2B Procurement Platform for Vegetarian Hospitality Establishments
          </p>
          <p className="hero-sub">
            Exclusive wholesale prices from verified vendors. Direct delivery to your kitchen.
            Built for pure vegetarian Hindu hospitality businesses across India.
          </p>
          <div className="hero-ctas">
            <Link to="/membership" className="btn-primary">Join as Member</Link>
            <Link to="/how-it-works" className="btn-outline-white">How It Works</Link>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <span className="tag">Why Choose SITA</span>
            <h2>Everything Your Hotel Needs, In One Platform</h2>
            <p>From procurement to delivery — SITA Foundation handles it all so you can focus on hospitality.</p>
          </div>
          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <span className="tag">Product Categories</span>
            <h2>Products Available for Members</h2>
            <p>Product catalogue is available exclusively after membership activation.</p>
          </div>
          <div className="categories-grid">
            {categories.map((c) => (
              <Link to="/membership" key={c.name} className="category-card">
                <div className="cat-icon">{c.icon}</div>
                <div>
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-items">Available for members</div>
                </div>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <span className="tag">Simple Process</span>
            <h2>Start in 5 Simple Steps</h2>
          </div>
          <div className="steps-row">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="step-card">
                  <div className="step-num">{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="step-connector">→</div>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/how-it-works" className="btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Reduce Your Procurement Costs?</h2>
            <p>Apply for SITA membership and access wholesale prices from verified vendors.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/membership" className="btn-primary">Become a Member</Link>
              <Link to="/contact" className="btn-outline-white">Talk to Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
