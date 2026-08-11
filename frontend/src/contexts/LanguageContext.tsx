import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DisplayLanguage = 'en' | 'my' | 'zh-TW';

interface LanguageOption {
  code: DisplayLanguage;
  name: string;
  nativeName: string;
  fontFamily: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', fontFamily: "'Noto Sans', sans-serif" },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ', fontFamily: "'Noto Sans Myanmar', 'Noto Sans', sans-serif" },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', fontFamily: "'Noto Sans TC', 'Noto Sans', sans-serif" },
];

interface LanguageContextType {
  displayLanguage: DisplayLanguage;
  setDisplayLanguage: (lang: DisplayLanguage) => void;
  currentFont: string;
  options: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  displayLanguage: 'en',
  setDisplayLanguage: () => {},
  currentFont: "'Noto Sans', sans-serif",
  options: LANGUAGE_OPTIONS,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [displayLanguage, setDisplayLanguageState] = useState<DisplayLanguage>(() => {
    return (localStorage.getItem('displayLanguage') as DisplayLanguage) || 'en';
  });

  const currentOption = LANGUAGE_OPTIONS.find((o) => o.code === displayLanguage) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    localStorage.setItem('displayLanguage', displayLanguage);
    document.documentElement.setAttribute('lang', displayLanguage);
    document.documentElement.style.setProperty('--font-display', currentOption.fontFamily);
  }, [displayLanguage, currentOption]);

  const setDisplayLanguage = (lang: DisplayLanguage) => {
    setDisplayLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        displayLanguage,
        setDisplayLanguage,
        currentFont: currentOption.fontFamily,
        options: LANGUAGE_OPTIONS,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
