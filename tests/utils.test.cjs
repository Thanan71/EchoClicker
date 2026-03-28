// ============================================
// Tests unitaires - Utils
// ============================================

const TYPE_CHART = {
    FEU: { strong: ['FLORE', 'GLACE', 'CRISTAL'], weak: ['OCEAN', 'TERRE', 'CHAOS'] },
    GLACE: { strong: ['VENT', 'FLORE', 'TERRE'], weak: ['FEU', 'FOUDRE', 'ARCANE'] },
    VENT: { strong: ['FLORE', 'ARCANE'], weak: ['FOUDRE', 'CRISTAL', 'TERRE'] },
    OCEAN: { strong: ['FEU', 'TERRE', 'CHAOS'], weak: ['FLORE', 'FOUDRE', 'GLACE'] },
    TERRE: { strong: ['FEU', 'FOUDRE', 'CRISTAL'], weak: ['OCEAN', 'FLORE', 'GLACE'] },
};

const GAME_CONFIG = { CAPTURE_HP_BONUS: 40, XP_BASE: 50, XP_GROWTH: 1.15 };

const TYPES = {
    FEU: { name: 'Feu', color: '#ff6b35', emoji: '🔥' },
    GLACE: { name: 'Glace', color: '#74b9ff', emoji: '❄️' },
    OCEAN: { name: 'Océan', color: '#0984e3', emoji: '🌊' },
    FLORE: { name: 'Flore', color: '#55a630', emoji: '🌿' },
};

const Utils = {
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    },
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    },
    chance(percent) {
        return Math.random() * 100 < percent;
    },
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    calculateDamage(attackerAtk, attackerType, defenderDef, defenderType, level) {
        const base = Math.max(1, attackerAtk - defenderDef * 0.5);
        const levelMult = 1 + level * 0.05;
        const effectiveness = this.getEffectiveness(attackerType, defenderType);
        const random = this.randFloat(0.85, 1.15);
        return Math.floor(base * levelMult * effectiveness * random);
    },
    getEffectiveness(atkType, defType) {
        const chart = TYPE_CHART[atkType];
        if (!chart) return 1;
        if (chart.strong.includes(defType)) return 1.5;
        if (chart.weak.includes(defType)) return 0.67;
        return 1;
    },
    calculateCaptureRate(baseRate, currentHp, maxHp) {
        const hpFactor = 1 - currentHp / maxHp;
        const rate = baseRate + hpFactor * GAME_CONFIG.CAPTURE_HP_BONUS;
        return this.clamp(rate, 5, 95);
    },
    xpForLevel(level) {
        return Math.floor(GAME_CONFIG.XP_BASE * Math.pow(GAME_CONFIG.XP_GROWTH, level - 1));
    },
    statsAtLevel(baseStat, level) {
        return baseStat + level * 3;
    },
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    getTypeColor(typeName) {
        return TYPES[typeName]?.color || '#888';
    },
    getTypeEmoji(typeName) {
        return TYPES[typeName]?.emoji || '❓';
    },
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
};

