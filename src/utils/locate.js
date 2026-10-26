// Coordinates alone are not something a shop owner can read, so the street text
// comes from BigDataCloud's key-free client endpoint. No secret can live here:
// this file ships inside the public browser bundle.
const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
const TIMEOUT_MS = 12000;

const ERROR_TEXT = {
  1: 'Location permission was blocked. Allow it for this site in the browser bar, or paste the map link yourself.',
  2: 'No location available right now. Move to a window or turn on GPS, then try again.',
  3: 'Reading the location took too long. Try again.',
};

export const geolocationSupported = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.geolocation);

// Same shape the profile page already falls back to, so the saved link opens a pin.
export const mapsPinUrl = (lat, lng) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

function currentPosition() {
  return new Promise((resolve, reject) => {
    if (!geolocationSupported()) {
      reject(new Error('This browser cannot share a location. Paste the map link instead.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (e) => reject(new Error(ERROR_TEXT[e.code] || 'Could not read your location. Try again.')), {
      enableHighAccuracy: true,
      timeout: TIMEOUT_MS,
      maximumAge: 0,
    });
  });
}

async function reverseGeocode(lat, lng) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${REVERSE_GEOCODE_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { signal: ctrl.signal });
    if (!res.ok) throw new Error('address lookup failed');
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// A failed address lookup still returns the pin: anything unresolved comes back
// empty so the caller leaves whatever the owner already typed untouched.
export async function locateMe() {
  const { latitude, longitude, accuracy } = (await currentPosition()).coords;
  const geo = await reverseGeocode(latitude, longitude).catch(() => ({}));
  const locality = (geo.locality || '').trim();
  const city = (geo.city || locality).trim();
  return {
    lat: latitude,
    lng: longitude,
    accuracy: Math.round(accuracy || 0),
    mapUrl: mapsPinUrl(latitude, longitude),
    // In a city the endpoint often repeats the city as the locality, which would put
    // a useless "Indore" in the street box, so only a genuinely smaller area is used.
    address: locality && locality !== city ? locality : '',
    city,
    state: (geo.principalSubdivision || '').trim(),
    // Indian postcodes are empty for most city coordinates on this free endpoint.
    pincode: (geo.postcode || '').trim(),
  };
}
