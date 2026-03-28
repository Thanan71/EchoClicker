// ============================================
// UICombat - Rendu combat
// ============================================

import { Combat } from '../combat.js';
import { GAME_CONFIG } from '../data/game-config.js';
import { TYPES } from '../data/types.js';
import { Game } from '../game.js';
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
      const enemyName = e.bossName || i18n.t(`echoes.${e.id}.name`) || e.name;
      this._setText('enemy-name', enemyName);
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
      const playerName = i18n.t(`echoes.${p.id}.name`) || p.name;
      this._setText('player-name', playerName);
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
    this._updateTeamPanel();
  },

  _updateTeamPanel() {
    const teamList = document.getElementById('team-panel-list');
    if (!teamList) {
      return;
    }

    const party = Game.state.party;
    if (!party || party.length === 0) {
      teamList.innerHTML = '<p class="team-empty">Aucun Écho dans l\'équipe</p>';
      return;
    }

    let html = '';
    for (const echo of party) {
      const isActive = Combat.activeEcho && Combat.activeEcho.uid === echo.uid;
      const isFainted = !echo.isAlive();
      const type = TYPES[echo.type];

      const hpPercent = echo.getHpPercent();
      const xpPercent = (echo.xp / echo.xpToNext) * 100;

      const primordialBadge = echo.isPrimordial ? '<span class="shiny-badge">\u2B50</span>' : '';

      const echoImgHTML = createEchoImageHTML(echo, 32);
      const echoName = i18n.t(`echoes.${echo.id}.name`) || echo.name;
      html += `
        <div class="team-member ${isActive ? 'active' : ''} ${isFainted ? 'fainted' : ''}">
          <div class="team-member-header">
            <span class="team-member-icon">${echoImgHTML}</span>
            <div class="team-member-info">
              <div class="team-member-name">${echoName} ${primordialBadge}</div>
              <div class="team-member-level">Niv. ${echo.level}</div>
            </div>
          </div>
          <div class="team-member-bars">
            <div class="team-bar-container">
              <span class="team-bar-label">PV</span>
              <div class="team-bar">
                <div class="team-bar-fill hp" style="width: ${hpPercent}%"></div>
              </div>
              <span class="team-bar-text">${Math.floor(echo.hp)}/${Math.floor(echo.maxHp)}</span>
            </div>
            <div class="team-bar-container">
              <span class="team-bar-label">XP</span>
              <div class="team-bar">
                <div class="team-bar-fill xp" style="width: ${xpPercent}%"></div>
              </div>
              <span class="team-bar-text">${Math.floor(echo.xp)}/${Math.floor(echo.xpToNext)}</span>
            </div>
          </div>
          <span class="team-member-type" style="background: ${type.color}; color: #fff">${type.emoji} ${type.name}</span>
        </div>
      `;
    }

    teamList.innerHTML = html;
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
