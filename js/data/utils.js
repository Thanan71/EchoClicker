// ============================================
// ÉchoClicker - Utilitaires
// ============================================

import { TYPE_CHART } from './types.js';
import { GAME_CONFIG } from './game-config.js';
import { TYPES } from './types.js';

export const Utils = {
    // Formatage de nombres (1.2K, 3.4M, etc.)
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    },

    // Formatage du temps (HH:MM:SS)
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    // Nombre aléatoire entre min et max (inclus)
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Nombre aléatoire flottant entre min et max
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Probabilité (0-100)
    chance(percent) {
        return Math.random() * 100 < percent;
    },

    // Clamp une valeur entre min et max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Interpolation linéaire
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    // Calcul des dégâts
    calculateDamage(attackerAtk, attackerType, defenderDef, defenderType, level) {
        const base = Math.max(1, attackerAtk - defenderDef * 0.5);
        const levelMult = 1 + level * 0.05;
        const effectiveness = this.getEffectiveness(attackerType, defenderType);
        const random = this.randFloat(0.85, 1.15);
        return Math.floor(base * levelMult * effectiveness * random);
    },

    // Efficacité de type
    getEffectiveness(atkType, defType) {
        const chart = TYPE_CHART[atkType];
        if (!chart) return 1;
        if (chart.strong.includes(defType)) return 1.5;
        if (chart.weak.includes(defType)) return 0.67;
        return 1;
    },

    // Taux de capture
    calculateCaptureRate(baseRate, currentHp, maxHp) {
        const hpFactor = 1 - currentHp / maxHp;
        const rate = baseRate + hpFactor * GAME_CONFIG.CAPTURE_HP_BONUS;
        return this.clamp(rate, 5, 95);
    },

    // XP nécessaire pour un niveau
    xpForLevel(level) {
        return Math.floor(GAME_CONFIG.XP_BASE * Math.pow(GAME_CONFIG.XP_GROWTH, level - 1));
    },

    // Stats d'un Écho à un niveau donné
    statsAtLevel(baseStat, level) {
        return baseStat + level * 3;
    },

    // Deep clone d'un objet
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Obtenir la couleur d'un type
    getTypeColor(typeName) {
        return TYPES[typeName]?.color || '#888';
    },

    // Obtenir l'emoji d'un type
    getTypeEmoji(typeName) {
        return TYPES[typeName]?.emoji || '❓';
    },

    // Générer un UID unique
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce
    debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    // Throttle
    throttle(fn, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },
};
