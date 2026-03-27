// ============================================
// Tests unitaires - Classe Echo
// ============================================

// Charger les mocks globaux (EventBus, GAME_EVENTS, Game, Utils, getEchoById)
const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');
const { Game, createMockGameState } = require('./__mocks__/game.cjs');

// Données de test simulant ECHOES_DB
const mockEchoData = {
    base: {
        id: 'flamby',
        name: 'Flamby',
        type: 'FEU',
        emoji: '🔥',
        rarity: 'common',
        desc: 'Un petit écho de feu',
        baseHp: 30,
        baseAtk: 15,
        baseDef: 10,
        baseSpd: 12,
        evo: { to: 'inferno', lv: 10 }
    },
    evolved: {
        id: 'inferno',
        name: 'Inferno',
        type: 'FEU',
        emoji: '🌋',
        rarity: 'rare',
        desc: 'Un écho de feu puissant',
        baseHp: 55,
        baseAtk: 30,
        baseDef: 20,
        baseSpd: 18,
        evo: null
    },
    noEvo: {
        id: 'blob',
        name: 'Blob',
        type: 'OCEAN',
        emoji: '💧',
        rarity: 'common',
        desc: 'Un écho sans évolution',
        baseHp: 25,
        baseAtk: 12,
        baseDef: 14,
        baseSpd: 8,
        evo: null
    }
};

// Helper pour configurer getEchoById avec les données mock
function setupGetEchoById() {
    globalThis.getEchoById.mockImplementation((id) => {
        if (id === 'flamby') return { ...mockEchoData.base };
        if (id === 'inferno') return { ...mockEchoData.evolved };
        if (id === 'blob') return { ...mockEchoData.noEvo };
        return null;
    });
}

// Echo et generateWildEcho sont chargés par tests/helpers/setup.cjs

