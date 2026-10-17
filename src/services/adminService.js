import api from './api.js';

export default {
  listProfiles: () => api.get('/admin/profiles').then((r) => r.data),
  setTenure: (profileId, days) => api.put(`/admin/profiles/${profileId}/tenure`, { days }).then((r) => r.data),
  setVerified: (profileId, verified) => api.put(`/admin/profiles/${profileId}/verified`, { verified }).then((r) => r.data),
  setSuggested: (profileId, on) => api.put(`/admin/profiles/${profileId}/suggested`, { on }).then((r) => r.data),
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
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  setSettings: (featuredLive) => api.put('/admin/settings', { featuredLive }).then((r) => r.data),
  listAds: () => api.get('/admin/ads').then((r) => r.data),
  createAd: (formData) =>
    api
      .post('/admin/ads', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  toggleAd: (id, active) => api.put(`/admin/ads/${id}`, { active }).then((r) => r.data),
  deleteAd: (id) => api.delete(`/admin/ads/${id}`).then((r) => r.data),
};
