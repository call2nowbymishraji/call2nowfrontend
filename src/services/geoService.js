import api from './api.js';

const cache = new Map();

const memo = (key, load) => {
  if (cache.has(key)) return cache.get(key);
  const p = load().catch((e) => {
    cache.delete(key);
    throw e;
  });
  cache.set(key, p);
  return p;
};

export default {
  countries: () => memo('countries', () => api.get('/geo/countries').then((r) => r.data.countries || [])),
  states: (country) =>
    memo(`states:${country}`, () => api.get('/geo/states', { params: { country } }).then((r) => r.data.states || [])),
  cities: (country, state) =>
    api.get('/geo/cities', { params: { country, state } }).then((r) => r.data.cities || []),
  allCities: () => memo('allCities', () => api.get('/geo/all-cities').then((r) => r.data.cities || [])),
};
