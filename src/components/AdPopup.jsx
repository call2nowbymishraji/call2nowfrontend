import { useEffect, useState } from 'react';
import searchService from '../services/searchService.js';
import { assetUrl } from '../services/api.js';

const dismissed = (id) => sessionStorage.getItem(`c2n_ad_dismissed_${id}`) === '1';
const dismiss = (id) => sessionStorage.setItem(`c2n_ad_dismissed_${id}`, '1');

export function pickRandom(ads) {
  const pool = (ads || []).filter((a) => a.active && !dismissed(a._id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function AdPopup() {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    searchService.ads('popup').then((d) => setAd(pickRandom(d.ads))).catch(() => setAd(null));
  }, []);

  // The sheet is anchored to the same bottom corner the help widget floats in.
  useEffect(() => {
    document.body.classList.toggle('ad-open', !!ad);
    return () => document.body.classList.remove('ad-open');
  }, [ad]);

  if (!ad) return null;

  const img = assetUrl(ad.image, 512);
  const body = (
    <>
      {img && <img src={img} alt={ad.title} className="h-28 w-44 shrink-0 rounded-xl object-cover sm:h-40 sm:w-64" />}
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="truncate text-base font-extrabold text-slate-900 sm:text-xl">{ad.title}</p>
        {ad.subtitle && <p className="mt-1 line-clamp-2 text-sm text-slate-600 sm:text-base">{ad.subtitle}</p>}
      </div>
      {ad.ctaText && (
        <span className="hidden shrink-0 rounded-full bg-gred px-6 py-3 text-base font-bold text-white sm:inline-flex">
          {ad.ctaText}
        </span>
      )}
    </>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="relative mx-auto flex max-w-5xl items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:gap-6 sm:p-6">
        {ad.linkUrl ? (
          <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
            {body}
          </a>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">{body}</div>
        )}
        <button
          onClick={() => {
            dismiss(ad._id);
            setAd(null);
          }}
          className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-base font-bold text-white shadow hover:bg-slate-600"
          aria-label="Close ad"
        >
          ×
        </button>
      </div>
    </div>
  );
}
