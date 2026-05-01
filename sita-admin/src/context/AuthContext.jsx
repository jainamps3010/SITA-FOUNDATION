import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sita_admin_token');
    const user = localStorage.getItem('sita_admin_user');
    if (token && user) {
      try { setAdmin(JSON.parse(user)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('[Auth] Base URL:', api.defaults.baseURL);
    console.log('[Auth] Calling:', api.defaults.baseURL + '/auth/admin/login');
    console.log('[Auth] Payload:', { email, password });
    const res = await api.post('/auth/admin/login', { email, password });
    console.log('[Auth] Response status:', res.status);
    console.log('[Auth] Response data:', res.data);
    const { token, admin } = res.data;
    localStorage.setItem('sita_admin_token', token);
    localStorage.setItem('sita_admin_user', JSON.stringify(admin));
    setAdmin(admin);
    return admin;
  };

  const logout = () => {
    localStorage.removeItem('sita_admin_token');
    localStorage.removeItem('sita_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
