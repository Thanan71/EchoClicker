// ============================================
// Setup DOM - Configure jsdom global pour les tests
// ============================================
// Ce fichier est chargé par setupFilesAfterFramework dans jest.config.js
// et s'assure que document, window, localStorage sont disponibles.

// localStorage mock
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = String(value);
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: jest.fn((index) => Object.keys(store)[index] || null),
    };
})();

// Exposer localStorage si pas déjà disponible
if (typeof globalThis.localStorage === 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
    });
}

// requestAnimationFrame mock
if (typeof globalThis.requestAnimationFrame === 'undefined') {
    globalThis.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
    globalThis.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));
}

// Date.now mock helper
const mockDateNow = (timestamp) => {
    jest.spyOn(Date, 'now').mockReturnValue(timestamp);
};

const restoreDateNow = () => {
    if (Date.now.mockRestore) {
        Date.now.mockRestore();
    }
};

module.exports = {
    localStorageMock,
    mockDateNow,
    restoreDateNow,
};
