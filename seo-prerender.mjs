// Build step: give every indexable URL a real initial HTML document.
//
//   vite build  ->  node seo-prerender.mjs
//
// The Vite bundle is left untouched; this only rewrites the shell's <head> and puts
// server-side content inside <div id="root">. main.jsx mounts with createRoot().render(),
// so React replaces this markup instead of hydrating it, which means no hydration mismatch
// is possible when the live data differs from what was captured here.
//
// It never fails the build: if the API cannot be reached the static pages are still
// written and the business pages simply render on the client.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PRIVATE_SCREENS,
  homeSeo,
  notFoundSeo,
  privacySeo,
  privateScreenSeo,
  profileSeo,
  searchSeo,
  SEARCH_HEADING,
  termsSeo,
} from './src/seo/pages.js';
import { HOMEPAGE_H1, isReservedSlug } from './src/seo/site.js';
import { DEFAULT_LANG, translate } from './src/i18n/hindi.js';
import { callLink, waLink } from './src/utils/contact.js';

// The first paint uses the same default language the app boots with, so a visitor whose browser
// has no stored choice sees no wording change when React mounts.
const t = (key, vars) => translate(DEFAULT_LANG, key, vars);

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const API_ORIGIN = String(process.env.SEO_API_ORIGIN || 'https://call2nowbackendend.onrender.com').replace(/\/+$/, '');
const LIMIT = Math.max(0, Number.parseInt(process.env.PRERENDER_PROFILES ?? '300', 10) || 0);

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// JSX source is read only to keep the prerendered copy identical to the page React
// renders, instead of maintaining a second copy of the same sentences here.
const flatten = (markup) =>
  markup
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const jsonLdTag = (blocks) => {
  if (!blocks.length) return '';
  const payload = JSON.stringify(blocks.length === 1 ? blocks[0] : blocks).replace(/<\//g, '<\\/');
  return `<script id="c2n-jsonld" type="application/ld+json">${payload}</script>`;
};

const metaTag = (attr, name, content) =>
  content ? `<meta ${attr}="${esc(name)}" content="${esc(content)}">` : '';

// The generated first paint starts with the same block height as the React navbar
// (102px below the sm breakpoint, where the two view pickers get their own row, and 67px above
// it, measured in a real browser), so mounting the app does not push the page down.
const SHELL_NAV_CSS =
  '<style id="c2n-shell-nav">.c2n-shell-nav{display:flex;align-items:flex-start;height:102px;padding:12px 16px 0}' +
  '@media (min-width:640px){.c2n-shell-nav{align-items:center;height:67px;padding:0 16px}}</style>';

function headBlock(seo) {
  const { title, description, canonical, robots, type = 'website', image, imageAlt, jsonLd } = seo;
  return [
    `<title>${esc(title)}</title>`,
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    metaTag('name', 'description', description),
    metaTag('name', 'robots', robots),
    metaTag('property', 'og:title', title),
    metaTag('property', 'og:description', description),
    metaTag('property', 'og:url', canonical),
    metaTag('property', 'og:type', type),
    metaTag('property', 'og:site_name', 'Call2Now'),
    metaTag('property', 'og:image', image),
    metaTag('property', 'og:image:alt', image ? imageAlt : ''),
    metaTag('property', 'og:locale', image ? 'hi_IN' : ''),
    metaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary'),
    metaTag('name', 'twitter:title', title),
    metaTag('name', 'twitter:description', description),
    metaTag('name', 'twitter:image', image),
    jsonLdTag(jsonLd || []),
  ]
    .filter(Boolean)
    .join('\n    ');
}

const SHELL = existsSync(join(DIST, 'index.html'))
  ? readFileSync(join(DIST, 'index.html'), 'utf8')
  : '<!doctype html><html lang="en"><head></head><body><div id="root"></div></body></html>';

// Strip the shell's own homepage defaults first, then add this page's head, so no
// replacement can ever match the tags that were just written.
function buildDocument(seo, bodyHtml) {
  const cleaned = SHELL.replace(/<html([^>]*)>/i, (m, attrs) => `<html${attrs.replace(/\slang="[^"]*"/, '')} lang="${DEFAULT_LANG}">`)
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<link rel="canonical"[^>]*>/i, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/\s*<meta\s+(?:name|property)="(?:og:|twitter:)[^"]*"[^>]*>/gi, '')
    .replace(/\s*<script[^>]*application\/ld\+json[\s\S]*?<\/script>/gi, '');
  const html = cleaned.replace(/<\/head>/i, `${headBlock(seo)}\n    ${SHELL_NAV_CSS}\n  </head>`);
  const withBody = bodyHtml ? html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}\n  </div>`) : html;
  return `${withBody}\n`;
}

function write(relPath, html) {
  const file = join(DIST, relPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html, 'utf8');
}

const mediaUrl = (value) => (/^https?:\/\//i.test(value || '') ? value : value ? `${API_ORIGIN}${value}` : '');

function homeBody(topProfiles) {
  const cards = topProfiles
    .map(
      (p) => `    <li class="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <a class="block text-base font-bold text-slate-900 hover:text-primary" href="/${esc(p.pageSlug)}">${esc(p.shopName)}</a>
      <p class="mt-1 text-sm text-slate-500">${esc([p.categoryLabel, p.locality].filter(Boolean).join(' · '))}</p>
      ${p.description ? `<p class="mt-2 line-clamp-3 text-sm text-slate-600">${esc(p.description)}</p>` : ''}
    </li>`
    )
    .join('\n');
  const listing = topProfiles.length
    ? `<ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">\n${cards}\n  </ul>`
    : `  <p class="mt-4 text-sm text-slate-500">${esc(t('No business profiles are listed yet. Owners can register for free.'))}</p>`;
  return `
<a class="c2n-shell-nav" href="/"><img src="/logo.png" alt="Call2Now" class="h-8 w-auto" /></a>
<main class="mx-auto max-w-4xl px-4 py-10">
  <h1 class="text-2xl font-extrabold text-slate-900 sm:text-3xl">${esc(HOMEPAGE_H1)}</h1>
  <p class="mt-3 text-sm leading-6 text-slate-600">${esc(homeSeo().description)}</p>
  <form class="mt-6 flex flex-col gap-3 sm:flex-row" action="/search" method="get" role="search">
    <label class="sr-only" for="c2n-q">${esc(t('Search businesses by name, product or category'))}</label>
    <input class="input" id="c2n-q" name="q" placeholder="${esc(t('Search anything... (business, product, name)'))}" />
    <label class="sr-only" for="c2n-loc">${esc(t('Location, city, area or pin code'))}</label>
    <input class="input" id="c2n-loc" name="location" placeholder="${esc(t('Location (city / area / pin code)'))}" />
    <button class="btn-primary" type="submit">${esc(t('Search'))}</button>
  </form>
  <p class="mt-4 text-sm leading-6 text-slate-600">
    ${esc(t('Open a business page to see its products and photos, then call, WhatsApp or email the business directly.'))}
    ${esc(t('Business owners can'))} <a class="font-semibold text-primary hover:underline" href="/signup">${esc(t('create a profile'))}</a> ${esc(t('and get discovered in their city.'))}
  </p>
  <h2 class="mt-10 text-lg font-bold text-slate-900">${esc(t('Businesses on Call2Now'))}</h2>
  ${listing}
  <p class="mt-8 text-sm">
    <a class="font-semibold text-primary hover:underline" href="/search">${esc(t('Browse all businesses'))}</a>
    <span class="mx-2 text-slate-300">|</span>
    <a class="font-semibold text-primary hover:underline" href="/privacy">${esc(t('Privacy Policy'))}</a>
    <span class="mx-2 text-slate-300">|</span>
    <a class="font-semibold text-primary hover:underline" href="/terms">${esc(t('Terms of Service'))}</a>
  </p>
</main>`;
}

