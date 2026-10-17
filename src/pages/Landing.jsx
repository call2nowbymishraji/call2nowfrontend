import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SearchBar from '../components/SearchBar.jsx';
import PromoSlider from '../components/PromoSlider.jsx';
import SuggestedCarousel from '../components/SuggestedCarousel.jsx';
import AdPopup from '../components/AdPopup.jsx';
import HelpWidget from '../components/HelpWidget.jsx';
import searchService from '../services/searchService.js';

export default function Landing() {
  const [suggested, setSuggested] = useState([]);
  const [featuredLive, setFeaturedLive] = useState(false);

  useEffect(() => {
    searchService.suggested().then((d) => setSuggested(d.profiles || [])).catch(() => setSuggested([]));
    searchService.settings().then((d) => setFeaturedLive(!!d.settings?.featuredLive)).catch(() => setFeaturedLive(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-4 pt-8 text-center sm:pt-10">
          <img src="/logo.png" alt="Call2Now" className="mx-auto h-16 w-auto sm:h-20" />
          <div className="mt-5">
            <SearchBar />
          </div>
        </section>

        {featuredLive && <PromoSlider />}

        <section className="mx-auto w-full max-w-[1400px] px-4 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Profiles suggested by us</h2>
            <Link to="/search" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {suggested.length ? (
            <SuggestedCarousel profiles={suggested} />
          ) : (
            <div className="card grid place-items-center p-10 text-sm text-slate-400">
              No business profiles yet. Be the first to{' '}
              <Link to="/signup" className="ml-1 font-semibold text-primary hover:underline">
                create one
              </Link>
              .
            </div>
          )}
        </section>
      </main>
      <Footer />
      <AdPopup />
      <HelpWidget />
    </div>
  );
}
