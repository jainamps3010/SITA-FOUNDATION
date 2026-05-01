import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <span style={{ display: 'inline-block', background: '#fff', borderRadius: 8, padding: 8, lineHeight: 0 }}>
            <img src="/logo.png" alt="SITA Foundation" height="50" className="nav-logo-img" />
          </span>
          <div className="logo-text">
            <span className="logo-main">SITA Foundation</span>
            <span className="logo-sub">Business Terminal</span>
          </div>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link to="/how-it-works" className={isActive('/how-it-works') ? 'active' : ''}>How It Works</Link>
          <Link to="/membership" className={isActive('/membership') ? 'active' : ''}>Membership</Link>
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
          <a href="https://member.sita.foundation" className="nav-login-btn" target="_blank" rel="noreferrer">Login</a>
        </div>
      </div>
    </nav>
  );
}
