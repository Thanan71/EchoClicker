// ============================================
// EchoClicker - Serialiseur de sauvegarde
// ============================================
// Responsable uniquement de la conversion entre Game.state et donnees JSON.
// Ne connait pas le localStorage ni la migration - c'est le role de SaveSystem.

import { GAME_CONFIG } from './data/game-config.js';
import { REGIONS } from './data/regions-data.js';
import { Utils } from './data/utils.js';

export const SaveSerializer = {
  CURRENT_VERSION: 4,

  /**
   * Convertir Game.state en objet de sauvegarde JSON-serialisable.
   * @param {Object} state - L'objet Game.state
   * @param {Object} systemState - Etat des sous-systemes { mine, hatchery, quests }
   * @returns {Object} Donnees pretes pour JSON.stringify
   */
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
        narrative: systemState.narrative,
      },
    };
  },

  /**
   * Charger des donnees JSON dans Game.state.
   * @param {Object} data - Donnees de sauvegarde (deja parsees et migrees)
   * @param {Object} state - L'objet Game.state a remplir
   * @param {Object} systemHandlers - { Mine, Hatchery, questSystem, Echo }
   * @returns {boolean} true si le chargement a reussi
   */
  _assignDefaults(target, source, defaults) {
    for (const [key, defaultValue] of Object.entries(defaults)) {
      target[key] = source[key] ?? defaultValue;
    }
  },

  _restoreBasicState(state, s) {
    const defaults = {
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
      regions: Utils.deepClone(REGIONS),
      boosts: {},
    };
    this._assignDefaults(state, s, defaults);
    state.inventory = s.inventory || [];
  },

  _restoreEchoArrays(state, s, Echo) {
    state.party = (s.party || []).map((j) => Echo.fromJSON(j));
    state.reserves = (s.reserves || []).map((j) => Echo.fromJSON(j));
  },

  _restoreCollections(state, s) {
    state.seenEchoes = new Set(s.seenEchoes || []);
    state.caughtEchoes = new Set(s.caughtEchoes || []);
    state.achievements = new Set(s.achievements || []);
  },

  _restoreSystems(s, systemHandlers) {
    const { Mine, Hatchery, questSystem, NarrativeSystem } = systemHandlers;
    if (s.mine) {
      Mine.fromJSON(s.mine);
    }
    if (s.hatchery) {
      Hatchery.fromJSON(s.hatchery);
    }
    if (s.quests) {
      questSystem.fromJSON(s.quests);
    }
    if (s.narrative) {
      NarrativeSystem.fromJSON(s.narrative);
    }
  },

  deserialize(data, state, systemHandlers) {
    try {
      if (!data?.s) {
        return false;
      }
      const s = data.s;
      const { Echo } = systemHandlers;
      this._restoreBasicState(state, s);
      this._restoreEchoArrays(state, s, Echo);
      this._restoreCollections(state, s);
      this._restoreSystems(s, systemHandlers);
      return true;
    } catch (_e) {
      return false;
    }
  },
};
