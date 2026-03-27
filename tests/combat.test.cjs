// Tests unitaires - Combat (js/combat.js)
// Couvre: startCombat, spawnEnemy, spawnBoss, getActiveEcho,
// endCombat, playerClick, attemptCapture, healParty, update (auto-attack).
// Mocks: Game, UI, EventBus, generateWildEcho, sous-modules Combat*.

const fs = require('fs');
const path = require('path');
const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');
const { Game, createMockGameState } = require('./__mocks__/game.cjs');
const { UI } = require('./__mocks__/ui.cjs');
require('./helpers/setup.cjs');

let mockEngine, mockCapture, mockAuto, mockParty;

function createSubModuleMocks() {
    mockEngine = {
        _state: null, _game: null, _ui: null, _eventBus: null, _onEnemyDefeated: null,
        init: jest.fn(function({ state, game, ui, eventBus, onEnemyDefeated }) {
            this._state = state; this._game = game; this._ui = ui;
            this._eventBus = eventBus; this._onEnemyDefeated = onEnemyDefeated;
        }),
        startCombat: jest.fn(), spawnEnemy: jest.fn(), spawnBoss: jest.fn(),
        playerClick: jest.fn(), endCombat: jest.fn(), autoAttack: jest.fn(),
        onEnemyDefeated: jest.fn(), onPlayerFainted: jest.fn()
    };
    mockCapture = {
        _state: null, _game: null, _ui: null,
        init: jest.fn(function({ state, game, ui }) {
            this._state = state; this._game = game; this._ui = ui;
        }),
        attemptCapture: jest.fn(), autoCaptureNewEcho: jest.fn()
    };
    mockAuto = {
        _state: null,
        init: jest.fn(function({ state }) { this._state = state; }),
        update: jest.fn()
    };
    mockParty = {
        _state: null, _game: null,
        init: jest.fn(function({ state, game }) {
            this._state = state; this._game = game;
        }),
        getActiveEcho: jest.fn(() => null),
        getNextAliveEcho: jest.fn(() => null),
        healParty: jest.fn()
    };
}

let Combat;

function loadCombat() {
    createSubModuleMocks();
    const combatPath = path.join(__dirname, '..', 'js', 'combat.js');
    const combatCode = fs.readFileSync(combatPath, 'utf-8');
    const patchedCode = combatCode.replace(/^const Combat =/m, 'Combat =');
    const loader = new Function('CombatEngine', 'CombatCapture', 'CombatAuto', 'CombatParty', patchedCode + '; return Combat;');
    Combat = loader(mockEngine, mockCapture, mockAuto, mockParty);
}

describe('Combat (facade)', () => {
    beforeEach(() => {
        EventBus.reset(); Game.reset(); UI.reset();
        loadCombat();
        Combat.init(Game, UI, EventBus);
    });

    describe('init()', () => {
        test('stocke les refs Game, UI, EventBus', () => {
            expect(Combat._game).toBe(Game);
            expect(Combat._ui).toBe(UI);
            expect(Combat._eventBus).toBe(EventBus);
        });
        test('appelle init() sur chaque sous-module', () => {
            expect(mockEngine.init).toHaveBeenCalledTimes(1);
            expect(mockCapture.init).toHaveBeenCalledTimes(1);
            expect(mockAuto.init).toHaveBeenCalledTimes(1);
            expect(mockParty.init).toHaveBeenCalledTimes(1);
        });
        test('passe le bon state aux sous-modules', () => {
            const c = mockEngine.init.mock.calls[0][0];
            expect(c.state).toBe(Combat);
            expect(c.game).toBe(Game);
            expect(c.ui).toBe(UI);
            expect(c.eventBus).toBe(EventBus);
            expect(typeof c.onEnemyDefeated).toBe('function');
        });
    });

    describe('startCombat()', () => {
        test('delegue a CombatEngine.startCombat()', () => {
            const route = { id: 'r1', name: 'Clairiere', ids: [1], lv: '1-5' };
            Combat.startCombat(route);
            expect(mockEngine.startCombat).toHaveBeenCalledWith(route);
        });
    });
    describe('spawnEnemy()', () => {
        test('delegue a CombatEngine.spawnEnemy()', () => {
            const route = { id: 'r1', name: 'Clairiere', ids: [1], lv: '1-5' };
            Combat.spawnEnemy(route);
            expect(mockEngine.spawnEnemy).toHaveBeenCalledWith(route);
        });
    });
    describe('playerClick()', () => {
        test('delegue a CombatEngine.playerClick()', () => {
            Combat.playerClick();
            expect(mockEngine.playerClick).toHaveBeenCalledTimes(1);
        });
    });
    describe('attemptCapture()', () => {
        test('delegue a CombatCapture.attemptCapture()', () => {
            Combat.attemptCapture();
            expect(mockCapture.attemptCapture).toHaveBeenCalledTimes(1);
        });
    });
    describe('healParty()', () => {
        test('delegue a CombatParty.healParty()', () => {
            Combat.healParty();
            expect(mockParty.healParty).toHaveBeenCalledTimes(1);
        });
    });
    describe('endCombat()', () => {
        test('delegue a CombatEngine.endCombat()', () => {
            Combat.endCombat();
            expect(mockEngine.endCombat).toHaveBeenCalledTimes(1);
        });
    });
    describe('update()', () => {
        test('delegue a CombatAuto.update(dt)', () => {
            Combat.update(0.05);
            expect(mockAuto.update).toHaveBeenCalledWith(0.05);
        });
        test('passe le delta time correctement', () => {
            Combat.update(0.1);
            Combat.update(0.016);
            expect(mockAuto.update).toHaveBeenCalledTimes(2);
            expect(mockAuto.update.mock.calls[0][0]).toBe(0.1);
            expect(mockAuto.update.mock.calls[1][0]).toBe(0.016);
        });
    });
});
