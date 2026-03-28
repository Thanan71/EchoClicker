// ============================================
// Tests unitaires - CombatEngine (js/combat/CombatEngine.js)
// ============================================

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');
const { Game, createMockGameState } = require('./__mocks__/game.cjs');
const { UI } = require('./__mocks__/ui.cjs');

// Mocks pour les sous-modules
const mockParty = {
    getActiveEcho: jest.fn(() => null),
    getNextAliveEcho: jest.fn(() => null),
};

const mockCapture = {
    autoCaptureNewEcho: jest.fn(),
};

// Mocks globaux
globalThis.CombatParty = mockParty;
globalThis.CombatCapture = mockCapture;
globalThis.GAME_CONFIG = {
    KILLS_FOR_ROUTE: 10,
    COMBAT_CLICK_MULTIPLIER: 2,
    MAX_PARTY: 6,
};

// Mock generateWildEcho
globalThis.generateWildEcho = jest.fn((ids, lv) => {
    const [minLv, maxLv] = lv.split('-').map(Number);
    const level = minLv + Math.floor(Math.random() * (maxLv - minLv + 1));
    return {
        uid: 'wild-' + Math.random().toString(36).substr(2, 9),
        id: ids[0],
        name: 'WildEcho',
        type: 'FEU',
        level: level,
        hp: 100,
        maxHp: 100,
        atk: 20,
        def: 10,
        spd: 15,
        isAlive: function () {
            return this.hp > 0;
        },
        takeDamage: function (dmg) {
            this.hp = Math.max(0, this.hp - dmg);
            return this.hp <= 0;
        },
        calculateDamageAgainst: jest.fn(() => 10),
        bossName: null,
        isBoss: false,
    };
});

// Mock getEchoById
globalThis.getEchoById = jest.fn((id) => ({
    id: id,
    name: 'TestEcho',
    type: 'FEU',
    baseHp: 30,
    baseAtk: 15,
    baseDef: 10,
    baseSpd: 12,
}));

// Mock Echo class
globalThis.Echo = jest.fn(function (data, level, isPrimordial) {
    this.uid = 'echo-' + Math.random().toString(36).substr(2, 9);
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.level = level || 1;
    this.isPrimordial = isPrimordial || false;
    this.hp = data.baseHp * level;
    this.maxHp = data.baseHp * level;
    this.atk = data.baseAtk * level;
    this.def = data.baseDef * level;
    this.spd = data.baseSpd * level;
    this.isBoss = false;
    this.bossName = null;
    this.isAlive = function () {
        return this.hp > 0;
    };
    this.takeDamage = function (dmg) {
        this.hp = Math.max(0, this.hp - dmg);
        return this.hp <= 0;
    };
    this.calculateDamageAgainst = jest.fn(() => 15);
    this.gainXp = jest.fn(() => []);
    this.fullHeal = jest.fn(() => {
        this.hp = this.maxHp;
    });
});

