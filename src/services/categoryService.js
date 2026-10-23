import api from './api.js';

export default {
  list: () => api.get('/categories').then((r) => r.data.categories || []),
};
