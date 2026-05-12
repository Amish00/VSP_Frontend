import axios from 'axios'

const API_BASE = 'http://localhost:8080'

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 600000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Let browser set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const creatorApi = {
  getDashboard: () => axiosInstance.get('/api/creator/dashboard'),
  getChannel: () => axiosInstance.get('/api/creator/channel'),
  updateChannel: (data) => axiosInstance.put('/api/creator/channel', data),
  getAnalytics: (range) => axiosInstance.get(`/api/creator/analytics?range=${range}`),
  
  getVideos: (status, search = '', size = 10, page = 0) => {
  let url = `/api/creator/videos?size=${size}&page=${page}`;
  if (status && status !== 'All') url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return axiosInstance.get(url);
},
  
  uploadVideo: (formData, onProgress) => {
    return axiosInstance.post('/api/videos', formData, {
      onUploadProgress: onProgress,
    });
  },
  
  getVideo: (id) => axiosInstance.get(`/api/videos/${id}`),
  
  updateVideoWithFiles: (id, formData) => {
    return axiosInstance.put(`/api/videos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  deleteVideo: (id) => axiosInstance.delete(`/api/creator/videos/${id}`),
  
  getEditors: () => axiosInstance.get('/api/creator/editors'),
  inviteEditor: (email) => axiosInstance.post('/api/creator/editors/invite', { email }),
  removeEditor: (id) => axiosInstance.delete(`/api/creator/editors/${id}`),
  getEarnings: (range) => axiosInstance.get(`/api/creator/earnings?range=${range}`),
  requestPayout: (amount) => axiosInstance.post('/api/creator/earnings/payout', { amount }),

  getViewsOverTime: (days = 180) => axiosInstance.get(`/api/creator/analytics/views-over-time?days=${days}`),
  getContentBreakdown: () => axiosInstance.get('/api/creator/analytics/content-breakdown'),

  getAnalyticsSummary: (days) => axiosInstance.get(`/api/creator/analytics/summary?days=${days}`),
  getTopVideos: (limit = 5) => axiosInstance.get(`/api/creator/analytics/top-videos?limit=${limit}`),
  getDashboardStats: () => axiosInstance.get('/api/creator/dashboard/stats'),
}

export const earningsApi = {
    getSummary: () => axiosInstance.get('/api/creator/earnings/summary'),
    getHistory: () => axiosInstance.get('/api/creator/earnings/history'),
    getPayouts: () => axiosInstance.get('/api/creator/earnings/payouts'),
    requestPayout: (amount, method, accountDetails) => 
        axiosInstance.post('/api/creator/earnings/request', { amount, method, accountDetails }),
};

export const adminRevenueApi = {
    getMonthlyRevenue: (months = 12) => axiosInstance.get('/api/admin/revenue/monthly', { params: { months } }),
    getPendingPayouts: () => axiosInstance.get('/api/admin/revenue/payouts/pending'),
    processPayout: (id) => axiosInstance.post(`/api/admin/revenue/payouts/${id}/process`),
    rejectPayout: (id, reason) => axiosInstance.post(`/api/admin/revenue/payouts/${id}/reject`, { reason }),
    getPaymentRecords: (page = 0, size = 20) => axiosInstance.get(`/api/admin/revenue/records?page=${page}&size=${size}`),
    getAllCreatorEarnings: () => axiosInstance.get('/api/admin/revenue/earnings/all'),
};