function contactLinks(profile) {
  const call = callLink(profile);
  const wa = waLink(profile);
  const links = [];
  if (call) links.push(`<a class="font-semibold text-primary" href="${esc(call)}">${esc(t('Call'))} ${esc(profile.phone)}</a>`);
  if (wa) links.push(`<a class="font-semibold text-ggreen" href="${esc(wa)}">${esc(t('WhatsApp'))}</a>`);
  if (profile.email) links.push(`<a class="font-semibold text-slate-700" href="mailto:${esc(profile.email)}">${esc(t('Email'))}</a>`);
  return links.join('\n    <span class="text-slate-300">|</span>\n    ');
}

function profileBody(profile) {
  const category = profile.category === 'Other' ? profile.customCategory : profile.category;
  const address = [profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ');
  const details = [
    [t('Owner'), profile.ownerName],
    [t('Phone'), profile.phone],
    [t('WhatsApp'), profile.whatsapp],
    [t('Email'), profile.email],
    [t('In market since'), profile.inMarketSince],
    [t('Operation days'), (profile.operationDays || []).map((d) => t(d)).join(', ')],
    [
      t('Timing'),
      profile.operationOpen && profile.operationClose ? t('{open} to {close}', { open: profile.operationOpen, close: profile.operationClose }) : '',
    ],
    [t('Online delivery'), profile.onlineDelivery ? t('Available') : ''],
    [t('Delivery area'), profile.panIndia ? t('Pan India') : ''],
    [t('Page URL'), profileSeo(profile).canonical],
  ].filter(([, value]) => value !== '' && value !== null && value !== undefined);
  const gallery = (profile.gallery || []).slice(0, 9).map(mediaUrl).filter(Boolean);
  const products = profile.products || [];

  return `
<a class="c2n-shell-nav" href="/"><img src="/logo.png" alt="${esc(t('Call2Now home'))}" class="h-8 w-auto" /></a>
<main class="mx-auto max-w-4xl px-4 py-10">
  <h1 class="text-2xl font-extrabold text-slate-900 sm:text-3xl">${esc(profile.shopName)}${profile.verified ? ` ${esc(t('(Verified)'))}` : ''}</h1>
  <p class="mt-2 text-sm text-slate-500">${esc([category, address].filter(Boolean).join(' · '))}</p>
  ${
    profile.shopImage
      ? `  <img class="mt-6 w-64 max-w-full rounded-2xl object-cover" src="${esc(mediaUrl(profile.shopImage))}" alt="${esc(profile.shopName)}" />`
      : ''
  }
  <nav class="mt-6 flex flex-wrap gap-4 text-sm">
    ${contactLinks(profile)}
  </nav>
  ${
    profile.description
      ? `  <h2 class="mt-8 text-lg font-bold text-slate-900">${esc(t('About'))}</h2>\n  <p class="mt-2 text-sm leading-6 text-slate-600">${esc(profile.description)}</p>`
      : ''
  }
  ${
    products.length
      ? `  <h2 class="mt-8 text-lg font-bold text-slate-900">${esc(t('Products ({count})', { count: products.length }))}</h2>
  <ul class="mt-3 grid gap-3 sm:grid-cols-2">
    ${products
      .map((pr) => {
        const discounted = pr.discountedPrice != null;
        const regular = pr.price != null;
        const price = [
          discounted ? `<span class="font-bold text-slate-900">₹${esc(pr.discountedPrice)} </span>` : '',
          regular && discounted
            ? `<span class="text-xs text-slate-400 line-through">₹${esc(pr.price)}</span>`
            : regular
              ? `<span class="font-bold text-slate-900">₹${esc(pr.price)}</span>`
              : '',
        ].join('');
        return `    <li class="rounded-xl border border-slate-100 p-4">
      <h3 class="font-bold text-slate-800">${esc(pr.name)}</h3>
      ${price ? `<p class="mt-1 text-sm">${price}</p>` : ''}
      <p class="mt-1 text-xs text-slate-500">${esc(pr.description)}</p>
    </li>`;
      })
      .join('\n')}
  </ul>`
      : ''
  }
  ${
    gallery.length
      ? `  <h2 class="mt-8 text-lg font-bold text-slate-900">${esc(t('Photos ({count})', { count: gallery.length }))}</h2>
  <ul class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
    ${gallery
      .map(
        (src, i) =>
          `    <li><img class="aspect-[3/4] w-full rounded-xl object-cover" src="${esc(src)}" alt="${esc(`${profile.shopName} ${t('Gallery')} ${i + 1}`)}" /></li>`
      )
      .join('\n')}
  </ul>`
      : ''
  }
  <h2 class="mt-8 text-lg font-bold text-slate-900">${esc(t('Business details'))}</h2>
  <dl class="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
    ${details.map(([label, value]) => `<div><dt class="text-xs font-semibold uppercase text-slate-400">${esc(label)}</dt><dd class="text-slate-700">${esc(value)}</dd></div>`).join('\n    ')}
  </dl>
  <p class="mt-8 text-sm"><a class="font-semibold text-primary hover:underline" href="/">${esc(t('Back to Call2Now'))}</a></p>
</main>`;
}

// Headings, the effective date and the opening paragraph are lifted from the page source
// so the initial HTML can never disagree with the rendered page.
function legalBody(sourceFile) {
  const source = readFileSync(join(ROOT, 'src/pages', sourceFile), 'utf8');
  const h1 = flatten(source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '');
  const date = flatten(source.match(/Effective date:\s*([^<]+)</)?.[1] || '');
  const intro = flatten(source.match(/<p className="mt-4 text-sm leading-6 text-slate-600">([\s\S]*?)<\/p>/)?.[1] || '');
  const sections = [...source.matchAll(/<Section title="([^"]+)"/g)].map((m) => m[1]);
  // The legal wording itself stays English: a Hindi translation of the policy text is its own
  // content task, so only the shared chrome around it is translated here.
  return `
<a class="c2n-shell-nav" href="/"><img src="/logo.png" alt="${esc(t('Call2Now home'))}" class="h-8 w-auto" /></a>
<main class="mx-auto max-w-3xl px-4 py-10">
  <h1 class="text-3xl font-extrabold text-slate-900">${esc(h1)}</h1>
  ${date ? `<p class="mt-2 text-sm text-slate-500">Effective date: ${esc(date)}</p>` : ''}
  ${intro ? `<p class="mt-4 text-sm leading-6 text-slate-600">${esc(intro)}</p>` : ''}
  ${sections.map((title) => `<h2 class="mt-8 text-lg font-bold text-slate-900">${esc(title)}</h2>`).join('\n  ')}
  <p class="mt-8 text-sm"><a class="font-semibold text-primary hover:underline" href="/">${esc(t('Back to Call2Now'))}</a></p>
</main>`;
}

function notFoundBody() {
  return `
<a class="c2n-shell-nav" href="/"><img src="/logo.png" alt="${esc(t('Call2Now home'))}" class="h-8 w-auto" /></a>
<main class="mx-auto max-w-xl px-4 py-24 text-center">
  <h1 class="text-2xl font-extrabold text-slate-900">${esc(t('Page not found'))}</h1>
  <p class="mt-2 text-sm text-slate-500">${esc(t('The page you are looking for was moved, removed or never existed. Let us get you back to discovering businesses near you.'))}</p>
  <p class="mt-6 flex justify-center gap-4 text-sm">
    <a class="font-semibold text-primary hover:underline" href="/">${esc(t('Go to home page'))}</a>
    <a class="font-semibold text-primary hover:underline" href="/search">${esc(t('Browse all businesses'))}</a>
  </p>
</main>`;
}

// Private screens only need correct metadata in the first response; the forms themselves
// are interactive and stay entirely on the client.
//
// The two auth screens are standalone in the app (no navbar, no footer), so their generated
// HTML must not reserve navbar height or mounting the app shifts the whole page.
const STANDALONE_SCREENS = new Set(['/login', '/signup']);

function screenBody(label, description, withNav = true) {
  const logo = withNav
    ? `<a class="c2n-shell-nav" href="/"><img src="/logo.png" alt="${esc(t('Call2Now home'))}" class="h-8 w-auto" /></a>`
    : `<a class="inline-block" href="/"><img src="/logo.png" alt="${esc(t('Call2Now home'))}" class="h-8 w-auto" /></a>`;
  return `
${logo}
<main class="mx-auto max-w-xl px-4 py-24 text-center">
  <h1 class="text-2xl font-extrabold text-slate-900">${esc(t(label))}</h1>
  <p class="mt-2 text-sm text-slate-500">${esc(t(description))}</p>
  <noscript><p class="mt-4 text-sm text-slate-500">${esc(t('This screen needs JavaScript to continue.'))}</p></noscript>
  <p class="mt-6 text-sm"><a class="font-semibold text-primary hover:underline" href="/">${esc(t('Back to Call2Now'))}</a></p>
</main>`;
}

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
};

