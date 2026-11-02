import { REGION_OPTIONS, useRegion } from '../context/RegionContext.jsx';
import { LANG_OPTIONS, useLang } from '../context/LangContext.jsx';

const SELECT_CLASS =
  'rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-blue-200 sm:px-3 sm:py-2 sm:text-sm';

// The two view choices live in the sticky header so they stay reachable on every screen.
// Both are device settings: neither one is written into the URL, so a shared link still opens
// the same page for the person receiving it.
//
// The auth screens have no header, so they render this without the location picker: a visitor
// still has to be able to leave Hindi before signing in, but choosing what to browse means
// nothing until they are looking at listings.
export default function ViewPickers({ showLocation = true }) {
  const { region, setRegion } = useRegion();
  const { lang, setLang, t } = useLang();

  return (
    <div className="flex items-center gap-1.5">
      {showLocation && (
        <select
          aria-label={t('Search location')}
          title={t('Search location')}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={SELECT_CLASS}
        >
          {REGION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(option === 'all' ? 'All' : option)}
            </option>
          ))}
        </select>
      )}
      <select
        aria-label={t('Platform language')}
        title={t('Platform language')}
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className={SELECT_CLASS}
      >
        {LANG_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
