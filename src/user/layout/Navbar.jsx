import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, X, Menu, LogOut, User, Clock, Heart, Users,
  DollarSign, Settings, Video, ChevronDown, Home, TrendingUp,
  CreditCard, CheckCircle, XCircle, BarChart, 
  MessageCircle,  UserPlus,
  VideoIcon
} from 'lucide-react';

import logoUrl from '../../assets/logo.svg';
import Badge from '../components/ui/Badge';
import { useAuth } from '../../auth/context/AuthContext';
import api, { markNotificationAsRead } from '../api/Api';
import LanguageSwitcher from '../components/LanguageSwitcher';

// ----------------------------------------------------------------------
// Helper functions & constants
// ----------------------------------------------------------------------
const getNotificationIcon = (type) => {
  const icons = {
    VIDEO_APPROVED: <CheckCircle className="text-green-500" size={20} />,
    VIDEO_REJECTED: <XCircle className="text-red-500" size={20} />,
    NEW_VIDEO_UPLOAD: <VideoIcon className="text-blue-500" size={20} />,
    PAYOUT_REQUEST: <DollarSign className="text-amber-500" size={20} />,
    MONTHLY_EARNINGS: <BarChart className="text-purple-500" size={20} />,
    MONTHLY_REVENUE_REPORT: <BarChart className="text-pink-500" size={20} />,
    NEW_SUBSCRIBER: <Users className="text-teal-500" size={20} />,
    NEW_COMMENT: <MessageCircle className="text-indigo-500" size={20} />,
    VIDEO_LIKE: <Heart className="text-rose-500" size={20} />,
    NEW_USER_REGISTRATION: <UserPlus className="text-lime-500" size={20} />,
  };
  return icons[type] || <Bell className="text-gray-500" size={20} />;
};

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/trending', label: 'Trending', icon: TrendingUp },
  { to: '/subscriptions', label: 'Subscriptions', icon: Users },
  { to: '/plans', label: 'Plans', icon: CreditCard },
];

