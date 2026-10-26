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

// Cloudinary stores the originals at full size (a shop photo arrives as 900x1200 or bigger
// and the homepage alone pulls ~4.7 MB). For Cloudinary URLs only, ask for the delivery
// width the layout actually renders; local /uploads paths and data URLs are returned as is.
export const assetUrl = (path, width) => {
  if (!path) return null;
  const url = path.startsWith('http') || path.startsWith('data:') ? path : API_ORIGIN + path;
  if (!width || !url.includes('/upload/') || /\/upload\/[^/]*(f_|q_|w_)/.test(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export default api;
