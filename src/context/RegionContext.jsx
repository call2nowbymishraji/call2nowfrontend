import { createContext, useContext, useEffect, useState } from 'react';

export const REGION_OPTIONS = ['all', 'India', 'Nepal'];
const STORAGE_KEY = 'c2n.region';

const readStoredRegion = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return REGION_OPTIONS.includes(value) ? value : 'all';
  } catch {
    return 'all';
  }
};

const RegionContext = createContext({ region: 'all', country: '', setRegion: () => {} });

// The navbar picker is a per-device view setting, not part of the URL, so links stay shareable
// and the sitemap keeps one entry per business.
export function RegionProvider({ children }) {
  const [region, setRegion] = useState(readStoredRegion);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, region);
    } catch {
      /* private mode: the choice just is not remembered */
    }
  }, [region]);

  // "All" means no filter, and the API treats a missing country param exactly that way.
  const country = region === 'all' ? '' : region;

  return <RegionContext.Provider value={{ region, country, setRegion }}>{children}</RegionContext.Provider>;
}

export const useRegion = () => useContext(RegionContext);
