import { Link } from 'react-router-dom';
import { paletteFor } from '../utils/categories.js';
import { profileLocality } from '../utils/geo.js';
import { callLink, waLink, mapsLink } from '../utils/contact.js';
import { assetUrl } from '../services/api.js';

export default function ProfileCard({ profile }) {
  const p = paletteFor(profile.category || profile.shopName);
  const img = assetUrl(profile.shopImage, 640);
  const place = profile.city ? [profile.city, profile.state].filter(Boolean).join(', ') : profileLocality(profile);
  const tel = callLink(profile);
  const wa = waLink(profile);
  const maps = mapsLink(profile);
  const href = `/b/${profile.pageSlug}`;
  const category = profile.category === 'Other' ? profile.customCategory : profile.category;
  const products = profile.products || [];

  return (
    <div className="pc h-full">
      <div className="card pc-body relative h-full overflow-hidden bg-white transition hover:-translate-y-1 hover:shadow-lg">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Stretched link: the ::after blankets the card so any click except the z-[2] contact buttons opens the profile. */}
          <Link to={href} aria-label={`Open ${profile.shopName}`} className="after:absolute after:inset-0 after:z-[1] after:content-['']">
            <h3 className="pc-name truncate font-extrabold tracking-tight text-slate-900">{profile.shopName}</h3>
          </Link>

          {category && (
            <p className="pc-meta pc-meta-1 font-semibold text-slate-500">
              <TagIcon className="pc-meta-icon" />
              <span className="truncate">{category}</span>
            </p>
          )}

          {place && (
            <p className="pc-meta pc-meta-2 !items-start font-medium text-slate-500">
              <PinIcon className="pc-meta-icon" />
              <span className="line-clamp-2">{place}</span>
            </p>
          )}

          <div className="pc-rule bg-slate-100" />

          {products.length > 0 && (
            <div className="pc-chips">
              {products.slice(0, 2).map((pr) => (
                <span key={pr._id || pr.name} className={`pc-chip ${p.chip}`}>
                  {pr.name}
                </span>
              ))}
            </div>
          )}

          <div className="pc-cta">
            {tel && (
              <a
                href={tel}
                className="pc-btn pc-btn-stack relative z-[2] bg-primary text-white transition hover:bg-primary/90"
                aria-label={`Call ${profile.shopName}`}
                title={`Call ${profile.shopName}`}
              >
                <PhoneIcon className="pc-btn-icon" />
                <span className="pc-btn-label">Call</span>
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="pc-btn pc-btn-stack relative z-[2] bg-ggreen text-white transition hover:brightness-110"
                aria-label={`WhatsApp ${profile.shopName}`}
                title={`WhatsApp ${profile.shopName}`}
              >
                <WhatsAppIcon className="pc-btn-icon" />
                <span className="pc-btn-label">WhatsApp</span>
              </a>
            )}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                aria-label={`Get directions to ${profile.shopName}`}
                className={`pc-btn pc-btn-grow relative z-[2] border transition hover:brightness-95 ${p.soft}`}
              >
                <PinIcon className="pc-btn-icon" />
                <span className="pc-btn-label">Visit for best price</span>
              </a>
            )}
          </div>
        </div>

        <div className={`pc-photo grid place-items-center ${img ? '' : p.bg}`}>
          {img ? (
            <img src={img} alt={profile.shopName} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <span className={`pc-photo-name ${p.text}`}>{profile.shopName}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PhoneIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.25 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.01l-2.2 2.21z" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function PinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TagIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
