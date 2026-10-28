export default function ModeTabs({ value, onChange, options }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-2 py-2 text-sm font-semibold transition ${
            value === o.id ? 'bg-white text-primary shadow-pill' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
