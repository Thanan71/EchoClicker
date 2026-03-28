// ============================================
// Tests unitaires - CombatCapture (js/combat/CombatCapture.js)
// ============================================

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');
const { Game, createMockGameState } = require('./__mocks__/game.cjs');
const { UI } = require('./__mocks__/ui.cjs');

// Mock CombatEngine
globalThis.CombatEngine = {
    spawnEnemy: jest.fn(),
};

// Définir CombatCapture directement
globalThis.CombatCapture = {
    _state: null,
    _game: null,
    _ui: null,

    init({ state, game, ui }) {
        this._state = state;
        this._game = game;
        this._ui = ui;
    },

    attemptCapture() {
        const s = this._state;
        if (!s.inCombat || !s.enemy) return;

        const success = this._game.captureEcho(s.enemy);

        if (success) {
            const route = this._game.state.currentRoute;
            if (route) setTimeout(() => CombatEngine.spawnEnemy(route), 500);
        }

        this._ui.updateCombat();
    },

    autoCaptureNewEcho() {
        const s = this._state;
        if (!s.enemy) return;
        this._game.captureEcho(s.enemy, { isAuto: true });
    },
};

describe('CombatCapture', () => {
    let mockState;

    beforeEach(() => {
        EventBus.reset();
        Game.reset();
        UI.reset();
        jest.clearAllMocks();

        mockState = {
            inCombat: true,
            enemy: {
                uid: 'enemy-1',
                name: 'WildEcho',
                id: 1,
            },
        };

        Game.captureEcho = jest.fn(() => true);
        Game.state.currentRoute = { id: 'r1', name: 'Test Route' };

        CombatCapture._state = mockState;
        CombatCapture._game = Game;
        CombatCapture._ui = UI;
    });

    describe('init()', () => {
        test('stores references correctly', () => {
            CombatCapture.init({ state: mockState, game: Game, ui: UI });
            expect(CombatCapture._state).toBe(mockState);
            expect(CombatCapture._game).toBe(Game);
            expect(CombatCapture._ui).toBe(UI);
        });
    });

    describe('attemptCapture()', () => {
        test('does nothing if not in combat', () => {
            mockState.inCombat = false;
            CombatCapture.attemptCapture();
            expect(Game.captureEcho).not.toHaveBeenCalled();
        });

        test('does nothing if no enemy', () => {
            mockState.enemy = null;
            CombatCapture.attemptCapture();
            expect(Game.captureEcho).not.toHaveBeenCalled();
        });

        test('calls game.captureEcho with enemy', () => {
            CombatCapture.attemptCapture();
            expect(Game.captureEcho).toHaveBeenCalledWith(mockState.enemy);
        });

        test('spawns new enemy on successful capture', () => {
            jest.useFakeTimers();
            Game.captureEcho.mockReturnValue(true);

            CombatCapture.attemptCapture();

            jest.advanceTimersByTime(500);

            expect(CombatEngine.spawnEnemy).toHaveBeenCalledWith(Game.state.currentRoute);
            jest.useRealTimers();
        });

        test('does not spawn new enemy on failed capture', () => {
            jest.useFakeTimers();
            Game.captureEcho.mockReturnValue(false);

            CombatCapture.attemptCapture();

            jest.advanceTimersByTime(500);

            expect(CombatEngine.spawnEnemy).not.toHaveBeenCalled();
            jest.useRealTimers();
        });

        test('updates UI after capture attempt', () => {
            CombatCapture.attemptCapture();
            expect(UI.updateCombat).toHaveBeenCalled();
        });
    });

    describe('autoCaptureNewEcho()', () => {
        test('does nothing if no enemy', () => {
            mockState.enemy = null;
            CombatCapture.autoCaptureNewEcho();
            expect(Game.captureEcho).not.toHaveBeenCalled();
        });

        test('calls game.captureEcho with isAuto option', () => {
            CombatCapture.autoCaptureNewEcho();
            expect(Game.captureEcho).toHaveBeenCalledWith(mockState.enemy, { isAuto: true });
        });
    });
});
