// ============================================
// CombatAuto - Auto-combat timer et auto-capture toggle
// ============================================

import { CombatEngine } from './CombatEngine.js';

export const CombatAuto = {
    _state: null,

    init({ state }) {
        this._state = state;
    },

    update(dt) {
        const s = this._state;
        if (!s.inCombat || !s.enemy || !s.activeEcho) return;

        s.autoTimer -= dt * 1000;
        if (s.autoTimer <= 0) {
            CombatEngine.autoAttack();
            s.autoTimer = s.activeEcho.getAttackInterval();
        }
    },
};
