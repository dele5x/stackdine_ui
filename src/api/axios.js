import axios from 'axios';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || 'https://stackdine-api.onrender.com/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use hash router navigation to avoid full page reload
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default API;