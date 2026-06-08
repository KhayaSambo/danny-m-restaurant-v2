import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const currentLang = useLanguageStore((state) => state.language);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      if (result && k in result) {
        result = result[k];
      } else {
        return key; // Return the key if path doesn't exist
      }
    }

    if (result && typeof result === 'object') {
      return result[currentLang] || result['en'] || key;
    }

    return typeof result === 'string' ? result : key;
  };

  return { t, currentLang };
};
