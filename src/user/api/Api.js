import axios from 'axios';
import { getSessionId } from '../components/utils/session';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const publicPaths = ['/auth/', '/payment/callback/', '/youtube/'];

api.interceptors.request.use((config) => {
  const isPublic = publicPaths.some(path => config.url.includes(path));
  
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

export default api;

// ---------- History API ----------
export const getHistory = (page = 0, size = 20) => {
  return api.get('/history', { params: { page, size } });
};

export const clearHistory = () => {
  return api.delete('/history');
};

// ---------- Video API ----------
export const recordWatch = (videoId) => {
  return api.post(`/videos/${videoId}/watch`);
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