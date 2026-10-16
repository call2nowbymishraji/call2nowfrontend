import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('c2n_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || (import.meta.env.DEV ? '' : 'http://localhost:5000');

export const assetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return API_ORIGIN + path;
};

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export default api;
