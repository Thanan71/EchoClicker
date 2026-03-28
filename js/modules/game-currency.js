// ============================================
// GameCurrency - Currency and income management
// Responsibility: energy, links, click power, passive income, boosts
// ============================================

import { EventBus, GAME_EVENTS } from '../core/eventBus.js';

export const GameCurrency = {
  _cachedPassiveIncome: null,
  _passiveIncomeDirty: true,

  // === Monnaies ===
  spendEnergy(amount) {
    if (this.state.energy < amount) {
      return false;
    }
    this.state.energy -= amount;
    return true;
  },

  spendLinks(amount) {
    if (this.state.links < amount) {
      return false;
    }
    this.state.links -= amount;
    EventBus.emit(GAME_EVENTS.LINKS_CHANGED, { links: this.state.links });
    return true;
  },

  addLinks(amount) {
    this.state.links += amount;
    EventBus.emit(GAME_EVENTS.LINKS_CHANGED, { links: this.state.links });
  },

  // === Click power & passive income ===
  getClickPower() {
    let power = this.state.clickPower;
    if (this.state.boosts.energy) {
      power *= 2;
    }
    // Bonus passif basé sur le nombre d'Échos
    power += this.state.party.length * 0.1;
    return Math.floor(power);
  },

  getPassiveIncome() {
    // Utiliser le cache si valide
    if (!this._passiveIncomeDirty && this._cachedPassiveIncome !== null) {
      return this._cachedPassiveIncome;
    }
    let income = this.state.passiveIncome;
    // Bonus par Écho en équipe
    income += this.state.party.length * 0.05;
    // Bonus par niveau moyen
    if (this.state.party.length > 0) {
      const avgLv = this.state.party.reduce((s, e) => s + e.level, 0) / this.state.party.length;
      income += avgLv * 0.02;
    }
    if (this.state.boosts.energy) {
      income *= 2;
    }
    // Mettre en cache le résultat
    this._cachedPassiveIncome = income;
    this._passiveIncomeDirty = false;
    return income;
  },

  // Invalider le cache du revenu passif (à appeler quand la composition de l'équipe change)
  invalidatePassiveIncomeCache() {
    this._passiveIncomeDirty = true;
  },

  // === Boosts ===
  updateBoosts(_dt) {
    const now = Date.now();
    for (const [key, boost] of Object.entries(this.state.boosts)) {
      if (boost.endTime && now > boost.endTime) {
        delete this.state.boosts[key];
      }
    }
  },
};
