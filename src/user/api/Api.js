// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
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
