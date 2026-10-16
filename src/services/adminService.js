import api from './api.js';

export default {
  listProfiles: () => api.get('/admin/profiles').then((r) => r.data),
  setTenure: (profileId, days) => api.put(`/admin/profiles/${profileId}/tenure`, { days }).then((r) => r.data),
  deleteProfile: (profileId) => api.delete(`/admin/profiles/${profileId}`).then((r) => r.data),
  removeProduct: (profileId, productId) =>
    api.delete(`/admin/profiles/${profileId}/products/${productId}`).then((r) => r.data),
  listSlides: () => api.get('/admin/slides').then((r) => r.data),
  createSlide: (formData) =>
    api
      .post('/admin/slides', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  toggleSlide: (id, active) => api.put(`/admin/slides/${id}`, { active }).then((r) => r.data),
  deleteSlide: (id) => api.delete(`/admin/slides/${id}`).then((r) => r.data),
};