const PROFILE_ITEMS = [
  { icon: User, label: 'Profile', to: '/profile' },
  { icon: Clock, label: 'Watch History', to: '/history' },
  { icon: Users, label: 'Subscriptions', to: '/subscriptions' },
  { icon: DollarSign, label: 'Subscription Plan', to: '/plans' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

const canAccessStudio = (user) => {
  if (!user) return false;
  return user.role === 'CREATOR' || user.plan === 'CREATE';
};

// ----------------------------------------------------------------------
// Notification Panel
// ----------------------------------------------------------------------
const NotifPanel = ({ onClose, notifications: initialNotifs, onMarkAllRead, unreadCount, onNotificationClick }) => {
  const [notifications, setNotifications] = useState(initialNotifs);

  const sortNotifications = (list) => {
    return [...list].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  useEffect(() => {
    setNotifications(sortNotifications(initialNotifs));
  }, [initialNotifs]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      const updated = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(sortNotifications(updated));
      if (onNotificationClick) onNotificationClick();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[148]" onClick={onClose} />
      <div className="absolute top-[calc(100%+10px)] right-0 w-80 bg-bg-card border border-border rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,.6)] overflow-hidden z-[149]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-text-primary">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-danger text-white text-xs font-bold">{unreadCount}</span>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-hov">
            <X size={14} />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-text-muted text-sm">No notifications yet</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkAsRead(n.id)}
                className={`flex gap-3 px-4 py-3.5 hover:bg-bg-hov border-b border-border/50 last:border-0 cursor-pointer transition-colors ${
                  !n.read ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-bg-el flex items-center justify-center text-lg flex-shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
              </div>
            ))
          )}
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={onMarkAllRead}
              className="text-sm text-primary-light font-semibold hover:opacity-80"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ----------------------------------------------------------------------
// Search Overlay (unchanged)
// ----------------------------------------------------------------------
const SearchOverlay = ({ onClose }) => {
  const [q, setQ] = useState('');
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 50, sort: 'publishedAt,desc' }
        });
        setAllVideos(response.data.content || response.data || []);
      } catch (err) {
        console.error('Failed to fetch videos for search:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    ref.current?.focus();
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatRelativeDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const now = new Date();
    const diffMin = (now - date) / 1000 / 60;
    const diffHour = diffMin / 60;
    const diffDay = diffHour / 24;
    if (diffDay >= 7) return `${Math.floor(diffDay / 7)} weeks ago`;
    if (diffDay >= 1) return `${Math.floor(diffDay)} days ago`;
    if (diffHour >= 1) return `${Math.floor(diffHour)} hours ago`;
    if (diffMin >= 1) return `${Math.floor(diffMin)} minutes ago`;
    return 'Just now';
  };

  const isShort = (video) => video.type === 'SHORT' || video.type === 'SHORTS' || video.isShort;

  const filteredVideos = q.length > 1
    ? allVideos.filter(v =>
        v.title?.toLowerCase().includes(q.toLowerCase()) ||
        v.username?.toLowerCase().includes(q.toLowerCase()) ||
        v.tags?.toLowerCase().includes(q.toLowerCase()) ||
        v.category?.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSelect = (video) => {
    if (isShort(video)) {
      navigate(`/shorts?play=${video.id}`);
    } else {
      navigate(`/watch/${video.id}`);
    }
    onClose();
  };

  const handleSearchNavigation = () => {
    const trimmed = q.trim();
    if (trimmed) {
      onClose();
      setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }, 10);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchNavigation();
    }
  };

  const trendingCategories = [...new Set(allVideos.map(v => v.category).filter(Boolean))].slice(0, 5);

  return (
    <>
      <div className="fixed inset-0 z-[198] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 z-[199] bg-bg-base/98 backdrop-blur-2xl border-b border-border px-4 sm:px-8 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              ref={ref}
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search videos, channels…"
              className={`${inp} pl-11 pr-20`}
            />
            <button
              onClick={handleSearchNavigation}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg"
            >
              Search
            </button>
          </div>

          {loading && <div className="mt-3 text-center text-text-muted py-4">Loading videos...</div>}

          {!loading && filteredVideos.length > 0 && (
            <div className="mt-2 bg-bg-card border border-border rounded-xl overflow-hidden">
              {filteredVideos.map(v => (
                <div
                  key={v.id}
                  onClick={() => handleSelect(v)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hov cursor-pointer border-b border-border/60 last:border-0 transition-colors"
                >
                  <div className="w-14 h-8 rounded-lg bg-bg-el flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                    {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : '🎬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{v.title}</p>
                      <Badge text={isShort(v) ? 'SHORTS' : 'VIDEO'} type={isShort(v) ? 'info' : 'pro'} small />
                    </div>
                    <p className="text-xs text-text-muted flex gap-2">
                      <span>{v.username}</span>
                      <span>{formatRelativeDate(v.publishedAt)}</span>
                      <span>{formatNumber(v.viewCount)} views</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge text={v.paid ? 'PAID' : 'FREE'} type={v.paid ? 'paid' : 'free'} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && q.length > 1 && filteredVideos.length === 0 && (
            <div className="mt-3 text-center text-text-muted py-4">No videos found</div>
          )}

          {!loading && q.length <= 1 && trendingCategories.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Trending:</span>
              {trendingCategories.map(cat => (
                <button key={cat} onClick={() => setQ(cat)} className="px-3 py-1 rounded-full bg-bg-el text-text-secondary text-sm hover:bg-bg-hov transition">
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ----------------------------------------------------------------------
// Mobile Drawer
// ----------------------------------------------------------------------
const MobileDrawer = ({ user, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const go = (to) => { navigate(to); onClose(); };

  return (
    <>
      <div className="fixed inset-0 z-[149] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 bottom-0 w-[280px] z-[150] bg-bg-side border-r border-border flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-4 h-16 border-b border-border flex-shrink-0">
          <span className="font-display font-black text-lg text-text-primary">Menu</span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-hov transition-colors">
            <X size={18} />
          </button>
        </div>

        {user ? (
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              {user.profilePicture?.trim() ? (
                <img
                  src={user.profilePicture.trim()}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-display font-black text-lg text-white flex-shrink-0"
                style={{ display: user.profilePicture?.trim() ? 'none' : 'flex' }}
              >
                {user.username?.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-base text-text-primary truncate" data-no-translate>{user.username}</p>
                <p className="text-sm text-text-muted truncate" data-no-translate>{user.email}</p>
              </div>
            </div>
            <Badge text={`${user.role}`} type="pro" />
          </div>
        ) : (
          <div className="px-4 py-4 border-b border-border">
            <button onClick={() => go('/signin')} className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-[#1d4ed8] transition-colors">
              Sign In
            </button>
          </div>
        )}

        <nav className="px-2 py-3 flex-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => go(to)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium mb-0.5 transition-colors text-left
                ${location.pathname === to ? 'bg-primary/12 text-primary-light font-semibold' : 'text-text-secondary hover:bg-bg-hov hover:text-text-primary'}`}
            >
              <Icon size={18} className="text-text-muted flex-shrink-0" />
              {label}
            </button>
          ))}

          {user && (
            <>
              <div className="h-px bg-border mx-2 my-3" />
              {PROFILE_ITEMS.map(({ icon: Icon, label, to }) => (
                <button
                  key={to}
                  onClick={() => go(to)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium mb-0.5 text-text-secondary hover:bg-bg-hov hover:text-text-primary transition-colors text-left"
                >
                  <Icon size={16} className="text-text-muted flex-shrink-0" />
                  {label}
                </button>
              ))}
              {canAccessStudio(user) && (
                <button
                  onClick={() => go('/creator')}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium mb-0.5 text-text-secondary hover:bg-bg-hov hover:text-text-primary transition-colors text-left"
                >
                  <Video size={16} className="text-text-muted flex-shrink-0" />
                  Creator Studio
                </button>
              )}
            </>
          )}
        </nav>

        <div className="px-3 py-3 border-t border-border flex-shrink-0">
          <LanguageSwitcher variant="dropdown" />
        </div>

        {user && (
          <div className="px-2 py-3 border-t border-border flex-shrink-0">
            <button
              onClick={async () => { await logout(); navigate('/'); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-danger hover:bg-danger/8 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ----------------------------------------------------------------------
// Main Navbar Component
// ----------------------------------------------------------------------
const Navbar = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [realUser, setRealUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch current user from API if token exists – plus listen for profile updates
  useEffect(() => {
    const fetchRealUser = async () => {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        setRealUser(null);
        setLoadingUser(false);
        return;
      }
      try {
        const response = await api.get('/users/me');
        setRealUser(response.data);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
        setRealUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchRealUser();

    // 👇 Listen for profile updates (avatar, banner, etc.)
    const handleProfileUpdate = () => {
      fetchRealUser();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [authUser]);

  const displayUser = realUser || authUser;
  const profileImageSrc = displayUser?.profilePicture?.trim();

  const handleProfileImageError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback && fallback.classList.contains('avatar-fallback')) {
      fallback.style.display = 'flex';
    }
  };

  // Notification functions
  const fetchUnreadCount = async () => {
    if (!displayUser) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!displayUser) return;
    try {
      const res = await api.get('/notifications', { params: { page: 0, size: 20 } });
      setNotifications(res.data.content);
      await fetchUnreadCount();
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!displayUser) return;
    try {
      await api.put('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const refreshUnreadCount = async () => {
    await fetchUnreadCount();
  };

  useEffect(() => {
    if (!displayUser) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [displayUser]);

  useEffect(() => {
    if (notifOpen && displayUser) {
      fetchNotifications();
    }
  }, [notifOpen, displayUser]);

  useEffect(() => {
    const handleClick = e => {
      if (!e.target.closest('[data-dd]')) {
        setNotifOpen(false);
        setProfOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loadingUser) {
    return <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-[#080D18] border-b border-border" />;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-[#080D18] border-b border-border">
        {/* Mobile layout */}
        <div className="flex md:hidden items-center h-full px-4 relative">
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-bg-el transition-colors">
            <Menu size={22} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoUrl} alt="" className="h-7 w-auto" />
              <span className="font-display font-black text-lg text-text-primary tracking-tight" data-no-translate>ViriShare</span>
            </Link>
          </div>
          <div className="ml-auto flex gap-1">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-bg-el transition-colors">
              <Search size={20} />
            </button>
            {displayUser && (
              <div className="relative" data-dd>
                <button
                  onClick={() => { setNotifOpen(p => !p); setProfOpen(false); }}
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-bg-el transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-bg-base" />
                  )}
                </button>
                {notifOpen && (
                  <NotifPanel
                    onClose={() => setNotifOpen(false)}
                    notifications={notifications}
                    onMarkAllRead={markAllAsRead}
                    unreadCount={unreadCount}
                    onNotificationClick={refreshUnreadCount}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex items-center h-full">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 w-full flex items-center justify-between gap-5">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <img src={logoUrl} alt="ViriShare logo" className="h-8 w-auto" />
              <span className="font-display font-black text-xl text-text-primary tracking-tight group-hover:text-primary-light transition-colors" data-no-translate>
                ViriShare
              </span>
            </Link>

            <nav className="flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-5 py-2.5 rounded-xl text-base font-semibold transition-all whitespace-nowrap
                    ${location.pathname === to ? 'text-text-primary bg-bg-el' : 'text-text-secondary hover:text-text-primary hover:bg-bg-el/50'}`}
                >
                  {label}
                  {location.pathname === to && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className="w-10 h-10 rounded-xl border border-border bg-bg-el text-text-secondary hover:bg-bg-hov hover:text-text-primary flex items-center justify-center transition-all">
                <Search size={17} />
              </button>

              {displayUser ? (
                <>
                  <div className="relative" data-dd>
                    <button
                      onClick={() => { setNotifOpen(p => !p); setProfOpen(false); }}
                      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                      className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all
                        ${notifOpen ? 'border-primary bg-primary/12 text-primary-light' : 'border-border bg-bg-el text-text-secondary hover:bg-bg-hov hover:text-text-primary'}`}
                    >
                      <Bell size={17} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-bg-base" />
                      )}
                    </button>
                    {notifOpen && (
                      <NotifPanel
                        onClose={() => setNotifOpen(false)}
                        notifications={notifications}
                        onMarkAllRead={markAllAsRead}
                        unreadCount={unreadCount}
                        onNotificationClick={refreshUnreadCount}
                      />
                    )}
                  </div>

                  {canAccessStudio(displayUser) && (
                    <Link to="/creator" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-primary-light text-sm font-semibold hover:bg-primary/15 hover:border-primary/55 transition-all">
                      <Video size={15} /> Studio
                    </Link>
                  )}

                  <div className="relative" data-dd>
                    <button
                      onClick={() => { setProfOpen(p => !p); setNotifOpen(false); }}
                      className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-xl border border-border bg-bg-el hover:bg-bg-hov transition-all"
                    >
                      {profileImageSrc && (
                        <img
                          src={profileImageSrc}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onError={handleProfileImageError}
                        />
                      )}
                      <div
                        className="avatar-fallback w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-black text-sm text-white flex-shrink-0"
                        style={{ display: profileImageSrc ? 'none' : 'flex' }}
                      >
                        {displayUser.username?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-base font-semibold text-text-primary max-w-[90px] truncate">{displayUser.username?.split(' ')[0]}</span>
                      <ChevronDown size={13} className={`text-text-muted transition-transform ${profOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profOpen && (
                      <div className="absolute top-[calc(100%+10px)] right-0 w-60 bg-bg-card border border-border rounded-2xl z-[149] shadow-[0_8px_40px_rgba(0,0,0,.6)] overflow-visible">
                        <div className="px-4 py-4 border-b border-border">
                          <div className="flex items-center gap-3 mb-2.5">
                            {profileImageSrc && (
                              <img
                                src={profileImageSrc}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover"
                                onError={handleProfileImageError}
                              />
                            )}
                            <div
                              className="avatar-fallback w-10 h-10 rounded-full bg-primary flex items-center justify-center font-display font-black text-sm text-white"
                              style={{ display: profileImageSrc ? 'none' : 'flex' }}
                            >
                              {displayUser.username?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-base text-text-primary leading-tight" data-no-translate>{displayUser.username}</p>
                              <p className="text-xs text-text-muted mt-0.5" data-no-translate>{displayUser.email}</p>
                            </div>
                          </div>
                          <Badge text={`${displayUser.role}`} type="pro" />
                        </div>

                        <div className="py-1.5 px-1.5">
                          {PROFILE_ITEMS.map(({ icon: Icon, label, to }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setProfOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary text-base hover:bg-bg-hov hover:text-text-primary transition-colors"
                            >
                              <Icon size={14} className="text-text-muted flex-shrink-0" /> {label}
                            </Link>
                          ))}
                          <div className="mt-1">
                            <LanguageSwitcher variant="dropdown" />
                          </div>
                        </div>

                        <div className="border-t border-border py-1.5 px-1.5">
                          <button
                            onClick={async () => { await logout(); navigate('/'); setProfOpen(false); }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-danger text-base font-semibold hover:bg-danger/8 transition-colors text-left"
                          >
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <LanguageSwitcher variant="icon" />
                  <Link
                    to="/signin"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-base font-bold hover:bg-[#1d4ed8] transition-all shadow-[0_2px_8px_rgba(37,99,235,.35)]"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {drawerOpen && <MobileDrawer user={displayUser} onClose={() => setDrawerOpen(false)} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
};

export default Navbar;