import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SearchBar from '../components/SearchBar.jsx';
import PromoSlider from '../components/PromoSlider.jsx';
import SuggestedCarousel from '../components/SuggestedCarousel.jsx';
import AdPopup from '../components/AdPopup.jsx';
import HelpWidget from '../components/HelpWidget.jsx';
import LoadingOverlay, { CardSkeletonRow } from '../components/LoadingOverlay.jsx';
import searchService from '../services/searchService.js';
import { useSiteSettings } from '../context/SiteSettingsContext.jsx';
import { useRegion } from '../context/RegionContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import Seo from '../seo/Seo.jsx';
import { homeSeo } from '../seo/pages.js';
import { HOMEPAGE_H1 } from '../seo/site.js';

export default function Landing() {
  // null means "not answered yet", which is what keeps the empty-state card from showing while
  // a slow backend is still connecting.
  const [suggested, setSuggested] = useState(null);
  const { featuredLive, homeFiltersLive, ready: settingsReady } = useSiteSettings();
  const { country } = useRegion();
  const { t } = useLang();

  useEffect(() => {
    // Going back to pending on a new pick reuses the same loader the first visit sees.
    setSuggested(null);
    searchService
      .suggested(country)
      .then((d) => setSuggested(d.profiles || []))
      .catch(() => setSuggested([]));
  }, [country]);

  const loading = suggested === null || !settingsReady;

  return (
    <div className="flex min-h-screen flex-col">
      <Seo {...homeSeo()} />
      <Navbar />
      <main className="flex-1">
        <h1 className="sr-only">{HOMEPAGE_H1}</h1>
        <section className="mx-auto max-w-4xl px-4 pb-4 pt-8 text-center sm:pt-10" aria-label={HOMEPAGE_H1}>
          <img src="/logo.png" alt="Call2Now" className="mx-auto h-16 w-auto sm:h-20" />
          <div className="mt-5">
            <SearchBar compact={!homeFiltersLive} />
          </div>
        </section>

        {featuredLive && <PromoSlider />}

        <section className="mx-auto w-full max-w-[1400px] px-4 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">{t('Profiles suggested by us')}</h2>
            <Link to="/search" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              {t('View all')}
            </Link>
          </div>
          {loading ? (
            <CardSkeletonRow />
          ) : suggested.length ? (
            <SuggestedCarousel profiles={suggested} />
          ) : (
            <div className="card grid place-items-center p-10 text-sm text-slate-400">
              {t('No business profiles yet.')}{' '}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                {t('Be the first to create one')}
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
      {/* Mounted last on purpose: the fixed veil must paint over the popup and help widget too. */}
      {loading && <LoadingOverlay />}
      <AdPopup />
      <HelpWidget />
    </div>
  );
}
