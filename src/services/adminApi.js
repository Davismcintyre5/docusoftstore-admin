import axios from 'axios';

// Use environment variable for API URL, fallback to production URL
const API_URL = import.meta.env.VITE_API_URL || 'https://docusoftserver.pxxl.click/api';

const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 600000,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;