import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import Badge from './ui/Badge';
import UserDataModal from './UserDataModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Pagination from './Pagination';
import { userApi } from '../api/userApi';
import { videoApi } from '../api/videoApi';
import { User, UserCheck, UserPlus, FilePlus, Eye, CircleDollarSign, Search } from 'lucide-react';

const PAGE_SIZE = 10;

const UserTable = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [videoCounts, setVideoCounts] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);

  const snackbarOptions = {
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    autoHideDuration: 3000,
  };

  // Debounce search
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
  }, [filter, debouncedSearch]);

  // Fetch current user role & id
  useEffect(() => {
    const role = sessionStorage.getItem('user_role');
    setCurrentUserRole(role || 'VIEWER');
    const fetchCurrentUser = async () => {
      try {
        const me = await userApi.getCurrentUser();
        setCurrentUserId(me.id);
      } catch (err) {
        console.error('Failed to get current user', err);
        enqueueSnackbar('Could not fetch current user info', { variant: 'error', ...snackbarOptions });
      }
    };
    fetchCurrentUser();
  }, [enqueueSnackbar]);

  // Fetch all users
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getAllUsers();
      setAllUsers(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      enqueueSnackbar('Failed to load users. Please refresh the page.', { variant: 'error', ...snackbarOptions });
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fetch video counts
  const fetchVideoCounts = useCallback(async () => {
    try {
      const response = await videoApi.getAllVideos(null, '', 0, 10000, null);
      const videos = response.content || [];
      const counts = {};
      videos.forEach(v => {
        const creatorId = v.creatorId || v.userId;
        if (creatorId) {
          counts[creatorId] = (counts[creatorId] || 0) + 1;
        }
      });
      setVideoCounts(counts);
    } catch (err) {
      console.error('Failed to fetch video counts', err);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
    fetchVideoCounts();
  }, [fetchAllUsers, fetchVideoCounts]);

  // Apply search and filter client‑side
  useEffect(() => {
    if (!allUsers.length) {
      setFilteredUsers([]);
      setTotalPages(1);
      setTotalElements(0);
      return;
    }

    let result = [...allUsers];

    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        u =>
          (u.username?.toLowerCase().includes(term)) ||
          (u.fullName?.toLowerCase().includes(term)) ||
          (u.email?.toLowerCase().includes(term))
      );
    }

    if (filter !== 'All') {
      if (filter === 'CREATOR' || filter === 'VIEWER') {
        result = result.filter(u => u.role === filter);
      } else if (filter === 'Blocked') {
        result = result.filter(u => u.status === 'BLOCKED');
      } else if (filter === 'Suspended') {
        result = result.filter(u => u.status === 'SUSPENDED');
      }
    }

    setFilteredUsers(result);
    setTotalElements(result.length);
    setTotalPages(Math.max(1, Math.ceil(result.length / PAGE_SIZE)));
  }, [allUsers, debouncedSearch, filter]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
      enqueueSnackbar('User deleted successfully', { variant: 'success', ...snackbarOptions });
      await fetchAllUsers();
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete failed', err);
      const msg = err.response?.data?.message || err.message;
      enqueueSnackbar(`Delete failed: ${msg}`, { variant: 'error', ...snackbarOptions });
    }
  };

  const handleUserUpdated = () => {
    fetchAllUsers();
  };

  // Helper: role icon & color
  const getRoleMeta = (role) => {
    switch (role) {
      case 'ADMIN':
        return { icon: UserCheck, color: 'text-red-500' };
      case 'CREATOR':
        return { icon: UserPlus, color: 'text-blue-500' };
      default:
        return { icon: User, color: 'text-gray-400' };
    }
  };

  // Helper: plan icon & color
  const getPlanMeta = (plan) => {
    switch (plan) {
      case 'CREATE':
        return { icon: FilePlus, color: 'text-green-500' };
      case 'VIEW':
        return { icon: Eye, color: 'text-indigo-400' };
      default:
        return { icon: CircleDollarSign, color: 'text-gray-400' };
    }
  };

  if (loading && allUsers.length === 0) {
    return <div className="text-center py-10 text-text-secondary">Loading users...</div>;
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg-el text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            {paginatedUsers.map(u => {
              const displayName = u.fullName || u.username;
              const avatarUrl = u.profilePicture;
              const isBlockedOrSuspended = u.status === 'BLOCKED' || u.status === 'SUSPENDED';
              const videoCount = videoCounts[u.id] || 0;
              const RoleIcon = getRoleMeta(u.role).icon;
              const PlanIcon = getPlanMeta(u.plan).icon;

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
                          {displayName?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-text-primary leading-tight">{displayName}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <RoleIcon size={16} className={getRoleMeta(u.role).color} />
                      <span className={`font-semibold ${getRoleMeta(u.role).color}`}>
                        {u.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <PlanIcon size={16} className={getPlanMeta(u.plan).color} />
                      <span className={`font-semibold ${getPlanMeta(u.plan).color}`}>
                        {u.plan}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary tabular-nums">{videoCount}</span>
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{u.joined || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge text={u.status} type={u.status.toLowerCase()} small />
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
            {filteredUsers.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  No users match your search.
                </td>
              </tr>
            )}
            {loading && allUsers.length === 0 && (
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
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, totalElements)} of {totalElements} users
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