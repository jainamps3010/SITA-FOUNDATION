import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="SITA Foundation" height="44" style={{ borderRadius: 8, objectFit: 'contain' }} />
              <div>
                <div className="logo-main">SITA Foundation</div>
                <div className="logo-sub">Business Terminal</div>
              </div>
            </div>
            <p className="footer-desc">
              B2B procurement platform for pure vegetarian Hindu hospitality establishments in India. Connecting verified members with quality suppliers.
            </p>
            <div className="footer-badges">
              <span>Verified Vendors</span>
              <span>Secure Payments</span>
              <span>Bulk Orders</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Product Categories</h4>
            <ul>
              <li><Link to="/membership">Cooking Oils</Link></li>
              <li><Link to="/membership">Grains & Rice</Link></li>
              <li><Link to="/membership">Spices & Masalas</Link></li>
              <li><Link to="/membership">Gas & Fuel</Link></li>
              <li><Link to="/membership">Cleaning Supplies</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <span className="icon">📍</span>
                <span>SITA Foundation, Surat, Gujarat, India</span>
              </li>
              <li>
                <span className="icon">📞</span>
                <a href="tel:+917069924365">+91 70699 24365</a>
              </li>
              <li>
                <span className="icon">📞</span>
                <a href="tel:+917069824365">+91 70698 24365</a>
              </li>
              <li>
                <span className="icon">✉️</span>
                <a href="mailto:chairman@sita.foundation">chairman@sita.foundation</a>
              </li>
              <li>
                <span className="icon">🕐</span>
                <span>Mon–Sat: 9:00 AM – 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SITA Foundation. All rights reserved.</p>
          <p>Empowering India's Hospitality Industry</p>
        </div>
      </div>
    </footer>
  );
}
