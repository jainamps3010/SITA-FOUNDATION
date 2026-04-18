import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('member_token');
  console.log('ProtectedRoute token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
