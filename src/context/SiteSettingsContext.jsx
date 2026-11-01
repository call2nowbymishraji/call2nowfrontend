import { createContext, useContext, useEffect, useState } from 'react';
import searchService from '../services/searchService.js';

// `ready` tells a page when the settings request has settled, so the home page can wait for
// profiles and settings together and reveal everything in one step instead of twice.
const SiteSettingsContext = createContext({
  featuredLive: false,
  homeFiltersLive: false,
  ready: true,
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({ featuredLive: false, homeFiltersLive: false, ready: false });

  useEffect(() => {
    let live = true;
    const done = (next) => {
      if (live) setSettings({ ...next, ready: true });
    };
    searchService
      .settings()
      .then((d) => done({ featuredLive: !!d.settings?.featuredLive, homeFiltersLive: !!d.settings?.homeFiltersLive }))
      .catch(() => done({ featuredLive: false, homeFiltersLive: false }));
    return () => {
      live = false;
    };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
