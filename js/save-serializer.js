// ============================================
// EchoClicker - Serialiseur de sauvegarde
// ============================================
// Responsable uniquement de la conversion entre Game.state et donnees JSON.
// Ne connait pas le localStorage ni la migration - c'est le role de SaveSystem.

const SaveSerializer = {
    CURRENT_VERSION: 4,

    /**
     * Convertir Game.state en objet de sauvegarde JSON-serialisable.
     * @param {Object} state - L'objet Game.state
     * @param {Object} systemState - Etat des sous-systemes { mine, hatchery, quests }
     * @returns {Object} Donnees pretes pour JSON.stringify
     */
    serialize(state, systemState) {
        return {
            v: this.CURRENT_VERSION,
            ts: Date.now(),
            s: {
                energy: state.energy,
                links: state.links,
                crystals: state.crystals,
                shards: state.shards,
                totalEnergy: state.totalEnergy,
                totalClicks: state.totalClicks,
                totalCaptures: state.totalCaptures,
                uniqueCaptures: state.uniqueCaptures,
                primordialCount: state.primordialCount,
                totalWins: state.totalWins,
                bossesDefeated: state.bossesDefeated,
                regionsUnlocked: state.regionsUnlocked,
                maxLevel: state.maxLevel,
                playTime: state.playTime,
                startTime: state.startTime,
                clickPower: state.clickPower,
                passiveIncome: state.passiveIncome,
                currentRegion: state.currentRegion,
                party: state.party.map(e => e.toJSON()),
                reserves: state.reserves.map(e => e.toJSON()),
                seenEchoes: [...state.seenEchoes],
                caughtEchoes: [...state.caughtEchoes],
                achievements: [...state.achievements],
                regions: state.regions,
                boosts: state.boosts,
                inventory: state.inventory || [],
                mine: systemState.mine,
                hatchery: systemState.hatchery,
                quests: systemState.quests,
                narrative: systemState.narrative
            }
        };
    },

    /**
     * Charger des donnees JSON dans Game.state.
     * @param {Object} data - Donnees de sauvegarde (deja parsees et migrees)
     * @param {Object} state - L'objet Game.state a remplir
     * @param {Object} systemHandlers - { Mine, Hatchery, questSystem, Echo }
     * @returns {boolean} true si le chargement a reussi
     */
    deserialize(data, state, systemHandlers) {
        try {
            if (!data?.s) return false;

            const s = data.s;
            const { Mine, Hatchery, questSystem, NarrativeSystem, Echo } = systemHandlers;

            state.energy = s.energy ?? 0;
            state.links = s.links ?? 5;
            state.crystals = s.crystals ?? 0;
            state.shards = s.shards ?? 0;
            state.totalEnergy = s.totalEnergy ?? 0;
            state.totalClicks = s.totalClicks ?? 0;
            state.totalCaptures = s.totalCaptures ?? 0;
            state.uniqueCaptures = s.uniqueCaptures ?? 0;
            state.primordialCount = s.primordialCount ?? 0;
            state.totalWins = s.totalWins ?? 0;
            state.bossesDefeated = s.bossesDefeated ?? 0;
            state.regionsUnlocked = s.regionsUnlocked ?? 1;
            state.maxLevel = s.maxLevel ?? 1;
            state.playTime = s.playTime ?? 0;
            state.startTime = s.startTime ?? Date.now();
            state.clickPower = s.clickPower ?? GAME_CONFIG.ENERGY_PER_CLICK_BASE;
            state.passiveIncome = s.passiveIncome ?? GAME_CONFIG.PASSIVE_BASE;
            state.currentRegion = s.currentRegion ?? 'foret';
            state.regions = s.regions ?? Utils.deepClone(REGIONS);
            state.boosts = s.boosts ?? {};
            state.inventory = s.inventory || [];

            // Reconstruire les Echos depuis JSON
            state.party = (s.party || []).map(j => Echo.fromJSON(j));
            state.reserves = (s.reserves || []).map(j => Echo.fromJSON(j));

            state.seenEchoes = new Set(s.seenEchoes || []);
            state.caughtEchoes = new Set(s.caughtEchoes || []);
            state.achievements = new Set(s.achievements || []);

            // Charger les systemes Mine et Hatchery
            if (s.mine) Mine.fromJSON(s.mine);
            if (s.hatchery) Hatchery.fromJSON(s.hatchery);

            // Charger les quetes
            if (s.quests) {
                questSystem.fromJSON(s.quests);
            }

            // Charger la narration
            if (s.narrative) {
                NarrativeSystem.fromJSON(s.narrative);
            }

            return true;
        } catch (e) {
            console.error('Deserialize error:', e);
            return false;
        }
    }
};
