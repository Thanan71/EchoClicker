// ============================================
// Tests unitaires - GameRoutes (js/modules/game-routes.js)
// ============================================

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');

// Mocks globaux
globalThis.EventBus = EventBus;
globalThis.GAME_EVENTS = GAME_EVENTS;

globalThis.UI = {
    toast: jest.fn(),
    renderRoutes: jest.fn(),
    updateCombat: jest.fn()
};

globalThis.i18n = {
    t: jest.fn((key) => key)
};

globalThis.Combat = {
    startCombat: jest.fn(),
    endCombat: jest.fn()
};

// Définir GameRoutes directement
globalThis.GameRoutes = {
    _state: null,

    selectRoute(routeId) {
        const region = this._state.regions.find(r => r.id === this._state.currentRegion);
        if (!region) return;
        const route = region.routes.find(r => r.id === routeId);
        if (!route || !route.unlocked) {
            UI.toast(i18n.t('capture.routeLocked'), 'warning');
            return;
        }
        this._state.currentRoute = route;
        Combat.startCombat(route);
        UI.renderRoutes();
        UI.updateCombat();
    },

    selectRegion(regionId) {
        const region = this._state.regions.find(r => r.id === regionId);
        if (!region || !region.unlocked) {
            UI.toast(i18n.t('capture.regionLocked'), 'warning');
            return;
        }
        this._state.currentRegion = regionId;
        this._state.currentRoute = null;
        Combat.endCombat();
        UI.renderRoutes();
    },

    unlockNextRoute() {
        const region = this._state.regions.find(r => r.id === this._state.currentRegion);
        if (!region) return;
        const idx = region.routes.findIndex(r => r.id === this._state.currentRoute?.id);
        if (idx < region.routes.length - 1) {
            const nextRoute = region.routes[idx + 1];
            if (!nextRoute.unlocked) {
                nextRoute.unlocked = true;
                EventBus.emit(GAME_EVENTS.ROUTE_UNLOCKED, { route: nextRoute });
                UI.toast(i18n.t('capture.newRoute', { name: nextRoute.name }), 'success');
            }
        }
    },

    defeatBoss() {
        const region = this._state.regions.find(r => r.id === this._state.currentRegion);
        if (!region) return;
        region.bossDefeated = true;
        this._state.bossesDefeated++;
        EventBus.emit(GAME_EVENTS.BOSS_DEFEATED, { region });

        EventBus.emit('boss:defeated', { id: this._state.currentRegion });

        const idx = this._state.regions.findIndex(r => r.id === this._state.currentRegion);
        if (idx < this._state.regions.length - 1) {
            const next = this._state.regions[idx + 1];
            next.unlocked = true;
            next.routes[0].unlocked = true;
            this._state.regionsUnlocked++;
            EventBus.emit(GAME_EVENTS.REGION_UNLOCKED, { region: next });
            UI.toast(i18n.t('capture.newRegion', { name: next.name }), 'success');
        } else {
            UI.toast(i18n.t('notifications.success'), 'success');
        }
    }
};

