import React, { useState, useEffect } from 'react';
import UserDataModal from './UserDataModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { userApi } from '../api/userApi';

const PLAN_COLORS = {
  CREATE: { color: '#2563EB', bg: 'rgba(37,99,235,.1)' },      // strong blue
  VIEW:   { color: '#059669', bg: 'rgba(5,150,105,.1)' },       // green
  FREE:   { color: '#4B5563', bg: 'rgba(75,85,99,.1)' },        // gray
};

const ROLE_COLORS = {
  ADMIN:   { color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },     // purple
  CREATOR: { color: '#2563EB', bg: 'rgba(37,99,235,.1)' },      // blue
  VIEWER:  { color: '#6B7280', bg: 'rgba(107,114,128,.1)' },    // gray
};

const STATUS_STYLES = {
  ACTIVE:    'bg-green-500/10 text-green-600',
  BLOCKED:   'bg-red-500/10 text-red-600',
  SUSPENDED: 'bg-yellow-500/10 text-yellow-600',
};

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);  // NEW

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setCurrentUserRole(role || 'VIEWER');
    // Fetch current user ID
    const fetchCurrentUser = async () => {
      try {
        const me = await userApi.getCurrentUser();
        setCurrentUserId(me.id);
      } catch (err) {
        console.error('Failed to get current user', err);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await userApi.deleteUser(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.fullName || u.username).toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' ||
                        u.role === filter ||
                        (filter === 'Blocked' && u.status === 'BLOCKED') ||
                        (filter === 'Suspended' && u.status === 'SUSPENDED');
    return matchSearch && matchFilter;
  });

  if (loading) {
    return <div className="text-center py-10 text-text-secondary">Loading users...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name or email…"
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-border bg-bg-el text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
          {['All', 'CREATOR', 'VIEWER', 'Blocked', 'Suspended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'CREATOR' ? 'Creators' : f === 'VIEWER' ? 'Viewers' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 720 }}>
          <thead>
            <tr className="border-b border-border bg-bg-el">
              {['User', 'Role', 'Plan', 'Videos', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const planMeta = PLAN_COLORS[u.plan] || PLAN_COLORS.FREE;
              const roleMeta = ROLE_COLORS[u.role] || ROLE_COLORS.VIEWER;
              const displayName = u.fullName || u.username;
              const avatarUrl = u.profilePicture;
              const statusClass = STATUS_STYLES[u.status] || STATUS_STYLES.ACTIVE;
              const isBlockedOrSuspended = u.status === 'BLOCKED' || u.status === 'SUSPENDED';
              return (
                <tr key={u.id} className={`border-b border-border/50 last:border-0 hover:bg-bg-hov/30 transition-colors ${isBlockedOrSuspended ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold font-display flex-shrink-0">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-text-primary leading-tight">{displayName}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: roleMeta.bg, color: roleMeta.color }}>
                      {u.role}
                    </span>
                   </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: planMeta.bg, color: planMeta.color }}>
                      {u.plan}
                    </span>
                   </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-text-secondary tabular-nums">{u.videos}</span>
                      {u.videos > 0 && (
                        <div className="w-12 h-1 bg-bg-el rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((u.videos / 30) * 100, 100)}%` }} />
                        </div>
                      )}
                    </div>
                   </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{u.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusClass}`}>
                      {u.status}
                    </span>
                   </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-danger/10 text-danger hover:bg-danger/20 transition"
                      >
                        Delete
                      </button>
                    </div>
                   </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">No users match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}   // ← added
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        userName={userToDelete?.fullName || userToDelete?.username}
      />
    </div>
  );
};

export default UserTable;