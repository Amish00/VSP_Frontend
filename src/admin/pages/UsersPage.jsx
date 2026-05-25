import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import UserTable from '../components/UserTable';
import StatCard from '../components/ui/StatCard';
import { Users, UserCheck, UserPlus, UserX } from 'lucide-react';
import { userApi } from '../api/userApi';

const UsersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCreators, setTotalCreators] = useState(0);
  const [totalViewers, setTotalViewers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

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
          autoHideDuration: 5000,
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

      {/* Stat Cards Row */}
      {!loadingStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Users size={24} />}
            label="Total Users"
            value={totalUsers.toLocaleString()}
          />
          <StatCard
            icon={<UserPlus size={24} />}
            label="Creators"
            value={totalCreators.toLocaleString()}
          />
          <StatCard
            icon={<Users size={24} />}
            label="Viewers"
            value={totalViewers.toLocaleString()}
          />
          <StatCard
            icon={<UserCheck size={24} />}
            label="Active Users"
            value={activeUsers.toLocaleString()}
          />
        </div>
      )}

      <UserTable search={search} setSearch={setSearch} />
    </div>
  );
};

export default UsersPage;