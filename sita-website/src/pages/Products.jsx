import React from 'react';
import { Link } from 'react-router-dom';
import './Products.css';

const categories = [
  { icon: '🛢️', name: 'Cooking Oils', desc: 'Refined oils, groundnut oil, vanaspati, desi ghee and more.' },
  { icon: '🌾', name: 'Grains & Rice', desc: 'Basmati rice, wheat flour, toor dal, moong dal and pulses.' },
  { icon: '🌶️', name: 'Spices & Masalas', desc: 'Red chilli, turmeric, coriander, garam masala and whole spices.' },
  { icon: '🔥', name: 'Gas & Fuel', desc: 'Commercial LPG cylinders and fuel supply for commercial kitchens.' },
  { icon: '🧴', name: 'Cleaning Supplies', desc: 'Floor cleaners, dish wash, laundry, toilet cleaners and sanitizers.' },
];

export default function Products() {
  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Members Only</span>
          <h1>Product Catalogue</h1>
          <p>Full product catalogue is available exclusively after membership activation.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Access Notice */}
          <div className="products-access-notice">
            <div className="notice-icon">🔒</div>
            <h2>Catalogue Available After Membership</h2>
            <p>
              SITA product catalogue with member pricing, vendor details, and bulk order options
              is accessible exclusively to active members. Apply for membership to view prices and place orders.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <a href="https://member.sita.foundation/register" target="_blank" rel="noreferrer" className="btn-primary">Apply for Membership</a>
              <Link to="/contact" className="btn-secondary">Contact Us</Link>
            </div>
          </div>

          {/* Category Preview */}
          <div className="section-header" style={{ marginTop: 60 }}>
            <span className="tag">Categories</span>
            <h2>Product Categories We Serve</h2>
            <p>We source and supply across these key categories for hospitality businesses.</p>
          </div>

          <div className="categories-preview-grid">
            {categories.map((c) => (
              <div key={c.name} className="category-preview-card card">
                <div className="cat-preview-icon">{c.icon}</div>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
                <div className="cat-locked-badge">🔒 Members Only</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="products-cta">
            <div className="cta-inner">
              <h3>Want Access to Member Prices?</h3>
              <p>Become a SITA member to view the full catalogue and place bulk orders at wholesale rates.</p>
              <Link to="/membership" className="btn-primary">Join as Member</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
