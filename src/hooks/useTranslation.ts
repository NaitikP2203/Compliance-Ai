import { useSettingsStore } from '@/store/settings';
import { TRANSLATIONS, TranslationKey } from '@/constants/translations';

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  
  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || String(key);
  };

  return { t, language };
}
