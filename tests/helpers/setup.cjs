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
  uid: jest.fn(() => `test-uid-${Math.random().toString(36).substr(2, 9)}`),
  randInt: jest.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min),
  chance: jest.fn((percent) => Math.random() * 100 < percent),
  xpForLevel: jest.fn((level) => Math.floor(100 * 1.2 ** (level - 1))),
  calculateDamage: jest.fn((atk, _atkType, def, _defType, level) => {
    return Math.max(1, Math.floor(((atk * level) / 50 + 2) * (100 / (100 + def))));
  }),
};

// GAME_CONFIG mock
globalThis.GAME_CONFIG = {
  PRIMORDIAL_CHANCE: 0.05,
  AUTO_SAVE_INTERVAL: 30000,
  MAX_PARTY_SIZE: 6,
  BASE_CLICK_POWER: 1,
};

// i18n mock
globalThis.i18n = {
  t: jest.fn((key) => key),
  init: jest.fn(() => Promise.resolve()),
  translateDOM: jest.fn(),
  setLanguage: jest.fn(() => Promise.resolve()),
};

// getEchoById mock (utilisé par Echo.js)
globalThis.getEchoById = jest.fn((_id) => null);

// GAME_EVENTS global (Echo.js l'utilise directement)
globalThis.GAME_EVENTS = {
  ENERGY_CHANGED: 'energy_changed',
  LINKS_CHANGED: 'links_changed',
  CLICK: 'click',
  COMBAT_START: 'combat_start',
  COMBAT_END: 'combat_end',
  ENEMY_DEFEATED: 'enemy_defeated',
  ECHO_CAPTURED: 'echo_captured',
  ECHO_LEVELED_UP: 'echo_leveled_up',
  ECHO_EVOLVED: 'echo_evolved',
  ECHO_FAINTED: 'echo_fainted',
  BOSS_DEFEATED: 'boss_defeated',
  ROUTE_UNLOCKED: 'route_unlocked',
  REGION_UNLOCKED: 'region_unlocked',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  ITEM_PURCHASED: 'item_purchased',
  SAVE_COMPLETE: 'save_complete',
  TICK: 'tick',
};

// Charger echo.js et exposer Echo/generateWildEcho sur globalThis
const fs = require('node:fs');
const echoPath = require('node:path').join(__dirname, '..', '..', 'js', 'core', 'echo.js');
const echoCode = fs.readFileSync(echoPath, 'utf-8');
// Remplacer les imports/exports ES6 et patcher la classe et la fonction
const patchedCode = echoCode
  .replace(/^import \{ Utils \} from '.*';$/m, '// Utils from global')
  .replace(/^import \{ getEchoById \} from '.*';$/m, '// getEchoById from global')
  .replace(/^import \{ GAME_CONFIG \} from '.*';$/m, '// GAME_CONFIG from global')
  .replace(
    /^import \{ EventBus, GAME_EVENTS \} from '.*';$/m,
    '// EventBus, GAME_EVENTS from global',
  )
  .replace(/^export class Echo \{/m, 'globalThis.Echo = class Echo {')
  .replace(
    /^export function generateWildEcho\(/m,
    'globalThis.generateWildEcho = function generateWildEcho(',
  );
eval(patchedCode);

module.exports = {
  EventBus,
  GAME_EVENTS,
  Game,
  createMockGameState,
  UI,
  localStorageMock,
  mockDateNow,
  restoreDateNow,
};
