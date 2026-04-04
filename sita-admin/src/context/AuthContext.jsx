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
    const res = await api.post('/auth/admin/login', { email, password });
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
