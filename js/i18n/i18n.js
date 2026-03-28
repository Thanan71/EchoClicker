/**
 * i18n.js - Système de gestion des traductions pour EchoClicker
 * Charge les traductions depuis les fichiers JSON (fr.json, en.json, etc.)
 * Fallback vers le français si une traduction est manquante
 */

class I18n {
    constructor() {
        this.currentLang = 'fr';
        this.translations = {};
        this.fallbackLang = 'fr';
        this.loaded = false;
        this.listeners = [];
        this.supportedLanguages = ['fr', 'en', 'es', 'de', 'ja'];
    }

    async init() {
        // Charger toutes les traductions
        await this.loadAllTranslations();

        // Déterminer la langue sauvegardée ou par défaut
        const savedLang = localStorage.getItem('echoclicker_lang') || 'fr';
        this.setLanguage(savedLang);
        this.loaded = true;
        console.log(`[i18n] Système initialisé avec la langue: ${this.currentLang}`);
    }

    async loadAllTranslations() {
        const loadPromises = this.supportedLanguages.map(async (lang) => {
            try {
                const response = await fetch(`js/i18n/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                    console.log(`[i18n] Traductions ${lang} chargées`);
                } else {
                    console.warn(`[i18n] Impossible de charger ${lang}.json`);
                }
            } catch (error) {
                console.error(`[i18n] Erreur lors du chargement de ${lang}.json:`, error);
            }
        });

        await Promise.all(loadPromises);
    }

    async setLanguage(lang) {
        try {
            if (!this.translations[lang]) {
                console.warn(`[i18n] Langue ${lang} non disponible, utilisation du français`);
                lang = this.fallbackLang;
            }
            this.currentLang = lang;
            localStorage.setItem('echoclicker_lang', lang);
            this.notifyListeners();
            console.log(`[i18n] Langue changée vers: ${lang}`);
            return true;
        } catch (error) {
            console.error(`[i18n] Erreur lors du changement de langue:`, error);
            return false;
        }
    }

    t(key, params = {}) {
        let text = this.getNestedValue(this.translations[this.currentLang], key);
        if (text === undefined && this.currentLang !== this.fallbackLang) {
            text = this.getNestedValue(this.translations[this.fallbackLang], key);
        }
        if (text === undefined) {
            console.warn(`[i18n] Clé non trouvée: ${key}`);
            return key;
        }
        if (typeof text === 'string' && Object.keys(params).length > 0) {
            return text.replace(/\{(\w+)\}/g, (match, paramName) => {
                return params[paramName] !== undefined ? params[paramName] : match;
            });
        }
        return text;
    }

    getNestedValue(obj, path) {
        if (!obj) return undefined;
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    getCurrentLang() {
        return this.currentLang;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    getLanguageName(lang) {
        const names = {
            fr: 'Français',
            en: 'English',
            es: 'Español',
            de: 'Deutsch',
            ja: '日本語',
        };
        return names[lang] || lang;
    }

    getLanguageFlag(lang) {
        const flags = {
            fr: '🇫🇷',
            en: '🇬🇧',
            es: '🇪🇸',
            de: '🇩🇪',
            ja: '🇯🇵',
        };
        return flags[lang] || '🏳️';
    }

    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach((callback) => {
            try {
                callback(this.currentLang);
            } catch (error) {
                console.error('[i18n] Erreur dans un listener:', error);
            }
        });
    }

    translateDOM() {
        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        document.querySelectorAll('[data-i18n-title]').forEach((element) => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }
}

const i18n = new I18n();

// Rendre i18n accessible globalement pour les modules ES6
window.i18n = i18n;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}
