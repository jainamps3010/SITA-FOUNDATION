import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdStorefront, MdShoppingCart, MdListAlt,
  MdAccountBalanceWallet, MdCardMembership, MdPerson, MdLogout, MdMenu, MdClose
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
  { path: '/marketplace', label: 'Marketplace', icon: <MdStorefront /> },
  { path: '/cart', label: 'Cart', icon: <MdShoppingCart />, badge: true },
  { path: '/orders', label: 'My Orders', icon: <MdListAlt /> },
  { path: '/wallet', label: 'SITA Wallet', icon: <MdAccountBalanceWallet /> },
  { path: '/membership', label: 'Membership', icon: <MdCardMembership /> },
  { path: '/profile', label: 'Profile', icon: <MdPerson /> },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/marketplace': 'Marketplace',
  '/cart': 'My Cart',
  '/orders': 'My Orders',
  '/wallet': 'SITA Wallet',
  '/membership': 'Membership',
  '/profile': 'My Profile',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title = pageTitles[location.pathname] || 'SITA Foundation';
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M';

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo.png" alt="SITA Foundation" height="45" style={{ borderRadius: 6, flexShrink: 0 }} />
          <div className="logo-text">
            SITA Foundation
            <span>Member Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
              {item.badge && cartCount > 0 && (
                <span className="nav-badge">{cartCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <MdLogout /> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <MdClose /> : <MdMenu />}
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-wallet">
              <MdAccountBalanceWallet />
              ₹{(user?.sita_wallet_balance ?? user?.wallet_balance ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
