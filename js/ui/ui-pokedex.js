// ============================================
// UIPokedex - Rendu Pokedex
// ============================================

import { getEchoById } from '../data/constants.js';
import { ECHOES_DB } from '../data/echoesData.js';
import { TYPES } from '../data/types.js';
import { Game } from '../game.js';
import { UICore, getEchoImagePathById } from './ui-core.js';

export const UIPokedex = {
  _languageListenerAdded: false,

  initPokedexFilters() {
    const typeFiltersContainer = document.getElementById('type-filters');
    if (typeFiltersContainer) {
      let typeHtml = `<button class="type-filter-btn active" data-type="all">${i18n.t('pokedex.typeAll')}</button>`;
      for (const [key, type] of Object.entries(TYPES)) {
        const typeName = i18n.t(`types.${key}`) || type.name;
        typeHtml += `<button class="type-filter-btn" data-type="${key}" style="--type-color:${type.color}">${type.emoji} ${typeName}</button>`;
      }
      typeFiltersContainer.innerHTML = typeHtml;
    }

    // Re-render when language changes (only add listener once)
    if (!this._languageListenerAdded) {
      i18n.onLanguageChange(() => {
        this.initPokedexFilters();
        this.renderPokedex();
      });
      this._languageListenerAdded = true;
    }

    for (const btn of document.querySelectorAll('.filter-btn[data-filter]')) {
      btn.addEventListener('click', () => {
        for (const b of document.querySelectorAll('.filter-btn[data-filter]')) {
          b.classList.remove('active');
        }
        btn.classList.add('active');
        this.pokedexStatusFilter = btn.dataset.filter;
        this.renderPokedex();
      });
    }

    for (const btn of document.querySelectorAll('.type-filter-btn[data-type]')) {
      btn.addEventListener('click', () => {
        for (const b of document.querySelectorAll('.type-filter-btn[data-type]')) {
          b.classList.remove('active');
        }
        btn.classList.add('active');
        this.pokedexTypeFilter = btn.dataset.type === 'all' ? null : btn.dataset.type;
        this.renderPokedex();
      });
    }
  },

  _echoMatchesFilter(echo) {
    const caught = Game.state.caughtEchoes.has(echo.id);
    const seen = Game.state.seenEchoes.has(echo.id);
    let statusMatch = true;
    if (this.pokedexStatusFilter === 'caught') {
      statusMatch = caught;
    } else if (this.pokedexStatusFilter === 'unseen') {
      statusMatch = !seen;
    }
    let typeMatch = true;
    if (this.pokedexTypeFilter) {
      typeMatch = echo.type === this.pokedexTypeFilter;
    }
    return statusMatch && typeMatch;
  },

  _renderPokedexCard(echo) {
    const caught = Game.state.caughtEchoes.has(echo.id);
    const seen = Game.state.seenEchoes.has(echo.id);
    const status = caught ? 'caught' : seen ? 'seen' : 'unseen';
    const t = TYPES[echo.type];
    const imgPath = getEchoImagePathById(echo.id);
    const echoName = i18n.t(`echoes.${echo.id}.name`) || echo.name;
    const typeName = i18n.t(`types.${echo.type}`) || t.name;
    let html = `<div class="pokedex-card ${status}" data-echo-id="${echo.id}">`;
    html += `<span class="pokedex-number">#${echo.id.toString().padStart(3, '0')}</span>`;
    html += `<div class="pokedex-echo-icon">${seen ? `<img src="${imgPath}" alt="${echoName}" style="width:48px;height:48px;object-fit:contain">` : '\u2753'}</div>`;
    if (seen) {
      html += `<div class="pokedex-echo-name">${echoName}</div>`;
      html += `<span class="pokedex-echo-type" style="background:${t.color};color:#fff">${t.emoji} ${typeName}</span>`;
    } else {
      html += '<div class="pokedex-echo-name">???</div>';
    }
    html += '</div>';
    return html;
  },

  renderPokedex() {
    const grid = document.getElementById('pokedex-grid');
    if (!grid) {
      return;
    }

    const filteredEchoes = ECHOES_DB.filter((echo) => this._echoMatchesFilter(echo));

    const counterEl = document.getElementById('pokedex-counter');
    if (counterEl) {
      counterEl.textContent = i18n.t('pokedex.counter', {
        caught: filteredEchoes.length,
        total: ECHOES_DB.length,
      });
    }

    let html = '';
    for (const echo of filteredEchoes) {
      html += this._renderPokedexCard(echo);
    }

    if (filteredEchoes.length === 0) {
      html = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px">${i18n.t('pokedex.noResults')}</div>`;
    }

    grid.innerHTML = html;

    // Add event listeners to pokedex cards
    for (const card of document.querySelectorAll('.pokedex-card[data-echo-id]')) {
      card.addEventListener('click', () => {
        const echoId = Number.parseInt(card.dataset.echoId);
        this.showPokedexDetail(echoId);
      });
    }
  },

  showPokedexDetail(id) {
    const echo = getEchoById(id);
    if (!echo) {
      return;
    }
    if (!Game.state.seenEchoes.has(id)) {
      UICore.showModal(
        i18n.t('pokedex.unknownEcho'),
        `<p style="text-align:center;color:var(--text-muted)">${i18n.t('pokedex.notEncountered')}</p>`,
      );
      return;
    }
    const t = TYPES[echo.type];
    const caught = Game.state.caughtEchoes.has(id);
    const imgPath = getEchoImagePathById(echo.id);
    const echoName = i18n.t(`echoes.${echo.id}.name`) || echo.name;
    const echoDesc = i18n.t(`echoes.${echo.id}.desc`) || echo.desc;
    const typeName = i18n.t(`types.${echo.type}`) || t.name;
    let html = `<div style="text-align:center">
            <div style="margin:10px 0"><img src="${imgPath}" alt="${echoName}" style="width:128px;height:128px;object-fit:contain"></div>
            <h3 style="font-family:var(--font-title)">${echoName}</h3>
            <span class="type-badge" style="background:${t.color};color:#fff;padding:4px 12px;border-radius:12px">${t.emoji} ${typeName}</span>
            <p style="color:var(--text-secondary);margin:12px 0;font-style:italic">${echoDesc}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0">
            <div class="stat"><span class="stat-label">${i18n.t('pokedex.stats.hp')}</span><span class="stat-value">${echo.baseHp}</span></div>
            <div class="stat"><span class="stat-label">${i18n.t('pokedex.stats.atk')}</span><span class="stat-value">${echo.baseAtk}</span></div>
            <div class="stat"><span class="stat-label">${i18n.t('pokedex.stats.def')}</span><span class="stat-value">${echo.baseDef}</span></div>
        </div>
        <div style="text-align:center;margin:8px 0"><span style="color:${caught ? 'var(--accent-green)' : 'var(--accent-red)'}">${caught ? `\u2705 ${i18n.t('pokedex.capturedLabel')}` : `\u274C ${i18n.t('pokedex.notCapturedLabel')}`}</span></div>`;
    if (echo.evo) {
      const evo = getEchoById(echo.evo.to);
      const evoName = i18n.t(`echoes.${evo?.id}.name`) || evo?.name || '?';
      html += `<div style="text-align:center;color:var(--accent-gold)">${i18n.t('pokedex.evolvesToLevel', { name: evoName, level: echo.evo.lv })}</div>`;
    }
    UICore.showModal(`#${echo.id.toString().padStart(3, '0')} - ${echoName}`, html);
  },
};