describe('Utils', () => {
    describe('formatNumber', () => {
        test('returns plain string for numbers < 1000', () => {
            expect(Utils.formatNumber(0)).toBe('0');
            expect(Utils.formatNumber(42)).toBe('42');
            expect(Utils.formatNumber(999)).toBe('999');
        });
        test('formats thousands with K suffix', () => {
            expect(Utils.formatNumber(1000)).toBe('1.0K');
            expect(Utils.formatNumber(5500)).toBe('5.5K');
        });
        test('formats millions with M suffix', () => {
            expect(Utils.formatNumber(1e6)).toBe('1.0M');
            expect(Utils.formatNumber(2500000)).toBe('2.5M');
        });
        test('formats billions with B suffix', () => {
            expect(Utils.formatNumber(1e9)).toBe('1.0B');
        });
        test('formats trillions with T suffix', () => {
            expect(Utils.formatNumber(1e12)).toBe('1.0T');
        });
        test('floors decimals below 1000', () => {
            expect(Utils.formatNumber(42.9)).toBe('42');
            expect(Utils.formatNumber(0.5)).toBe('0');
        });
    });

    describe('formatTime', () => {
        test('formats zero as 00:00:00', () => {
            expect(Utils.formatTime(0)).toBe('00:00:00');
        });
        test('formats seconds only', () => {
            expect(Utils.formatTime(45)).toBe('00:00:45');
        });
        test('formats minutes and seconds', () => {
            expect(Utils.formatTime(125)).toBe('00:02:05');
        });
        test('formats hours, minutes, and seconds', () => {
            expect(Utils.formatTime(3661)).toBe('01:01:01');
        });
        test('pads with leading zeros', () => {
            expect(Utils.formatTime(5)).toBe('00:00:05');
            expect(Utils.formatTime(65)).toBe('00:01:05');
        });
        test('handles large values (23:59:59)', () => {
            expect(Utils.formatTime(86399)).toBe('23:59:59');
        });
        test('floors fractional seconds', () => {
            expect(Utils.formatTime(1.9)).toBe('00:00:01');
        });
    });

    describe('randInt', () => {
        test('returns value within [min, max]', () => {
            for (let i = 0; i < 100; i++) {
                const val = Utils.randInt(5, 10);
                expect(val).toBeGreaterThanOrEqual(5);
                expect(val).toBeLessThanOrEqual(10);
                expect(Number.isInteger(val)).toBe(true);
            }
        });
        test('returns min when min === max', () => {
            expect(Utils.randInt(7, 7)).toBe(7);
        });
        test('handles negative ranges', () => {
            for (let i = 0; i < 50; i++) {
                const val = Utils.randInt(-10, -5);
                expect(val).toBeGreaterThanOrEqual(-10);
                expect(val).toBeLessThanOrEqual(-5);
            }
        });
        test('handles zero range', () => {
            for (let i = 0; i < 50; i++) {
                expect(Utils.randInt(0, 0)).toBe(0);
            }
        });
    });

    describe('randFloat', () => {
        test('returns value within [min, max)', () => {
            for (let i = 0; i < 100; i++) {
                const val = Utils.randFloat(0, 1);
                expect(val).toBeGreaterThanOrEqual(0);
                expect(val).toBeLessThan(1);
            }
        });
        test('handles negative ranges', () => {
            for (let i = 0; i < 50; i++) {
                const val = Utils.randFloat(-5, -1);
                expect(val).toBeGreaterThanOrEqual(-5);
                expect(val).toBeLessThan(-1);
            }
        });
        test('returns a number', () => {
            expect(typeof Utils.randFloat(0, 10)).toBe('number');
        });
    });

    describe('chance', () => {
        test('always returns false for 0%', () => {
            for (let i = 0; i < 50; i++) {
                expect(Utils.chance(0)).toBe(false);
            }
        });
        test('always returns true for 100%', () => {
            for (let i = 0; i < 50; i++) {
                expect(Utils.chance(100)).toBe(true);
            }
        });
        test('returns boolean', () => {
            expect(typeof Utils.chance(50)).toBe('boolean');
        });
        test('returns true for percent > 100', () => {
            expect(Utils.chance(200)).toBe(true);
        });
        test('returns false for negative percent', () => {
            expect(Utils.chance(-10)).toBe(false);
        });
    });

    describe('clamp', () => {
        test('returns value when within bounds', () => {
            expect(Utils.clamp(5, 0, 10)).toBe(5);
        });
        test('clamps to min when value is below', () => {
            expect(Utils.clamp(-5, 0, 10)).toBe(0);
        });
        test('clamps to max when value is above', () => {
            expect(Utils.clamp(15, 0, 10)).toBe(10);
        });
        test('returns min when value equals min', () => {
            expect(Utils.clamp(0, 0, 10)).toBe(0);
        });
        test('returns max when value equals max', () => {
            expect(Utils.clamp(10, 0, 10)).toBe(10);
        });
        test('works with negative bounds', () => {
            expect(Utils.clamp(-5, -10, -1)).toBe(-5);
            expect(Utils.clamp(-15, -10, -1)).toBe(-10);
            expect(Utils.clamp(0, -10, -1)).toBe(-1);
        });
        test('works with floats', () => {
            expect(Utils.clamp(5.5, 0, 10)).toBe(5.5);
            expect(Utils.clamp(10.1, 0, 10)).toBe(10);
        });
    });

    describe('lerp', () => {
        test('returns a when t=0', () => {
            expect(Utils.lerp(10, 20, 0)).toBe(10);
        });
        test('returns b when t=1', () => {
            expect(Utils.lerp(10, 20, 1)).toBe(20);
        });
        test('returns midpoint when t=0.5', () => {
            expect(Utils.lerp(0, 100, 0.5)).toBe(50);
        });
        test('extrapolates beyond t=1', () => {
            expect(Utils.lerp(0, 100, 2)).toBe(200);
        });
        test('extrapolates below t=0', () => {
            expect(Utils.lerp(0, 100, -1)).toBe(-100);
        });
        test('works with negative values', () => {
            expect(Utils.lerp(-10, 10, 0.5)).toBe(0);
        });
    });

    describe('getEffectiveness', () => {
        test('returns 1.5 for strong matchup', () => {
            expect(Utils.getEffectiveness('FEU', 'FLORE')).toBe(1.5);
        });
        test('returns 0.67 for weak matchup', () => {
            expect(Utils.getEffectiveness('FEU', 'OCEAN')).toBe(0.67);
        });
        test('returns 1 for neutral matchup', () => {
            expect(Utils.getEffectiveness('FEU', 'FEU')).toBe(1);
        });
        test('returns 1 for unknown attacker type', () => {
            expect(Utils.getEffectiveness('INCONNU', 'FEU')).toBe(1);
        });
        test('returns 1 when defType not in strong or weak', () => {
            expect(Utils.getEffectiveness('OCEAN', 'OCEAN')).toBe(1);
        });
        test('GLACE strong against VENT, FLORE, TERRE', () => {
            expect(Utils.getEffectiveness('GLACE', 'VENT')).toBe(1.5);
            expect(Utils.getEffectiveness('GLACE', 'FLORE')).toBe(1.5);
            expect(Utils.getEffectiveness('GLACE', 'TERRE')).toBe(1.5);
        });
        test('GLACE weak against FEU', () => {
            expect(Utils.getEffectiveness('GLACE', 'FEU')).toBe(0.67);
        });
    });

    describe('calculateDamage', () => {
        test('returns a positive integer', () => {
            const spy = jest.spyOn(Utils, 'randFloat').mockReturnValue(1.0);
            const dmg = Utils.calculateDamage(50, 'FEU', 20, 'FLORE', 5);
            expect(dmg).toBeGreaterThan(0);
            expect(Number.isInteger(dmg)).toBe(true);
            spy.mockRestore();
        });
        test('damage increases with level', () => {
            const spy = jest.spyOn(Utils, 'randFloat').mockReturnValue(1.0);
            const dmg1 = Utils.calculateDamage(50, 'FEU', 20, 'FLORE', 1);
            const dmg10 = Utils.calculateDamage(50, 'FEU', 20, 'FLORE', 10);
            expect(dmg10).toBeGreaterThan(dmg1);
            spy.mockRestore();
        });
        test('damage is at least 1 at higher levels', () => {
            const spy = jest.spyOn(Utils, 'randFloat').mockReturnValue(0.85);
            // base=1, levelMult=1+5*0.05=1.25, eff=1, rand=0.85 → floor(1.0625)=1
            const dmg = Utils.calculateDamage(1, 'FEU', 999, 'FEU', 5);
            expect(dmg).toBeGreaterThanOrEqual(1);
            spy.mockRestore();
        });
        test('super-effective type increases damage', () => {
            const spy = jest.spyOn(Utils, 'randFloat').mockReturnValue(1.0);
            const dmgEffective = Utils.calculateDamage(50, 'FEU', 20, 'FLORE', 5);
            const dmgNeutral = Utils.calculateDamage(50, 'FEU', 20, 'FEU', 5);
            expect(dmgEffective).toBeGreaterThan(dmgNeutral);
            spy.mockRestore();
        });
        test('resisted type decreases damage', () => {
            const spy = jest.spyOn(Utils, 'randFloat').mockReturnValue(1.0);
            const dmgResisted = Utils.calculateDamage(50, 'FEU', 20, 'OCEAN', 5);
            const dmgNeutral = Utils.calculateDamage(50, 'FEU', 20, 'FEU', 5);
            expect(dmgResisted).toBeLessThan(dmgNeutral);
            spy.mockRestore();
        });
    });

    describe('calculateCaptureRate', () => {
        test('higher capture rate when HP is low', () => {
            const rateLowHp = Utils.calculateCaptureRate(30, 1, 100);
            const rateFullHp = Utils.calculateCaptureRate(30, 100, 100);
            expect(rateLowHp).toBeGreaterThan(rateFullHp);
        });
        test('clamps to minimum 5', () => {
            const rate = Utils.calculateCaptureRate(0, 100, 100);
            expect(rate).toBe(5);
        });
        test('clamps to maximum 95', () => {
            const rate = Utils.calculateCaptureRate(90, 1, 100);
            expect(rate).toBe(95);
        });
        test('at full HP, rate equals baseRate', () => {
            const rate = Utils.calculateCaptureRate(30, 100, 100);
            expect(rate).toBe(30);
        });
        test('at 0 HP, rate = baseRate + CAPTURE_HP_BONUS', () => {
            const rate = Utils.calculateCaptureRate(30, 0, 100);
            expect(rate).toBe(70);
        });
    });

    describe('xpForLevel', () => {
        test('level 1 returns XP_BASE', () => {
            expect(Utils.xpForLevel(1)).toBe(50);
        });
        test('increases with level', () => {
            expect(Utils.xpForLevel(2)).toBeGreaterThan(Utils.xpForLevel(1));
        });
        test('returns integer', () => {
            expect(Number.isInteger(Utils.xpForLevel(5))).toBe(true);
            expect(Number.isInteger(Utils.xpForLevel(10))).toBe(true);
        });
        test('level 2 = floor(50 * 1.15)', () => {
            expect(Utils.xpForLevel(2)).toBe(Math.floor(50 * 1.15));
        });
        test('level 10 follows exponential formula', () => {
            const expected = Math.floor(50 * Math.pow(1.15, 9));
            expect(Utils.xpForLevel(10)).toBe(expected);
        });
    });

    describe('statsAtLevel', () => {
        test('level 1 returns baseStat + 3', () => {
            expect(Utils.statsAtLevel(10, 1)).toBe(13);
        });
        test('scales linearly with level', () => {
            expect(Utils.statsAtLevel(10, 1)).toBe(13);
            expect(Utils.statsAtLevel(10, 5)).toBe(25);
            expect(Utils.statsAtLevel(10, 10)).toBe(40);
        });
        test('returns baseStat at level 0', () => {
            expect(Utils.statsAtLevel(50, 0)).toBe(50);
        });
        test('works with zero baseStat', () => {
            expect(Utils.statsAtLevel(0, 5)).toBe(15);
        });
    });

    describe('deepClone', () => {
        test('returns a new object (not same reference)', () => {
            const obj = { a: 1, b: { c: 2 } };
            const clone = Utils.deepClone(obj);
            expect(clone).not.toBe(obj);
            expect(clone.b).not.toBe(obj.b);
        });
        test('clones nested values correctly', () => {
            const obj = { a: 1, b: { c: 'hello', d: [1, 2, 3] } };
            expect(Utils.deepClone(obj)).toEqual(obj);
        });
        test('modifying clone does not affect original', () => {
            const obj = { a: 1, b: { c: 2 } };
            const clone = Utils.deepClone(obj);
            clone.b.c = 999;
            expect(obj.b.c).toBe(2);
        });
        test('clones arrays', () => {
            const arr = [1, { x: 2 }, [3, 4]];
            const clone = Utils.deepClone(arr);
            expect(clone).toEqual(arr);
            expect(clone).not.toBe(arr);
        });
        test('clones primitives', () => {
            expect(Utils.deepClone(42)).toBe(42);
            expect(Utils.deepClone('hello')).toBe('hello');
            expect(Utils.deepClone(null)).toBe(null);
        });
    });

    describe('getTypeColor', () => {
        test('returns correct color for known type', () => {
            expect(Utils.getTypeColor('FEU')).toBe('#ff6b35');
            expect(Utils.getTypeColor('GLACE')).toBe('#74b9ff');
            expect(Utils.getTypeColor('OCEAN')).toBe('#0984e3');
        });
        test('returns default #888 for unknown type', () => {
            expect(Utils.getTypeColor('INCONNU')).toBe('#888');
        });
        test('returns default #888 for empty string', () => {
            expect(Utils.getTypeColor('')).toBe('#888');
        });
        test('returns default #888 for undefined', () => {
            expect(Utils.getTypeColor(undefined)).toBe('#888');
        });
    });

    describe('getTypeEmoji', () => {
        test('returns correct emoji for known type', () => {
            expect(Utils.getTypeEmoji('FEU')).toBe('\u{1F525}');
            expect(Utils.getTypeEmoji('GLACE')).toBe('\u2744\uFE0F');
            expect(Utils.getTypeEmoji('OCEAN')).toBe('\u{1F30A}');
            expect(Utils.getTypeEmoji('FLORE')).toBe('\u{1F33F}');
        });
        test('returns default \u2753 for unknown type', () => {
            expect(Utils.getTypeEmoji('INCONNU')).toBe('\u2753');
        });
        test('returns default \u2753 for empty string', () => {
            expect(Utils.getTypeEmoji('')).toBe('\u2753');
        });
    });

    describe('uid', () => {
        test('returns a string', () => {
            expect(typeof Utils.uid()).toBe('string');
        });
        test('returns non-empty string', () => {
            expect(Utils.uid().length).toBeGreaterThan(0);
        });
        test('generates unique values', () => {
            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(Utils.uid());
            }
            expect(ids.size).toBe(100);
        });
        test('contains base-36 characters', () => {
            expect(Utils.uid()).toMatch(/^[a-z0-9]+$/);
        });
    });
});
