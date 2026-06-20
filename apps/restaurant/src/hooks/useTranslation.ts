import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const currentLang = useLanguageStore((state) => state.language);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: unknown = translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key; // Return the key if path doesn't exist
      }
    }

    if (result && typeof result === 'object' && !Array.isArray(result)) {
      const resObj = result as Record<string, string>;
      return resObj[currentLang] || resObj['en'] || key;
    }

    return typeof result === 'string' ? result : key;
  };

  return { t, currentLang };
};
