import axios from 'axios';
import { getSessionId } from '../components/utils/session';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const publicPaths = ['/auth/', '/payment/callback/', '/youtube/'];

const isPublicRequest = (url = '') => publicPaths.some(path => url.includes(path));

api.interceptors.request.use((config) => {
  const isPublic = isPublicRequest(config.url);
  
  if (!isPublic) {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  const sessionId = getSessionId();
  config.headers['X-Session-ID'] = sessionId;
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isRefreshRequest = requestUrl.includes('/auth/refreshtoken');
    const shouldTryRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isRefreshRequest &&
      !isPublicRequest(requestUrl);

    if (!shouldTryRefresh) {
      return Promise.reject(error);
    }

    const refreshToken = sessionStorage.getItem('refresh_token');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post('/api/auth/refreshtoken', { refreshToken });
      const { accessToken, refreshToken: nextRefreshToken } = refreshResponse.data || {};

      if (!accessToken) {
        throw new Error('Refresh token response missing access token');
      }

      sessionStorage.setItem('access_token', accessToken);
      if (nextRefreshToken) {
        sessionStorage.setItem('refresh_token', nextRefreshToken);
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('user_role');
      return Promise.reject(refreshError);
    }
  }
);

export default api;

// ---------- History API ----------
export const getHistory = (page = 0, size = 20) => {
  return api.get('/history', { params: { page, size } });
};

export const clearHistory = () => {
  return api.delete('/history');
};

export const recordWatch = (videoId) => {
  return api.post(`/history/${videoId}`);
};


// ---------- User API ----------
export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const upgradeToFreePlan = async () => {
  const response = await api.post('/payment/upgrade-free');
  return response.data;
};

export const canWatchPaidVideo = (user) => {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'CREATOR') return true;
  return user.plan && user.plan !== 'FREE';
};

// ---------- Notification API ----------
export const getNotifications = (page = 0, size = 20) => 
  api.get('/notifications', { params: { page, size } });

export const markAllNotificationsAsRead = () => 
  api.put('/notifications/mark-read');

export const getUnreadNotificationCount = () => 
  api.get('/notifications/unread-count');

export const markNotificationAsRead = (notificationId) => 
  api.put(`/notifications/${notificationId}/read`);