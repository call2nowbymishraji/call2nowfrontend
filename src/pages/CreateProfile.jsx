import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ImageInput from '../components/ImageInput.jsx';
import ImageCropper from '../components/ImageCropper.jsx';
import profileService from '../services/profileService.js';
import categoryService from '../services/categoryService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CATEGORIES } from '../utils/categories.js';
import { slugify } from '../utils/slugify.js';
import { assetUrl, errMsg } from '../services/api.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_GALLERY = 9;
const MAX_PRODUCTS = 10;
const MAX_DESC_WORDS = 500;

const emptyProduct = () => ({ name: '', price: '', discountedPrice: '', description: '', imageFile: null, imagePath: null });

const wordCount = (t = '') => t.trim().split(/\s+/).filter(Boolean).length;

export default function CreateProfile() {
  const [params] = useSearchParams();
  const editMode = params.get('edit') === '1';
  const { markProfileCreated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(editMode);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileId, setProfileId] = useState(null);

  const [f, setF] = useState({
    category: '',
    customCategory: '',
    shopName: '',
    ownerName: '',
    phone: '',
    whatsappSame: true,
    whatsapp: '',
    email: user?.email || '',
    address: '',
    inMarketSince: '',
    description: '',
    gst: '',
    mapUrl: '',
    instagram: '',
    facebook: '',
    telegram: '',
    whatsappUrl: '',
    website: '',
    x: '',
    linkedin: '',
    onlineDelivery: false,
    panIndia: false,
    openAllDays: true,
    operationDays: [...DAYS],
    operationOpen: '09:00',
    operationClose: '21:00',
  });
  const [catQuery, setCatQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [cats, setCats] = useState(CATEGORIES);
  const [shopImageFile, setShopImageFile] = useState(null);
  const [shopImagePath, setShopImagePath] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePath, setCoverImagePath] = useState(null);
  const [gallery, setGallery] = useState([]); // { id, file?, path? }
  const [cropQueue, setCropQueue] = useState([]);
  const [products, setProducts] = useState([emptyProduct()]);
  const gid = useRef(0);
  const galleryRef = useRef([]);
  const updateGallery = (next) => {
    galleryRef.current = next;
    setGallery(next);
  };

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((s) => {
      const next = { ...s, [k]: v };
      if (k === 'whatsappSame' && v) next.whatsapp = next.phone;
      if (k === 'phone' && s.whatsappSame) next.whatsapp = v;
      if (k === 'openAllDays') next.operationDays = v ? [...DAYS] : [];
      return next;
    });
  };

  useEffect(() => {
    categoryService
      .list()
      .then((list) => list.length && setCats(list))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editMode) return;
    Promise.all([profileService.mine(), categoryService.list().catch(() => [])])
      .then(([d, list]) => {
        const known = list.length ? list : CATEGORIES;
        setCats(known);
        const p = d.profile;
        setProfileId(p._id);
        setF((s) => ({
          ...s,
          category: known.includes(p.category) ? p.category : 'Other',
          customCategory: p.category === 'Other' ? p.customCategory || '' : known.includes(p.category) ? '' : p.category,
          shopName: p.shopName,
          ownerName: p.ownerName,
          phone: p.phone,
          whatsapp: p.whatsapp,
          whatsappSame: p.whatsapp === p.phone,
          email: p.email,
          address: p.address,
          inMarketSince: p.inMarketSince || '',
          description: p.description || '',
          gst: p.gst || '',
          mapUrl: p.mapUrl || '',
          instagram: p.instagram || '',
          facebook: p.facebook || '',
          telegram: p.telegram || '',
          whatsappUrl: p.whatsappUrl || '',
          website: p.website || '',
          x: p.x || '',
          linkedin: p.linkedin || '',
          onlineDelivery: p.onlineDelivery,
          panIndia: p.panIndia,
          openAllDays: p.operationDays?.length === 7,
          operationDays: p.operationDays?.length ? p.operationDays : [...DAYS],
          operationOpen: p.operationOpen || '09:00',
          operationClose: p.operationClose || '21:00',
        }));
        setShopImagePath(p.shopImage || null);
        setCoverImagePath(p.coverImage || null);
        updateGallery((p.gallery || []).slice(0, MAX_GALLERY).map((path) => ({ id: ++gid.current, path })));
        setProducts(
          (p.products || []).map((pr) => ({
            name: pr.name,
            price: pr.price ?? '',
            discountedPrice: pr.discountedPrice ?? '',
            description: pr.description,
            imageFile: null,
            imagePath: pr.image || null,
          }))
        );
      })
      .catch((e) => toast(errMsg(e), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  useEffect(() => {
    if (user?.role === 'admin') navigate('/', { replace: true });
  }, [user, navigate]);

  const effectiveCategory = f.category === 'Other' ? f.customCategory.trim() : f.category;
  const slug = slugify(f.shopName);
  const catSuggestions = useMemo(() => {
    const q = catQuery.toLowerCase();
    return cats.filter((c) => c.toLowerCase().includes(q));
  }, [catQuery, cats]);

  const setProduct = (i, k, v) =>
    setProducts((ps) => ps.map((p, j) => (j === i ? { ...p, [k]: v } : p)));

  const addGallery = (files) => {
    const valid = (Array.isArray(files) ? files : [files]).filter(Boolean);
    if (!valid.length) return;
    const room = MAX_GALLERY - galleryRef.current.length;
    if (room <= 0) return toast(`Only ${MAX_GALLERY} gallery photos can be uploaded`, 'error');
    const accepted = valid.slice(0, room);
    if (valid.length > room)
      toast(`Only ${MAX_GALLERY} gallery photos allowed. ${valid.length - room} extra photo(s) were not added`, 'error');
    if (accepted.length) setCropQueue((q) => [...q, ...accepted]);
  };

  const validate = () => {
    const e = {};
    if (!effectiveCategory) e.category = 'Select or enter a category';
    if (f.shopName.trim().length < 2) e.shopName = 'Shop / business name is required';
    if (f.ownerName.trim().length < 2) e.ownerName = 'Owner name is required';
    if (!/^\d{10}$/.test(f.phone.replace(/\D/g, ''))) e.phone = '10-digit phone number required';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Valid email required';
    if (f.address.trim().length < 8) e.address = 'Full address is required';
    if (!products.length) e.products = 'At least 1 product is compulsory';
    products.forEach((p, i) => {
      if (!p.name.trim()) e[`p${i}name`] = 'Product name is required';
      if (!p.description.trim()) e[`p${i}desc`] = 'Product description is required';
      else if (wordCount(p.description) > MAX_DESC_WORDS) e[`p${i}desc`] = `Max ${MAX_DESC_WORDS} words`;
    });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('category', f.category === 'Other' ? 'Other' : f.category);
      if (f.category === 'Other') fd.append('customCategory', f.customCategory.trim());
      [
        'shopName',
        'ownerName',
        'phone',
        'whatsapp',
        'email',
        'address',
        'description',
        'gst',
        'mapUrl',
        'instagram',
        'facebook',
        'telegram',
        'whatsappUrl',
        'website',
        'x',
        'linkedin',
        'operationOpen',
        'operationClose',
      ].forEach((k) => fd.append(k, f[k]));
      if (f.inMarketSince) fd.append('inMarketSince', f.inMarketSince);
      fd.append('onlineDelivery', f.onlineDelivery);
      fd.append('panIndia', f.panIndia);
      fd.append('operationDays', JSON.stringify(f.operationDays));
      fd.append(
        'products',
        JSON.stringify(
          products.map((p, i) => ({
            name: p.name.trim(),
            price: p.price === '' ? null : Number(p.price),
            discountedPrice: p.discountedPrice === '' ? null : Number(p.discountedPrice),
            description: p.description.trim(),
            image: p.imagePath,
            imageField: p.imageFile ? `productImage_${i}` : null,
          }))
        )
      );
      fd.append('keepGallery', JSON.stringify(gallery.filter((g) => g.path).map((g) => g.path)));
      if (shopImageFile) fd.append('shopImage', shopImageFile);
      else if (shopImagePath) fd.append('keepShopImage', shopImagePath);
      if (coverImageFile) fd.append('coverImage', coverImageFile);
      else if (coverImagePath) fd.append('keepCoverImage', coverImagePath);
      gallery.filter((g) => g.file).forEach((g) => fd.append('gallery', g.file));
      products.forEach((p, i) => {
        if (p.imageFile) fd.append(`productImage_${i}`, p.imageFile);
      });

      const res = editMode ? await profileService.update(profileId, fd) : await profileService.create(fd);
      markProfileCreated(res.profile.pageSlug);
      toast(editMode ? 'Profile updated' : 'Business profile created!');
      navigate(`/b/${res.profile.pageSlug}`);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (user?.role === 'admin') return null;

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-primary" />
      </div>
    );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900">{editMode ? 'Edit your profile' : 'Create your profile'}</h1>
        <p className="mt-1 text-sm text-slate-500">This information builds your public business page on Call2Now.</p>

        <form onSubmit={submit} className="mt-8 space-y-8" noValidate>
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="border-b border-slate-100 pb-3 text-sm font-extrabold uppercase tracking-wider text-slate-700">
              Business information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <label className="label">Category *</label>
                <input
                  className="input"
                  placeholder="Search category..."
                  value={catOpen ? catQuery : f.category === 'Other' ? 'Other' : f.category}
                  onFocus={() => {
                    setCatOpen(true);
                    setCatQuery('');
                  }}
                  onChange={(e) => {
                    setCatQuery(e.target.value);
                    setF((s) => ({ ...s, category: e.target.value, customCategory: '' }));
                  }}
                />
                {catOpen && (
                  <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-card">
                    {catSuggestions.map((c) => (
                      <button
                        type="button"
                        key={c}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-50"
                        onClick={() => {
                          setF((s) => ({ ...s, category: c, customCategory: '' }));
                          setCatOpen(false);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm font-semibold text-primary hover:bg-blue-50"
                      onClick={() => {
                        setF((s) => ({ ...s, category: 'Other' }));
                        setCatOpen(false);
                      }}
                    >
                      + Others / custom category
                    </button>
                  </div>
                )}
                {f.category === 'Other' && (
                  <input
                    className="input mt-2"
                    placeholder="Enter your custom category *"
                    value={f.customCategory}
                    onChange={(e) => setF((s) => ({ ...s, customCategory: e.target.value }))}
                  />
                )}
                {errors.category && <p className="err">{errors.category}</p>}
              </div>
              <div>
                <label className="label">Shop / Business name *</label>
                <input className="input" value={f.shopName} onChange={set('shopName')} placeholder="e.g. Sharma Vegetables" />
                {errors.shopName && <p className="err">{errors.shopName}</p>}
                {slug && (
                  <p className="mt-1 text-xs text-slate-400">
                    Your page URL: <span className="font-semibold text-primary">call2now.in/b/{slug}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="label">Owner name *</label>
                <input className="input" value={f.ownerName} onChange={set('ownerName')} />
                {errors.ownerName && <p className="err">{errors.ownerName}</p>}
              </div>
              <div>
                <label className="label">Phone number *</label>
                <input className="input" inputMode="numeric" value={f.phone} onChange={set('phone')} placeholder="10-digit mobile" />
                {errors.phone && <p className="err">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">WhatsApp number</label>
                <input className="input" inputMode="numeric" value={f.whatsapp} onChange={set('whatsapp')} disabled={f.whatsappSame} />
                <label className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" className="accent-primary" checked={f.whatsappSame} onChange={set('whatsappSame')} />
                  Same as phone number
                </label>
              </div>
              <div>
                <label className="label">Email ID *</label>
                <input className="input" type="email" value={f.email} onChange={set('email')} />
                {errors.email && <p className="err">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address *</label>
                <textarea className="input" rows={2} value={f.address} onChange={set('address')} placeholder="Shop no, street, area, city" />
                {errors.address && <p className="err">{errors.address}</p>}
              </div>
              <div>
                <label className="label">In market since (optional)</label>
                <select className="input" value={f.inMarketSince} onChange={set('inMarketSince')}>
                  <option value="">Prefer not to say</option>
                  {Array.from({ length: 51 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">GST number</label>
                <input className="input" value={f.gst} onChange={set('gst')} placeholder="Optional" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Profile description</label>
                <textarea className="input" rows={3} value={f.description} onChange={set('description')} placeholder="What does your business offer?" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Map location URL</label>
                <input className="input" value={f.mapUrl} onChange={set('mapUrl')} placeholder="https://maps.google.com/..." />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Social links (all optional)</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="input" value={f.instagram} onChange={set('instagram')} placeholder="Instagram URL" />
                  <input className="input" value={f.facebook} onChange={set('facebook')} placeholder="Facebook URL" />
                  <input className="input" value={f.whatsappUrl} onChange={set('whatsappUrl')} placeholder="WhatsApp URL" />
                  <input className="input" value={f.x} onChange={set('x')} placeholder="X (Twitter) URL" />
                  <input className="input" value={f.linkedin} onChange={set('linkedin')} placeholder="LinkedIn URL" />
                  <input className="input" value={f.telegram} onChange={set('telegram')} placeholder="Telegram URL" />
                  <input className="input" value={f.website} onChange={set('website')} placeholder="Website URL" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Cover picture (landscape)</label>
                <ImageInput
                  shape="landscape"
                  cropAspect={16 / 9}
                  label="Upload cover picture"
                  value={coverImageFile}
                  preview={coverImagePath}
                  onChange={(file) => {
                    setCoverImageFile(file);
                    if (file) setCoverImagePath(null);
                  }}
                />
              </div>
              <div>
                <label className="label">Profile picture (portrait)</label>
                <ImageInput
                  shape="portrait"
                  cropAspect={3 / 4}
                  cropRadius="rounded-2xl"
                  label="Upload profile picture"
                  value={shopImageFile}
                  preview={shopImagePath}
                  onChange={(file) => {
                    setShopImageFile(file);
                    if (file) setShopImagePath(null);
                  }}
                />
              </div>
              <div className="space-y-3">
                <label className="label">Do we offer online delivery?</label>
                <div className="flex gap-4 text-sm font-semibold text-slate-600">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="od" className="accent-primary" checked={f.onlineDelivery} onChange={() => setF((s) => ({ ...s, onlineDelivery: true }))} />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="od" className="accent-primary" checked={!f.onlineDelivery} onChange={() => setF((s) => ({ ...s, onlineDelivery: false }))} />
                    No
                  </label>
                </div>
                <label className="label !mb-0">Delivery available pan India?</label>
                <div className="flex gap-4 text-sm font-semibold text-slate-600">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pi" className="accent-primary" checked={f.panIndia} onChange={() => setF((s) => ({ ...s, panIndia: true }))} />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pi" className="accent-primary" checked={!f.panIndia} onChange={() => setF((s) => ({ ...s, panIndia: false }))} />
                    No
                  </label>
                </div>
              </div>
              <div>
                <label className="label">Operation days</label>
                <label className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <input type="checkbox" className="accent-primary" checked={f.openAllDays} onChange={set('openAllDays')} />
                  Open all days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      disabled={f.openAllDays}
                      onClick={() =>
                        setF((s) => ({
                          ...s,
                          operationDays: s.operationDays.includes(d) ? s.operationDays.filter((x) => x !== d) : [...s.operationDays, d],
                        }))
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                        f.operationDays.includes(d) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Operation timing</label>
                <div className="flex items-center gap-2">
                  <input type="time" className="input" value={f.operationOpen} onChange={set('operationOpen')} />
                  <span className="text-slate-400">to</span>
                  <input type="time" className="input" value={f.operationClose} onChange={set('operationClose')} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">Gallery</h2>
              <span className="text-xs font-semibold text-slate-400">{gallery.length}/{MAX_GALLERY} photos</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="relative">
                  <img src={g.file ? URL.createObjectURL(g.file) : assetUrl(g.path)} alt="gallery" className="aspect-[3/4] w-full rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => updateGallery(gallery.filter((x) => x.id !== g.id))}
                    className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-gred text-xs font-bold text-white shadow"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {gallery.length < MAX_GALLERY && (
                <AddTile onClick={() => document.getElementById('gallery-input')?.click()} label="+ Add photo" />
              )}
              <input
                id="gallery-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addGallery(Array.from(e.target.files || []));
                  e.target.value = '';
                }}
              />
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">Products</h2>
              <span className="text-xs font-semibold text-slate-400">{products.length}/{MAX_PRODUCTS} · 1 compulsory</span>
            </div>
            {errors.products && <p className="err">{errors.products}</p>}
            {products.map((p, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-600">Product {i + 1}</h3>
                  {products.length > 1 && (
                    <button type="button" className="text-xs font-semibold text-gred hover:underline" onClick={() => setProducts((ps) => ps.filter((_, j) => j !== i))}>
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <input className="input" placeholder="Product name *" value={p.name} onChange={(e) => setProduct(i, 'name', e.target.value)} />
                    {errors[`p${i}name`] && <p className="err">{errors[`p${i}name`]}</p>}
                  </div>
                  <input className="input" type="number" min="0" placeholder="Price (₹)" value={p.price} onChange={(e) => setProduct(i, 'price', e.target.value)} />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="Discounted price (₹)"
                    value={p.discountedPrice}
                    onChange={(e) => setProduct(i, 'discountedPrice', e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Product description * (up to 500 words)"
                      value={p.description}
                      onChange={(e) => setProduct(i, 'description', e.target.value)}
                    />
                    <div className="mt-1 flex justify-between">
                      {errors[`p${i}desc`] ? <p className="err">{errors[`p${i}desc`]}</p> : <span />}
                      <span className={`text-xs ${wordCount(p.description) > MAX_DESC_WORDS ? 'font-bold text-gred' : 'text-slate-400'}`}>
                        {wordCount(p.description)}/{MAX_DESC_WORDS} words
                      </span>
                    </div>
                  </div>
                  <ImageInput
                    shape="tall"
                    cropAspect={4 / 5}
                    label="Product image"
                    value={p.imageFile}
                    preview={p.imagePath}
                    onChange={(file) => {
                      setProduct(i, 'imageFile', file);
                      if (file) setProduct(i, 'imagePath', null);
                    }}
                  />
                </div>
              </div>
            ))}
            {products.length < MAX_PRODUCTS && (
              <button type="button" className="btn-outline w-full !py-2.5 text-sm" onClick={() => setProducts((ps) => [...ps, emptyProduct()])}>
                + Add product
              </button>
            )}
          </section>

          <div className="flex items-center justify-end gap-3 pb-6">
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Saving...' : editMode ? 'Update profile' : 'Create profile'}
            </button>
          </div>
        </form>
      </main>
      {cropQueue.length > 0 && (
        <ImageCropper
          file={cropQueue[0]}
          aspect={3 / 4}
          radius="rounded-xl"
          onCancel={() => setCropQueue((q) => q.slice(1))}
          onConfirm={(cf) => {
            updateGallery([...galleryRef.current, { id: ++gid.current, file: cf }]);
            setCropQueue((q) => q.slice(1));
          }}
        />
      )}
    </div>
  );
}

function AddTile({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid aspect-[3/4] w-full place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400 transition hover:border-primary hover:text-primary"
    >
      {label}
    </button>
  );
}
