import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} height="44" alt="SITA Foundation" style={{ borderRadius: 8, objectFit: 'contain' }} />
              <div>
                <div className="logo-main">SITA Foundation</div>
                <div className="logo-sub">Business Terminal</div>
              </div>
            </div>
            <p className="footer-desc">
              India's trusted B2B procurement platform for hoteliers. Connecting hospitality businesses with quality suppliers since 2023.
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
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Product Categories</h4>
            <ul>
              <li><Link to="/products">Cooking Oils</Link></li>
              <li><Link to="/products">Grains & Rice</Link></li>
              <li><Link to="/products">Spices & Masalas</Link></li>
              <li><Link to="/products">Gas & Fuel</Link></li>
              <li><Link to="/products">Cleaning Supplies</Link></li>
              <li><Link to="/products">Dairy Products</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <span className="icon">📍</span>
                <span>SITA Foundation Office, Ahmedabad, Gujarat, India</span>
              </li>
              <li>
                <span className="icon">📞</span>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li>
                <span className="icon">✉️</span>
                <a href="mailto:info@sitafoundation.in">info@sitafoundation.in</a>
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
