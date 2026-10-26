// Every public page builds its metadata here, in one file, so a title or a robots rule
// can never drift between the running app and the build time HTML generator.
import {
  BRAND,
  HOMEPAGE_DESCRIPTION,
  HOMEPAGE_TITLE,
  OG_IMAGE,
  OG_IMAGE_ALT,
  ROBOTS,
  absoluteUrl,
} from './site.js';

const clip = (value, max) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/[\s,;:.-]+$/, '')}…`;
};

// The brand suffix is never allowed to be cut off, so a long page label loses characters
// instead of the title ending in "| Ca…".
const titleFor = (label, suffix = BRAND) => {
  const tail = suffix ? ` | ${suffix}` : '';
  return clip(label, 60 - tail.length) + tail;
};

// Social networks can only fetch an absolute image, so a relative /uploads path falls
// back to the branded cover instead of producing a broken preview.
export function socialImage(profile) {
  const raw = profile && (profile.shopImage || (profile.gallery || [])[0]);
  return /^https?:\/\//i.test(raw || '') ? raw : OG_IMAGE;
}

export function categoryLabel(profile) {
  const value = profile?.category === 'Other' ? profile?.customCategory : profile?.category;
  return String(value || '').trim();
}

export function localityLabel(profile) {
  const city = String(profile?.city || '').trim();
  const state = String(profile?.state || '').trim();
  if (city && state && !city.toLowerCase().includes(state.toLowerCase())) return `${city}, ${state}`;
  return city || state || '';
}

function webpageJsonLd({ name, description, url, type = 'WebPage', image, updated }) {
  const node = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    url,
  };
  if (description) node.description = description;
  if (image) node.image = image;
  if (updated) node.dateModified = new Date(updated).toISOString();
  return node;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/logo.png'),
    sameAs: [],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'helpcall2now@gmail.com',
        telephone: '+91-9305035828',
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: absoluteUrl('/'),
    publisher: { '@type': 'Organization', name: BRAND, url: absoluteUrl('/') },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// schema.org wants an ISO 3166-1 alpha-2 code; the profile form stores the full name.
const COUNTRY_CODES = { india: 'IN', nepal: 'NP', bhutan: 'BT', bangladesh: 'BD', srilanka: 'LK', 'sri lanka': 'LK' };

// Only fields the profile page actually renders, and only when the owner supplied them.
export function localBusinessJsonLd(profile) {
  const node = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.shopName,
    url: absoluteUrl(`/b/${profile.pageSlug}`),
  };
  if (profile.description) node.description = clip(profile.description, 300);
  const image = socialImage(profile);
  if (image !== OG_IMAGE) node.image = image;
  if (profile.phone) node.telephone = profile.phone;
  if (profile.email) node.email = profile.email;

  const country = COUNTRY_CODES[String(profile.country || '').toLowerCase()] || profile.country;
  const address = {
    '@type': 'PostalAddress',
    streetAddress: profile.address || undefined,
    addressLocality: profile.city || undefined,
    addressRegion: profile.state || undefined,
    postalCode: profile.pincode || undefined,
    addressCountry: country || undefined,
  };
  const hasAddressDetail = Object.entries(address).some(
    ([key, value]) => key !== '@type' && key !== 'addressCountry' && Boolean(value),
  );
  if (hasAddressDetail) node.address = address;

  const sameAs = ['website', 'instagram', 'facebook', 'x', 'youtube', 'telegram', 'whatsappUrl']
    .map((key) => profile[key])
    .filter((v) => /^https?:\/\//i.test(v || ''));
  if (sameAs.length) node.sameAs = sameAs;

  const days = Array.isArray(profile.operationDays) ? profile.operationDays.filter(Boolean) : [];
  if (days.length && profile.operationOpen && profile.operationClose) {
    node.openingHoursSpecification = days.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day,
      opens: profile.operationOpen,
      closes: profile.operationClose,
    }));
  }
  return node;
}

export function homeSeo() {
  return {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    path: '/',
    canonical: absoluteUrl('/'),
    robots: ROBOTS.index,
    type: 'website',
    image: OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
    jsonLd: [
      websiteJsonLd(),
      organizationJsonLd(),
      webpageJsonLd({
        name: HOMEPAGE_TITLE,
        description: HOMEPAGE_DESCRIPTION,
        url: absoluteUrl('/'),
        image: OG_IMAGE,
      }),
    ],
  };
}

export function profileSeo(profile) {
  const category = categoryLabel(profile);
  const locality = localityLabel(profile) || String(profile.address || '').split(',')[0]?.trim() || '';
  // Titles keep the shortest honest place label so the business name is never truncated.
  const city = String(profile.city || '').trim() || locality;
  const where = locality ? ` in ${locality}` : '';
  const label = `${profile.shopName}${category ? ` - ${category}` : ''}${city ? ` in ${city}` : ''}`;
  const description = profile.description
    ? clip(profile.description, 155)
    : clip(
        `Browse ${profile.shopName}${category ? `, a ${category.toLowerCase()} business` : ''}${where} on Call2Now. See products, photos and contact details.`,
        155
      );
  const path = `/b/${profile.pageSlug}`;
  return {
    title: titleFor(label),
    description,
    path,
    canonical: absoluteUrl(path),
    robots: ROBOTS.index,
    type: 'website',
    image: socialImage(profile),
    imageAlt: `${profile.shopName} on Call2Now`,
    jsonLd: [
      localBusinessJsonLd(profile),
      webpageJsonLd({
        name: profile.shopName,
        description,
        url: absoluteUrl(path),
        image: socialImage(profile),
        updated: profile.updatedAt,
      }),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: profile.shopName, path },
      ]),
    ],
  };
}

// A slug that is missing, removed or never existed must not publish a page that claims a
// business exists. No index, no structured data, canonical kept so the URL stays stable.
export function missingProfileSeo(slug) {
  const path = `/b/${slug}`;
  return {
    title: titleFor('Business page not found'),
    description: clip(
      'This business page is not available on Call2Now. Search the directory to find local businesses near you.',
      155
    ),
    path,
    canonical: absoluteUrl(path),
    robots: ROBOTS.hidden,
    type: 'website',
    image: OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
    jsonLd: [],
  };
}

export const SEARCH_HEADING = 'Find local businesses by name, product or city';

export function searchSeo() {
  const description =
    'Search Call2Now businesses by name, product, category, city or pin code and open the profile that fits.';
  return {
    title: titleFor(SEARCH_HEADING),
    description,
    // Query parameters are never part of the canonical: arbitrary search strings must
    // not create indexable URLs.
    path: '/search',
    canonical: absoluteUrl('/search'),
    robots: ROBOTS.search,
    type: 'website',
    image: OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
    jsonLd: [],
  };
}

export function privacySeo() {
  const description =
    'How Call2Now collects, stores and uses the account and business profile information you submit, and the choices you have.';
  return {
    title: titleFor('Privacy Policy'),
    description,
    path: '/privacy',
    canonical: absoluteUrl('/privacy'),
    robots: ROBOTS.index,
    type: 'article',
    image: OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
    jsonLd: [
      webpageJsonLd({ name: 'Privacy Policy', description, url: absoluteUrl('/privacy'), image: OG_IMAGE }),
      breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]),
    ],
  };
}

export function termsSeo() {
  const description =
    'The terms that apply to using Call2Now, creating a business profile and contacting businesses through the directory.';
  return {
    title: titleFor('Terms of Service'),
    description,
    path: '/terms',
    canonical: absoluteUrl('/terms'),
    robots: ROBOTS.index,
    type: 'article',
    image: OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
    jsonLd: [
      webpageJsonLd({ name: 'Terms of Service', description, url: absoluteUrl('/terms'), image: OG_IMAGE }),
      breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }]),
    ],
  };
}

export const notFoundSeo = () => ({
  title: titleFor('Page not found'),
  description: 'This page does not exist on Call2Now. Use the directory to find local businesses near you.',
  path: undefined,
  canonical: undefined,
  robots: ROBOTS.hidden,
  type: 'website',
  image: OG_IMAGE,
  imageAlt: OG_IMAGE_ALT,
  jsonLd: [],
});

// Screens behind a login or that only ever show one owner's own data. They keep a
// canonical of their own so a stale one can never be inherited from the previous route.
export function privateSeo(label, description, path) {
  return {
    title: titleFor(label),
    description: clip(description, 155),
    path,
    canonical: absoluteUrl(path),
    robots: ROBOTS.hidden,
    type: 'website',
    image: '',
    imageAlt: '',
    jsonLd: [],
  };
}

// Every screen that must never be indexed, in one place so the React route and the
// generated initial HTML for the same path can never disagree.
export const PRIVATE_SCREENS = [
  { path: '/login', label: 'Log In', description: 'Log in to Call2Now to manage your business profile.' },
  { path: '/signup', label: 'Sign Up', description: 'Create a Call2Now account to register your business profile.' },
  {
    path: '/create-profile',
    label: 'Create Your Business Profile',
    description: 'Register your business on Call2Now with your products, photos and contact details.',
  },
  {
    path: '/profile',
    label: 'My Business Profile',
    description: 'Manage your Call2Now business profile and see what customers viewing your page can see.',
  },
  {
    path: '/admin',
    label: 'Admin Dashboard',
    description: 'Internal Call2Now administration screen for profiles, promotions and products.',
  },
];

export const privateScreenSeo = (path) => {
  const screen = PRIVATE_SCREENS.find((entry) => entry.path === path);
  return privateSeo(screen.label, screen.description, screen.path);
};

// Shown while a business page is still loading. It states what the URL is without
// claiming anything about the business behind it.
export function profilePendingSeo(slug) {
  const path = `/b/${slug}`;
  return {
    title: titleFor('Business profile'),
    description: clip(`Loading this business profile on Call2Now.`, 155),
    path,
    canonical: absoluteUrl(path),
    robots: ROBOTS.index,
    type: 'website',
    image: OG_IMAGE,
    imageAlt: OG_IMAGE_ALT,
    jsonLd: [],
  };
}
