import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyMeta } from './meta.js';
import { trackPageView } from './analytics.js';
import { absoluteUrl } from './site.js';

// Renders nothing. It owns the document head for the page it is placed on and re-applies
// on every route transition, so the head can never be left showing the previous page's
// title, description or JSON-LD.
export default function Seo({ path, canonical, ...seo }) {
  const location = useLocation();
  // A page that does not name its own canonical still gets one for the URL it is served
  // on, so an inherited canonical can never follow it around.
  const finalCanonical = canonical || absoluteUrl(path ?? location.pathname);
  const jsonLd = seo.jsonLd || [];

  const serialized = JSON.stringify({
    title: seo.title,
    description: seo.description,
    canonical: finalCanonical,
    robots: seo.robots,
    type: seo.type,
    image: seo.image,
    imageAlt: seo.imageAlt,
    jsonLd,
  });

  useEffect(() => {
    applyMeta({ ...seo, canonical: finalCanonical, jsonLd });
    trackPageView(location.pathname, seo.title);
    // `serialized` is the dependency: it changes exactly when the head content changes.
  }, [serialized, location.pathname]);

  return null;
}
