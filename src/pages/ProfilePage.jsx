import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import RotatingRow from '../components/RotatingRow.jsx';
import SideAdRail from '../components/SideAds.jsx';
import profileService from '../services/profileService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { paletteFor, initialsOf } from '../utils/categories.js';
import { assetUrl, errMsg } from '../services/api.js';

export default function ProfilePage({ ownerMode = false }) {
  const { slug } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    const req = ownerMode ? profileService.mine() : profileService.bySlug(slug);
    req
      .then((d) => setProfile(d.profile))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [slug, ownerMode]);

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-primary" />
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-xl font-bold text-slate-800">{ownerMode ? 'You have no profile yet' : 'Profile not found'}</h1>
          <p className="mt-2 text-sm text-slate-500">{error || 'This business page does not exist.'}</p>
          {ownerMode && user?.role !== 'admin' && (
            <Link to="/create-profile" className="btn-primary mt-6">
              Create your profile
            </Link>
          )}
        </div>
      </div>
    );

  const p = paletteFor(profile.category || profile.shopName);
  const isOwner = user && String(profile.user?._id || profile.user) === String(user._id);
  const banner = assetUrl(profile.shopImage);
  const cover = assetUrl(profile.coverImage);
  const wa = profile.whatsappUrl || `https://wa.me/91${(profile.whatsapp || profile.phone || '').replace(/\D/g, '')}`;
  const products = profile.products || [];
  const gallery = (profile.gallery || []).slice(0, 9);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-stretch">
        <SideAdRail side="left" />
        <div className="min-w-0 flex-1">
          <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
            <div className="mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
              >
                <ChevronLeftIcon />
                Back to home
              </Link>
            </div>
            {isOwner && !profile.verified && (
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gyellow/50 bg-gyellow/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Your profile is not verified yet. To verify your profile, WhatsApp us and our team will activate it.
                </p>
                <a
                  href={`https://wa.me/919305035828?text=${encodeURIComponent(
                    `Hi Call2Now, please verify my business profile: ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ggreen px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:brightness-110"
                >
                  <WhatsAppIcon />
                  WhatsApp us
                </a>
              </div>
            )}
            <div className="overflow-hidden rounded-3xl bg-white shadow-card">
              {cover && <img src={cover} alt={`${profile.shopName} cover`} className="h-40 w-full object-cover sm:h-56" />}
          {/* hero, about, full info, delivery badges */}
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[360px_1fr]">
            <div className="mx-auto w-64 sm:mx-0 sm:w-full">
              {banner ? (
                <img src={banner} alt={profile.shopName} className="aspect-[3/4] w-full rounded-2xl object-cover shadow-card" />
              ) : (
                <div className={`grid aspect-[3/4] w-full place-items-center rounded-2xl ${p.avatar}`}>
                  <span className="text-6xl font-extrabold text-white">{initialsOf(profile.shopName)}</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="flex flex-wrap items-center gap-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {profile.shopName}
                {profile.verified && (
                  <span
                    title="Verified by Call2Now"
                    className="inline-flex items-center gap-1.5 rounded-full bg-ggreen/10 px-3 py-1 text-xs font-bold text-ggreen"
                  >
                    <VerifiedTick />
                    Verified
                  </span>
                )}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                <span className={`chip ${p.chip}`}>{profile.category === 'Other' ? profile.customCategory : profile.category}</span>
                <span className="ml-2">{profile.address}</span>
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`tel:+91${profile.phone}`}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-card transition hover:bg-primary/90"
                >
                  <PhoneIcon />
                  Call now
                </a>
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl border border-ggreen/30 bg-ggreen/5 px-5 py-3 text-sm font-bold text-ggreen transition hover:bg-ggreen/10"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
                >
                  <MailIcon />
                  Email
                </a>
                {profile.mapUrl && (
                  <a
                    href={profile.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
                  >
                    <DirectionsIcon />
                    Get directions
                  </a>
                )}
                {SOCIAL_BUTTONS.filter((s) => profile[s.key]).map((s) => (
                  <a
                    key={s.key}
                    href={profile[s.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
                  >
                    <s.Icon />
                    {s.label}
                  </a>
                ))}
              </div>

              {isOwner && (
                <div className="mt-4">
                  <Link to="/create-profile?edit=1" className="btn-outline !py-2 text-sm">
                    Edit profile
                  </Link>
                </div>
              )}

              {profile.description && (
                <div className="mt-7">
                  <h2 className="section-title">About</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{profile.description}</p>
                </div>
              )}

              <div className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <InfoCell label="Owner" value={profile.ownerName} />
                <InfoCell label="Phone" value={profile.phone} />
                <InfoCell label="WhatsApp" value={profile.whatsapp} />
                <InfoCell label="Email" value={profile.email} />
                <InfoCell label="In market since" value={profile.inMarketSince} />
                <InfoCell label="Operation days" value={profile.operationDays?.join(', ') || ''} />
                <InfoCell
                  label="Timing"
                  value={profile.operationOpen && profile.operationClose ? `${profile.operationOpen} to ${profile.operationClose}` : ''}
                />
                {profile.gst && <InfoCell label="GST" value={profile.gst} />}
                <InfoCell label="Page URL" value={`call2now.in/b/${profile.pageSlug}`} />
              </div>

              <div className="mt-7 flex flex-wrap gap-2 text-sm font-semibold">
                <Badge on={profile.onlineDelivery} yes="Online delivery available" no="No online delivery" />
                <Badge on={profile.panIndia} yes="Delivery pan India" no="Local delivery only" />
              </div>
            </div>
          </div>

          {/* products */}
          {products.length > 0 && (
            <div className="border-t border-slate-100 p-6 sm:p-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="section-title">Products ({products.length})</h2>
                <button onClick={() => setModal('products')} className="text-sm font-semibold text-primary hover:underline">
                  See all
                </button>
              </div>
              <RotatingRow items={products} target={2} aspect="" render={(pr) => <ProductTile pr={pr} />} />
            </div>
          )}

          {/* gallery */}
          {gallery.length > 0 && (
            <div className="border-t border-slate-100 p-6 sm:p-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="section-title">Gallery ({gallery.length})</h2>
                <button onClick={() => setModal('gallery')} className="text-sm font-semibold text-primary hover:underline">
                  See all
                </button>
              </div>
              <RotatingRow
                items={gallery}
                target={4}
                aspect="aspect-[3/4]"
                render={(g, i) => (
                  <img src={assetUrl(g)} alt={`${profile.shopName} ${i + 1}`} className="h-full w-full rounded-xl object-cover" />
                )}
              />
            </div>
          )}
            </div>
          </main>
        </div>
        <SideAdRail side="right" />
      </div>

      {modal === 'products' && (
        <SeeAllModal title={`All products (${products.length})`} onClose={() => setModal(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((pr) => (
              <ProductTile key={pr._id} pr={pr} />
            ))}
          </div>
        </SeeAllModal>
      )}
      {modal === 'gallery' && (
        <SeeAllModal title={`All photos (${gallery.length})`} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((g, i) => (
              <img key={i} src={assetUrl(g)} alt={`${profile.shopName} ${i + 1}`} className="aspect-[3/4] w-full rounded-xl object-cover" />
            ))}
          </div>
        </SeeAllModal>
      )}

      <Footer />
    </div>
  );
}

function ProductTile({ pr }) {
  const img = assetUrl(pr.image);
  const off = pr.price && pr.discountedPrice ? Math.round(((pr.price - pr.discountedPrice) / pr.price) * 100) : 0;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white">
      {img && <img src={img} alt={pr.name} className="aspect-[4/5] w-full object-cover" />}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800">{pr.name}</h3>
          {off > 0 && <span className="chip bg-ggreen/10 text-ggreen">{off}% off</span>}
        </div>
        <p className="mt-1 text-sm">
          {pr.discountedPrice != null && <span className="font-bold text-slate-900">₹{pr.discountedPrice} </span>}
          {pr.price != null && (
            <span className={pr.discountedPrice != null ? 'text-xs text-slate-400 line-through' : 'font-bold text-slate-900'}>
              ₹{pr.price}
            </span>
          )}
        </p>
        <p className="mt-2 line-clamp-3 text-xs text-slate-500">{pr.description}</p>
      </div>
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="border-b border-slate-100 pb-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <p className="mt-0.5 text-sm font-semibold text-slate-700">{value || 'Not set'}</p>
    </div>
  );
}

function SeeAllModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Badge({ on, yes, no }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${on ? 'bg-ggreen/10 text-ggreen' : 'bg-slate-100 text-slate-400'}`}>
      <span>{on ? '✓' : '✕'}</span>
      {on ? yes : no}
    </span>
  );
}

const SOCIAL_BUTTONS = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'x', label: 'X', Icon: XIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { key: 'telegram', label: 'Telegram', Icon: TelegramIcon },
  { key: 'website', label: 'Website', Icon: GlobeIcon },
];

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.49 2.49 0 1 1-.02 4.98 2.49 2.49 0 0 1 .02-4.98zM3 9h4v12H3zM9 9h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.04 15.51l-.38 5.4c.54 0 .78-.23 1.06-.5l2.55-2.44 5.28 3.87c.97.53 1.66.25 1.92-.9l3.48-16.3c.31-1.44-.52-2.02-1.47-1.66L1.4 10.63c-1.42.55-1.4 1.34-.24 1.7l5.22 1.62L18.5 6.4c.57-.37 1.08-.17.66.2z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.25 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.01l-2.2 2.21z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function VerifiedTick() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.5 14.7 4l3.6-.3 1 3.5 3 1.9-1.6 3.3 1.6 3.3-3 1.9-1 3.5-3.6-.3L12 22.5 9.3 20l-3.6.3-1-3.5-3-1.9L3.3 12 1.7 8.6l3-1.9 1-3.5L9.3 4 12 1.5Zm4.3 7.6-1.4-1.4-5 5-2.2-2.2-1.4 1.4 3.6 3.6 6.4-6.4Z" />
    </svg>
  );
}
