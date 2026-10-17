import { useEffect, useMemo, useRef, useState } from 'react';

const GAP = 16;
const ANIM_MS = 600;

export default function RotatingRow({ items, target = 2, stepMs = 2500, render, aspect = 'aspect-[4/5]' }) {
  const [wide, setWide] = useState(() => window.innerWidth >= 640);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
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
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  useEffect(() => {
    if (!canRotate) return;
    const t = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, stepMs);
    return () => clearInterval(t);
  }, [canRotate, stepMs]);

  useEffect(() => {
    if (index !== items.length) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, ANIM_MS + 40);
    return () => clearTimeout(t);
  }, [index, items.length]);

  const offset = useMemo(() => {
    const track = trackRef.current;
    if (!track || !track.children.length) return 0;
    const w = track.children[0].getBoundingClientRect().width;
    return index * (w + GAP);
  }, [index, items2.length, visible]);

  if (!items.length) return null;

  return (
    <div className="relative">
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
            onClick={() => {
              setAnimate(true);
              setIndex((i) => (i - 1 + items.length) % items.length);
            }}
            className="absolute -left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-card hover:text-primary"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={() => {
              setAnimate(true);
              setIndex((i) => (i + 1) % items.length);
            }}
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
