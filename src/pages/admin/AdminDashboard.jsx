import { useCallback, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import ImageInput from '../../components/ImageInput.jsx';
import adminService from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { assetUrl, errMsg } from '../../services/api.js';

const TENURES = [
  [0, 'No free promotion'],
  [30, '30 days free'],
  [60, '60 days free'],
  [365, '1 year paid subscription'],
  [36500, 'Lifetime paid subscription'],
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('profiles');
  const [profiles, setProfiles] = useState([]);
  const [slides, setSlides] = useState([]);
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [featuredLive, setFeaturedLive] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', profileId: '', imageFile: null });
  const [adForm, setAdForm] = useState({ title: '', subtitle: '', ctaText: '', linkUrl: '', placement: 'popup', imageFile: null });

  const load = useCallback(() => {
    adminService.listProfiles().then((d) => setProfiles(d.profiles || [])).catch(() => {});
    adminService.listSlides().then((d) => setSlides(d.slides || [])).catch(() => {});
    adminService.listAds().then((d) => setAds(d.ads || [])).catch(() => {});
    adminService.getSettings().then((d) => setFeaturedLive(!!d.settings?.featuredLive)).catch(() => {});
    adminService.listCategories().then((d) => setCategories(d.categories || [])).catch(() => {});
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

  const createAd = async (e) => {
    e.preventDefault();
    if (!adForm.title.trim()) return toast('Ad title required', 'error');
    const fd = new FormData();
    fd.append('title', adForm.title);
    fd.append('subtitle', adForm.subtitle);
    fd.append('ctaText', adForm.ctaText);
    fd.append('linkUrl', adForm.linkUrl);
    fd.append('placement', adForm.placement);
    if (adForm.imageFile) fd.append('image', adForm.imageFile);
    await run(() => adminService.createAd(fd), 'Ad created');
    setAdForm({ title: '', subtitle: '', ctaText: '', linkUrl: '', placement: 'popup', imageFile: null });
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (catName.trim().length < 2) return toast('Category name is too short', 'error');
    await run(() => adminService.addCategory(catName.trim()), 'Category added');
    setCatName('');
  };

  const saveCategoryRename = async (id) => {
    const name = (editingCat?.name || '').trim();
    if (name.length < 2) return toast('Category name is too short', 'error');
    await run(() => adminService.renameCategory(id, name), 'Category renamed, profiles updated');
    setEditingCat(null);
  };

  const deleteCategory = async (cat) => {
    const extra = cat.profiles
      ? ` ${cat.profiles} profile(s) currently use it. Their pages keep the label, but it will disappear from pickers and filters.`
      : '';
    if (!window.confirm(`Delete category "${cat.name}"?${extra}`)) return;
    await run(() => adminService.deleteCategory(cat._id), 'Category deleted');
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
            ['ads', 'Advertisements'],
            ['categories', 'Categories'],
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
                      {TENURES.map(([d, label]) => (
                        <option key={d} value={d}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button className="btn-outline !py-2 text-sm" onClick={() => setExpanded(expanded === p._id ? null : p._id)}>
                      {expanded === p._id ? 'Hide products' : 'Products'}
                    </button>
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                        p.verified
                          ? 'bg-ggreen text-white shadow-pill'
                          : 'bg-white text-slate-600 shadow-pill hover:text-ggreen'
                      }`}
                      disabled={busy}
                      title="Verify this profile once the owner contacts you on WhatsApp"
                      onClick={() =>
                        run(
                          () => adminService.setVerified(p._id, !p.verified),
                          p.verified ? 'Verification removed' : 'Profile verified'
                        )
                      }
                    >
                      {p.verified ? '✓ Verified' : 'Verify'}
                    </button>
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                        p.suggested
                          ? 'bg-primary text-white shadow-pill'
                          : 'bg-white text-slate-600 shadow-pill hover:text-primary'
                      }`}
                      disabled={busy}
                      title="Show this profile in 'Suggested by us' on the home page"
                      onClick={() =>
                        run(
                          () => adminService.setSuggested(p._id, !p.suggested),
                          p.suggested ? 'Removed from suggested' : 'Added to suggested'
                        )
                      }
                    >
                      {p.suggested ? '★ Suggested' : '☆ Suggest'}
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
          <div className="mt-6 space-y-6">
            <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="font-bold text-slate-800">Featured businesses section</h2>
                <p className="mt-0.5 text-xs text-slate-500">Show or hide the featured slider on the home page.</p>
              </div>
              <button
                disabled={busy}
                onClick={() => run(() => adminService.setSettings(!featuredLive), featuredLive ? 'Featured section hidden' : 'Featured section is live')}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  featuredLive ? 'bg-ggreen text-white shadow-pill' : 'bg-slate-200 text-slate-600 shadow-pill hover:bg-slate-300'
                }`}
              >
                {featuredLive ? '● Live on home page' : '○ Hidden from home page'}
              </button>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
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
          </div>
        )}

        {tab === 'ads' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <form onSubmit={createAd} className="card space-y-3 p-6">
              <h2 className="section-title">Add advertisement</h2>
              <input className="input" placeholder="Title *" value={adForm.title} onChange={(e) => setAdForm((s) => ({ ...s, title: e.target.value }))} />
              <input className="input" placeholder="Subtitle / offer text" value={adForm.subtitle} onChange={(e) => setAdForm((s) => ({ ...s, subtitle: e.target.value }))} />
              <input className="input" placeholder="Button text (e.g. Shop now)" value={adForm.ctaText} onChange={(e) => setAdForm((s) => ({ ...s, ctaText: e.target.value }))} />
              <input className="input" placeholder="Link URL (https://...)" value={adForm.linkUrl} onChange={(e) => setAdForm((s) => ({ ...s, linkUrl: e.target.value }))} />
              <select className="input" value={adForm.placement} onChange={(e) => setAdForm((s) => ({ ...s, placement: e.target.value }))}>
                <option value="popup">Home page popup</option>
                <option value="left">Left side</option>
                <option value="right">Right side</option>
              </select>
              <ImageInput
                shape="box"
                label="Ad image"
                value={adForm.imageFile}
                cropAspect={adForm.placement === 'popup' ? 8 / 5 : 9 / 16}
                onChange={(file) => setAdForm((s) => ({ ...s, imageFile: file }))}
              />
              <button type="submit" disabled={busy} className="btn-primary w-full">
                Add ad
              </button>
            </form>
            <div className="card divide-y divide-slate-100 lg:col-span-2">
              {ads.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No ads yet.</p>}
              {ads.map((a) => (
                <div key={a._id} className="flex items-center gap-4 p-4">
                  {a.image ? (
                    <img src={assetUrl(a.image)} alt={a.title} className="h-14 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="grid h-14 w-20 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">AD</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800">{a.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {a.placement} · {a.subtitle || 'No subtitle'}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={a.active}
                      disabled={busy}
                      onChange={(e) => run(() => adminService.toggleAd(a._id, e.target.checked), a.active ? 'Ad hidden' : 'Ad live')}
                    />
                    Live
                  </label>
                  <button
                    className="text-xs font-bold text-gred hover:underline"
                    disabled={busy}
                    onClick={() => run(() => adminService.deleteAd(a._id), 'Ad deleted')}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div className="mt-6 space-y-6">
            <form onSubmit={addCategory} className="card flex flex-wrap items-center gap-3 p-5">
              <input
                className="input flex-1"
                placeholder="New category name (e.g. Toys & Gifts)"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
              <button type="submit" disabled={busy} className="btn-primary">
                Add category
              </button>
            </form>
            <div className="card divide-y divide-slate-100">
              {categories.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No categories yet.</p>}
              {categories.map((c) => (
                <div key={c._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  {editingCat?.id === c._id ? (
                    <>
                      <input
                        className="input flex-1"
                        value={editingCat.name}
                        onChange={(e) => setEditingCat({ id: c._id, name: e.target.value })}
                      />
                      <button className="btn-primary !py-2 text-sm" disabled={busy} onClick={() => saveCategoryRename(c._id)}>
                        Save
                      </button>
                      <button className="btn-outline !py-2 text-sm" onClick={() => setEditingCat(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-bold text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-500">
                          {c.profiles} profile{c.profiles === 1 ? '' : 's'} using this
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-outline !py-2 text-sm" onClick={() => setEditingCat({ id: c._id, name: c.name })}>
                          Rename
                        </button>
                        <button
                          className="rounded-xl bg-gred/10 px-4 py-2 text-sm font-bold text-gred transition hover:bg-gred/20"
                          disabled={busy}
                          onClick={() => deleteCategory(c)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Users always keep the "Others / custom category" option on the profile form, so they can type a category of
              their own even if it is not listed here. Renaming a category also updates every profile that uses the old
              name. Deleting removes the option from pickers and filters, but existing profiles keep showing their label.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
