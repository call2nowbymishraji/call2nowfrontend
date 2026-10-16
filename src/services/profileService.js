import api from './api.js';

export default {
  create: (formData) =>
    api.post('/profiles', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (id, formData) =>
    api.put(`/profiles/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  mine: () => api.get('/profiles/mine').then((r) => r.data),
  bySlug: (slug) => api.get(`/profiles/slug/${slug}`).then((r) => r.data),
};
