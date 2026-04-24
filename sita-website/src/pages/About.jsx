import React from 'react';
import './About.css';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <span className="hero-tag">Our Story</span>
          <h1>About SITA Foundation</h1>
          <p>Empowering India's hospitality industry through collective procurement and trusted vendor networks.</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card mission">
              <div className="mv-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To empower pure vegetarian Hindu hoteliers and restaurateurs with access to quality products
                at wholesale prices, eliminating the exploitation of small buyers by creating a unified
                procurement cooperative.
              </p>
            </div>
            <div className="mv-card vision">
              <div className="mv-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>
                To become India's most trusted B2B procurement platform for the pure vegetarian hospitality
                sector — covering every city, every hotel, every kitchen — reducing costs industry-wide.
              </p>
            </div>
            <div className="mv-card values">
              <div className="mv-icon">💎</div>
              <h3>Our Values</h3>
              <p>
                Transparency in pricing. Trust in vendor verification. Integrity in every transaction.
                Community over competition. We grow when our members grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="section about-story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <span className="tag">The Problem We Solve</span>
              <h2>Why SITA Foundation Was Born</h2>
              <p>
                A group of hotel owners in Surat recognized a common problem — each of them was paying retail
                prices for bulk quantities of daily consumables. Cooking oil, rice, spices, cleaning supplies —
                items they needed in large volumes every week.
              </p>
              <p>
                Individually, they lacked the bargaining power to negotiate wholesale rates. Middlemen took large
                margins. Quality was inconsistent. Delivery was unreliable.
              </p>
              <p>
                SITA Foundation was established to solve this. By aggregating the purchasing power of verified
                hotels under one platform, we negotiate directly with manufacturers and distributors — passing the
                savings directly to our members.
              </p>
              <div className="story-highlights">
                <div className="highlight">
                  <span className="h-num">30%</span>
                  <span className="h-label">Average Cost Savings</span>
                </div>
                <div className="highlight">
                  <span className="h-num">48hr</span>
                  <span className="h-label">Delivery Turnaround</span>
                </div>
                <div className="highlight">
                  <span className="h-num">100%</span>
                  <span className="h-label">Verified Vendors</span>
                </div>
              </div>
            </div>
            <div className="story-visual">
              <div className="visual-card">
                <div className="vc-header">SITA Business Terminal</div>
                <div className="vc-feature-list">
                  <div className="vc-feature">✅ KYC-Verified Members Only</div>
                  <div className="vc-feature">✅ Pure Vegetarian Establishments</div>
                  <div className="vc-feature">✅ Verified Vendor Network</div>
                  <div className="vc-feature">✅ Direct Delivery to Your Kitchen</div>
                  <div className="vc-feature">✅ Transparent Member Pricing</div>
                </div>
                <div className="vc-footer">Registered Non-Profit Trust · Gujarat, India</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
