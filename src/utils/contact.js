import { formatAddress } from './geo.js';

export const callLink = (p = {}) => {
  const digits = String(p.phone || '').replace(/\D/g, '');
  return digits ? `tel:+91${digits}` : null;
};

export const waLink = (p = {}) => {
  if (p.whatsappUrl) return p.whatsappUrl;
  const digits = String(p.whatsapp || p.phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/91${digits}` : null;
};

// Falls back to a Maps text search so profiles without a saved map link still offer directions.
export const mapsLink = (p = {}) => {
  if (p.mapUrl) return p.mapUrl;
  const q = formatAddress(p);
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
};
