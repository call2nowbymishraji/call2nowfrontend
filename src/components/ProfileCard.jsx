import { Link } from 'react-router-dom';
import { paletteFor, initialsOf } from '../utils/categories.js';
import { assetUrl } from '../services/api.js';

export default function ProfileCard({ profile }) {
  const p = paletteFor(profile.category || profile.shopName);
  const img = assetUrl(profile.shopImage);
  return (
    <Link to={`/b/${profile.pageSlug}`} className="card block overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`relative grid h-28 place-items-center ${p.bg}`} style={img ? undefined : undefined}>
        {img ? (
          <img src={img} alt={profile.shopName} className="h-full w-full object-cover" />
        ) : (
          <span className={`px-4 text-center text-sm font-bold ${p.text}`}>{profile.shopName}</span>
        )}
      </div>
      <div className="relative px-4 pb-4">
        <div
          className={`absolute -top-5 left-4 grid h-10 w-10 place-items-center rounded-full ${p.avatar} text-xs font-bold text-white ring-4 ring-white`}
        >
          {initialsOf(profile.shopName)}
        </div>
        <div className="mt-6 flex gap-2 overflow-hidden">
          {(profile.products || []).slice(0, 3).map((pr) => (
            <span key={pr._id || pr.name} className={`chip truncate ${p.chip}`}>
              {pr.name}
            </span>
          ))}
          {(profile.products || []).length === 0 && <span className="chip bg-slate-100 text-slate-500">No products</span>}
        </div>
        <h3 className="mt-3 truncate font-bold text-slate-800">{profile.shopName}</h3>
        <p className="truncate text-xs text-slate-500">
          {profile.category}
          {profile.address ? ` · ${profile.address.split(',').pop().trim()}` : ''}
        </p>
      </div>
    </Link>
  );
}
