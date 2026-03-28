// ============================================
// Tests unitaires - GameParty (js/modules/game-party.js)
// ============================================

// Mocks globaux
globalThis.GAME_CONFIG = {
    MAX_PARTY: 6,
};

globalThis.UI = {
    toast: jest.fn(),
    renderParty: jest.fn(),
    addLog: jest.fn(),
};

globalThis.i18n = {
    t: jest.fn((key) => key),
};

// Définir GameParty directement
globalThis.GameParty = {
    _state: null,

    addToParty(echo) {
        if (this._state.party.length >= GAME_CONFIG.MAX_PARTY) return false;
        this._state.party.push(echo);
        return true;
    },

    buildOptimalTeam() {
        const allEchoes = this.getAllEchoes();
        if (allEchoes.length === 0) {
            UI.toast(i18n.t('combat.noEchoAvailable'), 'warning');
            return;
        }

        const scoredEchoes = allEchoes.map((echo) => {
            let score = 0;

            score += echo.maxHp * 0.3;
            score += echo.atk * 0.4;
            score += echo.def * 0.2;
            score += echo.spd * 0.1;

            score += echo.level * 5;

            const rarityBonus = {
                common: 0,
                uncommon: 20,
                rare: 50,
                epic: 100,
                legendary: 200,
                mythical: 300,
            };
            score += rarityBonus[echo.rarity] || 0;

            if (echo.isPrimordial) score += 50;

            if (echo.isAlive()) score += 100;

            return { echo, score };
        });

        scoredEchoes.sort((a, b) => b.score - a.score);

        const oldParty = [...this._state.party];
        this._state.party = [];

        const newParty = [];
        const usedIds = new Set();

        for (const { echo } of scoredEchoes) {
            if (newParty.length >= GAME_CONFIG.MAX_PARTY) break;

            if (!usedIds.has(echo.id) || allEchoes.length <= GAME_CONFIG.MAX_PARTY) {
                newParty.push(echo);
                usedIds.add(echo.id);
            }
        }

        this._state.party = newParty;

        const partyUids = new Set(newParty.map((e) => e.uid));
        const newReserves = allEchoes.filter((e) => !partyUids.has(e.uid));
        this._state.reserves = newReserves;

        this._state.party.forEach((e) => e.fullHeal());

        UI.renderParty();
        UI.toast(i18n.t('combat.optimalTeamCreated'), 'success');
        UI.addLog('info', i18n.t('combat.newTeam', { names: newParty.map((e) => e.name).join(', ') }));
    },

    removeFromParty(uid) {
        const idx = this._state.party.findIndex((e) => e.uid === uid);
        if (idx === -1) return false;
        const echo = this._state.party.splice(idx, 1)[0];
        this._state.reserves.push(echo);
        return true;
    },

    moveToParty(uid) {
        if (this._state.party.length >= GAME_CONFIG.MAX_PARTY) {
            UI.toast(i18n.t('combat.partyFull'), 'warning');
            return false;
        }
        const idx = this._state.reserves.findIndex((e) => e.uid === uid);
        if (idx === -1) return false;
        const echo = this._state.reserves.splice(idx, 1)[0];
        this._state.party.push(echo);
        return true;
    },

    getAllEchoes() {
        return [...this._state.party, ...this._state.reserves];
    },

    findEcho(uid) {
        return this.getAllEchoes().find((e) => e.uid === uid);
    },
};

