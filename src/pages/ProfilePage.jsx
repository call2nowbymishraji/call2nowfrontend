import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
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
          {ownerMode && (
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
  const wa = `https://wa.me/91${(profile.whatsapp || profile.phone || '').replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-b-3xl shadow-card">
          <div className={`h-44 sm:h-56 ${p.bg}`}>
            {banner && <img src={banner} alt={profile.shopName} className="h-full w-full object-cover" />}
          </div>
          <div className="bg-white px-6 pb-6">
            <div className={`-mt-8 grid h-16 w-16 place-items-center rounded-full ${p.avatar} text-lg font-extrabold text-white ring-4 ring-white`}>
              {initialsOf(profile.shopName)}
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{profile.shopName}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  <span className={`chip ${p.chip}`}>{profile.category === 'Other' ? profile.customCategory : profile.category}</span>
                  <span className="ml-2">{profile.address}</span>
                </p>
              </div>
              {isOwner && (
                <Link to="/create-profile?edit=1" className="btn-outline !py-2 text-sm">
                  Edit profile
                </Link>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:+91${profile.phone}`} className="btn-primary !py-2 text-sm">
                📞 Call now
              </a>
              <a href={wa} target="_blank" rel="noreferrer" className="btn-outline !py-2 text-sm !text-ggreen">
                WhatsApp
              </a>
              <a href={`mailto:${profile.email}`} className="btn-outline !py-2 text-sm">
                ✉️ Email
              </a>
              {profile.mapUrl && (
                <a href={profile.mapUrl} target="_blank" rel="noreferrer" className="btn-outline !py-2 text-sm">
                  📍 Get directions
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {profile.description && (
              <section className="card p-6">
                <h2 className="section-title">About</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{profile.description}</p>
              </section>
            )}
            <section className="card p-6">
              <h2 className="section-title">Products ({profile.products?.length || 0})</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(profile.products || []).map((pr) => {
                  const img = assetUrl(pr.image);
                  const off =
                    pr.price && pr.discountedPrice ? Math.round(((pr.price - pr.discountedPrice) / pr.price) * 100) : 0;
                  return (
                    <div key={pr._id} className="overflow-hidden rounded-xl border border-slate-100">
                      {img && <img src={img} alt={pr.name} className="h-36 w-full object-cover" />}
                      <div className="p-4">
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
                })}
              </div>
            </section>
            {(profile.gallery || []).length > 0 && (
              <section className="card p-6">
                <h2 className="section-title">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {profile.gallery.map((g, i) => (
                    <img key={i} src={assetUrl(g)} alt={`${profile.shopName} ${i + 1}`} className="h-28 w-full rounded-xl object-cover" />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="card divide-y divide-slate-100 text-sm">
              <InfoRow label="Owner" value={profile.ownerName} />
              <InfoRow label="Phone" value={profile.phone} />
              <InfoRow label="WhatsApp" value={profile.whatsapp} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="In market since" value={profile.inMarketSince} />
              <InfoRow label="Operation days" value={profile.operationDays?.join(', ') || '—'} />
              <InfoRow label="Timing" value={`${profile.operationOpen || '—'} to ${profile.operationClose || '—'}`} />
              {profile.gst && <InfoRow label="GST" value={profile.gst} />}
              <InfoRow label="Page URL" value={`call2now.in/b/${profile.pageSlug}`} />
            </section>
            <section className="card space-y-2 p-5 text-sm font-semibold">
              <Badge on={profile.onlineDelivery} yes="Online delivery available" no="No online delivery" />
              <Badge on={profile.panIndia} yes="Delivery pan India" no="Local delivery only" />
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 px-5 py-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-semibold text-slate-700">{value || '—'}</span>
    </div>
  );
}

function Badge({ on, yes, no }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${on ? 'bg-ggreen/10 text-ggreen' : 'bg-slate-100 text-slate-400'}`}>
      <span>{on ? '✓' : '✕'}</span>
      {on ? yes : no}
    </div>
  );
}
