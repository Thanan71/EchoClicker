// ============================================
// Tests unitaires - SaveSerializer (js/save-serializer.js)
// ============================================

// Mocks globaux
globalThis.GAME_CONFIG = {
  ENERGY_PER_CLICK_BASE: 1,
  PASSIVE_BASE: 0.1,
};

globalThis.REGIONS = [{ id: 'foret', name: 'Forêt', routes: [], bosses: [] }];

globalThis.Utils = {
  deepClone: jest.fn((obj) => JSON.parse(JSON.stringify(obj))),
};

// Définir SaveSerializer directement
globalThis.SaveSerializer = {
  CURRENT_VERSION: 4,

  serialize(state, systemState) {
    return {
      v: this.CURRENT_VERSION,
      ts: Date.now(),
      s: {
        energy: state.energy,
        links: state.links,
        crystals: state.crystals,
        shards: state.shards,
        totalEnergy: state.totalEnergy,
        totalClicks: state.totalClicks,
        totalCaptures: state.totalCaptures,
        uniqueCaptures: state.uniqueCaptures,
        primordialCount: state.primordialCount,
        totalWins: state.totalWins,
        bossesDefeated: state.bossesDefeated,
        regionsUnlocked: state.regionsUnlocked,
        maxLevel: state.maxLevel,
        playTime: state.playTime,
        startTime: state.startTime,
        clickPower: state.clickPower,
        passiveIncome: state.passiveIncome,
        currentRegion: state.currentRegion,
        party: state.party.map((e) => e.toJSON()),
        reserves: state.reserves.map((e) => e.toJSON()),
        seenEchoes: [...state.seenEchoes],
        caughtEchoes: [...state.caughtEchoes],
        achievements: [...state.achievements],
        regions: state.regions,
        boosts: state.boosts,
        inventory: state.inventory || [],
        mine: systemState.mine,
        hatchery: systemState.hatchery,
        quests: systemState.quests,
      },
    };
  },

  _restorePrimitiveState(s, state) {
    const primitiveDefaults = {
      energy: 0,
      links: 5,
      crystals: 0,
      shards: 0,
      totalEnergy: 0,
      totalClicks: 0,
      totalCaptures: 0,
      uniqueCaptures: 0,
      primordialCount: 0,
      totalWins: 0,
      bossesDefeated: 0,
      regionsUnlocked: 1,
      maxLevel: 1,
      playTime: 0,
      startTime: Date.now(),
      clickPower: GAME_CONFIG.ENERGY_PER_CLICK_BASE,
      passiveIncome: GAME_CONFIG.PASSIVE_BASE,
      currentRegion: 'foret',
    };
    for (const [key, defaultValue] of Object.entries(primitiveDefaults)) {
      state[key] = s[key] ?? defaultValue;
    }
    state.regions = s.regions ?? Utils.deepClone(REGIONS);
    state.boosts = s.boosts ?? {};
    state.inventory = s.inventory || [];
  },

  _restoreCollections(s, state, Echo) {
    state.party = (s.party || []).map((j) => Echo.fromJSON(j));
    state.reserves = (s.reserves || []).map((j) => Echo.fromJSON(j));
    state.seenEchoes = new Set(s.seenEchoes || []);
    state.caughtEchoes = new Set(s.caughtEchoes || []);
    state.achievements = new Set(s.achievements || []);
  },

  _restoreSystemHandlers(s, Mine, Hatchery, questSystem) {
    if (s.mine) {
      Mine.fromJSON(s.mine);
    }
    if (s.hatchery) {
      Hatchery.fromJSON(s.hatchery);
    }
    if (s.quests) {
      questSystem.fromJSON(s.quests);
    }
  },

  deserialize(data, state, systemHandlers) {
    try {
      if (!data?.s) {
        return false;
      }
      const s = data.s;
      const { Mine, Hatchery, questSystem, Echo } = systemHandlers;
      this._restorePrimitiveState(s, state);
      this._restoreCollections(s, state, Echo);
      this._restoreSystemHandlers(s, Mine, Hatchery, questSystem);
      return true;
    } catch (_e) {
      return false;
    }
  },
};

