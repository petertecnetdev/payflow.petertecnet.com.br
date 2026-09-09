import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import ProtectedRoute from './components/ProtectedRoute';
import SeoManager from './components/SeoManager';

export default function App() {
  return (
    <>
      <SeoManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/planos" element={<SubscriptionPlansPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
