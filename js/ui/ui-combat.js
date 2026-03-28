// ============================================
// UICombat - Rendu combat
// ============================================

import { TYPES } from '../data/types.js';
import { GAME_CONFIG } from '../data/game-config.js';
import { createEchoImageHTML } from './ui-core.js';
import { Combat } from '../combat.js';

export const UICombat = {
    updateCombat() {
        const set = (id, v) => {
            const e = document.getElementById(id);
            if (e) e.textContent = v;
        };
        const setHTML = (id, v) => {
            const e = document.getElementById(id);
            if (e) e.innerHTML = v;
        };
        const setStyle = (id, prop, v) => {
            const e = document.getElementById(id);
            if (e) e.style.setProperty(prop, v);
        };

        if (Combat.enemy) {
            const e = Combat.enemy;
            const primordialBadge = e.isPrimordial ? '<span class="shiny-badge">\u2B50</span>' : '';
            const imgHTML = createEchoImageHTML(e, 64);
            setHTML(
                'enemy-sprite',
                `<div style="position:relative;display:inline-block">${primordialBadge}${imgHTML}</div>`,
            );
            set('enemy-name', e.bossName || e.name);
            const hpPct = Math.max(0, e.getHpPercent());
            setStyle('enemy-hp-bar', '--hp-percent', hpPct + '%');
            set('enemy-hp-text', `${Math.max(0, Math.floor(e.hp))}/${Math.floor(e.maxHp)}`);
            const t = TYPES[e.type];
            const et = document.getElementById('enemy-type');
            if (et) {
                et.textContent = `${t.emoji} ${t.name}`;
                et.style.background = t.color;
                et.style.color = '#fff';
            }
            document.getElementById('btn-capture-combat').disabled = false;
        } else {
            set('enemy-sprite', '\u2753');
            set('enemy-name', '???');
            setStyle('enemy-hp-bar', '--hp-percent', '100%');
            set('enemy-hp-text', '???/???');
            const et = document.getElementById('enemy-type');
            if (et) et.textContent = '';
            document.getElementById('btn-capture-combat').disabled = true;
        }

        if (Combat.activeEcho) {
            const p = Combat.activeEcho;
            const primordialBadge = p.isPrimordial ? '<span class="shiny-badge">\u2B50</span>' : '';
            const imgHTML = createEchoImageHTML(p, 64);
            setHTML(
                'player-sprite',
                `<div style="position:relative;display:inline-block">${primordialBadge}${imgHTML}</div>`,
            );
            set('player-name', p.name);
            const hpPct = Math.max(0, p.getHpPercent());
            setStyle('player-hp-bar', '--hp-percent', hpPct + '%');
            set('player-hp-text', `${Math.max(0, Math.floor(p.hp))}/${Math.floor(p.maxHp)}`);
            const t = TYPES[p.type];
            const pt = document.getElementById('player-type');
            if (pt) {
                pt.textContent = `${t.emoji} ${t.name}`;
                pt.style.background = t.color;
                pt.style.color = '#fff';
            }
            document.getElementById('btn-tisser-coup').disabled = false;
            const dmg = p.calculateDamageAgainst(Combat.enemy || p) * GAME_CONFIG.COMBAT_CLICK_MULTIPLIER;
            set('dmg-preview', i18n.t('combat.dmgClick', { dmg: dmg }));
        } else {
            set('player-sprite', '\u2753');
            set('player-name', 'Aucun Echo');
            setStyle('player-hp-bar', '--hp-percent', '100%');
            set('player-hp-text', '???/???');
            const pt = document.getElementById('player-type');
            if (pt) pt.textContent = '';
            document.getElementById('btn-tisser-coup').disabled = true;
            set('dmg-preview', i18n.t('combat.dmgClickZero'));
        }
    },

    addLog(type, message) {
        const log = document.getElementById('combat-log');
        if (!log) return;
        const entry = document.createElement('p');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        while (log.children.length > GAME_CONFIG.MAX_LOG_ENTRIES) log.removeChild(log.firstChild);
    },

    spawnDamageParticle(dmg) {
        const container = document.getElementById('click-particles');
        if (!container) return;
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = `-${dmg}`;
        p.style.left = Math.random() * 300 + 100 + 'px';
        p.style.top = '120px';
        p.style.color = 'var(--accent-red)';
        p.style.fontWeight = '700';
        container.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    },
};
