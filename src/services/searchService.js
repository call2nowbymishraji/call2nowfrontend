import api from './api.js';

export default {
  search: (params) => api.get('/search', { params }).then((r) => r.data),
  suggested: () => api.get('/search/suggested').then((r) => r.data),
  slides: () => api.get('/promo/slides').then((r) => r.data),
};
