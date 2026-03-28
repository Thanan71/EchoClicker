const path = require('path');
const { loadDataFile } = require('./helpers/loadData.cjs');

const ctx = loadDataFile(path.join(__dirname, '../js/data/types.js'));
const TYPES = ctx.TYPES;
const TYPE_CHART = ctx.TYPE_CHART;
const RARITY_COLORS = ctx.RARITY_COLORS;

describe('types.js - Structure des types', () => {
    describe('TYPES - Chaque type a name, color, emoji', () => {
        test('TYPES est defini et contient au moins 1 type', () => {
            expect(TYPES).toBeDefined();
            expect(typeof TYPES).toBe('object');
            expect(Object.keys(TYPES).length).toBeGreaterThan(0);
        });

        test.each(Object.entries(TYPES))('type "%s" a name, color (hex), emoji', (typeKey, typeData) => {
            expect(typeData).toHaveProperty('name');
            expect(typeData).toHaveProperty('color');
            expect(typeData).toHaveProperty('emoji');
            expect(typeof typeData.name).toBe('string');
            expect(typeData.name.length).toBeGreaterThan(0);
            expect(typeData.color).toMatch(/^#[0-9a-fA-F]{6}$/);
            expect(typeof typeData.emoji).toBe('string');
            expect(typeData.emoji.length).toBeGreaterThan(0);
        });

        test('les noms et couleurs de types sont uniques', () => {
            const names = Object.values(TYPES).map((t) => t.name);
            const colors = Object.values(TYPES).map((t) => t.color);
            expect(new Set(names).size).toBe(names.length);
            expect(new Set(colors).size).toBe(colors.length);
        });
    });

    describe('TYPE_CHART - Structure et references valides', () => {
        test('chaque entree a strong et weak (arrays)', () => {
            for (const chart of Object.values(TYPE_CHART)) {
                expect(chart).toHaveProperty('strong');
                expect(chart).toHaveProperty('weak');
                expect(Array.isArray(chart.strong)).toBe(true);
                expect(Array.isArray(chart.weak)).toBe(true);
            }
        });

        test('toutes les cles et references pointent vers des types valides', () => {
            const typeKeys = Object.keys(TYPES);
            for (const [typeKey, chart] of Object.entries(TYPE_CHART)) {
                expect(typeKeys).toContain(typeKey);
                for (const ref of chart.strong) expect(typeKeys).toContain(ref);
                for (const ref of chart.weak) expect(typeKeys).toContain(ref);
            }
        });
    });

    describe('TYPE_CHART - Symetrie', () => {
        test('si A est strong contre B, B est weak contre A', () => {
            const asym = [];
            for (const [atk, chart] of Object.entries(TYPE_CHART)) {
                for (const def of chart.strong) {
                    const defChart = TYPE_CHART[def];
                    if (!defChart || !defChart.weak.includes(atk))
                        asym.push(`${atk} strong vs ${def}, mais ${def} pas weak vs ${atk}`);
                }
            }
            expect(asym).toEqual([]);
        });

        test('si A est weak contre B, B est strong contre A', () => {
            const asym = [];
            for (const [atk, chart] of Object.entries(TYPE_CHART)) {
                for (const def of chart.weak) {
                    const defChart = TYPE_CHART[def];
                    if (!defChart || !defChart.strong.includes(atk))
                        asym.push(`${atk} weak vs ${def}, mais ${def} pas strong vs ${atk}`);
                }
            }
            expect(asym).toEqual([]);
        });

        test('pas de strong ET weak contre le meme type', () => {
            for (const chart of Object.values(TYPE_CHART)) {
                expect(chart.strong.filter((t) => chart.weak.includes(t))).toEqual([]);
            }
        });

        test('pas de strong/weak contre soi-meme', () => {
            for (const [typeKey, chart] of Object.entries(TYPE_CHART)) {
                expect(chart.strong).not.toContain(typeKey);
                expect(chart.weak).not.toContain(typeKey);
            }
        });
    });

    describe('TYPE_CHART - Couverture', () => {
        test('chaque type a une entree dans TYPE_CHART', () => {
            for (const typeKey of Object.keys(TYPES)) {
                expect(TYPE_CHART).toHaveProperty(typeKey);
            }
        });
    });

    describe('RARITY_COLORS', () => {
        test('contient les raretes standard avec couleurs hex valides', () => {
            const expected = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'];
            for (const rarity of expected) {
                expect(RARITY_COLORS).toHaveProperty(rarity);
                expect(RARITY_COLORS[rarity]).toMatch(/^#[0-9a-fA-F]{6}$/);
            }
        });
    });
});
