import React, { useState, useEffect } from 'react';
import Badge from './ui/Badge';               // reuse the same component
import UserDataModal from './UserDataModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { userApi } from '../api/userApi';

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
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setCurrentUserRole(role || 'VIEWER');
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
    const matchSearch =
      (u.fullName || u.username).toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      u.role === filter ||
      (filter === 'Blocked' && u.status === 'BLOCKED') ||
      (filter === 'Suspended' && u.status === 'SUSPENDED');
    return matchSearch && matchFilter;
  });

  if (loading) {
    return <div className="text-center py-10 text-text-secondary">Loading users...</div>;
  }

  // Helper to map role to badge type
  const getRoleBadgeType = (role) => {
    switch (role) {
      case 'ADMIN': return 'admin';
      case 'CREATOR': return 'creator';
      default: return 'viewer';
    }
  };

  // Helper to map plan to badge type
  const getPlanBadgeType = (plan) => {
    switch (plan) {
      case 'CREATE': return 'create_plan';
      case 'VIEW': return 'view_plan';
      default: return 'free_plan';
    }
  };

  // Helper to map status to badge type
  const getStatusBadgeType = (status) => {
    switch (status) {
      case 'ACTIVE': return 'active';
      case 'BLOCKED': return 'blocked';
      case 'SUSPENDED': return 'suspended';
      default: return 'draft';
    }
  };

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
              const displayName = u.fullName || u.username;
              const avatarUrl = u.profilePicture;
              const isBlockedOrSuspended = u.status === 'BLOCKED' || u.status === 'SUSPENDED';
              return (
                <tr
                  key={u.id}
                  className={`border-b border-border/50 last:border-0 hover:bg-bg-hov/30 transition-colors ${
                    isBlockedOrSuspended ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
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
                    <Badge text={u.role} type={getRoleBadgeType(u.role)} small />
                  </td>
                  <td className="px-4 py-3">
                    <Badge text={u.plan} type={getPlanBadgeType(u.plan)} small />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-text-secondary tabular-nums">{u.videos}</span>
                      {u.videos > 0 && (
                        <div className="w-12 h-1 bg-bg-el rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min((u.videos / 30) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{u.joined}</td>
                  <td className="px-4 py-3">
                    <Badge text={u.status} type={getStatusBadgeType(u.status)} small />
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
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  No users match your search.
                </td>
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
        currentUserId={currentUserId}
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