async function collectProfiles() {
  // Render's free tier sleeps; one long warm-up request keeps the real calls fast.
  try {
    await fetch(`${API_ORIGIN}/api/health`, { signal: AbortSignal.timeout(45000) });
  } catch {
    /* still worth trying the data endpoints */
  }
  try {
    const list = await fetchJson(`${API_ORIGIN}/api/seo/sitemap`);
    const slugs = (list.profiles || []).slice(0, LIMIT).map((p) => p.slug);
    const out = [];
    for (const slug of slugs) {
      try {
        const { profile } = await fetchJson(`${API_ORIGIN}/api/profiles/slug/${encodeURIComponent(slug)}`);
        if (profile && profile.pageSlug && profile.status !== 'removed') out.push(profile);
      } catch (error) {
        console.warn(`[seo] skipped ${slug}: ${error.message}`);
      }
    }
    return out;
  } catch (error) {
    // A deployed backend that predates /api/seo/sitemap still answers /api/search with whole
    // active profiles, so a frontend-only release keeps real business pages in the build.
    // That endpoint is capped at 100 rows server side, which is reported rather than hidden.
    console.warn(`[seo] /api/seo/sitemap unavailable (${error.message}), falling back to /api/search`);
    const legacy = await fetchJson(`${API_ORIGIN}/api/search`);
    const rows = (legacy.profiles || []).filter((p) => p.pageSlug && p.status === 'active');
    if (rows.length >= 100) console.warn('[seo] WARNING: the legacy listing stops at 100 profiles; deploy the backend to list all of them');
    return rows.slice(0, LIMIT);
  }
}

