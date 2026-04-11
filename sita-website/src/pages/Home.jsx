import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  {
    icon: '🏷️',
    title: 'Wholesale Prices',
    desc: 'Access bulk rates directly from verified vendors — up to 30% savings vs market price.',
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
    title: 'Mobile App',
    desc: 'Order anytime, anywhere with our intuitive Android app. Track orders in real time.',
  },
  {
    icon: '📊',
    title: 'Spend Analytics',
    desc: 'Monthly reports on your procurement spending. Make smarter buying decisions.',
  },
  {
    icon: '🤝',
    title: 'Dedicated Support',
    desc: "A dedicated account manager for every member. We're here when you need us.",
  },
];

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '120+', label: 'Verified Vendors' },
  { value: '800+', label: 'Products Listed' },
  { value: '₹2Cr+', label: 'Monthly Procurement' },
];

const categories = [
  { icon: '🛢️', name: 'Cooking Oils', items: '45+ SKUs' },
  { icon: '🌾', name: 'Grains & Rice', items: '30+ SKUs' },
  { icon: '🌶️', name: 'Spices & Masalas', items: '60+ SKUs' },
  { icon: '🔥', name: 'Gas & Fuel', items: '10+ SKUs' },
  { icon: '🧴', name: 'Cleaning Supplies', items: '50+ SKUs' },
  { icon: '🥛', name: 'Dairy Products', items: '25+ SKUs' },
];

const steps = [
  { num: '01', title: 'Register', desc: 'Sign up as a member with your hotel/restaurant details.' },
  { num: '02', title: 'KYC Approval', desc: 'Submit documents for quick KYC verification.' },
  { num: '03', title: 'Browse & Order', desc: 'Explore products and place bulk orders at SITA prices.' },
  { num: '04', title: 'Fast Delivery', desc: 'Receive your order directly at your premises.' },
];

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-badge">🇮🇳 Trusted by 500+ Hoteliers Across India</div>
          <h1>
            SITA <span className="accent">Business Terminal</span>
          </h1>
          <p className="hero-tagline">
            India's Trusted B2B Procurement Platform for Hoteliers
          </p>
          <p className="hero-sub">
            Get wholesale prices on 800+ products. Verified vendors. Direct delivery.
            Built exclusively for India's hospitality industry.
          </p>
          <div className="hero-ctas">
            <Link to="/membership" className="btn-primary">Join as Member</Link>
            <a href="#download" className="btn-outline-white">Download App</a>
          </div>
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
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
            <span className="tag">Product Catalogue</span>
            <h2>800+ Products Across 6 Categories</h2>
            <p>Everything from cooking oils to cleaning supplies — sourced, verified, and delivered.</p>
          </div>
          <div className="categories-grid">
            {categories.map((c) => (
              <Link to="/products" key={c.name} className="category-card">
                <div className="cat-icon">{c.icon}</div>
                <div>
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-items">{c.items}</div>
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
            <h2>Start Saving in 4 Simple Steps</h2>
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

      {/* Download / CTA */}
      <section id="download" className="section download-section">
        <div className="container">
          <div className="download-box">
            <div className="download-content">
              <span className="tag">Mobile App</span>
              <h2>Order On The Go</h2>
              <p>
                Download the SITA Business Terminal app. Browse 800+ products, place bulk orders,
                track deliveries, and view your spend analytics — all from your phone.
              </p>
              <div className="app-btns">
                <a href="#download" className="app-btn">
                  <span className="app-icon">📱</span>
                  <div>
                    <div className="app-label">Download on</div>
                    <div className="app-store">Google Play</div>
                  </div>
                </a>
                <a href="#download" className="app-btn app-btn-outline">
                  <span className="app-icon">🍎</span>
                  <div>
                    <div className="app-label">Available on</div>
                    <div className="app-store">App Store</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="download-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="phone-header">SITA Business Terminal</div>
                  <div className="phone-item">🛢️ Cooking Oil — ₹125/L</div>
                  <div className="phone-item">🌾 Basmati Rice — ₹85/kg</div>
                  <div className="phone-item">🌶️ Red Chilli — ₹320/kg</div>
                  <div className="phone-item">🧴 Floor Cleaner — ₹45/L</div>
                  <div className="phone-order-btn">Place Order</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Reduce Your Procurement Costs?</h2>
            <p>Join 500+ hoteliers already saving with SITA Foundation.</p>
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
