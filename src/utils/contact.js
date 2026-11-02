import { formatAddress } from './geo.js';

// Numbers are stored exactly as the shop typed them, so the saved country decides what to dial.
// A country outside this map dials the digits as saved instead of guessing a code.
const DIAL_CODES = { india: '91', nepal: '977' };

const dialCode = (country) => DIAL_CODES[String(country || 'India').trim().toLowerCase()] || '';

export const callLink = (p = {}) => {
  const digits = String(p.phone || '').replace(/\D/g, '');
  if (!digits) return null;
  const code = dialCode(p.country);
  return `tel:${code ? `+${code}` : ''}${digits}`;
};

export const waLink = (p = {}) => {
  if (p.whatsappUrl) return p.whatsappUrl;
  const digits = String(p.whatsapp || p.phone || '').replace(/\D/g, '');
  if (!digits) return null;
  const code = dialCode(p.country);
  return `https://wa.me/${code ? code + digits : digits}`;
};

// Falls back to a Maps text search so profiles without a saved map link still offer directions.
export const mapsLink = (p = {}) => {
  if (p.mapUrl) return p.mapUrl;
  const q = formatAddress(p);
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
};