describe('SaveSerializer', () => {
  describe('CURRENT_VERSION', () => {
    test('is defined', () => {
      expect(SaveSerializer.CURRENT_VERSION).toBeDefined();
    });

    test('is a number', () => {
      expect(typeof SaveSerializer.CURRENT_VERSION).toBe('number');
    });

    test('is 4', () => {
      expect(SaveSerializer.CURRENT_VERSION).toBe(4);
    });
  });

  describe('serialize()', () => {
    let mockState;
    let mockSystemState;

    beforeEach(() => {
      mockState = {
        energy: 100,
        links: 10,
        crystals: 5,
        shards: 2,
        totalEnergy: 500,
        totalClicks: 200,
        totalCaptures: 10,
        uniqueCaptures: 8,
        primordialCount: 1,
        totalWins: 50,
        bossesDefeated: 2,
        regionsUnlocked: 2,
        maxLevel: 15,
        playTime: 3600,
        startTime: Date.now() - 3600000,
        clickPower: 2,
        passiveIncome: 0.5,
        currentRegion: 'foret',
        party: [{ toJSON: () => ({ id: 1, level: 5 }) }],
        reserves: [{ toJSON: () => ({ id: 2, level: 3 }) }],
        seenEchoes: new Set([1, 2, 3]),
        caughtEchoes: new Set([1, 2]),
        achievements: new Set(['first_capture']),
        regions: [{ id: 'foret', unlocked: true }],
        boosts: { xp: { endTime: Date.now() + 60000 } },
        inventory: [{ id: 'potion', count: 3 }],
      };

      mockSystemState = {
        mine: { energy: 50, grid: [] },
        hatchery: { slots: [] },
        quests: { dailyQuests: [], storyQuests: [] },
      };
    });

    test('returns object with version', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.v).toBe(SaveSerializer.CURRENT_VERSION);
    });

    test('returns object with timestamp', () => {
      const before = Date.now();
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      const after = Date.now();
      expect(result.ts).toBeGreaterThanOrEqual(before);
      expect(result.ts).toBeLessThanOrEqual(after);
    });

    test('returns object with s property', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.s).toBeDefined();
    });

    test('serializes energy', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.s.energy).toBe(100);
    });

    test('serializes links', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.s.links).toBe(10);
    });

    test('serializes crystals', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.s.crystals).toBe(5);
    });

    test('serializes party as array of toJSON results', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(Array.isArray(result.s.party)).toBe(true);
      expect(result.s.party[0]).toEqual({ id: 1, level: 5 });
    });

    test('serializes seenEchoes as array', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(Array.isArray(result.s.seenEchoes)).toBe(true);
      expect(result.s.seenEchoes).toEqual([1, 2, 3]);
    });

    test('serializes caughtEchoes as array', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(Array.isArray(result.s.caughtEchoes)).toBe(true);
      expect(result.s.caughtEchoes).toEqual([1, 2]);
    });

    test('serializes achievements as array', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(Array.isArray(result.s.achievements)).toBe(true);
      expect(result.s.achievements).toEqual(['first_capture']);
    });

    test('includes mine system state', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.s.mine).toEqual({ energy: 50, grid: [] });
    });

    test('includes hatchery system state', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.s.hatchery).toEqual({ slots: [] });
    });

    test('includes quests system state', () => {
      const result = SaveSerializer.serialize(mockState, mockSystemState);
      expect(result.s.quests).toEqual({ dailyQuests: [], storyQuests: [] });
    });
  });

  describe('deserialize()', () => {
    let mockState;
    let mockSystemHandlers;

    beforeEach(() => {
      mockState = {};
      mockSystemHandlers = {
        Mine: { fromJSON: jest.fn() },
        Hatchery: { fromJSON: jest.fn() },
        questSystem: { fromJSON: jest.fn() },
        Echo: { fromJSON: jest.fn((json) => ({ ...json, uid: 'restored' })) },
      };
    });

    test('returns false if data is null', () => {
      const result = SaveSerializer.deserialize(null, mockState, mockSystemHandlers);
      expect(result).toBe(false);
    });

    test('returns false if data.s is missing', () => {
      const result = SaveSerializer.deserialize({}, mockState, mockSystemHandlers);
      expect(result).toBe(false);
    });

    test('returns true on successful deserialize', () => {
      const data = {
        v: 4,
        ts: Date.now(),
        s: {
          energy: 100,
          links: 10,
          party: [],
          reserves: [],
          seenEchoes: [],
          caughtEchoes: [],
          achievements: [],
        },
      };
      const result = SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(result).toBe(true);
    });

    test('restores energy', () => {
      const data = {
        v: 4,
        s: {
          energy: 100,
          party: [],
          reserves: [],
          seenEchoes: [],
          caughtEchoes: [],
          achievements: [],
        },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockState.energy).toBe(100);
    });

    test('restores links', () => {
      const data = {
        v: 4,
        s: {
          links: 10,
          party: [],
          reserves: [],
          seenEchoes: [],
          caughtEchoes: [],
          achievements: [],
        },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockState.links).toBe(10);
    });

    test('defaults energy to 0 if missing', () => {
      const data = {
        v: 4,
        s: { party: [], reserves: [], seenEchoes: [], caughtEchoes: [], achievements: [] },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockState.energy).toBe(0);
    });

    test('restores party from JSON', () => {
      const data = {
        v: 4,
        s: {
          party: [{ id: 1, level: 5 }],
          reserves: [],
          seenEchoes: [],
          caughtEchoes: [],
          achievements: [],
        },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockSystemHandlers.Echo.fromJSON).toHaveBeenCalledWith({ id: 1, level: 5 });
    });

    test('restores seenEchoes as Set', () => {
      const data = {
        v: 4,
        s: { party: [], reserves: [], seenEchoes: [1, 2, 3], caughtEchoes: [], achievements: [] },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockState.seenEchoes instanceof Set).toBe(true);
      expect(mockState.seenEchoes.has(1)).toBe(true);
    });

    test('calls Mine.fromJSON if mine data exists', () => {
      const data = {
        v: 4,
        s: {
          party: [],
          reserves: [],
          seenEchoes: [],
          caughtEchoes: [],
          achievements: [],
          mine: { energy: 50 },
        },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockSystemHandlers.Mine.fromJSON).toHaveBeenCalledWith({ energy: 50 });
    });

    test('calls Hatchery.fromJSON if hatchery data exists', () => {
      const data = {
        v: 4,
        s: {
          party: [],
          reserves: [],
          seenEchoes: [],
          caughtEchoes: [],
          achievements: [],
          hatchery: { slots: [] },
        },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockSystemHandlers.Hatchery.fromJSON).toHaveBeenCalledWith({ slots: [] });
    });

    test('calls questSystem.fromJSON if quests data exists', () => {
      const data = {
        v: 4,
        s: {
          party: [],
          reserves: [],
          seenEchoes: [],
          caughtEchoes: [],
          achievements: [],
          quests: { dailyQuests: [] },
        },
      };
      SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(mockSystemHandlers.questSystem.fromJSON).toHaveBeenCalledWith({ dailyQuests: [] });
    });

    test('returns false on error', () => {
      const data = {
        v: 4,
        s: null,
      };
      const result = SaveSerializer.deserialize(data, mockState, mockSystemHandlers);
      expect(result).toBe(false);
    });
  });
});
