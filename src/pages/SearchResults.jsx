import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SearchBar from '../components/SearchBar.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import searchService from '../services/searchService.js';

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const location = params.get('location') || '';
  const [results, setResults] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchService
      .search({ q, category, location })
      .then((d) => setResults(d.profiles || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
    searchService.suggested().then((d) => setSuggested(d.profiles || [])).catch(() => setSuggested([]));
  }, [q, category, location]);

  const hasQuery = q || category || location;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 pt-8">
          <SearchBar initial={{ q, category, location }} />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="section-title">
            {hasQuery ? `Results for your search (${results.length})` : `All businesses (${results.length})`}
          </h1>
          {loading ? (
            <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : results.length ? (
            <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((p) => (
                <ProfileCard key={p._id} profile={p} />
              ))}
            </div>
          ) : (
            <p className="card mt-6 p-10 text-center text-sm text-slate-400">
              No businesses match your search. Try different keywords or category.
            </p>
          )}

          <section className="pt-12">
            <h2 className="section-title">Profiles suggested by us</h2>
            <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {suggested
                .filter((s) => !results.some((r) => r._id === s._id))
                .slice(0, 8)
                .map((p) => (
                  <ProfileCard key={p._id} profile={p} />
                ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
