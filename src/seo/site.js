// Single source of truth for the public site URL and the indexability rules.
// VITE_SITE_URL is a build time variable only. Never put a backend secret here.
// The same module is read by the Node prerender script, so the value is resolved from
// whichever environment is loading it.
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const nodeEnv = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) || {};

const configuredSiteUrl = String(viteEnv.VITE_SITE_URL || nodeEnv.SITE_URL || 'https://call2now.com');

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, '');

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

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
