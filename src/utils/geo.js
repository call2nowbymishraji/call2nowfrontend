export const DEFAULT_COUNTRY = 'India';

const contains = (haystack, needle) =>
  Boolean(needle) && haystack.toLowerCase().includes(String(needle).toLowerCase());

// Composes the display address from the street line plus the structured fields,
// skipping anything the street line already spells out so old profiles do not repeat.
export function formatAddress(p = {}) {
  const base = (p.address || '').trim();
  const lower = base.toLowerCase();
  const parts = base ? [base] : [];

  if (p.city && !contains(lower, p.city)) parts.push(p.city.trim());

  const region = [
    p.state && !contains(lower, p.state) ? p.state.trim() : '',
    p.pincode && !lower.includes(p.pincode) ? p.pincode.trim() : '',
  ]
    .filter(Boolean)
    .join(' ');
  if (region) parts.push(region);

  if (p.country && p.country !== DEFAULT_COUNTRY && !contains(lower, p.country)) parts.push(p.country.trim());

  return parts.join(', ');
}

// Short locality label for cards and chips. Falls back to the old free text address,
// skipping a trailing pin code or state abbreviation so "Indore, MP 452001" shows Indore.
export function profileLocality(p = {}) {
  if (p.city) return p.city;
  const base = (p.address || '').trim();
  if (!base) return '';
  const segs = base.split(',').map((s) => s.trim()).filter(Boolean);
  const noise = /^\d{6}$|^[A-Za-z]{2}\s*\d{6}$|^[A-Za-z]{2}$/;
  const named = segs.filter((s) => !noise.test(s));
  const list = named.length ? named : segs;
  return list[list.length - 1];
}
