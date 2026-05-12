import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Video,
  Users,
  DollarSign,
  FileText,
  Settings,
  FileSliders,
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'videos', label: 'Video Management', icon: Video, path: '/admin/videos' },
  { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, path: '/admin/revenue' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminSidebar = ({ active, onSelect, className = '' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveFromPath = () => {
    if (!currentPath.startsWith('/admin')) return null;

    if (currentPath === '/admin') return 'dashboard';
    if (currentPath.startsWith('/admin/videos')) return 'videos';
    if (currentPath.startsWith('/admin/users')) return 'users';
    if (currentPath.startsWith('/admin/revenue')) return 'revenue';
    if (currentPath.startsWith('/admin/reports')) return 'reports';
    if (currentPath.startsWith('/admin/settings')) return 'settings';

    return null;
  };

  const activeId = currentPath.startsWith('/admin')
    ? (active !== undefined ? active : getActiveFromPath())
    : null;

  const handleItemClick = (item) => {
    if (onSelect) {
      onSelect(item.id);
    }
  };

  return (
    <aside
      aria-label="Admin navigation"
      className={`bg-bg-side border-r border-border flex-shrink-0 transition-all duration-200 ${
        className || 'flex flex-col'
      }`}
      style={{
        width: collapsed ? 60 : 224,
        boxShadow: '1px 0 0 rgba(255,255,255,.02),2px 0 12px rgba(0,0,0,.2)',
      }}
    >
      <div
        className="flex items-center border-b border-border px-3 py-3 min-h-[52px] gap-2"
        style={{ justifyContent: collapsed ? 'center' : 'space-between' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden flex-1">
            <span aria-hidden><FileSliders /></span>
            <span className="text-md font-bold truncate tracking-tight text-danger">
              Admin Portal
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted bg-bg-el border border-border hover:bg-bg-hov hover:text-text-primary transition-all flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              aria-current={isActive ? 'page' : undefined}
              className={`sbi w-full text-left ${isActive ? 'active' : ''} ${
                collapsed ? 'justify-center !px-2' : ''
              }`}
            >
              <IconComponent
                size={20}
                className="flex-shrink-0"
                color={isActive ? '#EF4444' : undefined}
                strokeWidth={1.8}
              />
              {!collapsed && (
                <span
                  className={`flex-1 truncate text-lg font-medium ${
                    isActive ? 'text-danger font-semibold' : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute right-0 top-2 bottom-2 w-0.5 rounded-l-full bg-danger"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;