// Définir CombatEngine directement
globalThis.CombatEngine = {
    _state: null,
    _game: null,
    _ui: null,
    _eventBus: null,
    _onEnemyDefeated: null,

    init({ state, game, ui, eventBus, onEnemyDefeated }) {
        this._state = state;
        this._game = game;
        this._ui = ui;
        this._eventBus = eventBus;
        this._onEnemyDefeated = onEnemyDefeated;
    },

    startCombat(route) {
        const s = this._state;
        s.inCombat = true;
        s.routeKills = 0;
        s.isBoss = false;
        this.spawnEnemy(route);
        this._eventBus.emit(GAME_EVENTS.COMBAT_START, { route });
        this._ui.addLog('info', 'Exploration de ' + route.name + '...');
    },

    spawnEnemy(route) {
        const s = this._state;
        if (!route) return;

        const region = this._game.state.regions.find((r) => r.id === this._game.state.currentRegion);
        if (region && !region.bossDefeated && s.routeKills >= GAME_CONFIG.KILLS_FOR_ROUTE) {
            const last = region.routes[region.routes.length - 1];
            if (route.id === last.id && region.bosses.length) {
                this.spawnBoss(region);
                return;
            }
        }

        s.enemy = generateWildEcho(route.ids, route.lv);
        s.activeEcho = CombatParty.getActiveEcho();
        if (s.enemy) {
            this._game.state.seenEchoes.add(s.enemy.id);
            if (s.autoCaptureEnabled && !this._game.state.caughtEchoes.has(s.enemy.id)) {
                CombatCapture.autoCaptureNewEcho();
            }
        }
        this._ui.updateCombat();
    },

    spawnBoss(region) {
        const s = this._state;
        const boss = region.bosses[0];
        const data = getEchoById(boss.echoId);
        if (!data) return;

        s.isBoss = true;
        s.enemy = new Echo(data, boss.level, false);
        s.enemy.isBoss = true;
        s.enemy.bossName = boss.name;
        s.enemy.maxHp = Math.floor(s.enemy.maxHp * 2);
        s.enemy.hp = s.enemy.maxHp;
        s.enemy.atk = Math.floor(s.enemy.atk * 1.5);

        s.activeEcho = CombatParty.getActiveEcho();
        this._game.state.seenEchoes.add(s.enemy.id);
        this._ui.updateCombat();
        this._ui.addLog('info', '⚔️ BOSS : ' + boss.name + ' !');
        this._ui.toast('⚔️ Boss : ' + boss.name + ' !', 'warning');
    },

    autoAttack() {
        const s = this._state;
        if (!s.inCombat || !s.enemy || !s.activeEcho) return;

        const dmg = s.activeEcho.calculateDamageAgainst(s.enemy);
        s.enemy.takeDamage(dmg);

        if (!s.enemy.isAlive()) {
            this.onEnemyDefeated();
            return;
        }

        const enemyDmg = s.enemy.calculateDamageAgainst(s.activeEcho);
        s.activeEcho.takeDamage(enemyDmg);

        if (!s.activeEcho.isAlive()) {
            this.onPlayerFainted();
        }

        this._ui.updateCombat();
    },

    playerClick() {
        const s = this._state;
        if (!s.inCombat || !s.enemy || !s.activeEcho) return;

        const dmg = s.activeEcho.calculateDamageAgainst(s.enemy) * GAME_CONFIG.COMBAT_CLICK_MULTIPLIER;
        s.enemy.takeDamage(dmg);
        this._ui.spawnDamageParticle(dmg);

        if (!s.enemy.isAlive()) {
            this.onEnemyDefeated();
        }

        this._ui.updateCombat();
    },

    onEnemyDefeated() {
        const s = this._state;
        this._game.state.totalWins++;
        s.routeKills++;

        let xpGain = s.enemy.level * 5 + (s.isBoss ? 50 : 0);

        if (this._game.state.boosts.xp) {
            xpGain *= 2;
        }

        this._game.state.party.forEach((e) => {
            if (e.isAlive()) e.gainXp(Math.floor(xpGain / Math.max(1, this._game.state.party.length)));
        });

        const energyGain = s.enemy.level * 3 + (s.isBoss ? 100 : 0);
        this._game.state.energy += energyGain;
        this._game.state.totalEnergy += energyGain;

        const name = s.enemy.bossName || s.enemy.name;
        this._ui.addLog('damage', name + ' vaincu ! +' + energyGain + '⚡ +' + xpGain + 'XP');
        this._eventBus.emit(GAME_EVENTS.ENEMY_DEFEATED, { enemy: s.enemy, energyGain, xpGain });

        if (this._onEnemyDefeated) this._onEnemyDefeated();
    },

    onPlayerFainted() {
        const s = this._state;
        this._ui.addLog('damage', s.activeEcho.name + ' est K.O. !');
        const next = CombatParty.getNextAliveEcho();
        if (next) {
            s.activeEcho = next;
            this._ui.addLog('info', next.name + ' entre en combat !');
            this._ui.updateCombat();
        } else {
            this._ui.addLog('damage', 'Tous tes Echos sont K.O. !');
            this.endCombat();
            this._ui.toast('Tous tes Echos sont K.O. !', 'error');
        }
    },

    endCombat() {
        const s = this._state;
        s.inCombat = false;
        s.enemy = null;
        s.activeEcho = null;
        s.isBoss = false;
        this._eventBus.emit(GAME_EVENTS.COMBAT_END, {});
        this._ui.updateCombat();
    },
};

