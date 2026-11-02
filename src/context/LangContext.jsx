import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANG, translate } from '../i18n/hindi.js';

export const LANG_OPTIONS = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
];

const STORAGE_KEY = 'c2n.lang';

const readStoredLang = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return LANG_OPTIONS.some((l) => l.code === value) ? value : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
};

// Hindi is the default because most of the shopkeepers finding the site through a shared link
// read it first; the navbar choice is remembered per device and never changes the URL.
const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {}, t: (key) => key });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode: the choice just is not remembered */
    }
    // Screen readers and translate services read this, and the prerender writes the same value.
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, vars) => translate(lang, key, vars);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
