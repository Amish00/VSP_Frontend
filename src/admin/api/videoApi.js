import axios from 'axios';

const API_BASE_URL = '/api';

const getAuthHeader = () => {
    const token = sessionStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const videoApi = {
    getAllVideos: async (status = null, search = '', page = 0, size = 20, type = null) => {
        const params = new URLSearchParams();
        if (status && status !== 'All') params.append('status', status);
        if (search) params.append('search', search);
            if (type) params.append('type', type);
        params.append('page', page);
        params.append('size', size);
        const response = await axios.get(`${API_BASE_URL}/admin/videos?${params.toString()}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateVideo: async (id, videoData) => {
        const response = await axios.put(`${API_BASE_URL}/admin/videos/${id}`, videoData, {
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    deleteVideo: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/videos/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateVideoStatus: async (id, status, rejectionReason = null) => {
        const body = { status };
        if (rejectionReason) body.rejectionReason = rejectionReason;
        const response = await axios.patch(`${API_BASE_URL}/admin/videos/${id}/status`, body, {
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
        });
        return response.data;
    },
};