export const CATEGORIES = [
  'Vegetables & Fruits',
  'Grocery & Supermarket',
  'Bakery & Sweets',
  'Restaurants & Cafes',
  'Hardware & Paints',
  'Mobile & Electronics',
  'Electrical & Appliances',
  'Clothing & Fashion',
  'Jewellery & Watches',
  'Salon & Spa',
  'Pharmacy & Medical',
  'Furniture & Home Decor',
  'Construction Materials',
  'Automobiles & Spare Parts',
  'Education & Coaching',
  'Real Estate',
  'Stationery & Books',
  'Printing & Media',
  'Sports & Fitness',
  'Pets & Veterinary',
  'Travel & Tourism',
  'Banks & Finance',
  'Other',
];

const PASTELS = [
  { bg: 'bg-green-100', text: 'text-green-800', chip: 'bg-green-100 text-green-800', avatar: 'bg-green-700' },
  { bg: 'bg-slate-200', text: 'text-slate-700', chip: 'bg-slate-200 text-slate-700', avatar: 'bg-slate-600' },
  { bg: 'bg-amber-100', text: 'text-amber-800', chip: 'bg-amber-100 text-amber-800', avatar: 'bg-amber-600' },
  { bg: 'bg-blue-100', text: 'text-blue-800', chip: 'bg-blue-100 text-blue-800', avatar: 'bg-blue-700' },
  { bg: 'bg-rose-100', text: 'text-rose-800', chip: 'bg-rose-100 text-rose-800', avatar: 'bg-rose-600' },
  { bg: 'bg-purple-100', text: 'text-purple-800', chip: 'bg-purple-100 text-purple-800', avatar: 'bg-purple-600' },
];

export const paletteFor = (seed = '') => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PASTELS[h % PASTELS.length];
};

export const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'C2';
