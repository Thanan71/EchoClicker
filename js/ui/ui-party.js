// ============================================
// UIParty - Rendu equipe et reserves
// ============================================

import { TYPES } from '../data/types.js';
import { getEchoById } from '../data/constants.js';
import { createEchoImageHTML, getEchoImagePathById } from './ui-core.js';
import { Game } from '../game.js';
import { Combat } from '../combat.js';

export const UIParty = {
    renderParty() {
        const pg = document.getElementById('party-grid');
        const rg = document.getElementById('reserves-grid');
        if (!pg || !rg) return;

        let ph = '';
        for (let i = 0; i < 6; i++) {
            const echo = Game.state.party[i];
            if (echo) {
                const active = Combat.activeEcho?.uid === echo.uid;
                const hpPct = echo.getHpPercent();
                const imgHTML = createEchoImageHTML(echo, 48);
                ph += `<div class="party-slot ${active ? 'active-combat' : ''}" data-echo-uid="${echo.uid}">`;
                if (echo.isPrimordial) ph += '<span class="primordial-badge">\u2B50</span>';
                ph += `<div class="party-echo-icon">${imgHTML}</div>`;
                ph += `<div class="party-echo-name">${echo.name}</div>`;
                ph += `<div class="party-echo-level">${i18n.t('party.level', { level: echo.level })}</div>`;
                ph += `<div class="party-echo-hp" style="color:${hpPct < 30 ? 'var(--accent-red)' : hpPct < 60 ? 'var(--accent-gold)' : 'var(--accent-green)'}">\u2764\uFE0F ${Math.floor(echo.hp)}/${Math.floor(echo.maxHp)}</div>`;
                ph += '</div>';
            } else {
                ph += `<div class="party-slot empty"><div class="party-echo-icon">\u2795</div><div class="party-echo-name">${i18n.t('party.vacant')}</div></div>`;
            }
        }
        pg.innerHTML = ph;

        let rh = '';
        Game.state.reserves.forEach((echo) => {
            const imgHTML = createEchoImageHTML(echo, 32);
            rh += `<div class="reserve-slot" data-echo-uid="${echo.uid}" title="${echo.name} ${i18n.t('party.level', { level: echo.level })}">${echo.isPrimordial ? '\u2B50' : ''}${imgHTML}</div>`;
        });
        if (!Game.state.reserves.length)
            rh = `<div style="color:var(--text-muted);padding:20px;text-align:center">${i18n.t('party.noReserve')}</div>`;
        rg.innerHTML = rh;

        // Add event listeners to party slots
        document.querySelectorAll('.party-slot[data-echo-uid]').forEach((slot) => {
            slot.addEventListener('click', () => {
                const uid = slot.dataset.echoUid;
                this.showEchoDetail(uid);
            });
        });

        // Add event listeners to reserve slots
        document.querySelectorAll('.reserve-slot[data-echo-uid]').forEach((slot) => {
            slot.addEventListener('click', () => {
                const uid = slot.dataset.echoUid;
                this.showEchoDetail(uid);
            });
        });
    },

    showEchoDetail(uid) {
        const echo = Game.findEcho(uid);
        if (!echo) return;
        const t = TYPES[echo.type];
        const inParty = Game.state.party.some((e) => e.uid === uid);
        const imgHTML = createEchoImageHTML(echo, 128);

        let html = `<div style="text-align:center">
            <div style="margin:10px 0;position:relative;display:inline-block">
                ${echo.isPrimordial ? '<span class="shiny-badge">\u2B50</span>' : ''}
                ${imgHTML}
            </div>
            <h3 style="font-family:var(--font-title)">${echo.name}</h3>
            <span class="type-badge" style="background:${t.color};color:#fff;padding:4px 12px;border-radius:12px;font-size:0.8rem">${t.emoji} ${t.name}</span>
            ${echo.isPrimordial ? `<div style="color:var(--accent-gold);margin-top:8px">\u2728 ${i18n.t('party.primordialBonus')}</div>` : ''}
            <p style="color:var(--text-secondary);margin:12px 0;font-style:italic">${echo.description}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0">
            <div class="stat"><span class="stat-label">${i18n.t('party.levelLabel')}</span><span class="stat-value">${echo.level}</span></div>
            <div class="stat"><span class="stat-label">XP</span><span class="stat-value">${Math.floor(echo.xp)}/${echo.xpToNext}</span></div>
            <div class="stat"><span class="stat-label">HP</span><span class="stat-value">${Math.floor(echo.hp)}/${Math.floor(echo.maxHp)}</span></div>
            <div class="stat"><span class="stat-label">ATK</span><span class="stat-value">${Math.floor(echo.atk)}</span></div>
            <div class="stat"><span class="stat-label">DEF</span><span class="stat-value">${Math.floor(echo.def)}</span></div>
            <div class="stat"><span class="stat-label">SPD</span><span class="stat-value">${Math.floor(echo.spd)}</span></div>
        </div>`;

        if (echo.evolution) {
            const evo = getEchoById(echo.evolution.to);
            const evoImgPath = evo ? getEchoImagePathById(evo.id) : '';
            html += `<div style="text-align:center;margin:12px 0;color:var(--accent-gold)">${i18n.t('party.evolution', { name: `${evo ? `<img src="${evoImgPath}" alt="${evo.name}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle">` : ''} ${evo?.name || '?'}`, level: echo.evolution.lv })}</div>`;
        }

        const footer = inParty
            ? `<button class="btn-combat secondary party-action-btn" data-action="remove" data-uid="${uid}">\u{1F4E6} ${i18n.t('party.reserveBtn')}</button>`
            : `<button class="btn-combat party-action-btn" data-action="add" data-uid="${uid}">\u{1F465} ${i18n.t('party.partyBtn')}</button>`;

        this.showModal(echo.name, html, footer);

        // Add event listener to action button
        const actionBtn = document.querySelector('.party-action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                const action = actionBtn.dataset.action;
                const actionUid = actionBtn.dataset.uid;
                if (action === 'remove') {
                    Game.removeFromParty(actionUid);
                } else {
                    Game.moveToParty(actionUid);
                }
                this.closeModal();
                this.renderParty();
            });
        }
    },
};
