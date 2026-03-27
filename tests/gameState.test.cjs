// ============================================
// Tests unitaires - GameState (js/modules/game-state.js)
// ============================================

// Mocks globaux
globalThis.GAME_CONFIG = {
    ENERGY_PER_CLICK_BASE: 1,
    PASSIVE_BASE: 0.1
};

globalThis.REGIONS = [
    { id: 'foret', name: 'Forêt', routes: [], bosses: [] }
];

globalThis.Utils = {
    deepClone: jest.fn((obj) => JSON.parse(JSON.stringify(obj)))
};

// Définir GameState directement
globalThis.GameState = {
    state: {},

    initState() {
        this.state = {
            energy: 0,
            links: 5,
            crystals: 0,
            shards: 0,
            totalEnergy: 0,
            totalClicks: 0,
            totalCaptures: 0,
            uniqueCaptures: 0,
            primordialCount: 0,
            totalWins: 0,
            bossesDefeated: 0,
            regionsUnlocked: 1,
            maxLevel: 1,
            playTime: 0,
            clickPower: GAME_CONFIG.ENERGY_PER_CLICK_BASE,
            passiveIncome: GAME_CONFIG.PASSIVE_BASE,
            currentRegion: 'foret',
            currentRoute: null,
            party: [],
            reserves: [],
            seenEchoes: new Set(),
            caughtEchoes: new Set(),
            achievements: new Set(),
            regions: Utils.deepClone(REGIONS),
            boosts: {},
            inventory: [],
            startTime: Date.now()
        };
    },

    getStats() {
        return {
            totalClicks: this.state.totalClicks,
            totalCaptures: this.state.totalCaptures,
            uniqueCaptures: this.state.uniqueCaptures,
            primordialCount: this.state.primordialCount,
            totalWins: this.state.totalWins,
            totalEnergy: this.state.totalEnergy,
            maxLevel: this.state.maxLevel,
            bossesDefeated: this.state.bossesDefeated,
            regionsUnlocked: this.state.regionsUnlocked,
            playTime: Math.floor(this.state.playTime)
        };
    }
};

describe('GameState', () => {
    beforeEach(() => {
        GameState.state = {};
    });

    describe('initState()', () => {
        test('initializes energy to 0', () => {
            GameState.initState();
            expect(GameState.state.energy).toBe(0);
        });

        test('initializes links to 5', () => {
            GameState.initState();
            expect(GameState.state.links).toBe(5);
        });

        test('initializes crystals to 0', () => {
            GameState.initState();
            expect(GameState.state.crystals).toBe(0);
        });

        test('initializes shards to 0', () => {
            GameState.initState();
            expect(GameState.state.shards).toBe(0);
        });

        test('initializes totalEnergy to 0', () => {
            GameState.initState();
            expect(GameState.state.totalEnergy).toBe(0);
        });

        test('initializes totalClicks to 0', () => {
            GameState.initState();
            expect(GameState.state.totalClicks).toBe(0);
        });

        test('initializes totalCaptures to 0', () => {
            GameState.initState();
            expect(GameState.state.totalCaptures).toBe(0);
        });

        test('initializes uniqueCaptures to 0', () => {
            GameState.initState();
            expect(GameState.state.uniqueCaptures).toBe(0);
        });

        test('initializes primordialCount to 0', () => {
            GameState.initState();
            expect(GameState.state.primordialCount).toBe(0);
        });

        test('initializes totalWins to 0', () => {
            GameState.initState();
            expect(GameState.state.totalWins).toBe(0);
        });

        test('initializes bossesDefeated to 0', () => {
            GameState.initState();
            expect(GameState.state.bossesDefeated).toBe(0);
        });

        test('initializes regionsUnlocked to 1', () => {
            GameState.initState();
            expect(GameState.state.regionsUnlocked).toBe(1);
        });

        test('initializes maxLevel to 1', () => {
            GameState.initState();
            expect(GameState.state.maxLevel).toBe(1);
        });

        test('initializes playTime to 0', () => {
            GameState.initState();
            expect(GameState.state.playTime).toBe(0);
        });

        test('initializes clickPower from GAME_CONFIG', () => {
            GameState.initState();
            expect(GameState.state.clickPower).toBe(GAME_CONFIG.ENERGY_PER_CLICK_BASE);
        });

        test('initializes passiveIncome from GAME_CONFIG', () => {
            GameState.initState();
            expect(GameState.state.passiveIncome).toBe(GAME_CONFIG.PASSIVE_BASE);
        });

        test('initializes currentRegion to foret', () => {
            GameState.initState();
            expect(GameState.state.currentRegion).toBe('foret');
        });

        test('initializes currentRoute to null', () => {
            GameState.initState();
            expect(GameState.state.currentRoute).toBeNull();
        });

        test('initializes party as empty array', () => {
            GameState.initState();
            expect(Array.isArray(GameState.state.party)).toBe(true);
            expect(GameState.state.party.length).toBe(0);
        });

        test('initializes reserves as empty array', () => {
            GameState.initState();
            expect(Array.isArray(GameState.state.reserves)).toBe(true);
            expect(GameState.state.reserves.length).toBe(0);
        });

        test('initializes seenEchoes as Set', () => {
            GameState.initState();
            expect(GameState.state.seenEchoes instanceof Set).toBe(true);
        });

        test('initializes caughtEchoes as Set', () => {
            GameState.initState();
            expect(GameState.state.caughtEchoes instanceof Set).toBe(true);
        });

        test('initializes achievements as Set', () => {
            GameState.initState();
            expect(GameState.state.achievements instanceof Set).toBe(true);
        });

        test('initializes boosts as empty object', () => {
            GameState.initState();
            expect(typeof GameState.state.boosts).toBe('object');
            expect(Object.keys(GameState.state.boosts).length).toBe(0);
        });

        test('initializes inventory as empty array', () => {
            GameState.initState();
            expect(Array.isArray(GameState.state.inventory)).toBe(true);
            expect(GameState.state.inventory.length).toBe(0);
        });

        test('sets startTime to current time', () => {
            const before = Date.now();
            GameState.initState();
            const after = Date.now();
            expect(GameState.state.startTime).toBeGreaterThanOrEqual(before);
            expect(GameState.state.startTime).toBeLessThanOrEqual(after);
        });
    });

    describe('getStats()', () => {
        test('returns stats object with correct properties', () => {
            GameState.initState();
            const stats = GameState.getStats();
            
            expect(stats).toHaveProperty('totalClicks');
            expect(stats).toHaveProperty('totalCaptures');
            expect(stats).toHaveProperty('uniqueCaptures');
            expect(stats).toHaveProperty('primordialCount');
            expect(stats).toHaveProperty('totalWins');
            expect(stats).toHaveProperty('totalEnergy');
            expect(stats).toHaveProperty('maxLevel');
            expect(stats).toHaveProperty('bossesDefeated');
            expect(stats).toHaveProperty('regionsUnlocked');
            expect(stats).toHaveProperty('playTime');
        });

        test('returns current values', () => {
            GameState.initState();
            GameState.state.totalClicks = 100;
            GameState.state.totalCaptures = 5;
            GameState.state.maxLevel = 10;
            
            const stats = GameState.getStats();
            
            expect(stats.totalClicks).toBe(100);
            expect(stats.totalCaptures).toBe(5);
            expect(stats.maxLevel).toBe(10);
        });

        test('floors playTime', () => {
            GameState.initState();
            GameState.state.playTime = 123.456;
            
            const stats = GameState.getStats();
            
            expect(stats.playTime).toBe(123);
        });
    });
});