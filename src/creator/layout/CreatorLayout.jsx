// src/creator/layout/CreatorLayout.js
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import CreatorTopNav from './CreatorNav';
import CreatorSidebar from './CreatorSidebar';

const CreatorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = async () => {
    await logout();
    navigate('/signin', { replace: true });
  };

  const onGoHome = () => {
    navigate('/');
  };

  // Only used for top nav (if needed)
  const pathToNavId = {
    '/creator': 'dashboard',
    '/creator/dashboard': 'dashboard',
    '/creator/analytics': 'analytics',
    '/creator/videos': 'videos',
    '/creator/shorts': 'shorts',
    '/creator/upload': 'upload',
    '/creator/editors': 'editors',
    '/creator/earnings': 'earnings',
  };
  const activeNav = pathToNavId[location.pathname] || 'dashboard';

  const onNavSelect = (navId) => {
    const routeMap = {
      dashboard: '/creator',
      channel: '/creator/channel',
      analytics: '/creator/analytics',
      videos: '/creator/videos',
      shorts: '/creator/shorts',
      upload: '/creator/upload',
      editors: '/creator/editors',
      earnings: '/creator/earnings',
    };
    navigate(routeMap[navId] || '/creator');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-base">
      <CreatorTopNav
        user={user}
        onLogout={onLogout}
        onGoHome={onGoHome}
        onNavSelect={onNavSelect}
        activeNav={activeNav}
      />
      <div className="flex flex-1 overflow-hidden">
        <CreatorSidebar
          onSelect={onNavSelect}   // no active prop – sidebar handles it internally
          className="hidden md:flex md:flex-col"
        />
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-bg-base">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CreatorLayout;