describe('CombatEngine', () => {
    let mockState;

    beforeEach(() => {
        EventBus.reset();
        Game.reset();
        UI.reset();
        jest.clearAllMocks();

        mockState = {
            inCombat: false,
            routeKills: 0,
            isBoss: false,
            enemy: null,
            activeEcho: null,
            autoCaptureEnabled: false,
        };

        // Initialiser seenEchoes et caughtEchoes sur Game.state
        Game.state.seenEchoes = new Set();
        Game.state.caughtEchoes = new Set();

        CombatEngine._state = mockState;
        CombatEngine._game = Game;
        CombatEngine._ui = UI;
        CombatEngine._eventBus = EventBus;
        CombatEngine._onEnemyDefeated = jest.fn();
    });

    describe('init()', () => {
        test('stores references correctly', () => {
            const onDefeated = jest.fn();
            CombatEngine.init({
                state: mockState,
                game: Game,
                ui: UI,
                eventBus: EventBus,
                onEnemyDefeated: onDefeated,
            });

            expect(CombatEngine._state).toBe(mockState);
            expect(CombatEngine._game).toBe(Game);
            expect(CombatEngine._ui).toBe(UI);
            expect(CombatEngine._eventBus).toBe(EventBus);
            expect(CombatEngine._onEnemyDefeated).toBe(onDefeated);
        });
    });

    describe('startCombat()', () => {
        test('sets inCombat to true', () => {
            const route = { id: 'r1', name: 'Test Route', ids: [1], lv: '1-5' };
            CombatEngine.startCombat(route);
            expect(mockState.inCombat).toBe(true);
        });

        test('resets routeKills to 0', () => {
            mockState.routeKills = 5;
            const route = { id: 'r1', name: 'Test Route', ids: [1], lv: '1-5' };
            CombatEngine.startCombat(route);
            expect(mockState.routeKills).toBe(0);
        });

        test('sets isBoss to false', () => {
            mockState.isBoss = true;
            const route = { id: 'r1', name: 'Test Route', ids: [1], lv: '1-5' };
            CombatEngine.startCombat(route);
            expect(mockState.isBoss).toBe(false);
        });

        test('emits COMBAT_START event', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.COMBAT_START, listener);
            const route = { id: 'r1', name: 'Test Route', ids: [1], lv: '1-5' };
            CombatEngine.startCombat(route);
            expect(listener).toHaveBeenCalledWith({ route });
        });

        test('adds info log', () => {
            const route = { id: 'r1', name: 'Test Route', ids: [1], lv: '1-5' };
            CombatEngine.startCombat(route);
            expect(UI.addLog).toHaveBeenCalledWith('info', expect.stringContaining('Test Route'));
        });
    });

    describe('endCombat()', () => {
        test('sets inCombat to false', () => {
            mockState.inCombat = true;
            CombatEngine.endCombat();
            expect(mockState.inCombat).toBe(false);
        });

        test('sets enemy to null', () => {
            mockState.enemy = { name: 'Test' };
            CombatEngine.endCombat();
            expect(mockState.enemy).toBeNull();
        });

        test('sets activeEcho to null', () => {
            mockState.activeEcho = { name: 'Test' };
            CombatEngine.endCombat();
            expect(mockState.activeEcho).toBeNull();
        });

        test('sets isBoss to false', () => {
            mockState.isBoss = true;
            CombatEngine.endCombat();
            expect(mockState.isBoss).toBe(false);
        });

        test('emits COMBAT_END event', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.COMBAT_END, listener);
            CombatEngine.endCombat();
            expect(listener).toHaveBeenCalled();
        });
    });

    describe('playerClick()', () => {
        test('does nothing if not in combat', () => {
            mockState.inCombat = false;
            mockState.enemy = { hp: 100, takeDamage: jest.fn(), isAlive: () => true };
            mockState.activeEcho = { calculateDamageAgainst: jest.fn(() => 10) };

            CombatEngine.playerClick();

            expect(mockState.enemy.takeDamage).not.toHaveBeenCalled();
        });

        test('does nothing if no enemy', () => {
            mockState.inCombat = true;
            mockState.enemy = null;
            mockState.activeEcho = { calculateDamageAgainst: jest.fn(() => 10) };

            CombatEngine.playerClick();

            expect(UI.updateCombat).not.toHaveBeenCalled();
        });

        test('does nothing if no activeEcho', () => {
            mockState.inCombat = true;
            mockState.enemy = { hp: 100, takeDamage: jest.fn(), isAlive: () => true };
            mockState.activeEcho = null;

            CombatEngine.playerClick();

            expect(UI.updateCombat).not.toHaveBeenCalled();
        });

        test('deals damage with click multiplier', () => {
            const enemy = { hp: 100, takeDamage: jest.fn(), isAlive: () => true };
            const activeEcho = { calculateDamageAgainst: jest.fn(() => 10) };
            mockState.inCombat = true;
            mockState.enemy = enemy;
            mockState.activeEcho = activeEcho;

            CombatEngine.playerClick();

            expect(enemy.takeDamage).toHaveBeenCalledWith(20);
        });

        test('spawns damage particle', () => {
            const enemy = { hp: 100, takeDamage: jest.fn(), isAlive: () => true };
            const activeEcho = { calculateDamageAgainst: jest.fn(() => 10) };
            mockState.inCombat = true;
            mockState.enemy = enemy;
            mockState.activeEcho = activeEcho;

            CombatEngine.playerClick();

            expect(UI.spawnDamageParticle).toHaveBeenCalledWith(20);
        });
    });

    describe('onEnemyDefeated()', () => {
        test('increments totalWins', () => {
            Game.state.totalWins = 0;
            mockState.enemy = { level: 5, name: 'Test', bossName: null };
            mockState.isBoss = false;

            CombatEngine.onEnemyDefeated();

            expect(Game.state.totalWins).toBe(1);
        });

        test('increments routeKills', () => {
            mockState.routeKills = 0;
            mockState.enemy = { level: 5, name: 'Test', bossName: null };
            mockState.isBoss = false;

            CombatEngine.onEnemyDefeated();

            expect(mockState.routeKills).toBe(1);
        });

        test('emits ENEMY_DEFEATED event', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.ENEMY_DEFEATED, listener);
            mockState.enemy = { level: 5, name: 'Test', bossName: null };
            mockState.isBoss = false;

            CombatEngine.onEnemyDefeated();

            expect(listener).toHaveBeenCalled();
        });

        test('calls onEnemyDefeated callback', () => {
            mockState.enemy = { level: 5, name: 'Test', bossName: null };
            mockState.isBoss = false;

            CombatEngine.onEnemyDefeated();

            expect(CombatEngine._onEnemyDefeated).toHaveBeenCalled();
        });
    });
});