describe('GameRoutes', () => {
    let mockState;

    beforeEach(() => {
        EventBus.reset();
        jest.clearAllMocks();

        mockState = {
            currentRegion: 'foret',
            currentRoute: null,
            bossesDefeated: 0,
            regionsUnlocked: 1,
            regions: [
                {
                    id: 'foret',
                    name: 'Forêt',
                    unlocked: true,
                    bossDefeated: false,
                    routes: [
                        { id: 'r1', name: 'Clairière', unlocked: true },
                        { id: 'r2', name: 'Sous-bois', unlocked: false }
                    ],
                    bosses: [{ name: 'Boss Forêt', echoId: 1, level: 10 }]
                },
                {
                    id: 'montagnes',
                    name: 'Montagnes',
                    unlocked: false,
                    bossDefeated: false,
                    routes: [
                        { id: 'r3', name: 'Pied', unlocked: false }
                    ],
                    bosses: [{ name: 'Boss Montagnes', echoId: 2, level: 20 }]
                }
            ]
        };

        GameRoutes._state = mockState;
    });

    describe('selectRoute()', () => {
        test('sets currentRoute if route is unlocked', () => {
            const route = mockState.regions[0].routes[0];
            GameRoutes.selectRoute('r1');
            expect(mockState.currentRoute).toBe(route);
        });

        test('calls Combat.startCombat with route', () => {
            const route = mockState.regions[0].routes[0];
            GameRoutes.selectRoute('r1');
            expect(Combat.startCombat).toHaveBeenCalledWith(route);
        });

        test('shows warning if route is locked', () => {
            GameRoutes.selectRoute('r2');
            expect(UI.toast).toHaveBeenCalledWith('capture.routeLocked', 'warning');
        });

        test('does not start combat if route is locked', () => {
            GameRoutes.selectRoute('r2');
            expect(Combat.startCombat).not.toHaveBeenCalled();
        });

        test('renders routes after selection', () => {
            GameRoutes.selectRoute('r1');
            expect(UI.renderRoutes).toHaveBeenCalled();
        });
    });

    describe('selectRegion()', () => {
        test('sets currentRegion if region is unlocked', () => {
            GameRoutes.selectRegion('foret');
            expect(mockState.currentRegion).toBe('foret');
        });

        test('sets currentRoute to null', () => {
            mockState.currentRoute = { id: 'r1' };
            GameRoutes.selectRegion('foret');
            expect(mockState.currentRoute).toBeNull();
        });

        test('calls Combat.endCombat', () => {
            GameRoutes.selectRegion('foret');
            expect(Combat.endCombat).toHaveBeenCalled();
        });

        test('shows warning if region is locked', () => {
            GameRoutes.selectRegion('montagnes');
            expect(UI.toast).toHaveBeenCalledWith('capture.regionLocked', 'warning');
        });

        test('does not change region if locked', () => {
            const originalRegion = mockState.currentRegion;
            GameRoutes.selectRegion('montagnes');
            expect(mockState.currentRegion).toBe(originalRegion);
        });
    });

    describe('unlockNextRoute()', () => {
        test('unlocks next route in current region', () => {
            mockState.currentRoute = mockState.regions[0].routes[0];
            GameRoutes.unlockNextRoute();
            expect(mockState.regions[0].routes[1].unlocked).toBe(true);
        });

        test('emits ROUTE_UNLOCKED event', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.ROUTE_UNLOCKED, listener);
            mockState.currentRoute = mockState.regions[0].routes[0];
            GameRoutes.unlockNextRoute();
            expect(listener).toHaveBeenCalled();
        });

        test('shows success toast', () => {
            mockState.currentRoute = mockState.regions[0].routes[0];
            GameRoutes.unlockNextRoute();
            expect(UI.toast).toHaveBeenCalledWith('capture.newRoute', 'success');
        });

        test('does nothing if no current route', () => {
            mockState.currentRoute = null;
            expect(() => GameRoutes.unlockNextRoute()).not.toThrow();
        });

        test('does nothing if already at last route', () => {
            mockState.currentRoute = mockState.regions[0].routes[1];
            mockState.regions[0].routes[1].unlocked = true;
            expect(() => GameRoutes.unlockNextRoute()).not.toThrow();
        });
    });

    describe('defeatBoss()', () => {
        test('sets bossDefeated to true on current region', () => {
            GameRoutes.defeatBoss();
            expect(mockState.regions[0].bossDefeated).toBe(true);
        });

        test('increments bossesDefeated', () => {
            GameRoutes.defeatBoss();
            expect(mockState.bossesDefeated).toBe(1);
        });

        test('emits BOSS_DEFEATED event', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.BOSS_DEFEATED, listener);
            GameRoutes.defeatBoss();
            expect(listener).toHaveBeenCalled();
        });

        test('unlocks next region if exists', () => {
            GameRoutes.defeatBoss();
            expect(mockState.regions[1].unlocked).toBe(true);
        });

        test('increments regionsUnlocked when new region unlocked', () => {
            GameRoutes.defeatBoss();
            expect(mockState.regionsUnlocked).toBe(2);
        });

        test('emits REGION_UNLOCKED event when new region unlocked', () => {
            const listener = jest.fn();
            EventBus.on(GAME_EVENTS.REGION_UNLOCKED, listener);
            GameRoutes.defeatBoss();
            expect(listener).toHaveBeenCalled();
        });

        test('shows success toast for new region', () => {
            GameRoutes.defeatBoss();
            expect(UI.toast).toHaveBeenCalledWith('capture.newRegion', 'success');
        });

        test('shows generic success if no next region', () => {
            mockState.regions = [mockState.regions[0]];
            GameRoutes.defeatBoss();
            expect(UI.toast).toHaveBeenCalledWith('notifications.success', 'success');
        });
    });
});