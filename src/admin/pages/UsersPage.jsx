import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import UserTable from '../components/UserTable';
import StatCard from '../components/ui/StatCard';
import { Users, UserCheck, UserPlus, UserX, User2 } from 'lucide-react';
import { userApi } from '../api/userApi';

const UsersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCreators, setTotalCreators] = useState(0);
  const [totalViewers, setTotalViewers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const snackbarOptions = {
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    autoHideDuration: 3000,
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allUsers = await userApi.getAllUsers();
        const creators = allUsers.filter(u => u.role === 'CREATOR').length;
        const viewers = allUsers.filter(u => u.role === 'VIEWER').length;
        const active = allUsers.filter(u => u.status === 'ACTIVE').length;
        setTotalUsers(allUsers.length);
        setTotalCreators(creators);
        setTotalViewers(viewers);
        setActiveUsers(active);
      } catch (err) {
        console.error('Failed to fetch user stats', err);
        enqueueSnackbar('Failed to load user statistics. Please refresh the page.', {
          variant: 'error',
          ...snackbarOptions,
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [enqueueSnackbar]);

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          User Management
        </h1>
      </div>

      {!loadingStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Users size={24} color="#60A5FA" />} label="Total Users" value={totalUsers.toLocaleString()} color="#60A5FA" />
          <StatCard icon={<UserPlus size={24} color="#10B981" />} label="Creators" value={totalCreators.toLocaleString()} color="#10B981" />
          <StatCard icon={<User2 size={24} color="#F59E0B" />} label="Viewers" value={totalViewers.toLocaleString()} color="#F59E0B" />
          <StatCard icon={<UserCheck size={24} color="#8B5CF6" />} label="Active Users" value={activeUsers.toLocaleString()} color="#8B5CF6" />
        </div>
      )}

      <UserTable search={search} setSearch={setSearch} />
    </div>
  );
};

export default UsersPage;