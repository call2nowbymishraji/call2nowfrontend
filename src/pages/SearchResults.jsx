import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import SideAdRail from '../components/SideAds.jsx';
import searchService from '../services/searchService.js';

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const location = params.get('location') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchService
      .search({ q, category, location })
      .then((d) => setResults(d.profiles || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q, category, location]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-stretch">
        <SideAdRail side="left" />
        <div className="min-w-0 flex-1">
          <main>
            <div className="mx-auto max-w-4xl px-4 pt-8">
              <SearchBar initial={{ q, category, location }} />
            </div>
            <div className="mx-auto max-w-6xl px-4 py-8">
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="card h-64 animate-pulse bg-slate-100" />
                  ))}
                </div>
              ) : results.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {results.map((p) => (
                    <ProfileCard key={p._id} profile={p} />
                  ))}
                </div>
              ) : (
                <p className="card p-10 text-center text-sm text-slate-400">
                  No businesses match your search. Try different keywords or category.
                </p>
              )}
            </div>
          </main>
        </div>
        <SideAdRail side="right" />
      </div>
      <Footer />
    </div>
  );
}
