// GA4 is opt in: with no VITE_GA_MEASUREMENT_ID in the build environment this module does
// nothing at all, no script is fetched and no request leaves the browser.
const GA_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

let injected = false;
let lastPath = null;

function gtag(...args) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag(...args);
}

function ensureLoaded() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Page views come from trackPageView below, so the tag must not fire its own.
  window.gtag('config', GA_ID, { send_page_view: false });
}

export const analyticsEnabled = Boolean(GA_ID);

// Only the path and the document title leave the browser. No query string, no form
// values, no token and nothing from localStorage.
export function trackPageView(path, title) {
  if (!GA_ID || typeof window === 'undefined') return;
  if (path === lastPath) return;
  lastPath = path;
  ensureLoaded();
  gtag('event', 'page_view', { page_path: path, page_location: `${window.location.origin}${path}`, page_title: title });
}
