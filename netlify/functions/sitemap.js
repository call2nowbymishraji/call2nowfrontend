// Netlify Function: GET /sitemap.xml
// Built from the live profile list so a new or updated business becomes eligible without
// touching a static file. The API only ever returns { slug, lastmod }.
const SITE_URL = String(process.env.SITE_URL || 'https://call2now.com').replace(/\/+$/, '');
const API_ORIGIN = String(
  process.env.SEO_API_ORIGIN || process.env.VITE_API_ORIGIN || 'https://call2nowbackendend.onrender.com'
).replace(/\/+$/, '');

const URL_LIMIT = 50000;
const VALID_SLUG = /^[a-z0-9][a-z0-9-]*$/i;

// Each generated page is a directory index, so Netlify answers /b/slug with a 301 to
// /b/slug/. The sitemap declares the form that returns 200, which is also the form every
// canonical tag on the page carries.
const pageUrl = (path) => (path.endsWith('/') ? `${SITE_URL}${path}` : `${SITE_URL}${path}/`);

// Effective dates of the two legal pages, matching the copy shown on them.
const STATIC_URLS = [
  { loc: pageUrl('/'), lastmod: '' },
  { loc: pageUrl('/privacy'), lastmod: '2026-10-17' },
  { loc: pageUrl('/terms'), lastmod: '2026-10-17' },
];

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

const isoDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : '';
};

function toXml(entries, notes) {
  const body = entries
    .map((entry) => `  <url><loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  const comments = notes.map((text) => `  <!-- ${text} -->`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    comments ? `${comments}\n` : ''
  }${body}\n</urlset>\n`;
}

export default async (request, context) => {
  const seen = new Set();
  const entries = [];
  const notes = [];
  const add = (loc, lastmod) => {
    if (!loc || seen.has(loc) || entries.length >= URL_LIMIT) return false;
    seen.add(loc);
    entries.push({ loc, lastmod });
    return true;
  };
  STATIC_URLS.forEach((entry) => add(entry.loc, entry.lastmod));

  try {
    let profiles = [];
    let truncated = false;
    try {
      const response = await fetch(`${API_ORIGIN}/api/seo/sitemap`, {
        headers: { accept: 'application/json', 'user-agent': 'call2now-sitemap/1.0' },
        // Netlify kills a function after 10 seconds, so the profile list gets 8 and the
        // remaining time is spent building the response.
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`profile list responded ${response.status}`);
      const data = await response.json();
      profiles = (data.profiles || []).map((p) => ({ slug: p.slug, lastmod: p.lastmod }));
      if (profiles.length >= URL_LIMIT || (data.count || 0) > profiles.length) truncated = true;
    } catch (seoError) {
      // A backend that predates /api/seo/sitemap still answers /api/search, but with whole
      // profile documents capped at 100 rows. Used only so a frontend-only release keeps the
      // business URLs live; the cap is stated in the file itself.
      const legacy = await fetch(`${API_ORIGIN}/api/search`, {
        headers: { accept: 'application/json', 'user-agent': 'call2now-sitemap/1.0' },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      });
      if (!legacy.ok) throw new Error(`legacy profile list responded ${legacy.status}: ${seoError.message}`);
      const { profiles: rows = [] } = await legacy.json();
      profiles = rows
        .filter((row) => row.pageSlug && row.status === 'active')
        .map((row) => ({ slug: row.pageSlug, lastmod: row.updatedAt }));
      if (rows.length >= 100) truncated = true;
      notes.push('Generated from the legacy business listing while the dedicated endpoint is unavailable.');
    }
    profiles.forEach((profile) => {
      const slug = String(profile.slug || '').trim();
      if (!VALID_SLUG.test(slug)) return;
      add(pageUrl(`/b/${encodeURIComponent(slug)}`), isoDate(profile.lastmod));
    });
    if (truncated) notes.push(`Listed ${entries.length} URLs; the profile list reached its limit, so some business pages may be missing.`);
  } catch (error) {
    // Serve a valid sitemap of the static pages instead of an error, so a sleeping backend
    // never breaks the crawl. It is not cached, so the next request retries immediately.
    context?.log?.('[sitemap] profile list unavailable:', error?.message || error);
    notes.push('Business profile URLs are temporarily unavailable; only the static pages are listed.');
    return new Response(toXml(entries, notes), {
      status: 200,
      headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  return new Response(toXml(entries, notes), {
    status: 200,
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
};
