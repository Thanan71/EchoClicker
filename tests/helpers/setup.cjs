// ============================================
// Setup global des tests
// ============================================
// Chargé via setupFiles (avant le framework)

const { EventBus, GAME_EVENTS } = require('../__mocks__/eventBus');
const { Game, createMockGameState } = require('../__mocks__/game');
const { UI } = require('../__mocks__/ui');
const { localStorageMock, mockDateNow, restoreDateNow } = require('./dom');

// Exposer les mocks sur globalThis pour accès facile dans les tests
globalThis.EventBus = EventBus;
globalThis.GAME_EVENTS = GAME_EVENTS;
globalThis.Game = Game;
globalThis.UI = UI;

// Utils mock (utilisé par Echo)
globalThis.Utils = {
    uid: jest.fn(() => 'test-uid-' + Math.random().toString(36).substr(2, 9)),
    randInt: jest.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
    chance: jest.fn((percent) => Math.random() * 100 < percent),
    xpForLevel: jest.fn((level) => Math.floor(100 * Math.pow(1.2, level - 1))),
    calculateDamage: jest.fn((atk, atkType, def, defType, level) => {
        return Math.max(1, Math.floor((atk * level / 50 + 2) * (100 / (100 + def))));
    })
};

// GAME_CONFIG mock
globalThis.GAME_CONFIG = {
    PRIMORDIAL_CHANCE: 0.05,
    AUTO_SAVE_INTERVAL: 30000,
    MAX_PARTY_SIZE: 6,
    BASE_CLICK_POWER: 1
};

// i18n mock
globalThis.i18n = {
    t: jest.fn((key) => key),
    init: jest.fn(() => Promise.resolve()),
    translateDOM: jest.fn(),
    setLanguage: jest.fn(() => Promise.resolve())
};

// getEchoById mock (utilisé par Echo.js)
globalThis.getEchoById = jest.fn((id) => null);

module.exports = {
    EventBus,
    GAME_EVENTS,
    Game,
    createMockGameState,
    UI,
    localStorageMock,
    mockDateNow,
    restoreDateNow
};
