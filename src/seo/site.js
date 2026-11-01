// Single source of truth for the public site URL and the indexability rules.
// VITE_SITE_URL is a build time variable only. Never put a backend secret here.
// The same module is read by the Node prerender script, so the value is resolved from
// whichever environment is loading it.
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const nodeEnv = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) || {};

const configuredSiteUrl = String(viteEnv.VITE_SITE_URL || nodeEnv.SITE_URL || 'https://call2now.com');

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, '');

// Netlify serves each generated page from a directory index, so /slug answers with a 301 to
// /slug/. A canonical that points at the pre-redirect form contradicts the document Google
// actually stores, so the redirected-to form is declared everywhere instead: sitemap <loc>,
// <link rel=canonical> and the JSON-LD urls all end in a slash. Asset urls keep their
// extension because a slash would not exist for them.
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const url = `${SITE_URL}${clean}`;
  if (clean === '/' || clean.endsWith('/') || /\.[a-z0-9]{2,5}$/i.test(clean)) return url;
  return `${url}/`;
}

// Business pages live at the root of the domain, so a shop name that slugifies to one of
// these would collide with a real screen or with a built file. The server refuses them when
// it mints a slug; the build steps skip them so they can never overwrite a generated page.
// Mirrored in server/src/utils/slug.js, keep both lists in step when a route is added.
export const RESERVED_SEGMENTS = [
  'login',
  'signup',
  'search',
  'create-profile',
  'profile',
  'admin',
  'privacy',
  'terms',
  'b',
  'index.html',
  '404.html',
  'favicon.png',
  'logo.png',
  'og-cover.png',
  'robots.txt',
  'upi-qr.png',
  'sitemap.xml',
  'sitemap-index.xml',
  'assets',
  '_redirects',
  '.netlify',
  '.well-known',
];

export const isReservedSlug = (slug) => RESERVED_SEGMENTS.includes(String(slug || '').trim().toLowerCase());

// The single place a business URL is built, so the path shape never has to be hunted down again.
export const profilePath = (slug) => `/${String(slug || '').trim()}`;

export const BRAND = 'Call2Now';
export const HOMEPAGE_TITLE = 'Call2Now | Discover Local Businesses Near You';
export const HOMEPAGE_DESCRIPTION =
  'Discover local businesses, explore products and services, and connect with businesses through Call2Now.';
export const HOMEPAGE_H1 = 'Discover Local Businesses Near You';
export const OG_IMAGE = absoluteUrl('/og-cover.png');
export const OG_IMAGE_ALT = 'Call2Now, a free public directory of local businesses';

// Robots contracts. Search results stay crawlable so the business links on them keep
// being discovered, but the page itself is never indexed.
export const ROBOTS = {
  index: 'index, follow',
  search: 'noindex, follow',
  hidden: 'noindex, nofollow',
};
