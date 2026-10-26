import { createContext, useContext, useEffect, useState } from 'react';
import searchService from '../services/searchService.js';

const SiteSettingsContext = createContext({
  featuredLive: false,
  homeFiltersLive: false,
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({ featuredLive: false, homeFiltersLive: false });

  useEffect(() => {
    let live = true;
    searchService
      .settings()
      .then((d) => {
        if (!live) return;
        setSettings({
          featuredLive: !!d.settings?.featuredLive,
          homeFiltersLive: !!d.settings?.homeFiltersLive,
        });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
