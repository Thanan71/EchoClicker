// ============================================
// CombatCapture - Logique de capture (tentative, auto-capture)
// ============================================

import { CombatEngine } from './CombatEngine.js';

export const CombatCapture = {
  _state: null,
  _game: null,
  _ui: null,

  init({ state, game, ui }) {
    this._state = state;
    this._game = game;
    this._ui = ui;
  },

  attemptCapture() {
    const s = this._state;
    if (!s.inCombat || !s.enemy) {
      return;
    }

    const success = this._game.captureEcho(s.enemy);

    if (success) {
      const route = this._game.state.currentRoute;
      if (route) {
        setTimeout(() => CombatEngine.spawnEnemy(route), 500);
      }
    }

    this._ui.updateCombat();
  },

  autoCaptureNewEcho() {
    const s = this._state;
    if (!s.enemy) {
      return;
    }
    this._game.captureEcho(s.enemy, { isAuto: true });
  },
};
