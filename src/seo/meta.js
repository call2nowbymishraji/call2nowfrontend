// Imperative head management for the running SPA. Every tag we own is marked with
// data-c2n-seo so a route change can never leave a stale or duplicated description,
// og tag or canonical behind.

const MANAGED = 'data-c2n-seo';
const JSONLD_ID = 'c2n-jsonld';

function upsertEl(tag, match, attrs) {
  let el = document.head.querySelector(match);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  el.setAttribute(MANAGED, '');
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
  return el;
}

function setMeta(key, content) {
  if (!content) return;
  // Open Graph uses property=, Twitter cards use name=. Mixing them would leave the
  // static tag from index.html in place and add a duplicate instead of updating it.
  const attr = key.startsWith('og:') ? 'property' : 'name';
  upsertEl('meta', `meta[${attr}="${key}"]`, { [attr]: key, content });
}

// Tags that were written for the previous route but are not part of this one.
function prune(keep) {
  document.head.querySelectorAll(`meta[${MANAGED}]`).forEach((el) => {
    const key = el.getAttribute('name') || el.getAttribute('property');
    if (key && !keep.has(key)) el.remove();
  });
}

export function applyMeta(seo) {
  const { title, description, canonical, robots, type = 'website', image, imageAlt, jsonLd } = seo || {};

  if (title) document.title = title;
  if (canonical) upsertEl('link', 'link[rel="canonical"]', { rel: 'canonical', href: canonical });

  const keep = new Set();
  const put = (key, content) => {
    keep.add(key);
    setMeta(key, content || '');
  };

  put('description', description);
  put('robots', robots);
  put('og:title', title);
  put('og:description', description);
  put('og:url', canonical);
  put('og:type', type);
  put('og:site_name', 'Call2Now');
  put('og:image', image);
  put('og:image:alt', image ? imageAlt : '');
  put('og:locale', image ? 'en_US' : '');
  put('twitter:card', image ? 'summary_large_image' : 'summary');
  put('twitter:title', title);
  put('twitter:description', description);
  put('twitter:image', image);
  prune(keep);

  const blocks = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : [];
  let script = document.getElementById(JSONLD_ID);
  if (!blocks.length) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = JSONLD_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(blocks.length === 1 ? blocks[0] : blocks);
}
