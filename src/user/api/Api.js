
  import axios from 'axios';

  const API_BASE_URL = 'http://localhost:8080/api';

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Attach JWT token if available
  api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  export default api;

  // ---------- History API ----------
  export const getHistory = (page = 0, size = 20) => {
    return api.get('/history', { params: { page, size } });
  };

  export const clearHistory = () => {
    return api.delete('/history');
  };

  export const getCurrentUser = async () => {
      const response = await api.get('/users/me');
      return response.data;
  };

  export const upgradeToFreePlan = async () => {
      const response = await api.post('/payment/upgrade-free');
      return response.data;
  };

export const canWatchPaidVideo = (user) => {
  if (!user) return false; // not logged in
  if (user.role === 'ADMIN' || user.role === 'CREATOR') return true;
  return user.plan && user.plan !== 'FREE';
};

export const getNotifications = (page = 0, size = 20) => 
    api.get('/notifications', { params: { page, size } });

export const markAllNotificationsAsRead = () => 
    api.put('/notifications/mark-read');

export const getUnreadNotificationCount = () => 
    api.get('/notifications/unread-count');

