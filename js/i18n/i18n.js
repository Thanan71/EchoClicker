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
  }

  async loadAllTranslations() {
    const loadPromises = this.supportedLanguages.map(async (lang) => {
      try {
        const response = await fetch(`js/i18n/${lang}.json`);
        if (response.ok) {
          this.translations[lang] = await response.json();
        } else {
        }
      } catch (_error) {}
    });

    await Promise.all(loadPromises);
  }

  async setLanguage(lang) {
    try {
      let selectedLang = lang;
      if (!this.translations[lang]) {
        selectedLang = this.fallbackLang;
      }
      this.currentLang = selectedLang;
      localStorage.setItem('echoclicker_lang', selectedLang);
      this.notifyListeners();
      return true;
    } catch (_error) {
      return false;
    }
  }

  t(key, params = {}) {
    let text = this.getNestedValue(this.translations[this.currentLang], key);
    if (text === undefined && this.currentLang !== this.fallbackLang) {
      text = this.getNestedValue(this.translations[this.fallbackLang], key);
    }
    if (text === undefined) {
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
    if (!obj) {
      return undefined;
    }
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
    for (const callback of this.listeners) {
      try {
        callback(this.currentLang);
      } catch (_error) {}
    }
  }

  translateDOM() {
    for (const element of document.querySelectorAll('[data-i18n]')) {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    }
    for (const element of document.querySelectorAll('[data-i18n-placeholder]')) {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    }
    for (const element of document.querySelectorAll('[data-i18n-title]')) {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    }
  }
}

const i18n = new I18n();

// Rendre i18n accessible globalement pour les modules ES6
window.i18n = i18n;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
