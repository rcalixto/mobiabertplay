import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
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
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Radio API functions
export const radioAPI = {
  // Get all radios with filters
  getRadios: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/radios?${params}`);
    return response.data;
  },

  // Get radio by ID
  getRadio: async (id) => {
    const response = await api.get(`/radios/${id}`);
    return response.data;
  },

  // Create new radio (admin only)
  createRadio: async (radioData) => {
    const response = await api.post('/radios', radioData);
    return response.data;
  },

  // Update radio (admin only)
  updateRadio: async (id, radioData) => {
    const response = await api.put(`/radios/${id}`, radioData);
    return response.data;
  },

  // Delete radio (admin only)
  deleteRadio: async (id) => {
    const response = await api.delete(`/radios/${id}`);
    return response.data;
  },

  // Upload logo (admin only)
  uploadLogo: async (radioId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/upload/logo/${radioId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get genres
  getGeneros: async () => {
    const response = await api.get('/generos');
    return response.data;
  },

  // Get regions
  getRegioes: async () => {
    const response = await api.get('/regioes');
    return response.data;
  },

  // Get cities
  getCidades: async () => {
    const response = await api.get('/cidades');
    return response.data;
  },

  // Get states
  getEstados: async () => {
    const response = await api.get('/estados');
    return response.data;
  },

  // Get stats
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await axios.get(`${BACKEND_URL}/health`);
  return response.data;
};

export default api;