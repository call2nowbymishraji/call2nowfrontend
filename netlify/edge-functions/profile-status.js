// Netlify Edge Function, mounted on /b/* only.
// A removed or never-existing business page has to answer with a real HTTP 404, not a
// 200 that merely renders "Profile not found". Every uncertainty fails open: the request
// is passed on so a slow or sleeping API can never turn a live page into a 404.
const API_ORIGIN = String(
  globalThis.process?.env?.SEO_API_ORIGIN || 'https://call2nowbackendend.onrender.com'
).replace(/\/+$/, '');

const PROBE_TIMEOUT_MS = 4000;

function slugFrom(pathname) {
  const raw = pathname.replace(/^\/b\/?/, '').split('/')[0] || '';
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return '';
  }
}

// An empty slug is a malformed URL and can never be a real page, so it is the only case
// that is answered without consulting the API.
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
  const slug = slugFrom(url.pathname);

  if (!slug) {
    const page = await notFoundPage(url.origin);
    return page || (await context.next());
  }

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
