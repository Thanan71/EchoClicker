// ============================================
// ÉchoClicker - Bus d'événements
// ============================================

export const EventBus = {
  _listeners: {},

  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return () => this.off(event, callback);
  },

  off(event, callback) {
    if (!this._listeners[event]) {
      return;
    }
    this._listeners[event] = this._listeners[event].filter((cb) => cb !== callback);
  },

  emit(event, data) {
    if (!this._listeners[event]) {
      return;
    }
    for (const cb of this._listeners[event]) {
      try {
        cb(data);
      } catch (_e) {}
    }
  },

  once(event, callback) {
    const unsub = this.on(event, (data) => {
      unsub();
      callback(data);
    });
    return unsub;
  },
};

// Événements du jeu
export const GAME_EVENTS = {
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

// Export for tests (compatible CJS/ESM)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventBus, GAME_EVENTS };
}
