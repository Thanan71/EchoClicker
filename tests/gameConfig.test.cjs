// ============================================
// Tests unitaires - GAME_CONFIG & SHOP (js/data/game-config.js)
// ============================================

const fs = require('fs');
const path = require('path');

// Charger le module et extraire les variables
const configPath = path.join(__dirname, '..', 'js', 'data', 'game-config.js');
const configCode = fs.readFileSync(configPath, 'utf-8');

// Créer un contexte pour capturer les variables
const context = {};
const codeToEval = configCode
    .replace(/\bexport\b\s*/g, '')
    .replace('const GAME_CONFIG', 'context.GAME_CONFIG')
    .replace('const SHOP', 'context.SHOP');
eval(codeToEval);
const GAME_CONFIG = context.GAME_CONFIG;
const SHOP = context.SHOP;

describe('GAME_CONFIG', () => {
    test('is defined and is an object', () => {
        expect(GAME_CONFIG).toBeDefined();
        expect(typeof GAME_CONFIG).toBe('object');
    });

    describe('Numeric constants are positive', () => {
        test('TICK_RATE > 0', () => {
            expect(GAME_CONFIG.TICK_RATE).toBeGreaterThan(0);
        });

        test('PASSIVE_BASE >= 0', () => {
            expect(GAME_CONFIG.PASSIVE_BASE).toBeGreaterThanOrEqual(0);
        });

        test('CPS_WINDOW > 0', () => {
            expect(GAME_CONFIG.CPS_WINDOW).toBeGreaterThan(0);
        });

        test('MAX_PARTY > 0', () => {
            expect(GAME_CONFIG.MAX_PARTY).toBeGreaterThan(0);
        });

        test('CAPTURE_BASE_RATE between 0 and 100', () => {
            expect(GAME_CONFIG.CAPTURE_BASE_RATE).toBeGreaterThan(0);
            expect(GAME_CONFIG.CAPTURE_BASE_RATE).toBeLessThanOrEqual(100);
        });

        test('CAPTURE_HP_BONUS >= 0', () => {
            expect(GAME_CONFIG.CAPTURE_HP_BONUS).toBeGreaterThanOrEqual(0);
        });

        test('PRIMORDIAL_CHANCE between 0 and 1', () => {
            expect(GAME_CONFIG.PRIMORDIAL_CHANCE).toBeGreaterThan(0);
            expect(GAME_CONFIG.PRIMORDIAL_CHANCE).toBeLessThanOrEqual(1);
        });

        test('XP_BASE > 0', () => {
            expect(GAME_CONFIG.XP_BASE).toBeGreaterThan(0);
        });

        test('XP_GROWTH > 1', () => {
            expect(GAME_CONFIG.XP_GROWTH).toBeGreaterThan(1);
        });

        test('KILLS_FOR_ROUTE > 0', () => {
            expect(GAME_CONFIG.KILLS_FOR_ROUTE).toBeGreaterThan(0);
        });

        test('AUTO_SAVE_INTERVAL > 0', () => {
            expect(GAME_CONFIG.AUTO_SAVE_INTERVAL).toBeGreaterThan(0);
        });

        test('ENERGY_PER_CLICK_BASE > 0', () => {
            expect(GAME_CONFIG.ENERGY_PER_CLICK_BASE).toBeGreaterThan(0);
        });

        test('COMBAT_CLICK_MULTIPLIER >= 1', () => {
            expect(GAME_CONFIG.COMBAT_CLICK_MULTIPLIER).toBeGreaterThanOrEqual(1);
        });

        test('MAX_LOG_ENTRIES > 0', () => {
            expect(GAME_CONFIG.MAX_LOG_ENTRIES).toBeGreaterThan(0);
        });

        test('MINE_ENERGY_REGEN_RATE > 0', () => {
            expect(GAME_CONFIG.MINE_ENERGY_REGEN_RATE).toBeGreaterThan(0);
        });

        test('MINE_ENERGY_REGEN_INTERVAL > 0', () => {
            expect(GAME_CONFIG.MINE_ENERGY_REGEN_INTERVAL).toBeGreaterThan(0);
        });
    });

    describe('Specific values', () => {
        test('TICK_RATE is 50ms (20 ticks/sec)', () => {
            expect(GAME_CONFIG.TICK_RATE).toBe(50);
        });

        test('MAX_PARTY is 6', () => {
            expect(GAME_CONFIG.MAX_PARTY).toBe(6);
        });

        test('CAPTURE_BASE_RATE is 30', () => {
            expect(GAME_CONFIG.CAPTURE_BASE_RATE).toBe(30);
        });

        test('PRIMORDIAL_CHANCE is 0.005 (0.5%)', () => {
            expect(GAME_CONFIG.PRIMORDIAL_CHANCE).toBe(0.005);
        });
    });
});

