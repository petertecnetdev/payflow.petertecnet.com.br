import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredToken } from '../services/auth';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!getStoredToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
