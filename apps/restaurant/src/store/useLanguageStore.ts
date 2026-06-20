import { create } from 'zustand';

export type LanguageCode =
  | 'en'
  | 'zu'
  | 'xh'
  | 'af'
  | 'nso'
  | 'tn'
  | 'st'
  | 'ts'
  | 'ss'
  | 've'
  | 'nr';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'nso', name: 'Northern Sotho', nativeName: 'Sepedi' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana' },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho' },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga' },
  { code: 'ss', name: 'Swati', nativeName: 'SiSwati' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenda' },
  { code: 'nr', name: 'Ndebele', nativeName: 'isiNdebele' }
];

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>((set) => {
  const persistedLang = localStorage.getItem('danny-m-lang') as LanguageCode | null;
  const initialLanguage = persistedLang && LANGUAGES.some(l => l.code === persistedLang)
    ? persistedLang
    : 'en';

  return {
    language: initialLanguage,
    setLanguage: (lang) => {
      localStorage.setItem('danny-m-lang', lang);
      set({ language: lang });
    }
  };
});
