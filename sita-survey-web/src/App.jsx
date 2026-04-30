import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import NewEntityPage from './pages/NewEntityPage'
import ConsumptionPage from './pages/ConsumptionPage'
import MySurveysPage from './pages/MySurveysPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/new-entity" element={<ProtectedRoute><NewEntityPage /></ProtectedRoute>} />
        <Route path="/consumption/:entityId" element={<ProtectedRoute><ConsumptionPage /></ProtectedRoute>} />
        <Route path="/my-surveys" element={<ProtectedRoute><MySurveysPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
