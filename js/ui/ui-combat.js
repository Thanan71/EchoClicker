// ============================================
// UICombat - Rendu combat
// ============================================

import { Combat } from '../combat.js';
import { GAME_CONFIG } from '../data/game-config.js';
import { TYPES } from '../data/types.js';
import { createEchoImageHTML } from './ui-core.js';

export const UICombat = {
  _setText(id, v) {
    const e = document.getElementById(id);
    if (e) {
      e.textContent = v;
    }
  },

  _setHTML(id, v) {
    const e = document.getElementById(id);
    if (e) {
      e.innerHTML = v;
    }
  },

  _setStyle(id, prop, v) {
    const e = document.getElementById(id);
    if (e) {
      e.style.setProperty(prop, v);
    }
  },

  _updateEnemyDisplay() {
    if (Combat.enemy) {
      const e = Combat.enemy;
      const primordialBadge = e.isPrimordial ? '<span class="shiny-badge">\u2B50</span>' : '';
      const imgHTML = createEchoImageHTML(e, 64);
      this._setHTML(
        'enemy-sprite',
        `<div style="position:relative;display:inline-block">${primordialBadge}${imgHTML}</div>`,
      );
      this._setText('enemy-name', e.bossName || e.name);
      const hpPct = Math.max(0, e.getHpPercent());
      this._setStyle('enemy-hp-bar', '--hp-percent', `${hpPct}%`);
      this._setText('enemy-hp-text', `${Math.max(0, Math.floor(e.hp))}/${Math.floor(e.maxHp)}`);
      const t = TYPES[e.type];
      const et = document.getElementById('enemy-type');
      if (et) {
        et.textContent = `${t.emoji} ${t.name}`;
        et.style.background = t.color;
        et.style.color = '#fff';
      }
      document.getElementById('btn-capture-combat').disabled = false;
    } else {
      this._setText('enemy-sprite', '\u2753');
      this._setText('enemy-name', '???');
      this._setStyle('enemy-hp-bar', '--hp-percent', '100%');
      this._setText('enemy-hp-text', '???/???');
      const et = document.getElementById('enemy-type');
      if (et) {
        et.textContent = '';
      }
      document.getElementById('btn-capture-combat').disabled = true;
    }
  },

  _updatePlayerDisplay() {
    if (Combat.activeEcho) {
      const p = Combat.activeEcho;
      const primordialBadge = p.isPrimordial ? '<span class="shiny-badge">\u2B50</span>' : '';
      const imgHTML = createEchoImageHTML(p, 64);
      this._setHTML(
        'player-sprite',
        `<div style="position:relative;display:inline-block">${primordialBadge}${imgHTML}</div>`,
      );
      this._setText('player-name', p.name);
      const hpPct = Math.max(0, p.getHpPercent());
      this._setStyle('player-hp-bar', '--hp-percent', `${hpPct}%`);
      this._setText('player-hp-text', `${Math.max(0, Math.floor(p.hp))}/${Math.floor(p.maxHp)}`);
      const t = TYPES[p.type];
      const pt = document.getElementById('player-type');
      if (pt) {
        pt.textContent = `${t.emoji} ${t.name}`;
        pt.style.background = t.color;
        pt.style.color = '#fff';
      }
      document.getElementById('btn-tisser-coup').disabled = false;
      const dmg = p.calculateDamageAgainst(Combat.enemy || p) * GAME_CONFIG.COMBAT_CLICK_MULTIPLIER;
      this._setText('dmg-preview', i18n.t('combat.dmgClick', { dmg: dmg }));
    } else {
      this._setText('player-sprite', '\u2753');
      this._setText('player-name', 'Aucun Echo');
      this._setStyle('player-hp-bar', '--hp-percent', '100%');
      this._setText('player-hp-text', '???/???');
      const pt = document.getElementById('player-type');
      if (pt) {
        pt.textContent = '';
      }
      document.getElementById('btn-tisser-coup').disabled = true;
      this._setText('dmg-preview', i18n.t('combat.dmgClickZero'));
    }
  },

  updateCombat() {
    this._updateEnemyDisplay();
    this._updatePlayerDisplay();
  },

  addLog(type, message) {
    const log = document.getElementById('combat-log');
    if (!log) {
      return;
    }
    const entry = document.createElement('p');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    while (log.children.length > GAME_CONFIG.MAX_LOG_ENTRIES) {
      log.removeChild(log.firstChild);
    }
  },

  spawnDamageParticle(dmg) {
    const container = document.getElementById('click-particles');
    if (!container) {
      return;
    }
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = `-${dmg}`;
    p.style.left = `${Math.random() * 300 + 100}px`;
    p.style.top = '120px';
    p.style.color = 'var(--accent-red)';
    p.style.fontWeight = '700';
    container.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  },
};
