// ============================================
// Tests unitaires - CombatAuto (js/combat/CombatAuto.js)
// ============================================

// Mock CombatEngine
globalThis.CombatEngine = {
    autoAttack: jest.fn(),
};

// Définir CombatAuto directement (copie du source pour les tests)
globalThis.CombatAuto = {
    _state: null,

    init({ state }) {
        this._state = state;
    },

    update(dt) {
        const s = this._state;
        if (!s.inCombat || !s.enemy || !s.activeEcho) return;

        s.autoTimer -= dt * 1000;
        if (s.autoTimer <= 0) {
            CombatEngine.autoAttack();
            s.autoTimer = s.activeEcho.getAttackInterval();
        }
    },
};

describe('CombatAuto', () => {
    let mockState;

    beforeEach(() => {
        jest.clearAllMocks();

        mockState = {
            inCombat: true,
            enemy: { name: 'TestEnemy' },
            activeEcho: {
                name: 'TestEcho',
                getAttackInterval: jest.fn(() => 1000),
            },
            autoTimer: 1000,
        };

        CombatAuto._state = mockState;
    });

    describe('init()', () => {
        test('stores state reference', () => {
            CombatAuto.init({ state: mockState });
            expect(CombatAuto._state).toBe(mockState);
        });
    });

    describe('update()', () => {
        test('does nothing if not in combat', () => {
            mockState.inCombat = false;
            mockState.autoTimer = 0;

            CombatAuto.update(0.05);

            expect(CombatEngine.autoAttack).not.toHaveBeenCalled();
        });

        test('does nothing if no enemy', () => {
            mockState.enemy = null;
            mockState.autoTimer = 0;

            CombatAuto.update(0.05);

            expect(CombatEngine.autoAttack).not.toHaveBeenCalled();
        });

        test('does nothing if no activeEcho', () => {
            mockState.activeEcho = null;
            mockState.autoTimer = 0;

            CombatAuto.update(0.05);

            expect(CombatEngine.autoAttack).not.toHaveBeenCalled();
        });

        test('decreases autoTimer by dt * 1000', () => {
            mockState.autoTimer = 1000;

            CombatAuto.update(0.5); // 500ms

            expect(mockState.autoTimer).toBe(500);
        });

        test('calls autoAttack when timer reaches 0', () => {
            mockState.autoTimer = 50;

            CombatAuto.update(0.05); // 50ms, timer becomes 0

            expect(CombatEngine.autoAttack).toHaveBeenCalled();
        });

        test('resets timer after autoAttack', () => {
            mockState.autoTimer = 50;
            mockState.activeEcho.getAttackInterval.mockReturnValue(2000);

            CombatAuto.update(0.05);

            expect(mockState.autoTimer).toBe(2000);
        });

        test('does not call autoAttack if timer still positive', () => {
            mockState.autoTimer = 100;

            CombatAuto.update(0.05); // 50ms, timer becomes 50

            expect(CombatEngine.autoAttack).not.toHaveBeenCalled();
        });

        test('handles multiple updates correctly', () => {
            mockState.autoTimer = 200;

            CombatAuto.update(0.05); // 50ms, timer = 150
            CombatAuto.update(0.05); // 50ms, timer = 100
            CombatAuto.update(0.05); // 50ms, timer = 50
            CombatAuto.update(0.05); // 50ms, timer = 0, autoAttack

            expect(CombatEngine.autoAttack).toHaveBeenCalledTimes(1);
        });
    });
});
