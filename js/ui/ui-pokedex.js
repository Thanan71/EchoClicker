// ============================================
// UIPokedex - Rendu Pokedex
// ============================================

import { getEchoById } from '../data/constants.js';
import { ECHOES_DB } from '../data/echoesData.js';
import { TYPES } from '../data/types.js';
import { Game } from '../game.js';
import { getEchoImagePathById } from './ui-core.js';

export const UIPokedex = {
    initPokedexFilters() {
        const typeFiltersContainer = document.getElementById('type-filters');
        if (typeFiltersContainer) {
            let typeHtml = `<button class="type-filter-btn active" data-type="all">${i18n.t('pokedex.typeAll')}</button>`;
            Object.entries(TYPES).forEach(([key, type]) => {
                typeHtml += `<button class="type-filter-btn" data-type="${key}" style="--type-color:${type.color}">${type.emoji} ${type.name}</button>`;
            });
            typeFiltersContainer.innerHTML = typeHtml;
        }

        document.querySelectorAll('.filter-btn[data-filter]').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn[data-filter]').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.pokedexStatusFilter = btn.dataset.filter;
                this.renderPokedex();
            });
        });

        document.querySelectorAll('.type-filter-btn[data-type]').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-filter-btn[data-type]').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.pokedexTypeFilter = btn.dataset.type === 'all' ? null : btn.dataset.type;
                this.renderPokedex();
            });
        });
    },

    renderPokedex() {
        const grid = document.getElementById('pokedex-grid');
        if (!grid) return;

        const filteredEchoes = ECHOES_DB.filter((echo) => {
            const caught = Game.state.caughtEchoes.has(echo.id);
            const seen = Game.state.seenEchoes.has(echo.id);
            let statusMatch = true;
            if (this.pokedexStatusFilter === 'caught') statusMatch = caught;
            else if (this.pokedexStatusFilter === 'unseen') statusMatch = !seen;
            let typeMatch = true;
            if (this.pokedexTypeFilter) typeMatch = echo.type === this.pokedexTypeFilter;
            return statusMatch && typeMatch;
        });

        const counterEl = document.getElementById('pokedex-counter');
        if (counterEl)
            counterEl.textContent = i18n.t('pokedex.counter', {
                caught: filteredEchoes.length,
                total: ECHOES_DB.length,
            });

        let html = '';
        filteredEchoes.forEach((echo) => {
            const caught = Game.state.caughtEchoes.has(echo.id);
            const seen = Game.state.seenEchoes.has(echo.id);
            const status = caught ? 'caught' : seen ? 'seen' : 'unseen';
            const t = TYPES[echo.type];
            const imgPath = getEchoImagePathById(echo.id);
            html += `<div class="pokedex-card ${status}" data-echo-id="${echo.id}">`;
            html += `<span class="pokedex-number">#${echo.id.toString().padStart(3, '0')}</span>`;
            html += `<div class="pokedex-echo-icon">${seen ? `<img src="${imgPath}" alt="${echo.name}" style="width:48px;height:48px;object-fit:contain">` : '\u2753'}</div>`;
            if (seen) {
                html += `<div class="pokedex-echo-name">${echo.name}</div>`;
                html += `<span class="pokedex-echo-type" style="background:${t.color};color:#fff">${t.emoji} ${t.name}</span>`;
            } else {
                html += '<div class="pokedex-echo-name">???</div>';
            }
            html += '</div>';
        });

        if (filteredEchoes.length === 0) {
            html = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px">${i18n.t('pokedex.noResults')}</div>`;
        }

        grid.innerHTML = html;

        // Add event listeners to pokedex cards
        document.querySelectorAll('.pokedex-card[data-echo-id]').forEach((card) => {
            card.addEventListener('click', () => {
                const echoId = Number.parseInt(card.dataset.echoId);
                this.showPokedexDetail(echoId);
            });
        });
    },

    showPokedexDetail(id) {
        const echo = getEchoById(id);
        if (!echo) return;
        if (!Game.state.seenEchoes.has(id)) {
            this.showModal(
                i18n.t('pokedex.unknownEcho'),
                `<p style="text-align:center;color:var(--text-muted)">${i18n.t('pokedex.notEncountered')}</p>`,
            );
            return;
        }
        const t = TYPES[echo.type];
        const caught = Game.state.caughtEchoes.has(id);
        const imgPath = getEchoImagePathById(echo.id);
        let html = `<div style="text-align:center">
            <div style="margin:10px 0"><img src="${imgPath}" alt="${echo.name}" style="width:128px;height:128px;object-fit:contain"></div>
            <h3 style="font-family:var(--font-title)">${echo.name}</h3>
            <span class="type-badge" style="background:${t.color};color:#fff;padding:4px 12px;border-radius:12px">${t.emoji} ${t.name}</span>
            <p style="color:var(--text-secondary);margin:12px 0;font-style:italic">${echo.desc}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0">
            <div class="stat"><span class="stat-label">${i18n.t('pokedex.stats.hp')}</span><span class="stat-value">${echo.baseHp}</span></div>
            <div class="stat"><span class="stat-label">${i18n.t('pokedex.stats.atk')}</span><span class="stat-value">${echo.baseAtk}</span></div>
            <div class="stat"><span class="stat-label">${i18n.t('pokedex.stats.def')}</span><span class="stat-value">${echo.baseDef}</span></div>
        </div>
        <div style="text-align:center;margin:8px 0"><span style="color:${caught ? 'var(--accent-green)' : 'var(--accent-red)'}">${caught ? '\u2705 ' + i18n.t('pokedex.capturedLabel') : '\u274C ' + i18n.t('pokedex.notCapturedLabel')}</span></div>`;
        if (echo.evo) {
            const evo = getEchoById(echo.evo.to);
            const evoImgPath = evo ? getEchoImagePathById(evo.id) : '';
            html += `<div style="text-align:center;color:var(--accent-gold)">${i18n.t('pokedex.evolvesToLevel', { name: evo?.name || '?', level: echo.evo.lv })}</div>`;
        }
        this.showModal(`#${echo.id.toString().padStart(3, '0')} - ${echo.name}`, html);
    },
};
