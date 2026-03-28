// ============================================
// GameState - State initialization and stats
// Responsibility: game state creation, stats snapshot
// ============================================

import { GAME_CONFIG } from '../data/game-config.js';
import { REGIONS } from '../data/regions-data.js';
import { Utils } from '../data/utils.js';

export const GameState = {
  initState() {
    this.state = {
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
      clickPower: GAME_CONFIG.ENERGY_PER_CLICK_BASE,
      passiveIncome: GAME_CONFIG.PASSIVE_BASE,
      currentRegion: 'foret',
      currentRoute: null,
      party: [],
      reserves: [],
      seenEchoes: new Set(),
      caughtEchoes: new Set(),
      achievements: new Set(),
      regions: Utils.deepClone(REGIONS),
      boosts: {},
      inventory: [], // Inventaire pour les objets de quêtes
      startTime: Date.now(),
    };
  },

  getStats() {
    return {
      totalClicks: this.state.totalClicks,
      totalCaptures: this.state.totalCaptures,
      uniqueCaptures: this.state.uniqueCaptures,
      primordialCount: this.state.primordialCount,
      totalWins: this.state.totalWins,
      totalEnergy: this.state.totalEnergy,
      maxLevel: this.state.maxLevel,
      bossesDefeated: this.state.bossesDefeated,
      regionsUnlocked: this.state.regionsUnlocked,
      playTime: Math.floor(this.state.playTime),
    };
  },
};
