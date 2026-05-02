// src/layout/UserLayout.js
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const UserLayout = () => {
  const location = useLocation();
  const hideFooter = ['/profile', '/watch'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-body flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 px-4 md:px-[60px]">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default UserLayout;