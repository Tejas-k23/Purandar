import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking admin access..." />;
  }

  if (!user) {
    return <Navigate to="/tk23" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/tk23" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
