import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const GAP = 16;
const ANIM_MS = 600;

export default function RotatingRow({ items, target = 2, stepMs = 2500, render, aspect = 'aspect-[4/5]' }) {
  const [wide, setWide] = useState(() => window.innerWidth >= 640);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [unit, setUnit] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const visible = Math.max(1, Math.min(items.length, wide ? target : 1));
  const lone = items.length === 1 && wide && target > 1;
  const cols = lone ? target : visible;
  const canRotate = items.length > visible;
  const items2 = useMemo(() => items.concat(items.slice(0, visible)), [items, visible]);

  useEffect(() => {
    if (index > items.length) setIndex(0);
  }, [items.length, index]);

  // The slide width comes from the layout, so it has to be re-measured whenever the
  // row is rebuilt or the column width changes. A stale width shifts the track by the
  // wrong distance and the row stops lining up with its own edges.
  useLayoutEffect(() => {
    const first = trackRef.current?.children?.[0];
    if (!first) return undefined;
    const measure = () => setUnit(first.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    return () => ro.disconnect();
  }, [items2.length, cols, visible]);

  useEffect(() => {
    if (!canRotate || paused) return undefined;
    const t = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, stepMs);
    return () => clearInterval(t);
  }, [canRotate, stepMs, paused]);

  useEffect(() => {
    if (index !== items.length) return undefined;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, ANIM_MS + 40);
    return () => clearTimeout(t);
  }, [index, items.length]);

  if (!items.length) return null;

  const offset = index * (unit + GAP);

  // A clicked button keeps focus, which would leave the row paused for good.
  const nudge = (delta) => (e) => {
    setAnimate(true);
    setIndex((i) => (i + delta + items.length) % items.length);
    e.currentTarget.blur();
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className={`flex ${lone && !canRotate ? 'justify-center' : ''}`}
          style={{
            gap: `${GAP}px`,
            transform: `translateX(-${offset}px)`,
            transition: animate ? `transform ${ANIM_MS}ms cubic-bezier(.22,.61,.36,1)` : 'none',
          }}
        >
          {items2.map((it, i) => (
            <div
              key={i}
              className={`shrink-0 ${aspect}`}
              style={{ width: `calc((100% - ${GAP * (cols - 1)}px) / ${cols})` }}
            >
              {render(it, i % items.length)}
            </div>
          ))}
        </div>
      </div>

      {canRotate && (
        <>
          <button
            onClick={nudge(-1)}
            className="absolute -left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-card hover:text-primary"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={nudge(1)}
            className="absolute -right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-card hover:text-primary"
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