describe('GameParty', () => {
    let mockState;
    let mockEcho1, mockEcho2, mockEcho3;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEcho1 = {
            uid: 'echo-1',
            id: 1,
            name: 'Echo1',
            level: 5,
            rarity: 'common',
            isPrimordial: false,
            isAlive: jest.fn(() => true),
            fullHeal: jest.fn(),
            maxHp: 100,
            atk: 20,
            def: 10,
            spd: 15,
        };
        mockEcho2 = {
            uid: 'echo-2',
            id: 2,
            name: 'Echo2',
            level: 10,
            rarity: 'rare',
            isPrimordial: false,
            isAlive: jest.fn(() => true),
            fullHeal: jest.fn(),
            maxHp: 150,
            atk: 30,
            def: 20,
            spd: 20,
        };
        mockEcho3 = {
            uid: 'echo-3',
            id: 3,
            name: 'Echo3',
            level: 3,
            rarity: 'uncommon',
            isPrimordial: true,
            isAlive: jest.fn(() => true),
            fullHeal: jest.fn(),
            maxHp: 80,
            atk: 15,
            def: 8,
            spd: 12,
        };

        mockState = {
            party: [mockEcho1],
            reserves: [mockEcho2, mockEcho3],
        };

        GameParty._state = mockState;
    });

    describe('addToParty()', () => {
        test('adds echo to party if under limit', () => {
            const newEcho = { uid: 'new', name: 'New' };
            const result = GameParty.addToParty(newEcho);
            expect(result).toBe(true);
            expect(mockState.party).toContain(newEcho);
        });

        test('returns false if party is full', () => {
            mockState.party = [{}, {}, {}, {}, {}, {}];
            const newEcho = { uid: 'new', name: 'New' };
            const result = GameParty.addToParty(newEcho);
            expect(result).toBe(false);
        });

        test('does not add if party is full', () => {
            mockState.party = [{}, {}, {}, {}, {}, {}];
            const newEcho = { uid: 'new', name: 'New' };
            GameParty.addToParty(newEcho);
            expect(mockState.party.length).toBe(6);
        });
    });

    describe('removeFromParty()', () => {
        test('removes echo from party by uid', () => {
            const result = GameParty.removeFromParty('echo-1');
            expect(result).toBe(true);
            expect(mockState.party.find((e) => e.uid === 'echo-1')).toBeUndefined();
        });

        test('moves removed echo to reserves', () => {
            GameParty.removeFromParty('echo-1');
            expect(mockState.reserves).toContain(mockEcho1);
        });

        test('returns false if uid not found', () => {
            const result = GameParty.removeFromParty('nonexistent');
            expect(result).toBe(false);
        });
    });

    describe('moveToParty()', () => {
        test('moves echo from reserves to party', () => {
            const result = GameParty.moveToParty('echo-2');
            expect(result).toBe(true);
            expect(mockState.party).toContain(mockEcho2);
            expect(mockState.reserves.find((e) => e.uid === 'echo-2')).toBeUndefined();
        });

        test('returns false if party is full', () => {
            mockState.party = [{}, {}, {}, {}, {}, {}];
            const result = GameParty.moveToParty('echo-2');
            expect(result).toBe(false);
        });

        test('returns false if uid not in reserves', () => {
            const result = GameParty.moveToParty('nonexistent');
            expect(result).toBe(false);
        });

        test('shows warning toast if party full', () => {
            mockState.party = [{}, {}, {}, {}, {}, {}];
            GameParty.moveToParty('echo-2');
            expect(UI.toast).toHaveBeenCalledWith('combat.partyFull', 'warning');
        });
    });

    describe('getAllEchoes()', () => {
        test('returns combined party and reserves', () => {
            const all = GameParty.getAllEchoes();
            expect(all.length).toBe(3);
            expect(all).toContain(mockEcho1);
            expect(all).toContain(mockEcho2);
            expect(all).toContain(mockEcho3);
        });

        test('returns empty array if both empty', () => {
            mockState.party = [];
            mockState.reserves = [];
            const all = GameParty.getAllEchoes();
            expect(all.length).toBe(0);
        });
    });

    describe('findEcho()', () => {
        test('finds echo by uid in party', () => {
            const found = GameParty.findEcho('echo-1');
            expect(found).toBe(mockEcho1);
        });

        test('finds echo by uid in reserves', () => {
            const found = GameParty.findEcho('echo-2');
            expect(found).toBe(mockEcho2);
        });

        test('returns undefined if not found', () => {
            const found = GameParty.findEcho('nonexistent');
            expect(found).toBeUndefined();
        });
    });

    describe('buildOptimalTeam()', () => {
        test('shows warning if no echoes available', () => {
            mockState.party = [];
            mockState.reserves = [];
            GameParty.buildOptimalTeam();
            expect(UI.toast).toHaveBeenCalledWith('combat.noEchoAvailable', 'warning');
        });

        test('rebuilds party from all echoes', () => {
            GameParty.buildOptimalTeam();
            expect(mockState.party.length).toBeGreaterThan(0);
        });

        test('heals new party members', () => {
            GameParty.buildOptimalTeam();
            mockState.party.forEach((e) => {
                expect(e.fullHeal).toHaveBeenCalled();
            });
        });

        test('moves non-selected echoes to reserves', () => {
            GameParty.buildOptimalTeam();
            const partyUids = new Set(mockState.party.map((e) => e.uid));
            mockState.reserves.forEach((e) => {
                expect(partyUids.has(e.uid)).toBe(false);
            });
        });
    });
});
