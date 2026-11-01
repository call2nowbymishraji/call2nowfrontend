// Netlify Edge Function, mounted on /* because business pages live at the root.
// A removed or never-existing business page has to answer with a real HTTP 404, not a
// 200 that merely renders "Profile not found". Every uncertainty fails open: the request
// is passed on so a slow or sleeping API can never turn a live page into a 404.
const API_ORIGIN = String(
  globalThis.process?.env?.SEO_API_ORIGIN || 'https://call2nowbackendend.onrender.com'
).replace(/\/+$/, '');

const PROBE_TIMEOUT_MS = 4000;

const VALID_SLUG = /^[a-z0-9][a-z0-9-]*$/;

// Only a single, unreserved path segment can be a business page. Everything else (an app
// route, a built file, the legacy /b/ prefix, an asset) is passed through untouched. Keep in
// step with RESERVED_SEGMENTS in src/seo/site.js; this file is deployed standalone.
const RESERVED = new Set([
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
]);

function profileSlug(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const parts = decoded.split('/').filter(Boolean);
  if (parts.length !== 1) return null;
  const segment = parts[0].trim().toLowerCase();
  if (!segment || RESERVED.has(segment) || !VALID_SLUG.test(segment)) return null;
  return segment;
}

// Only reached once the API has confirmed the business is gone, so the 404 document is
// fetched rather than a soft 200 that claims a page exists.
async function notFoundPage(origin) {
  try {
    const file = await fetch(new URL('/404.html', origin), { cache: 'no-store' });
    const html = await file.text();
    if (!html.includes('<html')) return null;
    return new Response(html, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8', 'x-call2now-404': 'missing-business-page' },
    });
  } catch {
    return null;
  }
}

export default async (request, context) => {
  const url = new URL(request.url);
  const slug = profileSlug(url.pathname);

  // Not a business URL, so it is not this function's decision to make.
  if (!slug) return context.next();

  let exists = null;
  try {
    const probe = await fetch(`${API_ORIGIN}/api/seo/profile/${encodeURIComponent(slug)}`, {
      headers: { accept: 'application/json', 'user-agent': 'call2now-edge/1.0' },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      cache: 'no-store',
    });
    // The status alone is not enough: a backend that has no /api/seo route answers every
    // slug with its own 404 "Route not found". Only a body that really says
    // { exists: false } may turn a business page into a 404.
    const body = await probe.json().catch(() => null);
    if (body && typeof body.exists === 'boolean') exists = body.exists;
  } catch {
    exists = null;
  }

  if (exists === false) {
    const page = await notFoundPage(url.origin);
    if (page) return page;
  }
  return context.next();
};