describe('SHOP', () => {
    test('is defined and is an object', () => {
        expect(SHOP).toBeDefined();
        expect(typeof SHOP).toBe('object');
    });

    describe('SHOP.links', () => {
        test('is a non-empty array', () => {
            expect(Array.isArray(SHOP.links)).toBe(true);
            expect(SHOP.links.length).toBeGreaterThan(0);
        });

        test.each(SHOP.links.map(l => [l.id, l]))(
            'link "%s" has id, name, icon, price, currency, amount',
            (_, link) => {
                expect(typeof link.id).toBe('string');
                expect(link.id.length).toBeGreaterThan(0);
                expect(typeof link.name).toBe('string');
                expect(link.name.length).toBeGreaterThan(0);
                expect(typeof link.icon).toBe('string');
                expect(typeof link.price).toBe('number');
                expect(link.price).toBeGreaterThan(0);
                expect(link.currency).toBe('energy');
                expect(typeof link.amount).toBe('number');
                expect(link.amount).toBeGreaterThan(0);
            }
        );

        test('link IDs are unique', () => {
            const ids = SHOP.links.map(l => l.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('SHOP.boosts', () => {
        test('is a non-empty array', () => {
            expect(Array.isArray(SHOP.boosts)).toBe(true);
            expect(SHOP.boosts.length).toBeGreaterThan(0);
        });

        test.each(SHOP.boosts.map(b => [b.id, b]))(
            'boost "%s" has id, name, icon, price, currency, duration, type',
            (_, boost) => {
                expect(typeof boost.id).toBe('string');
                expect(boost.id.length).toBeGreaterThan(0);
                expect(typeof boost.name).toBe('string');
                expect(boost.name.length).toBeGreaterThan(0);
                expect(typeof boost.icon).toBe('string');
                expect(typeof boost.price).toBe('number');
                expect(boost.price).toBeGreaterThan(0);
                expect(boost.currency).toBe('energy');
                expect(typeof boost.duration).toBe('number');
                expect(boost.duration).toBeGreaterThan(0);
                expect(typeof boost.type).toBe('string');
                expect(boost.type.length).toBeGreaterThan(0);
            }
        );

        test('boost IDs are unique', () => {
            const ids = SHOP.boosts.map(b => b.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('SHOP.items', () => {
        test('is a non-empty array', () => {
            expect(Array.isArray(SHOP.items)).toBe(true);
            expect(SHOP.items.length).toBeGreaterThan(0);
        });

        test.each(SHOP.items.map(i => [i.id, i]))(
            'item "%s" has id, name, icon, price, currency',
            (_, item) => {
                expect(typeof item.id).toBe('string');
                expect(item.id.length).toBeGreaterThan(0);
                expect(typeof item.name).toBe('string');
                expect(item.name.length).toBeGreaterThan(0);
                expect(typeof item.icon).toBe('string');
                expect(typeof item.price).toBe('number');
                expect(item.price).toBeGreaterThan(0);
                expect(item.currency).toBe('energy');
            }
        );

        test('item IDs are unique', () => {
            const ids = SHOP.items.map(i => i.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('All SHOP IDs are globally unique', () => {
        test('no duplicate IDs across links, boosts, items', () => {
            const allIds = [
                ...SHOP.links.map(l => l.id),
                ...SHOP.boosts.map(b => b.id),
                ...SHOP.items.map(i => i.id)
            ];
            expect(new Set(allIds).size).toBe(allIds.length);
        });
    });
});