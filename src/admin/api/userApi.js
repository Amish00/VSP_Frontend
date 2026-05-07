import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userApi = {
    getCurrentUser: async () => {
        const response = await axios.get(`${API_BASE_URL}/users/me`, { headers: getAuthHeader() });
        return response.data;
    },
    getAllUsers: async () => {
        const response = await axios.get(`${API_BASE_URL}/users`, { headers: getAuthHeader() });
        return response.data;
    },
    getUserById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeader() });
        return response.data;
    },
    updateUser: async (id, userData) => {
        const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData, {
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
        });
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeader() });
        return response.data;
    },
    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_BASE_URL}/users/me/profile-picture`, formData, {
            headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    uploadProfilePictureForUser: async (userId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_BASE_URL}/users/${userId}/profile-picture`, formData, {
            headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    uploadBanner: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_BASE_URL}/users/me/banner`, formData, {
            headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
};