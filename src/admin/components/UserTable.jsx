import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import Badge from './ui/Badge';
import UserDataModal from './UserDataModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Pagination from './Pagination';
import { userApi } from '../api/userApi';

const PAGE_SIZE = 10;

const UserTable = () => {
  const { enqueueSnackbar } = useSnackbar();
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Fetch current user role and id
  useEffect(() => {
    const role = sessionStorage.getItem('user_role');
    setCurrentUserRole(role || 'VIEWER');
    const fetchCurrentUser = async () => {
      try {
        const me = await userApi.getCurrentUser();
        setCurrentUserId(me.id);
      } catch (err) {
        console.error('Failed to get current user', err);
        enqueueSnackbar('Could not fetch current user info', { variant: 'error' });
      }
    };
    fetchCurrentUser();
  }, [enqueueSnackbar]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getAllUsers(
        filter === 'All' ? null : filter,
        debouncedSearch,
        currentPage - 1,
        PAGE_SIZE
      );

      if (Array.isArray(data)) {
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageUsers = data.slice(start, start + PAGE_SIZE);
        setUsers(pageUsers);
        setTotalElements(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / PAGE_SIZE)));
      } else {
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || data.content?.length || 0);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      enqueueSnackbar('Failed to load users. Please try again.', { variant: 'error' });
      setUsers([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch, currentPage, enqueueSnackbar]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      await fetchUsers(); // refresh current page
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete failed', err);
      const msg = err.response?.data?.message || err.message;
      enqueueSnackbar(`Delete failed: ${msg}`, { variant: 'error' });
    }
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  // Helper to map role to badge type
  const getRoleBadgeType = (role) => {
    switch (role) {
      case 'ADMIN': return 'admin';
      case 'CREATOR': return 'creator';
      default: return 'viewer';
    }
  };

  const getPlanBadgeType = (plan) => {
    switch (plan) {
      case 'CREATE': return 'create_plan';
      case 'VIEW': return 'view_plan';
      default: return 'free_plan';
    }
  };

  const getStatusBadgeType = (status) => {
    switch (status) {
      case 'ACTIVE': return 'active';
      case 'BLOCKED': return 'blocked';
      case 'SUSPENDED': return 'suspended';
      default: return 'draft';
    }
  };

  if (loading && users.length === 0) {
    return <div className="text-center py-10 text-text-secondary">Loading users...</div>;
  }

  return (
    <div>
      {/* Filters row */}
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

      {/* User Table */}
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
            {users.map(u => {
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
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  No users match your search.
                </td>
              </tr>
            )}
            {loading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-text-muted">
            Showing {(currentPage-1)*PAGE_SIZE+1} to {Math.min(currentPage*PAGE_SIZE, totalElements)} of {totalElements} users
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            siblingCount={1}
          />
        </div>
      )}

      {/* Modals */}
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