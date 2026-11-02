import api from './api.js';

// An empty or missing value means "no filter", and the API reads an absent param that way,
// so the query string only carries the filters a visitor actually picked.
const only = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== '' && value !== null && value !== undefined));

export default {
  search: (params) => api.get('/search', { params: only(params) }).then((r) => r.data),
  suggested: (country) => api.get('/search/suggested', { params: only({ country }) }).then((r) => r.data),
  slides: (country) => api.get('/promo/slides', { params: only({ country }) }).then((r) => r.data),
  settings: () => api.get('/promo/settings').then((r) => r.data),
  ads: (placement) => api.get('/promo/ads', { params: placement ? { placement } : {} }).then((r) => r.data),
};
