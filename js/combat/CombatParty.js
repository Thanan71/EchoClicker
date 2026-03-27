// ============================================
// CombatParty - Gestion de l'equipe (heal, selection active echo)
// ============================================

const CombatParty = {
    _state: null,
    _game: null,

    init({ state, game }) {
        this._state = state;
        this._game = game;
    },

    getActiveEcho() {
        return this._game.state.party.find(e => e.isAlive()) || null;
    },

    getNextAliveEcho() {
        const s = this._state;
        return this._game.state.party.find(e => e.isAlive() && e.uid !== s.activeEcho.uid) || null;
    },

    healParty() {
        this._game.state.party.forEach(e => e.fullHeal());
        this._game.state.reserves.forEach(e => e.fullHeal());
    }
};
