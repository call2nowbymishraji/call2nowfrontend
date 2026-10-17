import api from './api.js';

export default {
  search: (params) => api.get('/search', { params }).then((r) => r.data),
  suggested: () => api.get('/search/suggested').then((r) => r.data),
  slides: () => api.get('/promo/slides').then((r) => r.data),
  settings: () => api.get('/promo/settings').then((r) => r.data),
  ads: (placement) => api.get('/promo/ads', { params: placement ? { placement } : {} }).then((r) => r.data),
};
