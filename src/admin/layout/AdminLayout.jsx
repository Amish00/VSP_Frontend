// src/admin/layout/AdminLayout.js
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import AdminNav from './AdminNav';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const onGoHome = () => {
    navigate('/');
  };

  // Map current path to nav id
  const pathToNavId = {
    '/admin': 'dashboard',
    '/admin/dashboard': 'dashboard',
    '/admin/videos': 'videos',
    '/admin/users': 'users',
    '/admin/revenue': 'revenue',
    '/admin/reports': 'reports',
    '/admin/settings': 'settings',
  };
  const activeNav = pathToNavId[location.pathname] || null;

  const onNavSelect = (navId) => {
    const routeMap = {
      dashboard: '/admin',
      videos: '/admin/videos',
      users: '/admin/users',
      revenue: '/admin/revenue',
      reports: '/admin/reports',
      settings: '/admin/settings',
    };
    navigate(routeMap[navId] || '/admin');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-base">
      <AdminNav
        user={user}
        onLogout={onLogout}
        onGoHome={onGoHome}
        onNavSelect={onNavSelect}
        activeNav={activeNav}
      />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          active={activeNav}
          onSelect={onNavSelect}
          className="hidden md:flex md:flex-col"
        />
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-bg-base">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;