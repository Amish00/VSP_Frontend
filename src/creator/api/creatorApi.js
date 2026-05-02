// src/services/creatorApi.js
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
    } else {
      console.warn('No accesstoken found in localStorage. User might not be logged in.')
    }

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
  getVideos: (filter) => axiosInstance.get(`/api/creator/videos?filter=${filter}`),
  uploadVideo: (formData) => axiosInstance.post('/api/videos', formData),
  updateVideo: (id, data) => axiosInstance.put(`/api/creator/videos/${id}`, data),
  deleteVideo: (id) => axiosInstance.delete(`/api/creator/videos/${id}`),
  getEditors: () => axiosInstance.get('/api/creator/editors'),
  inviteEditor: (email) => axiosInstance.post('/api/creator/editors/invite', { email }),
  removeEditor: (id) => axiosInstance.delete(`/api/creator/editors/${id}`),
  getEarnings: (range) => axiosInstance.get(`/api/creator/earnings?range=${range}`),
  requestPayout: (amount) => axiosInstance.post('/api/creator/earnings/payout', { amount }),
}