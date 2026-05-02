// src/creator/layout/CreatorLayout.js (refactored with Outlet)
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import CreatorTopNav from './CreatorNav';
import CreatorSidebar from './CreatorSidebar';

const CreatorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = () => {
    logout();
    navigate('/signin');
  };

  const onGoHome = () => {
    navigate('/');
  };

  // Map current path to navigation id
  const pathToNavId = {
    '/creator': 'dashboard',
    '/creator/dashboard': 'dashboard',
    '/creator/channel': 'channel',
    '/creator/analytics': 'analytics',
    '/creator/videos': 'videos',
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
          active={activeNav}
          onSelect={onNavSelect}
          className="hidden md:flex md:flex-col"
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8 bg-bg-base">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CreatorLayout;