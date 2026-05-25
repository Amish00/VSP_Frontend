import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Video,
  Upload,
  Scissors,
  DollarSign,
} from 'lucide-react';
import logoUrl from '../../assets/logo.svg';
import Badge from '../components/ui/Badge';
import api from '../../user/api/Api';
import { useNavigate, useLocation } from 'react-router-dom';
import LanguageSwitcher from '../../user/components/LanguageSwitcher';

// Map notification type to an icon (emoji)
const getNotificationIcon = (type) => {
  const icons = {
    VIDEO_APPROVED: '✅',
    VIDEO_REJECTED: '❌',
    NEW_VIDEO_UPLOAD: '📹',
    PAYOUT_REQUEST: '💰',
    MONTHLY_EARNINGS: '📊',
    MONTHLY_REVENUE_REPORT: '📈',
    SUBSCRIPTION: '👥',
    COMMENT: '💬',
    LIKE: '❤️',
  };
  return icons[type] || '🔔';
};

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/creator/dashboard' },
  { id: 'profile', label: 'My Profile', icon: User, path: '/creator/profile' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/creator/analytics' },
  { id: 'videos', label: 'My Videos', icon: Video, path: '/creator/videos' },
  { id: 'upload', label: 'Upload', icon: Upload, path: '/creator/upload' },
  { id: 'editors', label: 'Editors', icon: Scissors, path: '/creator/editors' },
  { id: 'earnings', label: 'Earnings', icon: DollarSign, path: '/creator/earnings' },
];

const CreatorNav = ({ onLogout, onGoHome, onNavSelect, activeNav }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profOpen, setProfOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Real notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // Determine active nav based on current path
  const getActiveNavFromPath = () => {
    const currentPath = location.pathname;
    const navItem = NAV.find(item => currentPath.startsWith(item.path));
    return navItem ? navItem.id : 'dashboard';
  };
  const currentActiveNav = activeNav || getActiveNavFromPath();

  // Fetch real user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Notification API calls
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setNotifLoading(true);
    try {
      const res = await api.get('/notifications', { params: { page: 0, size: 20 } });
      setNotifications(res.data.content);
      // also refresh unread count
      await fetchUnreadCount();
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await api.put('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Poll unread count every 30 seconds when user is logged in
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Load notifications when panel opens
  useEffect(() => {
    if (notifOpen && user) {
      fetchNotifications();
    }
  }, [notifOpen, user]);

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    if (onLogout) onLogout();
    navigate('/');
  };

  const handleNavClick = (item) => {
    if (item.id === 'profile') {
      navigate('/creator/profile');
    } else {
      if (onNavSelect) {
        onNavSelect(item.id);
      } else {
        navigate(item.path);
      }
    }
    setDrawerOpen(false);
    setProfOpen(false);
  };

  if (loading) {
    return (
      <header className="h-[68px] bg-bg-side border-b border-border flex items-center px-4 sm:px-5 gap-3 flex-shrink-0 z-50 relative">
        <div className="animate-pulse w-8 h-8 rounded-full bg-bg-el" />
      </header>
    );
  }

  if (!user) return null;

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
          onClick={() => navigate('/creator')}
          aria-label="ViriShare home"
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <img src={logoUrl} alt="ViriShare" style={{ height: 26, width: 'auto' }} />
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

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(p => !p);
              setProfOpen(false);
            }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              notifOpen
                ? 'border-primary bg-primary/12 text-primary-light'
                : 'border-border bg-bg-el text-text-secondary hover:bg-bg-hov hover:text-text-primary'
            }`}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-bg-side" />
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-[148]" onClick={() => setNotifOpen(false)} />
              <div className="absolute top-[calc(100%+10px)] right-0 w-80 bg-bg-card border border-border rounded-2xl z-[149] shadow-drop overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-text-primary">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-danger text-white text-xs font-bold">{unreadCount}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-hov"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-86 overflow-y-auto">
                  {notifLoading ? (
                    <div className="px-4 py-8 text-center text-text-muted">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-text-muted text-sm">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3.5 hover:bg-bg-hov border-b border-border/50 last:border-0 ${
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
                      onClick={markAllAsRead}
                      className="text-sm text-primary-light font-semibold hover:opacity-80"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Profile dropdown (unchanged except using real user data) */}
        <div className="relative">
          <button
            onClick={() => {
              setProfOpen(p => !p);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-border bg-bg-el hover:bg-bg-hov transition-all"
          >
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold font-display">
                {user.username?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-text-primary max-w-[80px] truncate hidden sm:block">
              {user.username?.split(' ')[0] || 'User'}
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
                className="absolute top-[calc(100%+8px)] right-0 w-52 bg-bg-card border border-border rounded-2xl z-[149] shadow-drop overflow-visible"
              >
                <div className="px-4 py-3.5 border-b border-border">
                  <div className="flex items-center gap-2.5 mb-2">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold font-display">
                        {user.username?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{user.username}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </div>
                  <Badge text={`${user.role}`} type="pro" />
                </div>
                <div className="py-1.5 px-1.5">
                  <button
                    role="menuitem"
                    onClick={() => {
                      navigate('/creator/profile');
                      setProfOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-text-secondary text-sm hover:bg-bg-hov transition-colors"
                  >
                    <User size={13} className="text-text-muted" />
                    My Profile
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => setProfOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-text-secondary text-sm hover:bg-bg-hov transition-colors"
                  >
                    <Settings size={13} className="text-text-muted" />
                    Settings
                  </button>
                  <div className="mt-1">
                    <LanguageSwitcher variant="dropdown" />
                  </div>
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
                    onClick={handleLogout}
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

      {/* Mobile drawer (unchanged except using real user) */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-[149] bg-black/60 md:hidden" onClick={() => setDrawerOpen(false)} />
          <div
            className="fixed top-0 left-0 bottom-0 w-[220px] z-[150] bg-bg-side border-r border-border flex flex-col md:hidden"
            style={{ boxShadow: '4px 0 24px rgba(0,0,0,.5)' }}
          >
            <div className="h-[60px] flex items-center px-4 gap-2.5 border-b border-border">
              <img src={logoUrl} alt="ViriShare" style={{ height: 22, width: 'auto' }} />
              <span className="font-display font-black text-base text-text-primary">ViriShare</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-hov"
              >
                <X size={14} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {NAV.map(item => {
                const IconComponent = item.icon;
                const isActive = currentActiveNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors text-left"
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