// ============================================
// Tests unitaires - CombatParty (js/combat/CombatParty.js)
// ============================================

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');
const { Game, createMockGameState } = require('./__mocks__/game.cjs');
const { UI } = require('./__mocks__/ui.cjs');

// Définir CombatParty directement
globalThis.CombatParty = {
    _state: null,
    _game: null,

    init({ state, game }) {
        this._state = state;
        this._game = game;
    },

    getActiveEcho() {
        return this._game.state.party.find(e => e.isAlive()) || null;
    },

    getNextAliveEcho() {
        const s = this._state;
        return this._game.state.party.find(e => e.isAlive() && e.uid !== s.activeEcho.uid) || null;
    },

    healParty() {
        this._game.state.party.forEach(e => e.fullHeal());
        this._game.state.reserves.forEach(e => e.fullHeal());
    }
};

describe('CombatParty', () => {
    let mockState;
    let mockEcho1, mockEcho2, mockEcho3;

    beforeEach(() => {
        EventBus.reset();
        Game.reset();
        UI.reset();
        jest.clearAllMocks();

        mockEcho1 = {
            uid: 'echo-1',
            name: 'Echo1',
            isAlive: jest.fn(() => true),
            fullHeal: jest.fn()
        };
        mockEcho2 = {
            uid: 'echo-2',
            name: 'Echo2',
            isAlive: jest.fn(() => true),
            fullHeal: jest.fn()
        };
        mockEcho3 = {
            uid: 'echo-3',
            name: 'Echo3',
            isAlive: jest.fn(() => false),
            fullHeal: jest.fn()
        };

        mockState = {
            activeEcho: mockEcho1
        };

        Game.state.party = [mockEcho1, mockEcho2, mockEcho3];
        Game.state.reserves = [];

        CombatParty._state = mockState;
        CombatParty._game = Game;
    });

    describe('init()', () => {
        test('stores references correctly', () => {
            CombatParty.init({ state: mockState, game: Game });
            expect(CombatParty._state).toBe(mockState);
            expect(CombatParty._game).toBe(Game);
        });
    });

    describe('getActiveEcho()', () => {
        test('returns first alive echo from party', () => {
            const result = CombatParty.getActiveEcho();
            expect(result).toBe(mockEcho1);
        });

        test('returns second echo if first is dead', () => {
            mockEcho1.isAlive.mockReturnValue(false);
            const result = CombatParty.getActiveEcho();
            expect(result).toBe(mockEcho2);
        });

        test('returns null if all echoes are dead', () => {
            mockEcho1.isAlive.mockReturnValue(false);
            mockEcho2.isAlive.mockReturnValue(false);
            mockEcho3.isAlive.mockReturnValue(false);
            const result = CombatParty.getActiveEcho();
            expect(result).toBeNull();
        });

        test('returns null if party is empty', () => {
            Game.state.party = [];
            const result = CombatParty.getActiveEcho();
            expect(result).toBeNull();
        });
    });

    describe('getNextAliveEcho()', () => {
        test('returns next alive echo different from active', () => {
            const result = CombatParty.getNextAliveEcho();
            expect(result).toBe(mockEcho2);
        });

        test('returns null if only active echo is alive', () => {
            mockEcho2.isAlive.mockReturnValue(false);
            mockEcho3.isAlive.mockReturnValue(false);
            const result = CombatParty.getNextAliveEcho();
            expect(result).toBeNull();
        });

        test('returns null if all echoes are dead', () => {
            mockEcho1.isAlive.mockReturnValue(false);
            mockEcho2.isAlive.mockReturnValue(false);
            mockEcho3.isAlive.mockReturnValue(false);
            const result = CombatParty.getNextAliveEcho();
            expect(result).toBeNull();
        });

        test('skips active echo uid', () => {
            mockState.activeEcho = mockEcho2;
            const result = CombatParty.getNextAliveEcho();
            expect(result).toBe(mockEcho1);
            expect(result.uid).not.toBe('echo-2');
        });
    });

    describe('healParty()', () => {
        test('calls fullHeal on all party echoes', () => {
            CombatParty.healParty();
            expect(mockEcho1.fullHeal).toHaveBeenCalled();
            expect(mockEcho2.fullHeal).toHaveBeenCalled();
            expect(mockEcho3.fullHeal).toHaveBeenCalled();
        });

        test('calls fullHeal on all reserve echoes', () => {
            const reserveEcho = { uid: 'reserve-1', fullHeal: jest.fn() };
            Game.state.reserves = [reserveEcho];
            
            CombatParty.healParty();
            
            expect(reserveEcho.fullHeal).toHaveBeenCalled();
        });

        test('works with empty party', () => {
            Game.state.party = [];
            expect(() => CombatParty.healParty()).not.toThrow();
        });

        test('works with empty reserves', () => {
            Game.state.reserves = [];
            expect(() => CombatParty.healParty()).not.toThrow();
        });
    });
});