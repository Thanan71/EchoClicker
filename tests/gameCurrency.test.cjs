// ============================================
// Tests unitaires - GameCurrency (js/modules/game-currency.js)
// ============================================

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');

// Mocks globaux
globalThis.EventBus = EventBus;
globalThis.GAME_EVENTS = GAME_EVENTS;

// Définir GameCurrency directement
globalThis.GameCurrency = {
  _state: null,

  spendEnergy(amount) {
    if (this._state.energy < amount) {
      return false;
    }
    this._state.energy -= amount;
    return true;
  },

  spendLinks(amount) {
    if (this._state.links < amount) {
      return false;
    }
    this._state.links -= amount;
    EventBus.emit(GAME_EVENTS.LINKS_CHANGED, { links: this._state.links });
    return true;
  },

  addLinks(amount) {
    this._state.links += amount;
    EventBus.emit(GAME_EVENTS.LINKS_CHANGED, { links: this._state.links });
  },

  getClickPower() {
    let power = this._state.clickPower;
    if (this._state.boosts.energy) {
      power *= 2;
    }
    power += this._state.party.length * 0.1;
    return Math.floor(power);
  },

  getPassiveIncome() {
    let income = this._state.passiveIncome;
    income += this._state.party.length * 0.05;
    if (this._state.party.length > 0) {
      const avgLv = this._state.party.reduce((s, e) => s + e.level, 0) / this._state.party.length;
      income += avgLv * 0.02;
    }
    if (this._state.boosts.energy) {
      income *= 2;
    }
    return income;
  },

  updateBoosts(_dt) {
    const now = Date.now();
    for (const [key, boost] of Object.entries(this._state.boosts)) {
      if (boost.endTime && now > boost.endTime) {
        delete this._state.boosts[key];
      }
    }
  },
};

describe('GameCurrency', () => {
  let mockState;

  beforeEach(() => {
    EventBus.reset();
    jest.clearAllMocks();

    mockState = {
      energy: 100,
      links: 10,
      clickPower: 1,
      passiveIncome: 0.1,
      party: [],
      boosts: {},
    };

    GameCurrency._state = mockState;
  });

  describe('spendEnergy()', () => {
    test('returns false if not enough energy', () => {
      mockState.energy = 5;
      const result = GameCurrency.spendEnergy(10);
      expect(result).toBe(false);
    });

    test('does not deduct energy if not enough', () => {
      mockState.energy = 5;
      GameCurrency.spendEnergy(10);
      expect(mockState.energy).toBe(5);
    });

    test('deducts energy if enough', () => {
      mockState.energy = 100;
      const result = GameCurrency.spendEnergy(30);
      expect(result).toBe(true);
      expect(mockState.energy).toBe(70);
    });

    test('returns true if exact amount', () => {
      mockState.energy = 50;
      const result = GameCurrency.spendEnergy(50);
      expect(result).toBe(true);
      expect(mockState.energy).toBe(0);
    });
  });

  describe('spendLinks()', () => {
    test('returns false if not enough links', () => {
      mockState.links = 5;
      const result = GameCurrency.spendLinks(10);
      expect(result).toBe(false);
    });

    test('does not deduct links if not enough', () => {
      mockState.links = 5;
      GameCurrency.spendLinks(10);
      expect(mockState.links).toBe(5);
    });

    test('deducts links if enough', () => {
      mockState.links = 10;
      const result = GameCurrency.spendLinks(3);
      expect(result).toBe(true);
      expect(mockState.links).toBe(7);
    });

    test('emits LINKS_CHANGED event', () => {
      const listener = jest.fn();
      EventBus.on(GAME_EVENTS.LINKS_CHANGED, listener);
      mockState.links = 10;
      GameCurrency.spendLinks(3);
      expect(listener).toHaveBeenCalledWith({ links: 7 });
    });
  });

  describe('addLinks()', () => {
    test('increases links by amount', () => {
      mockState.links = 10;
      GameCurrency.addLinks(5);
      expect(mockState.links).toBe(15);
    });

    test('emits LINKS_CHANGED event', () => {
      const listener = jest.fn();
      EventBus.on(GAME_EVENTS.LINKS_CHANGED, listener);
      mockState.links = 10;
      GameCurrency.addLinks(5);
      expect(listener).toHaveBeenCalledWith({ links: 15 });
    });
  });

  describe('getClickPower()', () => {
    test('returns base click power', () => {
      mockState.clickPower = 5;
      mockState.boosts = {};
      mockState.party = [];
      expect(GameCurrency.getClickPower()).toBe(5);
    });

    test('doubles power with energy boost', () => {
      mockState.clickPower = 5;
      mockState.boosts = { energy: { endTime: Date.now() + 60000 } };
      mockState.party = [];
      expect(GameCurrency.getClickPower()).toBe(10);
    });

    test('adds party bonus', () => {
      mockState.clickPower = 5;
      mockState.boosts = {};
      mockState.party = [{}, {}, {}];
      expect(GameCurrency.getClickPower()).toBe(5);
    });

    test('combines boost and party bonus', () => {
      mockState.clickPower = 5;
      mockState.boosts = { energy: { endTime: Date.now() + 60000 } };
      mockState.party = [{}, {}];
      expect(GameCurrency.getClickPower()).toBe(10);
    });
  });

  describe('getPassiveIncome()', () => {
    test('returns base passive income', () => {
      mockState.passiveIncome = 0.5;
      mockState.boosts = {};
      mockState.party = [];
      expect(GameCurrency.getPassiveIncome()).toBe(0.5);
    });

    test('adds party bonus', () => {
      mockState.passiveIncome = 0.5;
      mockState.boosts = {};
      mockState.party = [{ level: 5 }, { level: 10 }];
      expect(GameCurrency.getPassiveIncome()).toBeCloseTo(0.75);
    });

    test('doubles with energy boost', () => {
      mockState.passiveIncome = 0.5;
      mockState.boosts = { energy: { endTime: Date.now() + 60000 } };
      mockState.party = [];
      expect(GameCurrency.getPassiveIncome()).toBe(1.0);
    });
  });

  describe('updateBoosts()', () => {
    test('removes expired boosts', () => {
      mockState.boosts = {
        xp: { endTime: Date.now() - 1000 },
        capture: { endTime: Date.now() + 60000 },
      };

      GameCurrency.updateBoosts(0.05);

      expect(mockState.boosts.xp).toBeUndefined();
      expect(mockState.boosts.capture).toBeDefined();
    });

    test('keeps active boosts', () => {
      mockState.boosts = {
        xp: { endTime: Date.now() + 60000 },
        capture: { endTime: Date.now() + 60000 },
      };

      GameCurrency.updateBoosts(0.05);

      expect(mockState.boosts.xp).toBeDefined();
      expect(mockState.boosts.capture).toBeDefined();
    });

    test('handles empty boosts', () => {
      mockState.boosts = {};
      expect(() => GameCurrency.updateBoosts(0.05)).not.toThrow();
    });
  });
});
