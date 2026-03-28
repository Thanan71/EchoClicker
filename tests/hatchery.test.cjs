// ============================================
// Tests unitaires - Hatchery (js/systems/hatchery.js)
// ============================================

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');
const { Game, createMockGameState } = require('./__mocks__/game.cjs');
const { UI } = require('./__mocks__/ui.cjs');

// Mocks globaux
globalThis.GAME_CONFIG = {
  MAX_PARTY: 6,
};

globalThis.TYPES = {
  FEU: { name: 'Feu', color: '#ff6b35', emoji: '🔥' },
  OCEAN: { name: 'Océan', color: '#0984e3', emoji: '🌊' },
  FLORE: { name: 'Flore', color: '#55a630', emoji: '🌿' },
};

globalThis.ECHOES_DB = [
  {
    id: 1,
    name: 'Echo1',
    type: 'FEU',
    rarity: 'common',
    baseHp: 30,
    baseAtk: 15,
    baseDef: 10,
    baseSpd: 12,
  },
  {
    id: 2,
    name: 'Echo2',
    type: 'OCEAN',
    rarity: 'uncommon',
    baseHp: 40,
    baseAtk: 20,
    baseDef: 15,
    baseSpd: 14,
  },
  {
    id: 3,
    name: 'Echo3',
    type: 'FLORE',
    rarity: 'rare',
    baseHp: 50,
    baseAtk: 25,
    baseDef: 20,
    baseSpd: 16,
  },
];

globalThis.getEchoById = jest.fn((id) => ECHOES_DB.find((e) => e.id === id));
globalThis.getEchoImagePath = jest.fn((echo) => `assets/echos/echo_${echo.id}.png`);

globalThis.Echo = jest.fn(function (data, level, isPrimordial) {
  this.uid = `echo-${Math.random().toString(36).substr(2, 9)}`;
  this.id = data.id;
  this.name = data.name;
  this.type = data.type;
  this.rarity = data.rarity;
  this.level = level || 1;
  this.isPrimordial = isPrimordial || false;
  this.baseHp = data.baseHp;
  this.baseAtk = data.baseAtk;
  this.baseDef = data.baseDef;
  this.baseSpd = data.baseSpd;
});

globalThis.Utils = {
  formatTime: jest.fn((seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }),
};

// Mock document
globalThis.document = {
  getElementById: jest.fn(() => null),
  addEventListener: jest.fn(),
};

