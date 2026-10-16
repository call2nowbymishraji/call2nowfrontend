import { useCallback, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import adminService from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { assetUrl, errMsg } from '../../services/api.js';

const TENURES = [0, 30, 60];

export default function AdminDashboard() {
  const [tab, setTab] = useState('profiles');
  const [profiles, setProfiles] = useState([]);
  const [slides, setSlides] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', profileId: '', imageFile: null });

  const load = useCallback(() => {
    adminService.listProfiles().then((d) => setProfiles(d.profiles || [])).catch(() => {});
    adminService.listSlides().then((d) => setSlides(d.slides || [])).catch(() => {});
  }, []);

  useEffect(load, [load]);

  const run = async (fn, msg) => {
    setBusy(true);
    try {
      await fn();
      toast(msg);
      load();
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const createSlide = async (e) => {
    e.preventDefault();
    if (!slideForm.title.trim()) return toast('Slide title required', 'error');
    const fd = new FormData();
    fd.append('title', slideForm.title);
    fd.append('subtitle', slideForm.subtitle);
    if (slideForm.profileId) fd.append('profileId', slideForm.profileId);
    if (slideForm.imageFile) fd.append('image', slideForm.imageFile);
    await run(() => adminService.createSlide(fd), 'Slide added to front page');
    setSlideForm({ title: '', subtitle: '', profileId: '', imageFile: null });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage promotions, profiles and products.</p>

        <div className="mt-6 flex gap-2">
          {[
            ['profiles', 'Profiles & products'],
            ['slides', 'Front-page slider'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                tab === k ? 'bg-primary text-white shadow-pill' : 'bg-white text-slate-600 shadow-pill hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'profiles' && (
          <div className="card mt-6 divide-y divide-slate-100">
            {profiles.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No profiles yet.</p>}
            {profiles.map((p) => (
              <div key={p._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{p.shopName}</h3>
                    <p className="text-xs text-slate-500">
                      {p.category === 'Other' ? p.customCategory : p.category} · {p.email} · {p.products?.length || 0} products
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gyellow">
                      Promotion: {p.promo?.days || 0} days free
                      {p.promo?.days > 0 && p.promo?.startDate
                        ? ` (since ${new Date(p.promo.startDate).toLocaleDateString()})`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="input !w-auto !py-2 text-sm"
                      value={p.promo?.days || 0}
                      disabled={busy}
                      onChange={(e) => run(() => adminService.setTenure(p._id, Number(e.target.value)), 'Promotion tenure updated')}
                    >
                      {TENURES.map((d) => (
                        <option key={d} value={d}>
                          {d === 0 ? 'No free promotion' : `${d} days free`}
                        </option>
                      ))}
                    </select>
                    <button className="btn-outline !py-2 text-sm" onClick={() => setExpanded(expanded === p._id ? null : p._id)}>
                      {expanded === p._id ? 'Hide products' : 'Products'}
                    </button>
                    <button
                      className="rounded-full bg-gred/10 px-4 py-2 text-sm font-semibold text-gred transition hover:bg-gred hover:text-white"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Delete profile "${p.shopName}" permanently?`))
                          run(() => adminService.deleteProfile(p._id), 'Profile deleted');
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {expanded === p._id && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(p.products || []).map((pr) => (
                      <div key={pr._id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        {pr.image && <img src={assetUrl(pr.image)} alt={pr.name} className="h-12 w-12 rounded-lg object-cover" />}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-700">{pr.name}</p>
                          <p className="truncate text-xs text-slate-400">{pr.description}</p>
                        </div>
                        <button
                          className="text-xs font-bold text-gred hover:underline"
                          disabled={busy}
                          title="Remove unethical product"
                          onClick={() => run(() => adminService.removeProduct(p._id, pr._id), 'Product removed')}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'slides' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <form onSubmit={createSlide} className="card space-y-3 p-6">
              <h2 className="section-title">Add promotion slide</h2>
              <input className="input" placeholder="Title *" value={slideForm.title} onChange={(e) => setSlideForm((s) => ({ ...s, title: e.target.value }))} />
              <input className="input" placeholder="Subtitle" value={slideForm.subtitle} onChange={(e) => setSlideForm((s) => ({ ...s, subtitle: e.target.value }))} />
              <select className="input" value={slideForm.profileId} onChange={(e) => setSlideForm((s) => ({ ...s, profileId: e.target.value }))}>
                <option value="">No linked profile</option>
                {profiles.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.shopName}
                  </option>
                ))}
              </select>
              <input type="file" accept="image/*" className="input" onChange={(e) => setSlideForm((s) => ({ ...s, imageFile: e.target.files?.[0] || null }))} />
              <button type="submit" disabled={busy} className="btn-primary w-full">
                Add slide
              </button>
            </form>
            <div className="card divide-y divide-slate-100 lg:col-span-2">
              {slides.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No slides yet.</p>}
              {slides.map((s) => (
                <div key={s._id} className="flex items-center gap-4 p-4">
                  {s.image ? (
                    <img src={assetUrl(s.image)} alt={s.title} className="h-14 w-24 rounded-lg object-cover" />
                  ) : (
                    <div className="h-14 w-24 rounded-lg bg-gradient-to-r from-primary to-gblue" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800">{s.title}</p>
                    <p className="truncate text-xs text-slate-500">{s.subtitle || (s.profile ? s.profile.shopName : 'No link')}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={s.active}
                      disabled={busy}
                      onChange={(e) => run(() => adminService.toggleSlide(s._id, e.target.checked), s.active ? 'Slide hidden' : 'Slide live')}
                    />
                    Live
                  </label>
                  <button
                    className="text-xs font-bold text-gred hover:underline"
                    disabled={busy}
                    onClick={() => run(() => adminService.deleteSlide(s._id), 'Slide deleted')}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
