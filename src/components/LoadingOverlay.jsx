// The backend can take a few seconds to answer (a cold Render container), which used to leave
// the home page showing an empty-state card that read as a broken site. The veil states that
// wait out loud over the page's own skeleton.
//
// It is deliberately pointer-events-none: the veil only paints, so the navbar and search bar
// stay usable while a request is in flight instead of trapping the visitor behind a spinner.
export default function LoadingOverlay({ label = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-white/45 backdrop-blur-[3px]"
    >
      <div className="flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 shadow-card">
        <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-blue-200 border-t-primary" />
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      </div>
    </div>
  );
}

// One card slot. The heights track the profile card's own measured size at each breakpoint
// (about 207px below xl, 257px above), so replacing the skeleton with real cards does not
// shove the rest of the page down when the data lands.
export function CardSkeleton({ className = '' }) {
  return <div className={`card h-52 animate-pulse bg-slate-100 xl:h-64 ${className}`} aria-hidden="true" />;
}

// A row of them, sized like the suggested carousel: one card on a phone, two from tablet up.
export function CardSkeletonRow({ count = 2 }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
