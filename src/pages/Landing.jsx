import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SearchBar from '../components/SearchBar.jsx';
import PromoSlider from '../components/PromoSlider.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import searchService from '../services/searchService.js';
import { CATEGORIES } from '../utils/categories.js';

export default function Landing() {
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    searchService.suggested().then((d) => setSuggested(d.profiles || [])).catch(() => setSuggested([]));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-10 pt-12 text-center sm:pt-16">
          <img src="/logo.png" alt="call2now" className="mx-auto h-16 w-auto sm:h-20" />
          <p className="mt-3 text-sm font-medium text-slate-500 sm:text-base">Find any business near you</p>
          <div className="mt-8">
            <SearchBar />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link
                key={c}
                to={`/search?category=${encodeURIComponent(c)}`}
                className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-pill transition hover:text-primary"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>

        <PromoSlider />

        <section className="mx-auto max-w-6xl px-4 pt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Profiles suggested by us</h2>
            <Link to="/search" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {suggested.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {suggested.map((p) => (
                <ProfileCard key={p._id} profile={p} />
              ))}
            </div>
          ) : (
            <div className="card grid place-items-center p-10 text-sm text-slate-400">
              No business profiles yet — be the first to{' '}
              <Link to="/signup" className="ml-1 font-semibold text-primary hover:underline">
                create one
              </Link>
              .
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
