// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import tl from './locales/tl';
import ilo from './locales/ilo';
import ibg from './locales/ibg';

// ============ LANGUAGE ============
const supportedLanguages = ['en', 'tl', 'ilo', 'ibg'];

let savedLanguage = localStorage.getItem('resqnow_language') || 'en';

if (!supportedLanguages.includes(savedLanguage)) {
  savedLanguage = 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tl: { translation: tl },
      ilo: { translation: ilo },
      ibg: { translation: ibg },
    },

    lng: savedLanguage,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,

    interpolation: {
      escapeValue: false,
    },

    returnNull: false,
    debug: import.meta.env.DEV,
  });

document.documentElement.lang = savedLanguage;

export default i18n;