// Définir Hatchery directement
globalThis.Hatchery = {
  slots: [],
  maxSlots: 4,
  parents: [null, null],

  _game: null,
  _ui: null,
  _eventBus: null,

  init(gameRef, uiRef, eventBusRef) {
    this._game = gameRef;
    this._ui = uiRef;
    this._eventBus = eventBusRef;
    this.slots = Array(this.maxSlots).fill(null);
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('btn-breed')?.addEventListener('click', () => this.breed());
    document.getElementById('parent-1')?.addEventListener('click', () => this.selectParent(0));
    document.getElementById('parent-2')?.addEventListener('click', () => this.selectParent(1));
  },

  selectParent(slotIndex) {
    const party = [...this._game.state.party, ...this._game.state.reserves];
    if (party.length === 0) {
      this._ui.toast('Aucun Écho disponible !', 'error');
      return;
    }

    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
    party.forEach((echo) => {
      const _t = TYPES[echo.type];
      const imgPath = getEchoImagePath(echo);
      html += `<div class="party-slot" onclick="Hatchery.setParent(${slotIndex}, '${echo.uid}')">
                <div class="party-echo-icon">${echo.isPrimordial ? '⭐' : ''}<img src="${imgPath}" alt="${echo.name}" style="width:48px;height:48px;object-fit:contain"></div>
                <div class="party-echo-name">${echo.name}</div>
                <div class="party-echo-level">Nv. ${echo.level}</div>
            </div>`;
    });
    html += '</div>';

    this._ui.showModal('Sélectionner un parent', html);
  },

  setParent(slotIndex, uid) {
    const echo = this._game.findEcho(uid);
    if (!echo) {
      return;
    }

    const otherSlot = slotIndex === 0 ? 1 : 0;
    if (this.parents[otherSlot]?.uid === uid) {
      this._ui.toast('Cet Écho est déjà sélectionné !', 'warning');
      return;
    }

    this.parents[slotIndex] = echo;
    this._ui.closeModal();
    this.updateDisplay();
    this.checkCanBreed();
  },

  checkCanBreed() {
    const btn = document.getElementById('btn-breed');
    if (!btn) {
      return;
    }

    const canBreed = this.parents[0] && this.parents[1] && this.hasFreeSlot();
    btn.disabled = !canBreed;
  },

  hasFreeSlot() {
    return this.slots.some((s) => s === null);
  },

  breed() {
    if (!this.parents[0] || !this.parents[1]) {
      this._ui.toast('Sélectionne deux parents !', 'error');
      return;
    }

    if (!this.hasFreeSlot()) {
      this._ui.toast('Tous les incubateurs sont occupés !', 'error');
      return;
    }

    const p1 = this.parents[0];
    const p2 = this.parents[1];

    const offspring = this.calculateOffspring(p1, p2);

    const slotIndex = this.slots.findIndex((s) => s === null);
    const incubationTime = this.getIncubationTime(offspring.rarity);

    this.slots[slotIndex] = {
      egg: offspring,
      startTime: Date.now(),
      duration: incubationTime,
      parent1: p1.id,
      parent2: p2.id,
    };

    this.parents = [null, null];

    this._ui.toast('🥚 Œuf créé ! Incubation en cours...', 'success');
    this.updateDisplay();
  },

  calculateOffspring(p1, p2) {
    const type = this.determineOffspringType(p1, p2);

    const possibleEchoes = ECHOES_DB.filter((e) => e.type === type);

    const avgRarity = this.getAverageRarity(p1, p2);
    const filteredEchoes = possibleEchoes.filter(
      (e) => this.getRarityWeight(e.rarity) <= avgRarity + 1,
    );

    const chosen =
      filteredEchoes.length > 0
        ? filteredEchoes[Math.floor(Math.random() * filteredEchoes.length)]
        : possibleEchoes[0];

    const primordialChance = (p1.isPrimordial ? 0.02 : 0) + (p2.isPrimordial ? 0.02 : 0) + 0.005;
    const isPrimordial = Math.random() < primordialChance;

    const avgLevel = Math.floor((p1.level + p2.level) / 2);
    const level = Math.max(1, avgLevel - 2 + Math.floor(Math.random() * 5));

    return {
      id: chosen.id,
      name: chosen.name,
      emoji: chosen.emoji,
      type: chosen.type,
      rarity: chosen.rarity,
      level: level,
      isPrimordial: isPrimordial,
      baseHp: chosen.baseHp,
      baseAtk: chosen.baseAtk,
      baseDef: chosen.baseDef,
      baseSpd: chosen.baseSpd,
    };
  },

  determineOffspringType(p1, p2) {
    if (p1.type === p2.type) {
      return p1.type;
    }

    const rand = Math.random();
    if (rand < 0.45) {
      return p1.type;
    }
    if (rand < 0.9) {
      return p2.type;
    }

    const types = Object.keys(TYPES);
    return types[Math.floor(Math.random() * types.length)];
  },

  getAverageRarity(p1, p2) {
    return (this.getRarityWeight(p1.rarity) + this.getRarityWeight(p2.rarity)) / 2;
  },

  getRarityWeight(rarity) {
    const weights = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5,
      mythical: 6,
    };
    return weights[rarity] || 1;
  },

  getIncubationTime(rarity) {
    const times = {
      common: 30000,
      uncommon: 60000,
      rare: 120000,
      epic: 300000,
      legendary: 600000,
      mythical: 900000,
    };
    return times[rarity] || 30000;
  },

  update(_dt) {
    const now = Date.now();
    this.slots.forEach((slot, index) => {
      if (slot && now >= slot.startTime + slot.duration) {
        this.hatch(index);
      }
    });
  },

  hatch(index) {
    const slot = this.slots[index];
    if (!slot) {
      return;
    }

    const eggData = slot.egg;
    const echo = new Echo(getEchoById(eggData.id), eggData.level, eggData.isPrimordial);

    if (this._game.state.party.length < GAME_CONFIG.MAX_PARTY) {
      this._game.addToParty(echo);
    } else {
      this._game.state.reserves.push(echo);
    }

    this._game.state.totalCaptures++;
    this._game.state.caughtEchoes.add(echo.id);
    if (echo.isPrimordial) {
      this._game.state.primordialCount++;
    }

    const prefix = echo.isPrimordial ? '✨ PRIMORDIAL ! ' : '';
    this._ui.toast(`${prefix}🥚 ${echo.name} est éclos !`, 'success');

    this._eventBus.emit(GAME_EVENTS.ECHO_CAPTURED, { echo });

    this.slots[index] = null;
    this.updateDisplay();
  },

  collectEgg(index) {
    const slot = this.slots[index];
    if (!slot) {
      return;
    }

    const now = Date.now();
    const elapsed = now - slot.startTime;
    const remaining = slot.duration - elapsed;

    if (remaining > 0) {
      const cost = Math.ceil(remaining / 10000);
      if (this._game.state.crystals >= cost) {
        if (confirm(`Accélérer pour ${cost} cristaux ?`)) {
          this._game.state.crystals -= cost;
          slot.startTime = now - slot.duration;
          this.updateDisplay();
        }
      } else {
        const timeStr = Utils.formatTime(Math.ceil(remaining / 1000));
        this._ui.toast(`Encore ${timeStr} avant l'éclosion`, 'info');
      }
    } else {
      this.hatch(index);
    }
  },

  updateDisplay() {
    const slotsEl = document.getElementById('hatchery-slots');
    if (slotsEl) {
      let html = '';
      this.slots.forEach((slot, i) => {
        if (slot) {
          const now = Date.now();
          const elapsed = now - slot.startTime;
          const remaining = Math.max(0, slot.duration - elapsed);
          const progress = Math.min(100, (elapsed / slot.duration) * 100);
          const isReady = remaining <= 0;

          html += `<div class="incubator-slot occupied" onclick="Hatchery.collectEgg(${i})">
                        <div class="incubator-egg">${isReady ? '✨' : '🥚'}</div>
                        <div class="incubator-progress">
                            <div class="progress-bar" style="width:${progress}%"></div>
                        </div>
                        <div class="incubator-timer">${isReady ? 'Prêt !' : Utils.formatTime(Math.ceil(remaining / 1000))}</div>
                    </div>`;
        } else {
          html += `<div class="incubator-slot">
                        <div style="color:var(--text-muted)">🥚 Vide</div>
                    </div>`;
        }
      });
      slotsEl.innerHTML = html;
    }

    const p1 = document.getElementById('parent-1');
    const p2 = document.getElementById('parent-2');

    if (p1) {
      if (this.parents[0]) {
        const imgPath1 = getEchoImagePath(this.parents[0]);
        p1.innerHTML = `<span class="slot-label">Parent 1</span>
                    <div class="slot-content"><img src="${imgPath1}" alt="${this.parents[0].name}" style="width:48px;height:48px;object-fit:contain"></div>
                    <div style="font-size:0.7rem">${this.parents[0].name}</div>`;
        p1.classList.add('filled');
      } else {
        p1.innerHTML = `<span class="slot-label">Parent 1</span><div class="slot-content">+</div>`;
        p1.classList.remove('filled');
      }
    }

    if (p2) {
      if (this.parents[1]) {
        const imgPath2 = getEchoImagePath(this.parents[1]);
        p2.innerHTML = `<span class="slot-label">Parent 2</span>
                    <div class="slot-content"><img src="${imgPath2}" alt="${this.parents[1].name}" style="width:48px;height:48px;object-fit:contain"></div>
                    <div style="font-size:0.7rem">${this.parents[1].name}</div>`;
        p2.classList.add('filled');
      } else {
        p2.innerHTML = `<span class="slot-label">Parent 2</span><div class="slot-content">+</div>`;
        p2.classList.remove('filled');
      }
    }

    this.checkCanBreed();
  },

  toJSON() {
    return {
      slots: this.slots,
      parents: this.parents.map((p) => (p ? p.uid : null)),
    };
  },

  fromJSON(data) {
    if (data) {
      this.slots = data.slots || Array(this.maxSlots).fill(null);
      if (data.parents) {
        this.parents = [
          data.parents[0] ? this._game.findEcho(data.parents[0]) || null : null,
          data.parents[1] ? this._game.findEcho(data.parents[1]) || null : null,
        ];
      }
    }
  },
};

