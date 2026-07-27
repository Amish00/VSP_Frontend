import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

// Request interceptor – attach access token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 & refresh token
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthFlowRequest =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/signup') ||
      url.includes('/api/auth/forgot-password') ||
      url.includes('/api/auth/verify-otp') ||
      url.includes('/api/auth/reset-password');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !url.includes('/auth/refreshtoken') &&
      !isAuthFlowRequest
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { accessToken, refreshToken: newRefreshToken } = await authApi.refreshToken(refreshToken);
        sessionStorage.setItem('access_token', accessToken);
        sessionStorage.setItem('refresh_token', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('user_role');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// API methods
export const authApi = {
  // Core auth
  signUp: (username, email, password) =>
    api.post('/api/auth/signup', { username, email, password }),

  signIn: (email, password) =>
    api.post('/api/auth/login', { email, password }),

  refreshToken: (refreshToken) =>
    api.post('/api/auth/refreshtoken', { refreshToken }),

  logout: () => api.post('/api/auth/logout'),

  // Password reset
  forgotPassword: (email) =>
    api.post('/api/auth/forgot-password', { email }),

  verifyOtp: (email, otp) =>
    api.post('/api/auth/verify-otp', { email, otp }),

  resetPassword: (email, otp, newPassword) =>
    api.post('/api/auth/reset-password', { email, otp, newPassword }),

  // OAuth (placeholders – implement when endpoints are ready)
  googleAuth: (idToken) => api.post('/api/auth/oauth2/google', { idToken }),
  githubAuth: (code) => api.post('/api/auth/oauth2/github', { code }),
  outlookAuth: (code) => api.post('/api/auth/oauth2/azure', { code }),
};
export default api;