try {
  let profiles = [];
  try {
    profiles = await collectProfiles();
  } catch (error) {
    console.warn(`[seo] business pages skipped this build: ${error.message}`);
  }
  // Business pages now live at /<slug>, so a slug that spells an app route or a built file
  // would overwrite that page. The server refuses those names when it mints a slug; this
  // defends against rows created before the guard existed.
  const blocked = profiles.filter((p) => isReservedSlug(p.pageSlug)).map((p) => p.pageSlug);
  if (blocked.length) console.warn(`[seo] skipped reserved slug(s): ${blocked.join(', ')}`);
  profiles = profiles.filter((p) => !isReservedSlug(p.pageSlug));

  const labels = profiles.map((p) => ({
    ...p,
    categoryLabel: p.category === 'Other' ? p.customCategory : p.category,
    locality: p.city || p.state || '',
  }));

  write('index.html', buildDocument(homeSeo(), homeBody(labels.slice(0, 12))));
  write('privacy/index.html', buildDocument(privacySeo(), legalBody('PrivacyPolicy.jsx')));
  write('terms/index.html', buildDocument(termsSeo(), legalBody('TermsOfService.jsx')));
  write('404.html', buildDocument(notFoundSeo(), notFoundBody()));

  // Screens that must never be indexed get their own files, so the noindex rule is in the
  // first response instead of only appearing after React runs.
  PRIVATE_SCREENS.forEach((screen) => {
    const file = `${screen.path.replace(/^\//, '')}/index.html`;
    write(file, buildDocument(privateScreenSeo(screen.path), screenBody(screen.label, screen.description, !STANDALONE_SCREENS.has(screen.path))));
  });
  const search = searchSeo();
  write('search/index.html', buildDocument(search, screenBody(SEARCH_HEADING, search.description)));

  // Written at the root, so a page directory is only ever a plain slug. Anything else (a dot,
  // a slash, an uppercase letter) comes from data this build should not trust with a path.
  const WRITABLE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
  let written = 0;
  profiles.forEach((profile) => {
    if (!WRITABLE_SLUG.test(String(profile.pageSlug || ''))) {
      console.warn(`[seo] skipped "${profile.pageSlug}": not a writable slug`);
      return;
    }
    write(`${profile.pageSlug}/index.html`, buildDocument(profileSeo(profile), profileBody(profile)));
    written += 1;
  });

  console.log(
    `[seo] initial HTML written: /, /privacy, /terms, /404.html, ${PRIVATE_SCREENS.length + 1} noindex screens and ${written} business page(s)`,
  );
} catch (error) {
  // A build must never break because the SEO step failed.
  console.error(`[seo] prerender skipped: ${error?.message || error}`);
}
