import { useEffect, useMemo, useRef, useState } from 'react';
import ProfileCard from './ProfileCard.jsx';

const GAP = 20;
const STEP_MS = 2500;
const ANIM_MS = 600;

function visibleFor(w) {
  if (w >= 1024) return 4;
  if (w >= 640) return 2;
  return 1;
}

export default function SuggestedCarousel({ profiles }) {
  const [visible, setVisible] = useState(() => visibleFor(window.innerWidth));
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    const onResize = () => setVisible(visibleFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const items = useMemo(() => profiles.concat(profiles.slice(0, visible)), [profiles, visible]);

  useEffect(() => {
    if (index >= profiles.length) setIndex(0);
  }, [profiles.length, index]);

  useEffect(() => {
    if (profiles.length < 2) return;
    const t = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, STEP_MS);
    return () => clearInterval(t);
  }, [profiles.length, visible]);

  // seamless wrap: once we've slid past the real list, jump back without animating
  useEffect(() => {
    if (index !== profiles.length) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, ANIM_MS + 40);
    return () => clearTimeout(t);
  }, [index, profiles.length]);

  const offset = useMemo(() => {
    const track = trackRef.current;
    if (!track || !track.children.length) return 0;
    const cardW = track.children[0].getBoundingClientRect().width;
    return index * (cardW + GAP);
  }, [index, items.length, visible]);

  if (!profiles.length) return null;

  const canMove = profiles.length > 1;

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex"
          style={{
            gap: `${GAP}px`,
            transform: `translateX(-${offset}px)`,
            transition: animate ? `transform ${ANIM_MS}ms cubic-bezier(.22,.61,.36,1)` : 'none',
          }}
        >
          {items.map((p, i) => (
            <div
              key={`${p._id}-${i}`}
              className="shrink-0"
              style={{ width: `calc((100% - ${GAP * (visible - 1)}px) / ${visible})` }}
            >
              <ProfileCard profile={p} />
            </div>
          ))}
        </div>
      </div>

      {canMove && (
        <>
          <button
            onClick={() => {
              setAnimate(true);
              setIndex((i) => (i - 1 + profiles.length) % profiles.length);
            }}
            className="absolute -left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-card hover:text-primary"
            aria-label="Previous profiles"
          >
            ‹
          </button>
          <button
            onClick={() => {
              setAnimate(true);
              setIndex((i) => (i + 1) % profiles.length);
            }}
            className="absolute -right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-card hover:text-primary"
            aria-label="Next profiles"
          >
            ›
          </button>
          <div className="mt-4 flex justify-center gap-1.5">
            {profiles.map((p, i) => (
              <button
                key={p._id}
                onClick={() => {
                  setAnimate(true);
                  setIndex(i);
                }}
                className={`h-2 rounded-full transition-all ${i === index % profiles.length ? 'w-6 bg-primary' : 'w-2 bg-slate-300'}`}
                aria-label={`Go to profile ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
