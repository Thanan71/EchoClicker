// ============================================
// ÉchoClicker - Wiki Logic (Module ES6)
// ============================================

import { ECHOES_DB } from './data/echoesData.js';
import { REGIONS } from './data/regions-data.js';
import { RARITY_COLORS, TYPES, TYPE_CHART } from './data/types.js';

document.addEventListener('DOMContentLoaded', () => {
    renderRoutes();
    renderEchoes();
    renderTypeChart();
    setupNavigation();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.wiki-nav a');
    const sections = document.querySelectorAll('.wiki-section');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                    });
                }
            });
        },
        { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
}

function renderRoutes() {
    const container = document.getElementById('routes-content');
    if (!container) return;

    let html = '';

    REGIONS.forEach((region) => {
        html += `
            <div class="region-block">
                <h3>${region.emoji} ${region.name}</h3>
                <p><em>${region.desc}</em></p>
                <table class="wiki-table">
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Niveaux</th>
                            <th>Échos disponibles</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        region.routes.forEach((route) => {
            const echoesList = route.ids
                .map((id) => {
                    const echo = ECHOES_DB.find((e) => e.id === id);
                    if (!echo) return '?';
                    const imgPath = `assets/echos-no-bg/echo_${String(echo.id).padStart(3, '0')}_no_bg.png`;
                    return `<span class="echo-sprite-container" data-echo-name="${echo.name}">
                    <img src="${imgPath}" alt="${echo.name}" class="echo-sprite" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <span class="echo-emoji-fallback" style="display:none;">${echo.emoji}</span>
                    <span class="echo-tooltip">${echo.name}</span>
                </span>`;
                })
                .join(' ');

            html += `
                <tr>
                    <td>${route.name}</td>
                    <td>Nv. ${route.lv}</td>
                    <td>${echoesList}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
                ${
                    region.bosses.length > 0
                        ? `<p style="margin-top: 12px; color: var(--accent-red);">
                        <strong>Boss:</strong> ${region.bosses.map((b) => `${b.name} (Nv. ${b.level})`).join(', ')}
                    </p>`
                        : ''
                }
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderEchoes() {
    const container = document.getElementById('echoes-content');
    if (!container) return;

    let html = `
        <table class="wiki-table">
            <thead>
                <tr>
                    <th>Icon</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Rareté</th>
                    <th>Stats (Base)</th>
                    <th>Évolution</th>
                    <th>Taux Capture</th>
                </tr>
            </thead>
            <tbody>
    `;

    ECHOES_DB.forEach((echo) => {
        const typeInfo = TYPES[echo.type];
        const evoText = echo.evo
            ? `➡️ ${ECHOES_DB.find((e) => e.id === echo.evo.to)?.name || '?'} (Nv. ${echo.evo.lv})`
            : '<span style="color:var(--text-muted)">Aucune</span>';

        html += `
            <tr>
                <td><img src="assets/echos-no-bg/echo_${String(echo.id).padStart(3, '0')}_no_bg.png" class="echo-icon" onerror="this.innerText='${echo.emoji}'; this.style.fontSize='24px'"></td>
                <td><strong>${echo.name}</strong></td>
                <td>
                    <span class="type-badge" style="background-color: ${typeInfo.color}">
                        ${typeInfo.emoji} ${typeInfo.name}
                    </span>
                </td>
                <td>
                    <span class="rarity-badge" style="background-color: ${RARITY_COLORS[echo.rarity]}">
                        ${echo.rarity}
                    </span>
                </td>
                <td>
                    ❤️${echo.baseHp} ⚔️${echo.baseAtk} 🛡️${echo.baseDef} ⚡${echo.baseSpd}
                </td>
                <td>${evoText}</td>
                <td>${echo.captureRate}%</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderTypeChart() {
    const container = document.getElementById('types-content');
    if (!container) return;

    let html = `
        <table class="wiki-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Fort contre (x1.5)</th>
                    <th>Faible contre (x0.5)</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.keys(TYPE_CHART).forEach((type) => {
        const info = TYPES[type];
        const chart = TYPE_CHART[type];

        const strongList = chart.strong
            .map((t) => {
                const ti = TYPES[t];
                return `<span class="type-badge" style="background-color: ${ti.color}">${ti.emoji} ${t}</span>`;
            })
            .join(' ');

        const weakList = chart.weak
            .map((t) => {
                const ti = TYPES[t];
                return `<span class="type-badge" style="background-color: ${ti.color}">${ti.emoji} ${t}</span>`;
            })
            .join(' ');

        html += `
            <tr>
                <td>
                    <span class="type-badge" style="background-color: ${info.color}; font-size: 1rem; padding: 4px 12px;">
                        ${info.emoji} ${info.name}
                    </span>
                </td>
                <td>${strongList}</td>
                <td>${weakList}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}
