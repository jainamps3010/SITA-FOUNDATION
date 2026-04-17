import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const icons = {
  dashboard: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h7v7H3zM14 7h7v7h-7zM3 17h7v4H3zM14 17h7v4h-7z" /></svg>,
  members: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  vendors: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  products: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  orders: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  disputes: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  logout: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  surveyphotos: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  agents: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  survey: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  chevronDown: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  chevronRight: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:14,height:14}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  surveydata: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/members', label: 'Members', icon: 'members' },
  { to: '/vendors', label: 'Vendors', icon: 'vendors' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/disputes', label: 'Disputes', icon: 'disputes' },
];

const surveySubItems = [
  { to: '/survey-photos', label: 'Survey Photos', icon: 'surveyphotos' },
  { to: '/survey-agents', label: 'Survey Agents', icon: 'agents' },
  { to: '/survey-data',   label: 'Survey Data',   icon: 'surveydata'  },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/members': 'Members Management',
  '/vendors': 'Vendors Management',
  '/products': 'Products Management',
  '/orders': 'Orders Management',
  '/disputes': 'Disputes Management',
  '/survey-photos': 'Survey — Photos',
  '/survey-agents': 'Survey — Agents',
  '/survey-data':   'Survey — Data',
};

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState('EN');
  const isSurveyPath = location.pathname.startsWith('/survey');
  const [surveyOpen, setSurveyOpen] = useState(isSurveyPath);
  const title = pageTitles[location.pathname] || 'SITA Foundation';

  useEffect(() => {
    if (isSurveyPath) setSurveyOpen(true);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{margin:'8px', overflow:'hidden', height:'80px', display:'flex', alignItems:'center', justifyContent:'center', background:'white', borderRadius:'8px'}}>
            <img src="/logo.png" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 30%'}}/>
          </div>
          <div className="sidebar-brand-text">
            <h1>SITA Foundation</h1>
            <p>Admin Panel</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {icons[item.icon]}
              {item.label}
            </NavLink>
          ))}

          {/* Survey section with sub-items */}
          <div
            className={`nav-item${isSurveyPath ? ' active' : ''}`}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setSurveyOpen(o => !o)}
          >
            {icons.survey}
            <span style={{ flex: 1 }}>Survey</span>
            {surveyOpen ? icons.chevronDown : icons.chevronRight}
          </div>
          {surveyOpen && (
            <div style={{ marginLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.15)', paddingLeft: 4 }}>
              {surveySubItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  style={{ fontSize: 13, paddingLeft: 16 }}
                >
                  {icons[item.icon]}
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{admin?.name || 'Admin'}</strong>
            {admin?.email}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', fontSize: '12px', padding: '4px 8px' }}
            onClick={handleLogout}
          >
            {icons.logout} Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <h2>{title}</h2>
          <div className="topbar-right">
            <div className="lang-toggle">
              <button
                className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
                onClick={() => setLang('EN')}
              >EN</button>
              <button
                className="lang-btn"
                title="Gujarati translation coming soon"
                style={{ opacity: 0.45, cursor: 'not-allowed' }}
              >GU</button>
            </div>
            <span className="text-muted">
              {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </span>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
