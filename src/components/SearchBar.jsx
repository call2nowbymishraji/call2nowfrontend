import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../utils/categories.js';
import categoryService from '../services/categoryService.js';

export default function SearchBar({ initial = {}, compact = false }) {
  const [q, setQ] = useState(initial.q || '');
  const [category, setCategory] = useState(initial.category || '');
  const [location, setLocation] = useState(initial.location || '');
  const [listening, setListening] = useState(false);
  const [cats, setCats] = useState(CATEGORIES);
  const recRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => () => recRef.current?.stop?.(), []);

  useEffect(() => {
    categoryService
      .list()
      .then((list) => list.length && setCats(list))
      .catch(() => {});
  }, []);

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => setQ(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const submit = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (location.trim()) params.set('location', location.trim());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex items-center gap-2 rounded-full bg-white py-2 pl-5 pr-2 shadow-pill ring-1 ring-slate-100 focus-within:ring-2 focus-within:ring-blue-200">
        <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search anything... (business, product, name)"
          className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={startVoice}
          title="Search by voice"
          className={`rounded-full p-2 transition ${listening ? 'bg-gred text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100 hover:text-primary'}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zm7-3a7 7 0 01-14 0M12 19v3"
            />
          </svg>
        </button>
        <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:bg-blue-700">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
        </button>
      </div>
      {!compact && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input !rounded-full !py-2.5 text-sm">
              <option value="">All categories</option>
              {category && !cats.includes(category) && <option value={category}>{category}</option>}
              {cats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (city / area)"
              className="input !rounded-full !py-2.5 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary !py-2.5 text-sm">
            Search
          </button>
        </div>
      )}
    </form>
  );
}
