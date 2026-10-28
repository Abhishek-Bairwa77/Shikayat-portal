import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shikayat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('shikayat_token');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Grievance API functions
export const grievanceAPI = {
  getAll: (params) => api.get('/grievances', { params }),
  getById: (id) => api.get(`/grievances/${id}`),
  create: (formData) => api.post('/grievances', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  upvote: (id, actionPin) => api.post(`/grievances/${id}/upvote`, { actionPin }),
  getMy: () => api.get('/grievances/my'),
  getVoteStatus: (id) => api.get(`/grievances/${id}/vote-status`),
  getStats: () => api.get('/grievances/stats')
};

// Admin API functions
export const adminAPI = {
  getAllGrievances: (params) => api.get('/admin/grievances', { params }),
  getConfidential: () => api.get('/admin/confidential'),
  updateStatus: (id, data) => api.put(`/admin/grievances/${id}/status`, data),
  assignGrievance: (id, facultyId) => api.put(`/admin/grievances/${id}/assign`, { facultyId }),
  getStats: () => api.get('/admin/stats')
};

export default api;