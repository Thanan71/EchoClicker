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

// Créer un mock de la classe Echo directement
class Echo {
  constructor(data, level = 1, isPrimordial = false) {
    this.uid = globalThis.Utils.uid();
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.emoji = data.emoji;
    this.rarity = data.rarity || 'common';
    this.isPrimordial = isPrimordial;
    this.description = data.desc || '';

    // Stats de base
    this.baseHp = data.baseHp;
    this.baseAtk = data.baseAtk;
    this.baseDef = data.baseDef;
    this.baseSpd = data.baseSpd;

    // Niveau & XP
    this.level = level;
    this.xp = 0;
    this.xpToNext = globalThis.Utils.xpForLevel(level);

    // Stats calculées
    this.recalcStats();

    // HP actuels
    this.hp = this.maxHp;

    // Évolution
    this.evolution = data.evo || null;
  }

  recalcStats() {
    const primMult = this.isPrimordial ? 1.1 : 1;
    this.maxHp = Math.floor((this.baseHp + this.level * 3) * primMult);
    this.atk = Math.floor((this.baseAtk + this.level * 2) * primMult);
    this.def = Math.floor((this.baseDef + this.level * 2) * primMult);
    this.spd = Math.floor((this.baseSpd + this.level * 1.5) * primMult);
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
  }

  gainXp(amount) {
    let xpToAdd = amount;
    if (globalThis.Game?.state?.boosts?.xp) {
      xpToAdd = Math.floor(xpToAdd * 1.5);
    }
    this.xp += xpToAdd;
    const leveledUp = [];
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = globalThis.Utils.xpForLevel(this.level);
      this.recalcStats();
      this.hp = this.maxHp; // Heal on level up
      leveledUp.push(this.level);
      globalThis.EventBus.emit(globalThis.GAME_EVENTS.ECHO_LEVELED_UP, {
        echo: this,
        level: this.level,
      });
      if (this.evolution && this.level >= this.evolution.lv) {
        this.evolve();
      }
    }
    return leveledUp;
  }

  evolve() {
    if (!this.evolution) {
      return;
    }
    const evoData = globalThis.getEchoById(this.evolution.to);
    if (!evoData) {
      return;
    }

    const oldName = this.name;
    this.id = evoData.id;
    this.name = evoData.name;
    this.emoji = evoData.emoji;
    this.type = evoData.type;
    this.rarity = evoData.rarity;
    this.description = evoData.desc;
    this.baseHp = evoData.baseHp;
    this.baseAtk = evoData.baseAtk;
    this.baseDef = evoData.baseDef;
    this.baseSpd = evoData.baseSpd;
    this.evolution = evoData.evo || null;
    this.recalcStats();
    this.hp = this.maxHp;

    globalThis.EventBus.emit(globalThis.GAME_EVENTS.ECHO_EVOLVED, { echo: this, oldName });
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      globalThis.EventBus.emit(globalThis.GAME_EVENTS.ECHO_FAINTED, { echo: this });
      return true; // is fainted
    }
    return false;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  fullHeal() {
    this.hp = this.maxHp;
  }

  isAlive() {
    return this.hp > 0;
  }

  getHpPercent() {
    return (this.hp / this.maxHp) * 100;
  }

  calculateDamageAgainst(defender) {
    return globalThis.Utils.calculateDamage(
      this.atk,
      this.type,
      defender.def,
      defender.type,
      this.level,
    );
  }

  getAttackInterval() {
    return Math.max(500, 3000 - this.spd * 30);
  }

  // Sérialisation pour la sauvegarde
  toJSON() {
    return {
      uid: this.uid,
      id: this.id,
      name: this.name,
      type: this.type,
      emoji: this.emoji,
      rarity: this.rarity,
      isPrimordial: this.isPrimordial,
      description: this.description,
      baseHp: this.baseHp,
      baseAtk: this.baseAtk,
      baseDef: this.baseDef,
      baseSpd: this.baseSpd,
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext,
      hp: this.hp,
      maxHp: this.maxHp,
      atk: this.atk,
      def: this.def,
      spd: this.spd,
      evolution: this.evolution,
    };
  }

  // Reconstruction depuis JSON
  static fromJSON(json) {
    const data = globalThis.getEchoById(json.id) || json;
    const echo = new Echo(data, json.level, json.isPrimordial);
    echo.uid = json.uid;
    echo.xp = json.xp || 0;
    echo.xpToNext = json.xpToNext || globalThis.Utils.xpForLevel(json.level);
    echo.hp = json.hp || echo.maxHp;
    echo.rarity = json.rarity || 'common';
    echo.description = json.description || '';
    return echo;
  }
}

// Génération d'un Écho sauvage
function generateWildEcho(routeIds, routeLv) {
  const id = routeIds[globalThis.Utils.randInt(0, routeIds.length - 1)];
  const data = globalThis.getEchoById(id);
  if (!data) {
    return null;
  }
  const lvRange = routeLv.split('-').map(Number);
  const level = globalThis.Utils.randInt(lvRange[0], lvRange[1]);
  const primordial = globalThis.Utils.chance(globalThis.GAME_CONFIG.PRIMORDIAL_CHANCE * 100);
  return new Echo(data, level, primordial);
}

// Exposer sur globalThis
globalThis.Echo = Echo;
globalThis.generateWildEcho = generateWildEcho;

module.exports = {
  EventBus,
  GAME_EVENTS,
  Game,
  createMockGameState,
  UI,
  localStorageMock,
  mockDateNow,
  restoreDateNow,
  Utils: globalThis.Utils,
};
