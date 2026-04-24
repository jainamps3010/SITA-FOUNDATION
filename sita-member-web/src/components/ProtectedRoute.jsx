import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('member_token') || sessionStorage.getItem('member_token');
  if (!token) return <Navigate to="/" replace />;
  return children;
}
