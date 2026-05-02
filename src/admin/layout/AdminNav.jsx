// src/admin/layout/AdminNav.js
import React, { useState } from 'react';
import {
  Bell,
  Home,
  LogOut,
  X,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Video,
  Users,
  DollarSign,
  User,
} from 'lucide-react';
import logoUrl from '../../assets/logo.svg';

// Notifications (unchanged)
export const NOTIFICATIONS = [
  { id: 1, icon: '✅', title: 'Video Approved', body: "'React Masterclass' is now live!", time: '2h ago', unread: true },
  { id: 2, icon: '❤️', title: 'New Likes', body: 'Your video got 340 new likes', time: '4h ago', unread: true },
  { id: 3, icon: '💬', title: 'New Comment', body: 'Dev_Ninja: "Amazing content!"', time: '6h ago', unread: true },
  { id: 4, icon: '👥', title: '+340 subscribers', body: 'You gained 340 new subs this week', time: '1d ago', unread: false },
  { id: 5, icon: '💰', title: 'Payout Processed', body: '$320 sent to your account', time: '3d ago', unread: false },
];

// Replace emoji icons with Lucide components
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
];

const AdminNav = ({ user, onLogout, onGoHome, onNavSelect, activeNav }) => {
  const [profOpen, setProfOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="h-[60px] bg-bg-side border-b border-border flex items-center px-4 sm:px-5 gap-3 flex-shrink-0 z-50 relative"
        style={{
          boxShadow: '0 1px 0 rgba(255,255,255,.02),0 2px 12px rgba(0,0,0,.25)',
        }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="md:hidden w-9 h-9 rounded-xl border border-border bg-bg-el flex items-center justify-center text-text-secondary hover:bg-bg-hov transition-colors"
        >
          <Menu size={16} />
        </button>
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <img src={logoUrl} alt="ViriShare" style={{ height: 26 + 'px', width: 'auto' }} />
          <span className="font-display font-black text-lg text-text-primary tracking-tight group-hover:text-primary-light transition-colors hidden sm:block">
            ViriShare
          </span>
        </button>
        <div className="flex-1" />

        {/* Profile dropdown (unchanged) */}
        <div className="relative">
          <button
            onClick={() => setProfOpen((p) => !p)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-border bg-bg-el hover:bg-bg-hov transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-danger flex items-center justify-center text-white text-xs font-bold font-display">
              {(user?.name || 'AD').slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-text-primary max-w-[80px] truncate hidden sm:block">
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
            <ChevronDown
              size={12}
              className={`text-text-muted transition-transform ${profOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {profOpen && (
            <>
              <div className="fixed inset-0 z-[148]" onClick={() => setProfOpen(false)} />
              <div
                role="menu"
                className="absolute top-[calc(100%+8px)] right-0 w-44 bg-bg-card border border-border rounded-2xl z-[149] shadow-drop overflow-hidden p-1.5"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    onGoHome();
                    setProfOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-text-secondary text-sm hover:bg-bg-hov transition-colors"
                >
                  <User size={13} /> My Profile
                </button>
                <div className="border-t border-border my-1" />
                <button
                  role="menuitem"
                  onClick={() => {
                    onLogout();
                    setProfOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-danger text-sm font-semibold hover:bg-danger/8 transition-colors"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile drawer – improved with Lucide icons and larger text */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[149] bg-black/60 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fixed top-0 left-0 bottom-0 w-[220px] z-[150] bg-bg-side border-r border-border flex flex-col md:hidden"
            style={{ boxShadow: '4px 0 24px rgba(0,0,0,.5)' }}
          >
            <div className="h-[60px] flex items-center px-4 gap-2.5 border-b border-border">
              <img src={logoUrl} alt="ViriShare" style={{ height: 22 + 'px', width: 'auto' }} />
              <span className="font-display font-black text-base text-text-primary">ViriShare</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-hov"
              >
                <X size={14} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {NAV.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavSelect(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`sbi w-full text-left ${isActive ? 'active' : ''}`}
                  >
                    <IconComponent
                      size={20}
                      className="flex-shrink-0"
                      color={isActive ? '#EF4444' : undefined}
                      strokeWidth={1.8}
                    />
                    <span
                      className={`flex-1 truncate text-lg font-medium ${
                        isActive ? 'text-danger font-semibold' : 'text-text-secondary'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default AdminNav;