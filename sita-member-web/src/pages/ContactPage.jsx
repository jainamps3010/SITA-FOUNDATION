import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <span className={styles.title}>Contact Us</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <div className={styles.orgName}>SITA Foundation</div>
          <div className={styles.orgSub}>We're here to help</div>
        </div>

        <ContactCard
          icon="✉️"
          label="Email"
          value="chairman@sita.foundation"
          href="mailto:chairman@sita.foundation"
        />
        <ContactCard
          icon="📞"
          label="Phone 1"
          value="+91 7069924365"
          href="tel:+917069924365"
        />
        <ContactCard
          icon="📞"
          label="Phone 2"
          value="+91 7069824365"
          href="tel:+917069824365"
        />
        <ContactCard
          icon="💬"
          label="WhatsApp"
          value="+91 7069924365"
          href="https://wa.me/917069924365"
          accentColor="#25D366"
        />
      </div>

      <nav className={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', path: '/home' },
          { icon: '🏪', label: 'Market', path: '/marketplace' },
          { icon: '📋', label: 'Orders', path: '/orders' },
          { icon: '👤', label: 'Profile', path: '/profile' },
        ].map((n) => (
          <button
            key={n.path}
            className={styles.navItem}
            onClick={() => navigate(n.path)}
          >
            <span className={styles.navIcon}>{n.icon}</span>
            <span className={styles.navLabel}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ContactCard({ icon, label, value, href, accentColor = '#1A237E' }) {
  return (
    <a href={href} className={styles.card} style={{ '--accent': accentColor }}>
      <div className={styles.cardIcon} style={{ background: accentColor + '1A' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardLabel}>{label}</div>
        <div className={styles.cardValue}>{value}</div>
      </div>
      <span className={styles.cardArrow} style={{ color: accentColor }}>›</span>
    </a>
  );
}
