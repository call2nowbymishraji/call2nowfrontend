import { useRef } from 'react';
import { assetUrl } from '../services/api.js';

export default function ImageInput({ label, value, preview, onChange, required = false, rounded = 'rounded-xl' }) {
  const ref = useRef(null);
  const show = value instanceof File ? URL.createObjectURL(value) : assetUrl(preview || value);

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className={`group relative grid h-28 w-full place-items-center overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-primary ${rounded}`}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {show ? (
        <>
          <img src={show} alt={label} className="h-full w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
            Change
          </span>
        </>
      ) : (
        <span className="px-2 text-center text-xs font-semibold text-slate-400">
          {label}
          {required && <span className="text-gred"> *</span>}
        </span>
      )}
    </button>
  );
}
