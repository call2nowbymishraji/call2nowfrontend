import { useRef, useState } from 'react';
import { assetUrl } from '../services/api.js';
import ImageCropper from './ImageCropper.jsx';

const SHAPES = {
  landscape: 'aspect-[16/9] w-full',
  portrait: 'aspect-[3/4] w-full',
  tall: 'aspect-[4/5] w-full',
  square: 'aspect-square w-full',
  box: 'h-28 w-full',
};

export default function ImageInput({
  label,
  value,
  preview,
  onChange,
  required = false,
  rounded = 'rounded-xl',
  shape = 'box',
  cropAspect = null,
  cropRadius = 'rounded-xl',
}) {
  const ref = useRef(null);
  const [pending, setPending] = useState(null);
  const show = value instanceof File ? URL.createObjectURL(value) : assetUrl(preview || value);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`group relative grid place-items-center overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-primary ${
          SHAPES[shape] || SHAPES.box
        } ${rounded}`}
      >
        <input
          ref={ref}
          type="file"
          aria-label={label}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            e.target.value = '';
            if (f && cropAspect) setPending(f);
            else onChange(f);
          }}
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
      {pending && (
        <ImageCropper
          file={pending}
          aspect={cropAspect}
          radius={cropRadius}
          onCancel={() => setPending(null)}
          onConfirm={(cf) => {
            setPending(null);
            onChange(cf);
          }}
        />
      )}
    </>
  );
}
