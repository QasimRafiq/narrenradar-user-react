import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files
import translationEnglish from './src/translation/en.json';
import translationGerman from './src/translation/de.json';

// Define the resources object with different namespaces
const resources = {
    en: {
        all: translationEnglish,
    },
    de: {
        all: translationGerman,
    },
};

// Configure i18next
i18next
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources,
        fallbackLng: 'en', // Default language if the translation is not available
        interpolation: {
            escapeValue: false, // React Native doesn't require escaping HTML
        },
    })
    .then(() => {
        // Fetch the language value from AsyncStorage
        AsyncStorage.getItem('language')
            .then((language) => {
                // Set the language if it exists in AsyncStorage, otherwise use the default language
                const selectedLanguage = language || 'en';
                i18next.changeLanguage(selectedLanguage);
            })
            .catch((error) => {
            });
    });

export default i18next;
