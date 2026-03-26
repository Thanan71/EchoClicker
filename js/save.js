// ============================================
// ÉchoClicker - Système de sauvegarde (v2)
// ============================================

const SaveSystem = {
    KEY: 'echoclicker_save_v2',

    save() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(this.getSaveData()));
            EventBus.emit(GAME_EVENTS.SAVE_COMPLETE, {});
            return true;
        } catch (e) {
            console.error('Save error:', e);
            return false;
        }
    },

    getSaveData() {
        return {
            v: 3,
            ts: Date.now(),
            s: {
                energy: Game.state.energy,
                links: Game.state.links,
                crystals: Game.state.crystals,
                shards: Game.state.shards,
                totalEnergy: Game.state.totalEnergy,
                totalClicks: Game.state.totalClicks,
                totalCaptures: Game.state.totalCaptures,
                uniqueCaptures: Game.state.uniqueCaptures,
                primordialCount: Game.state.primordialCount,
                totalWins: Game.state.totalWins,
                bossesDefeated: Game.state.bossesDefeated,
                regionsUnlocked: Game.state.regionsUnlocked,
                maxLevel: Game.state.maxLevel,
                playTime: Game.state.playTime,
                startTime: Game.state.startTime,
                clickPower: Game.state.clickPower,
                passiveIncome: Game.state.passiveIncome,
                currentRegion: Game.state.currentRegion,
                party: Game.state.party.map(e => e.toJSON()),
                reserves: Game.state.reserves.map(e => e.toJSON()),
                seenEchoes: [...Game.state.seenEchoes],
                caughtEchoes: [...Game.state.caughtEchoes],
                achievements: [...Game.state.achievements],
                regions: Game.state.regions,
                boosts: Game.state.boosts,
                mine: Mine.toJSON(),
                hatchery: Hatchery.toJSON()
            }
        };
    },

    load() {
        try {
            const json = localStorage.getItem(this.KEY);
            if (!json) return false;
            return this.loadFromData(JSON.parse(json));
        } catch (e) {
            console.error('Load error:', e);
            return false;
        }
    },

    loadFromData(data) {
        try {
            if (!data?.s) return false;
            const s = data.s;

            Game.state.energy = s.energy ?? 0;
            Game.state.links = s.links ?? 5;
            Game.state.crystals = s.crystals ?? 0;
            Game.state.shards = s.shards ?? 0;
            Game.state.totalEnergy = s.totalEnergy ?? 0;
            Game.state.totalClicks = s.totalClicks ?? 0;
            Game.state.totalCaptures = s.totalCaptures ?? 0;
            Game.state.uniqueCaptures = s.uniqueCaptures ?? 0;
            Game.state.primordialCount = s.primordialCount ?? 0;
            Game.state.totalWins = s.totalWins ?? 0;
            Game.state.bossesDefeated = s.bossesDefeated ?? 0;
            Game.state.regionsUnlocked = s.regionsUnlocked ?? 1;
            Game.state.maxLevel = s.maxLevel ?? 1;
            Game.state.playTime = s.playTime ?? 0;
            Game.state.startTime = s.startTime ?? Date.now();
            Game.state.clickPower = s.clickPower ?? GAME_CONFIG.ENERGY_PER_CLICK_BASE;
            Game.state.passiveIncome = s.passiveIncome ?? GAME_CONFIG.PASSIVE_BASE;
            Game.state.currentRegion = s.currentRegion ?? 'foret';
            Game.state.regions = s.regions ?? Utils.deepClone(REGIONS);
            Game.state.boosts = s.boosts ?? {};

            // Reconstruire les Échos depuis JSON
            Game.state.party = (s.party || []).map(j => Echo.fromJSON(j));
            Game.state.reserves = (s.reserves || []).map(j => Echo.fromJSON(j));

            Game.state.seenEchoes = new Set(s.seenEchoes || []);
            Game.state.caughtEchoes = new Set(s.caughtEchoes || []);
            Game.state.achievements = new Set(s.achievements || []);

            // Charger les systèmes Mine et Hatchery
            if (s.mine) Mine.fromJSON(s.mine);
            if (s.hatchery) Hatchery.fromJSON(s.hatchery);

            return true;
        } catch (e) {
            console.error('Load data error:', e);
            return false;
        }
    },

    hasSave() {
        return localStorage.getItem(this.KEY) !== null;
    },

    deleteSave() {
        localStorage.removeItem(this.KEY);
    }
};

// Note: Game.loadGame est défini dans game.js pour éviter les erreurs de référence
