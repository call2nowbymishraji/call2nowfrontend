import { useEffect, useRef, useState } from 'react';

const OUT_PX = 1200;
const PAD = 24;

export default function ImageCropper({ file, aspect = 1, radius = 'rounded-xl', title = 'Drag the image to adjust', onConfirm, onCancel }) {
  const [img, setImg] = useState(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState(null); // { x, y, w, h } in displayed-image px
  const [saving, setSaving] = useState(false);
  const stageRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = url;
    setBox(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (el) setStage({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // displayed (contain-fit) image size
  let dw = 0;
  let dh = 0;
  if (img && stage.w) {
    const availW = Math.max(120, stage.w - PAD * 2);
    const availH = Math.max(120, stage.h - PAD * 2);
    const s = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
    dw = img.naturalWidth * s;
    dh = img.naturalHeight * s;
  }

  // default box: largest rect of the target aspect, centred
  useEffect(() => {
    if (!img || !dw || box) return;
    const maxW = Math.min(dw, dh * aspect);
    const w = maxW;
    const h = w / aspect;
    setBox({ x: (dw - w) / 2, y: (dh - h) / 2, w, h });
  }, [img, dw, dh, aspect, box]);

  const clampBox = (b) => {
    const maxW = Math.min(dw, dh * aspect);
    const minW = maxW * 0.12;
    const w = Math.min(maxW, Math.max(minW, b.w));
    const h = w / aspect;
    const x = Math.min(Math.max(0, b.x), dw - w);
    const y = Math.min(Math.max(0, b.y), dh - h);
    return { x, y, w, h };
  };

  const resizeBy = (factor) => {
    setBox((b) => {
      if (!b) return b;
      const w = b.w * factor;
      return clampBox({ x: b.x + (b.w - w) / 2, y: b.y + (b.w / aspect - w / aspect) / 2, w, h: w / aspect });
    });
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!box) return;
      e.preventDefault();
      resizeBy(e.deltaY < 0 ? 1.1 : 0.9);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  const confirm = () => {
    if (!img || !box || saving) return;
    setSaving(true);
    const s = dw / img.naturalWidth; // displayed px per natural px
    const srcX = box.x / s;
    const srcY = box.y / s;
    const srcW = box.w / s;
    const srcH = box.h / s;
    let outW;
    let outH;
    if (aspect >= 1) {
      outW = OUT_PX;
      outH = Math.round(OUT_PX / aspect);
    } else {
      outH = OUT_PX;
      outW = Math.round(OUT_PX * aspect);
    }
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    if (type === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outW, outH);
    }
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    canvas.toBlob((blob) => {
      setSaving(false);
      if (!blob) return;
      const name = `${file.name.replace(/\.[^.]+$/, '')}${type === 'image/png' ? '.png' : '.jpg'}`;
      onConfirm(new File([blob], name, { type }));
    }, type, 0.92);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/85 backdrop-blur-sm">
      <div className="flex items-center gap-3 bg-white px-4 py-3 shadow-card">
        <button
          type="button"
          onClick={onCancel}
          className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-600 transition hover:bg-slate-100"
          aria-label="Cancel"
        >
          ×
        </button>
        <p className="flex-1 truncate text-sm font-bold text-slate-800 sm:text-base">{title}</p>
        <button type="button" onClick={confirm} disabled={!box || saving} className="text-sm font-bold text-primary hover:underline disabled:opacity-50">
          {saving ? 'Saving...' : 'Upload'}
        </button>
      </div>

      <div ref={stageRef} className="relative flex flex-1 items-center justify-center overflow-hidden">
        {img && dw > 0 && (
          <div className="relative" style={{ width: `${dw}px`, height: `${dh}px` }}>
            <img src={img.src} alt="crop preview" draggable={false} className="h-full w-full select-none rounded-lg" />
            {box && (
              <div
                className={`absolute ${radius}`}
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.w}px`,
                  height: `${box.h}px`,
                  cursor: 'move',
                  touchAction: 'none',
                  boxShadow: '0 0 0 9999px rgba(15,23,42,0.72), 0 0 0 2px rgba(255,255,255,0.95)',
                }}
                onPointerDown={(e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                    /* synthetic pointers cannot be captured */
                  }
                  drag.current = { mode: 'move', sx: e.clientX, sy: e.clientY, ox: box.x, oy: box.y };
                  const onMove = (ev) => {
                    const d = drag.current;
                    if (!d || d.mode !== 'move') return;
                    const nx = d.ox + (ev.clientX - d.sx);
                    const ny = d.oy + (ev.clientY - d.sy);
                    setBox((b) => clampBox({ ...b, x: nx, y: ny }));
                  };
                  const onUp = () => {
                    drag.current = null;
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    window.removeEventListener('pointercancel', onUp);
                  };
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                  window.addEventListener('pointercancel', onUp);
                }}
              >
                <div
                  className="absolute -bottom-3 -right-3 grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-card"
                  style={{ cursor: 'nwse-resize', touchAction: 'none' }}
                  aria-label="Resize box"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      /* synthetic pointers cannot be captured */
                    }
                    drag.current = { mode: 'resize', sx: e.clientX, sy: e.clientY, ow: box.w };
                    const onMove = (ev) => {
                      const d = drag.current;
                      if (!d || d.mode !== 'resize') return;
                      const w = d.ow + (ev.clientX - d.sx) + (ev.clientY - d.sy);
                      setBox((b) => clampBox({ ...b, w, h: w / aspect }));
                    };
                    const onUp = () => {
                      drag.current = null;
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      window.removeEventListener('pointercancel', onUp);
                    };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                    window.addEventListener('pointercancel', onUp);
                  }}
                >
                  ⤡
                </div>
              </div>
            )}
          </div>
        )}

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2">
          <button
            type="button"
            onClick={() => resizeBy(1.2)}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/95 text-xl font-bold text-slate-700 shadow-card hover:text-primary"
            aria-label="Bigger box"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => resizeBy(0.8)}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/95 text-xl font-bold text-slate-700 shadow-card hover:text-primary"
            aria-label="Smaller box"
          >
            −
          </button>
        </div>

        <button
          type="button"
          onClick={confirm}
          disabled={!box || saving}
          className="absolute bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-ggreen text-2xl font-bold text-white shadow-card transition hover:brightness-110 disabled:opacity-50"
          aria-label="Confirm and upload"
        >
          ✓
        </button>
      </div>

      <p className="bg-white/95 px-4 py-3 text-center text-xs font-semibold text-slate-600">
        The full photo is shown. Move the bright box or drag its corner handle to choose the visible area. Only the box area is uploaded.
      </p>
    </div>
  );
}