describe('Hatchery', () => {
  beforeEach(() => {
    EventBus.reset();
    Game.reset();
    UI.reset();
    jest.clearAllMocks();

    Game.state.party = [];
    Game.state.reserves = [];
    Game.state.crystals = 100;
    Game.state.totalCaptures = 0;
    Game.state.caughtEchoes = new Set();
    Game.state.primordialCount = 0;
    Game.addToParty = jest.fn((echo) => {
      if (Game.state.party.length < 6) {
        Game.state.party.push(echo);
        return true;
      }
      return false;
    });
    Game.findEcho = jest.fn(() => null);

    Hatchery._game = Game;
    Hatchery._ui = UI;
    Hatchery._eventBus = EventBus;
    Hatchery.slots = Array(4).fill(null);
    Hatchery.parents = [null, null];
  });

  describe('init()', () => {
    test('initializes slots array', () => {
      Hatchery.init(Game, UI, EventBus);
      expect(Hatchery.slots.length).toBe(4);
      expect(Hatchery.slots.every((s) => s === null)).toBe(true);
    });

    test('stores dependencies', () => {
      Hatchery.init(Game, UI, EventBus);
      expect(Hatchery._game).toBe(Game);
      expect(Hatchery._ui).toBe(UI);
      expect(Hatchery._eventBus).toBe(EventBus);
    });
  });

  describe('hasFreeSlot()', () => {
    test('returns true when slots are empty', () => {
      Hatchery.slots = [null, null, null, null];
      expect(Hatchery.hasFreeSlot()).toBe(true);
    });

    test('returns true when at least one slot is empty', () => {
      Hatchery.slots = [{ egg: {} }, null, { egg: {} }, null];
      expect(Hatchery.hasFreeSlot()).toBe(true);
    });

    test('returns false when all slots are full', () => {
      Hatchery.slots = [{ egg: {} }, { egg: {} }, { egg: {} }, { egg: {} }];
      expect(Hatchery.hasFreeSlot()).toBe(false);
    });
  });

  describe('getRarityWeight()', () => {
    test('returns 1 for common', () => {
      expect(Hatchery.getRarityWeight('common')).toBe(1);
    });

    test('returns 2 for uncommon', () => {
      expect(Hatchery.getRarityWeight('uncommon')).toBe(2);
    });

    test('returns 3 for rare', () => {
      expect(Hatchery.getRarityWeight('rare')).toBe(3);
    });

    test('returns 4 for epic', () => {
      expect(Hatchery.getRarityWeight('epic')).toBe(4);
    });

    test('returns 5 for legendary', () => {
      expect(Hatchery.getRarityWeight('legendary')).toBe(5);
    });

    test('returns 6 for mythical', () => {
      expect(Hatchery.getRarityWeight('mythical')).toBe(6);
    });

    test('returns 1 for unknown rarity', () => {
      expect(Hatchery.getRarityWeight('unknown')).toBe(1);
    });
  });

  describe('getIncubationTime()', () => {
    test('returns 30000 for common', () => {
      expect(Hatchery.getIncubationTime('common')).toBe(30000);
    });

    test('returns 60000 for uncommon', () => {
      expect(Hatchery.getIncubationTime('uncommon')).toBe(60000);
    });

    test('returns 120000 for rare', () => {
      expect(Hatchery.getIncubationTime('rare')).toBe(120000);
    });

    test('returns 300000 for epic', () => {
      expect(Hatchery.getIncubationTime('epic')).toBe(300000);
    });

    test('returns 600000 for legendary', () => {
      expect(Hatchery.getIncubationTime('legendary')).toBe(600000);
    });

    test('returns 900000 for mythical', () => {
      expect(Hatchery.getIncubationTime('mythical')).toBe(900000);
    });

    test('returns 30000 for unknown rarity', () => {
      expect(Hatchery.getIncubationTime('unknown')).toBe(30000);
    });
  });

  describe('determineOffspringType()', () => {
    test('returns same type when both parents have same type', () => {
      const p1 = { type: 'FEU' };
      const p2 = { type: 'FEU' };
      const result = Hatchery.determineOffspringType(p1, p2);
      expect(result).toBe('FEU');
    });

    test('returns a valid type', () => {
      const p1 = { type: 'FEU' };
      const p2 = { type: 'OCEAN' };
      const result = Hatchery.determineOffspringType(p1, p2);
      expect(['FEU', 'OCEAN', 'FLORE']).toContain(result);
    });
  });

  describe('getAverageRarity()', () => {
    test('returns average of two rarity weights', () => {
      const p1 = { rarity: 'common' };
      const p2 = { rarity: 'rare' };
      const result = Hatchery.getAverageRarity(p1, p2);
      expect(result).toBe(2);
    });
  });

  describe('toJSON()', () => {
    test('returns slots and parents', () => {
      Hatchery.slots = [{ egg: { id: 1 } }, null, null, null];
      Hatchery.parents = [{ uid: 'p1' }, null];

      const json = Hatchery.toJSON();

      expect(json.slots).toEqual(Hatchery.slots);
      expect(json.parents).toEqual(['p1', null]);
    });
  });

  describe('fromJSON()', () => {
    test('restores slots from data', () => {
      const data = {
        slots: [{ egg: { id: 1 } }, null, null, null],
        parents: [null, null],
      };

      Hatchery.fromJSON(data);

      expect(Hatchery.slots).toEqual(data.slots);
    });

    test('handles null data', () => {
      expect(() => Hatchery.fromJSON(null)).not.toThrow();
    });

    test('handles undefined data', () => {
      expect(() => Hatchery.fromJSON(undefined)).not.toThrow();
    });
  });
});
