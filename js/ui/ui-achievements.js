// ============================================
// UIAchievements - Rendu succes
// ============================================

import { ACHIEVEMENTS } from '../data/achievements-data.js';
import { Game } from '../game.js';

export const UIAchievements = {
    renderAchievements() {
        const list = document.getElementById('achievements-list');
        if (!list) return;
        const unlocked = Game.state.achievements.size;
        const total = ACHIEVEMENTS.length;
        const pct = total > 0 ? (unlocked / total) * 100 : 0;
        const prog = document.getElementById('achievement-progress');
        if (prog) prog.style.width = pct + '%';
        const cnt = document.getElementById('achievement-count');
        if (cnt) cnt.textContent = `${unlocked} / ${total}`;

        let html = '';
        ACHIEVEMENTS.forEach((ach) => {
            const done = Game.state.achievements.has(ach.id);
            html += `<div class="achievement-card ${done ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info"><div class="achievement-name">${ach.name}</div><div class="achievement-desc">${ach.desc}</div></div>
                ${done ? '<span style="color:var(--accent-gold)">\u2705</span>' : ''}
            </div>`;
        });
        list.innerHTML = html;
    },
};
