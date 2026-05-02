// src/creator/layout/CreatorSidebar.js
import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Tv,
  BarChart3,
  Video,
  Upload,
  Scissors,
  DollarSign,
  VideoIcon,
  Clapperboard,
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'channel', label: 'My Channel', icon: Tv },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'videos', label: 'My Videos', icon: Video },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'editors', label: 'Editors', icon: Scissors },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
];

const CreatorSidebar = ({ active, onSelect, className = '' }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Creator Studio navigation"
      className={`bg-bg-side border-r border-border flex-shrink-0 transition-all duration-200 ${className || 'flex flex-col'}`}
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
            <span aria-hidden><Clapperboard /></span>
            <span className="text-md font-bold truncate tracking-tight text-primary-light">
              Creator Studio
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
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`sbi w-full text-left ${isActive ? 'active' : ''} ${
                collapsed ? 'justify-center !px-2' : ''
              }`}
            >
              <IconComponent
                size={20}
                className="flex-shrink-0"
                color={isActive ? '#60A5FA' : undefined}
                strokeWidth={1.8}
              />
              {!collapsed && (
                <span
                  className={`flex-1 truncate text-lg font-medium ${
                    isActive ? 'text-primary-light font-semibold' : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute right-0 top-2 bottom-2 w-0.5 rounded-l-full bg-primary-light"
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

export default CreatorSidebar;