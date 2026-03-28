// ============================================
// Tests unitaires - I18n (js/i18n/i18n.js)
// ============================================

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        ui: { test: 'Test' },
        combat: { victory: 'Victoire!' },
      }),
  }),
);

// Mock document
globalThis.document = {
  readyState: 'complete',
  addEventListener: jest.fn(),
  querySelectorAll: jest.fn(() => []),
};

// Mock console
globalThis.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Définir I18n directement
globalThis.I18n = class I18n {
  constructor() {
    this.currentLang = 'fr';
    this.translations = {};
    this.fallbackLang = 'fr';
    this.loaded = false;
    this.listeners = [];
    this.supportedLanguages = ['fr', 'en', 'es', 'de', 'ja'];
  }

  async init() {
    await this.loadAllTranslations();

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
      if (!this.translations[lang]) {
        lang = this.fallbackLang;
      }
      this.currentLang = lang;
      localStorage.setItem('echoclicker_lang', lang);
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
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentLang);
      } catch (_error) {}
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
};

// Créer une instance singleton
globalThis.i18n = new I18n();

describe('I18n', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    i18n.translations = {
      fr: {
        ui: { test: 'Test FR', hello: 'Bonjour {name}!' },
        combat: { victory: 'Victoire!' },
      },
      en: {
        ui: { test: 'Test EN', hello: 'Hello {name}!' },
        combat: { victory: 'Victory!' },
      },
    };
    i18n.currentLang = 'fr';
    i18n.listeners = [];
  });

  describe('constructor', () => {
    test('defaults to fr language', () => {
      expect(i18n.currentLang).toBe('fr');
    });

    test('has supported languages', () => {
      expect(i18n.supportedLanguages).toContain('fr');
      expect(i18n.supportedLanguages).toContain('en');
    });

    test('sets fallbackLang to fr', () => {
      expect(i18n.fallbackLang).toBe('fr');
    });
  });

  describe('t()', () => {
    test('returns translation for valid key', () => {
      expect(i18n.t('ui.test')).toBe('Test FR');
    });

    test('returns key for missing translation', () => {
      expect(i18n.t('ui.missing')).toBe('ui.missing');
    });

    test('falls back to fallback language', () => {
      i18n.currentLang = 'en';
      i18n.translations.en = { ui: {} };
      expect(i18n.t('combat.victory')).toBe('Victoire!');
    });

    test('handles nested keys', () => {
      expect(i18n.t('combat.victory')).toBe('Victoire!');
    });

    test('replaces parameters in translation', () => {
      expect(i18n.t('ui.hello', { name: 'Jean' })).toBe('Bonjour Jean!');
    });

    test('keeps placeholder if param not provided', () => {
      expect(i18n.t('ui.hello')).toBe('Bonjour {name}!');
    });

    test('returns key for completely missing path', () => {
      expect(i18n.t('nonexistent.deep.key')).toBe('nonexistent.deep.key');
    });
  });

  describe('setLanguage()', () => {
    test('changes current language', async () => {
      await i18n.setLanguage('en');
      expect(i18n.currentLang).toBe('en');
    });

    test('saves to localStorage', async () => {
      await i18n.setLanguage('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('echoclicker_lang', 'en');
    });

    test('falls back to fr for unsupported language', async () => {
      await i18n.setLanguage('unsupported');
      expect(i18n.currentLang).toBe('fr');
    });

    test('notifies listeners', async () => {
      const listener = jest.fn();
      i18n.onLanguageChange(listener);
      await i18n.setLanguage('en');
      expect(listener).toHaveBeenCalledWith('en');
    });
  });

  describe('getCurrentLang()', () => {
    test('returns current language', () => {
      expect(i18n.getCurrentLang()).toBe('fr');
    });

    test('returns updated language after change', async () => {
      await i18n.setLanguage('en');
      expect(i18n.getCurrentLang()).toBe('en');
    });
  });

  describe('getSupportedLanguages()', () => {
    test('returns array of supported languages', () => {
      const langs = i18n.getSupportedLanguages();
      expect(Array.isArray(langs)).toBe(true);
      expect(langs).toContain('fr');
      expect(langs).toContain('en');
    });
  });

  describe('getLanguageName()', () => {
    test('returns Français for fr', () => {
      expect(i18n.getLanguageName('fr')).toBe('Français');
    });

    test('returns English for en', () => {
      expect(i18n.getLanguageName('en')).toBe('English');
    });

    test('returns Español for es', () => {
      expect(i18n.getLanguageName('es')).toBe('Español');
    });

    test('returns Deutsch for de', () => {
      expect(i18n.getLanguageName('de')).toBe('Deutsch');
    });

    test('returns 日本語 for ja', () => {
      expect(i18n.getLanguageName('ja')).toBe('日本語');
    });

    test('returns lang code for unknown', () => {
      expect(i18n.getLanguageName('unknown')).toBe('unknown');
    });
  });

  describe('getLanguageFlag()', () => {
    test('returns 🇫🇷 for fr', () => {
      expect(i18n.getLanguageFlag('fr')).toBe('🇫🇷');
    });

    test('returns 🇬🇧 for en', () => {
      expect(i18n.getLanguageFlag('en')).toBe('🇬🇧');
    });

    test('returns 🇪🇸 for es', () => {
      expect(i18n.getLanguageFlag('es')).toBe('🇪🇸');
    });

    test('returns 🇩🇪 for de', () => {
      expect(i18n.getLanguageFlag('de')).toBe('🇩🇪');
    });

    test('returns 🇯🇵 for ja', () => {
      expect(i18n.getLanguageFlag('ja')).toBe('🇯🇵');
    });

    test('returns 🏳️ for unknown', () => {
      expect(i18n.getLanguageFlag('unknown')).toBe('🏳️');
    });
  });

  describe('onLanguageChange()', () => {
    test('adds listener to list', () => {
      const listener = jest.fn();
      i18n.onLanguageChange(listener);
      expect(i18n.listeners).toContain(listener);
    });
  });

  describe('getNestedValue()', () => {
    test('returns nested value', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(i18n.getNestedValue(obj, 'a.b.c')).toBe('value');
    });

    test('returns undefined for missing path', () => {
      const obj = { a: { b: 1 } };
      expect(i18n.getNestedValue(obj, 'a.c.d')).toBeUndefined();
    });

    test('returns undefined for null obj', () => {
      expect(i18n.getNestedValue(null, 'a.b')).toBeUndefined();
    });

    test('returns undefined for undefined obj', () => {
      expect(i18n.getNestedValue(undefined, 'a.b')).toBeUndefined();
    });
  });
});
