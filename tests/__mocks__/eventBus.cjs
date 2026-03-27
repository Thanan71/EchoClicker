// ============================================
// Mock EventBus - Simule le système pub/sub pour les tests
// ============================================

const EventBus = {
    _listeners: {},

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
        return () => this.off(event, callback);
    },

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    emit(event, data) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(cb => {
            try { cb(data); } catch(e) { console.error(`EventBus error [${event}]:`, e); }
        });
    },

    once(event, callback) {
        const unsub = this.on(event, (data) => {
            unsub();
            callback(data);
        });
        return unsub;
    },

    // === Helpers de test ===
    /** Réinitialise tous les listeners (pour beforeEach) */
    reset() {
        this._listeners = {};
    },

    /** Retourne les listeners pour un event */
    getListeners(event) {
        return this._listeners[event] || [];
    },

    /** Vérifie si un événement a des listeners */
    hasListeners(event) {
        return (this._listeners[event]?.length || 0) > 0;
    },

    /** Retourne tous les noms d'événements avec des listeners */
    getEventNames() {
        return Object.keys(this._listeners).filter(k => this._listeners[k].length > 0);
    }
};

// Reproduire les constantes d'événements
const GAME_EVENTS = {
    ENERGY_CHANGED:    'energy_changed',
    LINKS_CHANGED:     'links_changed',
    CLICK:             'click',
    COMBAT_START:      'combat_start',
    COMBAT_END:        'combat_end',
    ENEMY_DEFEATED:    'enemy_defeated',
    ECHO_CAPTURED:     'echo_captured',
    ECHO_LEVELED_UP:   'echo_leveled_up',
    ECHO_EVOLVED:      'echo_evolved',
    ECHO_FAINTED:      'echo_fainted',
    BOSS_DEFEATED:     'boss_defeated',
    ROUTE_UNLOCKED:    'route_unlocked',
    REGION_UNLOCKED:   'region_unlocked',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    ITEM_PURCHASED:    'item_purchased',
    SAVE_COMPLETE:     'save_complete',
    TICK:              'tick'
};

module.exports = { EventBus, GAME_EVENTS };
