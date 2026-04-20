import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

export default function Header({ title, showBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCart();

  const member = (() => {
    try { return JSON.parse(localStorage.getItem('member_data') || '{}'); }
    catch { return {}; }
  })();

  const isHome = location.pathname === '/home';

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {showBack && (
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              ‹
            </button>
          )}
          <img
            src="/logo.png"
            alt="SITA Foundation"
            className={styles.logo}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {title && <span className={styles.title}>{title}</span>}
        </div>

        <div className={styles.right}>
          <button className={styles.cartBtn} onClick={() => navigate('/cart')}>
            🛒
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </button>
          {isHome && (
            <button
              className={styles.logoutBtn}
              onClick={() => {
                localStorage.removeItem('member_token');
                localStorage.removeItem('member_data');
                navigate('/');
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {isHome && (
        <div className={styles.memberInfo}>
          <span className={styles.greeting}>Good morning,</span>
          <span className={styles.memberName}>{member.name || 'Member'}</span>
          {member.hotel_name && (
            <span className={styles.hotelName}>{member.hotel_name}</span>
          )}
        </div>
      )}
    </header>
  );
}
