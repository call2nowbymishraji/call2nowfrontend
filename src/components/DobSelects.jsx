const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DobSelects({ value, onChange, label = 'Date of birth' }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <select aria-label="Day" className="input min-w-0 grow basis-0" value={value.day} onChange={set('day')}>
          <option value="">Day</option>
          {DAYS.map((d) => (
            <option key={d} value={String(d)}>
              {d}
            </option>
          ))}
        </select>
        <select aria-label="Month" className="input min-w-0 grow basis-0" value={value.month} onChange={set('month')}>
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </select>
        <select aria-label="Year" className="input min-w-0 grow basis-0" value={value.year} onChange={set('year')}>
          <option value="">Year</option>
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
