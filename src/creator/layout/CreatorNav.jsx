// src/creator/layout/CreatorNav.js
import React, { useState } from 'react';
import {
  Bell,
  Home,
  LogOut,
  Settings,
  User,
  X,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Tv,
  BarChart3,
  Video,
  Upload,
  Scissors,
  DollarSign,
} from 'lucide-react';
import logoUrl from '../../assets/logo.svg';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

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
  { id: 'channel', label: 'My Channel', icon: Tv },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'videos', label: 'My Videos', icon: Video },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'editors', label: 'Editors', icon: Scissors },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
];

const CreatorNav = ({ user, onLogout, onGoHome, onNavSelect, activeNav }) => {
  const [profOpen, setProfOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      <header
        className="h-[68px] bg-bg-side border-b border-border flex items-center px-4 sm:px-5 gap-3 flex-shrink-0 z-50 relative"
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
          aria-label="ViriShare home"
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <img src={logoUrl} alt="ViriShare" style={{ height: 26 + 'px', width: 'auto' }} />
          <span className="font-display font-black text-lg text-text-primary tracking-tight group-hover:text-primary-light transition-colors hidden sm:block">
            ViriShare
          </span>
        </button>
        <div className="flex-1" />
        <button
          onClick={onGoHome}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-bg-el text-text-secondary text-sm font-medium hover:bg-bg-hov hover:text-text-primary transition-all"
        >
          <Home size={14} />
          Home
        </button>
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              setProfOpen(false);
            }}
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              notifOpen
                ? 'border-primary bg-primary/12 text-primary-light'
                : 'border-border bg-bg-el text-text-secondary hover:bg-bg-hov hover:text-text-primary'
            }`}
          >
            <Bell size={15} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-bg-side" />
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-[148]" onClick={() => setNotifOpen(false)} />
              <div className="absolute top-[calc(100%+10px)] right-0 w-72 bg-bg-card border border-border rounded-2xl z-[149] shadow-drop overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-display font-bold text-base">Notifications</span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-hov"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-bg-hov border-b border-border/50 last:border-0 ${
                        n.unread
                          ? 'border-l-2 border-l-primary'
                          : 'border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-bg-el flex items-center justify-center text-base flex-shrink-0">
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            n.unread
                              ? 'font-semibold text-text-primary'
                              : 'font-medium text-text-secondary'
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-text-muted">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setProfOpen((p) => !p);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-border bg-bg-el hover:bg-bg-hov transition-all"
          >
            <Avatar size={28} initials={(user?.name?.slice(0, 2) || 'ME').toUpperCase()} />
            <span className="text-sm font-semibold text-text-primary max-w-[80px] truncate hidden sm:block">
              {user?.name?.split(' ')[0] || 'User'}
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
                className="absolute top-[calc(100%+8px)] right-0 w-52 bg-bg-card border border-border rounded-2xl z-[149] shadow-drop overflow-hidden"
              >
                <div className="px-4 py-3.5 border-b border-border">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar size={36} initials={(user?.name?.slice(0, 2) || 'ME').toUpperCase()} />
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{user?.name}</p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                  </div>
                  <Badge text="⭐ View+Create" type="pro" />
                </div>
                <div className="py-1.5 px-1.5">
                  <button
                    role="menuitem"
                    onClick={() => {
                      onNavSelect('channel');
                      setProfOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-text-secondary text-sm hover:bg-bg-hov transition-colors"
                  >
                    <User size={13} className="text-text-muted" />
                    My Channel
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => setProfOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-text-secondary text-sm hover:bg-bg-hov transition-colors"
                  >
                    <Settings size={13} className="text-text-muted" />
                    Settings
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      onGoHome();
                      setProfOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-text-secondary text-sm hover:bg-bg-hov transition-colors"
                  >
                    <Home size={13} className="text-text-muted" />
                    Back to Home
                  </button>
                </div>
                <div className="border-t border-border py-1.5 px-1.5">
                  <button
                    role="menuitem"
                    onClick={() => {
                      onLogout();
                      setProfOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-danger text-sm font-semibold hover:bg-danger/8 transition-colors"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-[149] bg-black/60 md:hidden" onClick={() => setDrawerOpen(false)} />
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
                      color={isActive ? '#60A5FA' : undefined}
                      strokeWidth={1.8}
                    />
                    <span
                      className={`flex-1 truncate text-lg font-medium ${
                        isActive ? 'text-primary-light font-semibold' : 'text-text-secondary'
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

export default CreatorNav;