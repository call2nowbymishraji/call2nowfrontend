import { useEffect, useState } from 'react';
import searchService from '../services/searchService.js';
import { assetUrl } from '../services/api.js';
import { pickRandom } from './AdPopup.jsx';

const dismissed = (id) => sessionStorage.getItem(`c2n_ad_dismissed_${id}`) === '1';
const dismiss = (id) => sessionStorage.setItem(`c2n_ad_dismissed_${id}`, '1');

export default function SideAdRail({ side }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    searchService.ads(side).then((d) => setAd(pickRandom(d.ads))).catch(() => setAd(null));
  }, [side]);

  if (!ad) return null;

  const img = assetUrl(ad.image, 480);
  const inner = (
    <>
      {img && <img src={img} alt={ad.title} className="w-full flex-1 object-cover" />}
      <div className="bg-white p-3 text-center">
        <p className="line-clamp-2 text-sm font-extrabold text-slate-900">{ad.title}</p>
        {ad.subtitle && <p className="mt-1 line-clamp-3 text-xs text-slate-500">{ad.subtitle}</p>}
        {ad.ctaText && (
          <span className="mt-2 inline-flex rounded-full bg-gred px-4 py-1.5 text-xs font-bold text-white">{ad.ctaText}</span>
        )}
      </div>
    </>
  );

  return (
    <aside
      className={`relative hidden w-40 shrink-0 border-slate-100 bg-white lg:block xl:w-52 ${
        side === 'left' ? 'border-r' : 'border-l'
      }`}
    >
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="flex h-full flex-col overflow-hidden">
          {inner}
        </a>
      ) : (
        <div className="flex h-full flex-col overflow-hidden">{inner}</div>
      )}
      <button
        onClick={() => {
          dismiss(ad._id);
          setAd(null);
        }}
        className="absolute right-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-slate-800/90 text-sm font-bold text-white hover:bg-slate-600"
        aria-label="Close ad"
      >
        ×
      </button>
    </aside>
  );
}
