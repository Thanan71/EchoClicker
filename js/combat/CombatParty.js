// ============================================
// CombatParty - Gestion de l'equipe (heal, selection active echo)
// ============================================

export const CombatParty = {
  _state: null,
  _game: null,

  init({ state, game }) {
    this._state = state;
    this._game = game;
  },

  getActiveEcho() {
    return this._game.state.party.find((e) => e.isAlive()) || null;
  },

  getNextAliveEcho() {
    const s = this._state;
    return this._game.state.party.find((e) => e.isAlive() && e.uid !== s.activeEcho.uid) || null;
  },

  healParty() {
    for (const e of this._game.state.party) {
      e.fullHeal();
    }
    for (const e of this._game.state.reserves) {
      e.fullHeal();
    }
  },
};
