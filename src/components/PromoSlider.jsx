import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import searchService from '../services/searchService.js';
import { assetUrl } from '../services/api.js';

const BRAND_SLIDE = {
  _id: 'brand-call2now',
  brand: true,
  title: 'Reach any business near you',
  subtitle: 'One tap to call, WhatsApp or get directions. List your shop free and get found today.',
};

export default function PromoSlider() {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    searchService.slides().then((d) => setSlides(d.slides || [])).catch(() => setSlides([]));
  }, []);

  const all = useMemo(() => [BRAND_SLIDE, ...slides], [slides]);

  useEffect(() => {
    if (all.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % all.length), 3000);
    return () => clearInterval(t);
  }, [all.length]);

  useEffect(() => {
    if (idx >= all.length) setIdx(0);
  }, [all.length, idx]);

  return (
    <section className="relative mx-auto w-full max-w-[1400px] px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">Featured businesses</h2>
        <span className="text-xs font-semibold uppercase tracking-wide text-gyellow">Paid promotions</span>
      </div>
      <div className="relative overflow-hidden rounded-2xl shadow-card">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {all.map((s) => {
            if (s.brand) {
              return (
                <div key={s._id} className="w-full shrink-0">
                  <Link to="/signup" className="block">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-gblue to-ggreen" />
                    <div className="relative flex h-64 flex-col justify-center bg-black/10 px-8 sm:h-80">
                      <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Call2Now" className="h-12 w-auto rounded-xl bg-white/95 p-1 shadow" />
                        <h3 className="text-2xl font-extrabold text-white drop-shadow sm:text-3xl">{s.title}</h3>
                      </div>
                      <p className="mt-2 max-w-xl text-sm text-white/95">{s.subtitle}</p>
                      <span className="mt-3 inline-flex w-fit rounded-full bg-white px-4 py-1.5 text-xs font-bold text-primary">
                        Get started free
                      </span>
                    </div>
                  </Link>
                </div>
              );
            }
            const img = assetUrl(s.image);
            const to = s.profile ? `/b/${s.profile.pageSlug}` : s.customUrl || '#';
            const inner = (
              <>
                {img ? (
                  <img src={img} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-gblue" />
                )}
                <div className="relative flex h-64 flex-col justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent px-8 sm:h-80">
                  <h3 className="text-2xl font-extrabold text-white drop-shadow sm:text-3xl">{s.title}</h3>
                  {s.subtitle && <p className="mt-1 max-w-xl text-sm text-white/90">{s.subtitle}</p>}
                  <span className="mt-3 inline-flex w-fit rounded-full bg-white px-4 py-1.5 text-xs font-bold text-primary">
                    View profile
                  </span>
                </div>
              </>
            );
            return (
              <div key={s._id} className="w-full shrink-0">
                {to && to !== '#' ? (
                  <Link to={to.startsWith('http') ? '#' : to} className="block">
                    {inner}
                  </Link>
                ) : (
                  <div className="block">{inner}</div>
                )}
              </div>
            );
          })}
        </div>
        {all.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + all.length) % all.length)}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % all.length)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
              aria-label="Next slide"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {all.map((s, i) => (
                <button
                  key={s._id}
                  onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
