export const SUPPORT_WHATSAPP = '919305035828';
export const UPI_ID = '9305636901-1@nyes';
export const PAYEE_NAME = 'Nilesh Kumar Mishra';
export const QR_SRC = '/upi-qr.png';
export const FREE_DAYS = 30;
export const DAY_PRICE = 1;
export const YEAR_PRICE = 365;

// The owner pays in any UPI app, then sends the screenshot here so the team can extend the listing.
export const paymentWaLink = ({ shopName, city } = {}) => {
  const text = [
    'Hi Call2Now, I have completed the payment for my business listing.',
    shopName && `Business: ${shopName}`,
    city && `City: ${city}`,
    `Plan: ₹${YEAR_PRICE} for 1 year (₹${DAY_PRICE} per day) after the ${FREE_DAYS} free days.`,
    'My payment screenshot is attached below. Please extend my listing.',
  ]
    .filter(Boolean)
    .join('\n');
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`;
};