describe('Echo', () => {
    beforeEach(() => {
        EventBus.reset();
        Game.reset();
        setupGetEchoById();
        Game.state.boosts = {};
    });

    // ========== Constructor ==========
    describe('constructor', () => {
        test('sets properties from data object', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.id).toBe('flamby');
            expect(echo.name).toBe('Flamby');
            expect(echo.type).toBe('FEU');
            expect(echo.emoji).toBe('🔥');
            expect(echo.rarity).toBe('common');
            expect(echo.description).toBe('Un petit écho de feu');
        });

        test('sets base stats from data', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.baseHp).toBe(30);
            expect(echo.baseAtk).toBe(15);
            expect(echo.baseDef).toBe(10);
            expect(echo.baseSpd).toBe(12);
        });

        test('defaults level to 1 when not provided', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.level).toBe(1);
        });

        test('accepts custom level', () => {
            const echo = new Echo(mockEchoData.base, 5);
            expect(echo.level).toBe(5);
        });

        test('defaults isPrimordial to false', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.isPrimordial).toBe(false);
        });

        test('accepts isPrimordial flag', () => {
            const echo = new Echo(mockEchoData.base, 1, true);
            expect(echo.isPrimordial).toBe(true);
        });

        test('xp starts at 0', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.xp).toBe(0);
        });

        test('xpToNext is calculated via Utils.xpForLevel', () => {
            const echo = new Echo(mockEchoData.base, 1);
            expect(echo.xpToNext).toBe(Utils.xpForLevel(1));
        });

        test('hp is set to maxHp after construction', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.hp).toBe(echo.maxHp);
        });

        test('sets evolution from data.evo', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.evolution).toEqual({ to: 'inferno', lv: 10 });
        });

        test('sets evolution to null when data has no evo', () => {
            const echo = new Echo(mockEchoData.noEvo);
            expect(echo.evolution).toBeNull();
        });

        test('generates a uid via Utils.uid', () => {
            const echo = new Echo(mockEchoData.base);
            expect(typeof echo.uid).toBe('string');
            expect(echo.uid.length).toBeGreaterThan(0);
        });

        test('defaults rarity to common if not provided', () => {
            const data = { ...mockEchoData.base };
            delete data.rarity;
            const echo = new Echo(data);
            expect(echo.rarity).toBe('common');
        });

        test('defaults description to empty string if desc not provided', () => {
            const data = { ...mockEchoData.base };
            delete data.desc;
            const echo = new Echo(data);
            expect(echo.description).toBe('');
        });
    });

    // ========== recalcStats ==========
    describe('recalcStats', () => {
        test('calculates maxHp correctly for non-primordial', () => {
            const echo = new Echo(mockEchoData.base, 1, false);
            // maxHp = floor((30 + 1*3) * 1) = 33
            expect(echo.maxHp).toBe(33);
        });

        test('calculates atk correctly for non-primordial', () => {
            const echo = new Echo(mockEchoData.base, 1, false);
            // atk = floor((15 + 1*2) * 1) = 17
            expect(echo.atk).toBe(17);
        });

        test('calculates def correctly for non-primordial', () => {
            const echo = new Echo(mockEchoData.base, 1, false);
            // def = floor((10 + 1*2) * 1) = 12
            expect(echo.def).toBe(12);
        });

        test('calculates spd correctly for non-primordial', () => {
            const echo = new Echo(mockEchoData.base, 1, false);
            // spd = floor((12 + 1*1.5) * 1) = 13
            expect(echo.spd).toBe(13);
        });

        test('applies 1.1 primordial multiplier', () => {
            const echo = new Echo(mockEchoData.base, 1, true);
            // maxHp = floor((30 + 1*3) * 1.1) = floor(36.3) = 36
            expect(echo.maxHp).toBe(36);
            // atk = floor((15 + 1*2) * 1.1) = floor(18.7) = 18
            expect(echo.atk).toBe(18);
        });

        test('scales stats with level', () => {
            const echo1 = new Echo(mockEchoData.base, 1);
            const echo10 = new Echo(mockEchoData.base, 10);
            expect(echo10.maxHp).toBeGreaterThan(echo1.maxHp);
            expect(echo10.atk).toBeGreaterThan(echo1.atk);
            expect(echo10.def).toBeGreaterThan(echo1.def);
            expect(echo10.spd).toBeGreaterThan(echo1.spd);
        });

        test('caps hp to maxHp when hp exceeds maxHp', () => {
            const echo = new Echo(mockEchoData.base, 5);
            echo.hp = echo.maxHp;
            echo.level = 1;
            echo.recalcStats();
            expect(echo.hp).toBeLessThanOrEqual(echo.maxHp);
        });

        test('does not change hp when hp is below maxHp', () => {
            const echo = new Echo(mockEchoData.base, 5);
            echo.hp = 10;
            echo.recalcStats();
            expect(echo.hp).toBe(10);
        });
    });

    // ========== gainXp ==========
    describe('gainXp', () => {
        test('adds xp to current xp', () => {
            const echo = new Echo(mockEchoData.base, 1);
            echo.gainXp(10);
            expect(echo.xp).toBe(10);
        });

        test('returns empty array when no level up occurs', () => {
            const echo = new Echo(mockEchoData.base, 1);
            const result = echo.gainXp(5);
            expect(result).toEqual([]);
        });

        test('levels up when xp reaches xpToNext', () => {
            const echo = new Echo(mockEchoData.base, 1);
            echo.gainXp(echo.xpToNext);
            expect(echo.level).toBe(2);
        });

        test('returns array of new levels after level up', () => {
            const echo = new Echo(mockEchoData.base, 1);
            const result = echo.gainXp(echo.xpToNext);
            expect(result).toContain(2);
        });

        test('heals to maxHp on level up', () => {
            const echo = new Echo(mockEchoData.base, 1);
            echo.hp = 1;
            echo.gainXp(echo.xpToNext);
            expect(echo.hp).toBe(echo.maxHp);
        });

        test('emits ECHO_LEVELED_UP event on level up', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.ECHO_LEVELED_UP, listener);
            const echo = new Echo(mockEchoData.base, 1);
            echo.gainXp(echo.xpToNext);
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(expect.objectContaining({
                echo: echo, level: 2
            }));
        });

        test('can level up multiple times in one gainXp call', () => {
            const echo = new Echo(mockEchoData.base, 1);
            const result = echo.gainXp(99999);
            expect(result.length).toBeGreaterThanOrEqual(2);
            expect(echo.level).toBeGreaterThan(2);
        });

        test('applies 1.5x xp boost when Game.state.boosts.xp is active', () => {
            Game.state.boosts = { xp: { endTime: Date.now() + 60000 } };
            const echo = new Echo(mockEchoData.base, 1);
            echo.gainXp(100);
            expect(echo.xp).toBe(150);
        });

        test('does not apply boost when boosts.xp is falsy', () => {
            Game.state.boosts = {};
            const echo = new Echo(mockEchoData.base, 1);
            echo.gainXp(100);
            expect(echo.xp).toBe(100);
        });

        test('triggers evolve when level reaches evolution threshold', () => {
            const echo = new Echo(mockEchoData.base, 9);
            echo.gainXp(echo.xpToNext);
            expect(echo.level).toBe(10);
            expect(echo.id).toBe('inferno');
        });
    });

    // ========== evolve ==========
    describe('evolve', () => {
        test('updates id to evolved form', () => {
            const echo = new Echo(mockEchoData.base, 10);
            echo.evolve();
            expect(echo.id).toBe('inferno');
        });

        test('updates name to evolved form', () => {
            const echo = new Echo(mockEchoData.base, 10);
            echo.evolve();
            expect(echo.name).toBe('Inferno');
        });

        test('updates emoji, type, rarity, description', () => {
            const echo = new Echo(mockEchoData.base, 10);
            echo.evolve();
            expect(echo.emoji).toBe('🌋');
            expect(echo.rarity).toBe('rare');
            expect(echo.description).toBe('Un écho de feu puissant');
        });

        test('updates base stats to evolved form', () => {
            const echo = new Echo(mockEchoData.base, 10);
            echo.evolve();
            expect(echo.baseHp).toBe(55);
            expect(echo.baseAtk).toBe(30);
        });

        test('recalculates and heals after evolution', () => {
            const echo = new Echo(mockEchoData.base, 10);
            const oldMaxHp = echo.maxHp;
            echo.hp = 1;
            echo.evolve();
            expect(echo.maxHp).toBeGreaterThan(oldMaxHp);
            expect(echo.hp).toBe(echo.maxHp);
        });

        test('emits ECHO_EVOLVED event with oldName', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.ECHO_EVOLVED, listener);
            const echo = new Echo(mockEchoData.base, 10);
            echo.evolve();
            expect(listener).toHaveBeenCalledWith(expect.objectContaining({
                echo: echo, oldName: 'Flamby'
            }));
        });

        test('does nothing when no evolution data', () => {
            const echo = new Echo(mockEchoData.noEvo);
            const originalId = echo.id;
            echo.evolve();
            expect(echo.id).toBe(originalId);
        });

        test('does nothing when getEchoById returns null', () => {
            globalThis.getEchoById.mockReturnValue(null);
            const echo = new Echo(mockEchoData.base, 10);
            echo.evolve();
            expect(echo.name).toBe('Flamby');
        });
    });

    // ========== takeDamage ==========
    describe('takeDamage', () => {
        test('reduces hp by damage amount', () => {
            const echo = new Echo(mockEchoData.base);
            const hp = echo.hp;
            echo.takeDamage(10);
            expect(echo.hp).toBe(hp - 10);
        });

        test('hp floors at 0', () => {
            const echo = new Echo(mockEchoData.base);
            echo.takeDamage(9999);
            expect(echo.hp).toBe(0);
        });

        test('returns false when survives', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.takeDamage(1)).toBe(false);
        });

        test('returns true when faints', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.takeDamage(echo.hp)).toBe(true);
        });

        test('emits ECHO_FAINTED when hp reaches 0', () => {
            const fn = jest.fn();
            EventBus.on(GAME_EVENTS.ECHO_FAINTED, fn);
            const echo = new Echo(mockEchoData.base);
            echo.takeDamage(echo.hp);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('does not emit ECHO_FAINTED when survives', () => {
            const fn = jest.fn();
            EventBus.on(GAME_EVENTS.ECHO_FAINTED, fn);
            const echo = new Echo(mockEchoData.base);
            echo.takeDamage(1);
            expect(fn).not.toHaveBeenCalled();
        });
    });

    // ========== heal ==========
    describe('heal', () => {
        test('increases hp by heal amount', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = 1;
            echo.heal(10);
            expect(echo.hp).toBe(11);
        });

        test('caps hp at maxHp', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = echo.maxHp - 1;
            echo.heal(999);
            expect(echo.hp).toBe(echo.maxHp);
        });

        test('heal of 0 does not change hp', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = 5;
            echo.heal(0);
            expect(echo.hp).toBe(5);
        });
    });

    // ========== fullHeal ==========
    describe('fullHeal', () => {
        test('sets hp to maxHp', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = 1;
            echo.fullHeal();
            expect(echo.hp).toBe(echo.maxHp);
        });

        test('works when already full', () => {
            const echo = new Echo(mockEchoData.base);
            const mhp = echo.maxHp;
            echo.fullHeal();
            expect(echo.hp).toBe(mhp);
        });
    });

    // ========== isAlive ==========
    describe('isAlive', () => {
        test('returns true when hp > 0', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.isAlive()).toBe(true);
        });

        test('returns false when hp === 0', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = 0;
            expect(echo.isAlive()).toBe(false);
        });

        test('returns true when hp is 1', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = 1;
            expect(echo.isAlive()).toBe(true);
        });
    });

    // ========== getHpPercent ==========
    describe('getHpPercent', () => {
        test('returns 100 at full health', () => {
            const echo = new Echo(mockEchoData.base);
            expect(echo.getHpPercent()).toBe(100);
        });

        test('returns 0 when hp is 0', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = 0;
            expect(echo.getHpPercent()).toBe(0);
        });

        test('returns ~50 at half health', () => {
            const echo = new Echo(mockEchoData.base);
            echo.hp = echo.maxHp / 2;
            expect(echo.getHpPercent()).toBeCloseTo(50, 0);
        });
    });

    // ========== calculateDamageAgainst ==========
    describe('calculateDamageAgainst', () => {
        test('delegates to Utils.calculateDamage with correct args', () => {
            const attacker = new Echo(mockEchoData.base, 5);
            const defender = new Echo(mockEchoData.noEvo, 5);
            attacker.calculateDamageAgainst(defender);
            expect(Utils.calculateDamage).toHaveBeenCalledWith(
                attacker.atk, attacker.type,
                defender.def, defender.type,
                attacker.level
            );
        });

        test('returns a number', () => {
            const a = new Echo(mockEchoData.base, 1);
            const d = new Echo(mockEchoData.noEvo, 1);
            expect(typeof a.calculateDamageAgainst(d)).toBe('number');
        });
    });

    // ========== getAttackInterval ==========
    describe('getAttackInterval', () => {
        test('formula: max(500, 3000 - spd * 30)', () => {
            const echo = new Echo(mockEchoData.base, 1);
            const expected = Math.max(500, 3000 - echo.spd * 30);
            expect(echo.getAttackInterval()).toBe(expected);
        });

        test('returns >= 500 always', () => {
            const echo = new Echo(mockEchoData.base, 100);
            expect(echo.getAttackInterval()).toBeGreaterThanOrEqual(500);
        });

        test('decreases with higher speed', () => {
            const slow = new Echo(mockEchoData.noEvo, 1);
            const fast = new Echo(mockEchoData.base, 50);
            expect(fast.getAttackInterval()).toBeLessThan(slow.getAttackInterval());
        });
    });

    // ========== toJSON ==========
    describe('toJSON', () => {
        test('returns a plain object with all properties', () => {
            const echo = new Echo(mockEchoData.base, 5);
            const json = echo.toJSON();
            expect(json.uid).toBe(echo.uid);
            expect(json.id).toBe('flamby');
            expect(json.name).toBe('Flamby');
            expect(json.level).toBe(5);
            expect(json.xp).toBe(0);
            expect(json.hp).toBe(echo.hp);
            expect(json.maxHp).toBe(echo.maxHp);
            expect(json.isPrimordial).toBe(false);
            expect(json.evolution).toEqual({ to: 'inferno', lv: 10 });
        });

        test('serializes primordial correctly', () => {
            const echo = new Echo(mockEchoData.base, 1, true);
            expect(echo.toJSON().isPrimordial).toBe(true);
        });
    });

    // ========== fromJSON ==========
    describe('fromJSON', () => {
        test('reconstructs echo from serialized data', () => {
            const original = new Echo(mockEchoData.base, 5);
            original.xp = 20;
            const restored = Echo.fromJSON(original.toJSON());
            expect(restored.id).toBe('flamby');
            expect(restored.level).toBe(5);
            expect(restored.xp).toBe(20);
        });

        test('preserves uid from json', () => {
            const original = new Echo(mockEchoData.base, 3);
            const restored = Echo.fromJSON(original.toJSON());
            expect(restored.uid).toBe(original.uid);
        });

        test('uses getEchoById for data lookup', () => {
            const json = { id: 'flamby', level: 5, xp: 10, uid: 'u1', hp: 50, isPrimordial: false };
            Echo.fromJSON(json);
            expect(globalThis.getEchoById).toHaveBeenCalledWith('flamby');
        });

        test('falls back to json data when getEchoById returns null', () => {
            globalThis.getEchoById.mockReturnValue(null);
            const json = {
                id: 'x', name: 'X', type: 'FEU', emoji: '?',
                baseHp: 10, baseAtk: 5, baseDef: 5, baseSpd: 5,
                level: 1, uid: 'u2', hp: 10, isPrimordial: false
            };
            const restored = Echo.fromJSON(json);
            expect(restored.id).toBe('x');
            expect(restored.baseHp).toBe(10);
        });

        test('defaults hp to maxHp when not in json', () => {
            const json = { id: 'flamby', level: 1, uid: 'u3', isPrimordial: false };
            const restored = Echo.fromJSON(json);
            expect(restored.hp).toBe(restored.maxHp);
        });

        test('roundtrip: toJSON then fromJSON preserves all data', () => {
            const orig = new Echo(mockEchoData.base, 7, true);
            orig.xp = 30;
            orig.hp = orig.maxHp - 10;
            const restored = Echo.fromJSON(orig.toJSON());
            expect(restored.uid).toBe(orig.uid);
            expect(restored.id).toBe(orig.id);
            expect(restored.level).toBe(orig.level);
            expect(restored.xp).toBe(orig.xp);
            expect(restored.hp).toBe(orig.hp);
            expect(restored.isPrimordial).toBe(true);
            expect(restored.maxHp).toBe(orig.maxHp);
            expect(restored.atk).toBe(orig.atk);
        });
    });
});
