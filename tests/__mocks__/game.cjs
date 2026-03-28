// ============================================
// Mock Game - Simule l'objet Game principal pour les tests
// ============================================

const createMockGameState = (overrides = {}) => {
    const baseState = {
        energy: 0,
        totalEnergy: 0,
        links: 0,
        maxLevel: 1,
        playTime: 0,
        clickPower: 1,
        currentRegion: 'verdant',
        bossesDefeated: 0,
        regionsUnlocked: 1,
        captureChance: 30,
        party: [],
        reserves: [],
        achievements: new Set(),
        boosts: {},
        pokedex: {},
        routes: {},
        regions: [],
    };
    // Merge overrides deeply to allow setting nested properties like boosts
    return { ...baseState, ...overrides };
};

const Game = {
    state: createMockGameState(),

    /** Initialise le mock avec un state par défaut */
    initState(overrides = {}) {
        this.state = createMockGameState(overrides);
        return this.state;
    },

    /** Reset complet pour beforeEach */
    reset() {
        this.state = createMockGameState();
    },

    // Méthodes stub
    findEcho: jest.fn(() => null),
    addToParty: jest.fn(() => true),
    removeFromParty: jest.fn(() => true),
    captureEcho: jest.fn((echo) => echo),
    attemptCapture: jest.fn(() => true),
    defeatBoss: jest.fn(),
    unlockNextRoute: jest.fn(),
    selectRoute: jest.fn(),
    getCPS: jest.fn(() => 0),
    getPassiveIncome: jest.fn(() => 0),
    click: jest.fn(),
    update: jest.fn(),
    render: jest.fn(),
    getAllEchoes: jest.fn(() => []),
    buyItem: jest.fn(() => true),
    checkAchievements: jest.fn(),
    buildOptimalTeam: jest.fn(),
};

module.exports = { Game, createMockGameState };
