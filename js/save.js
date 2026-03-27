// ============================================
// ÉchoClicker - Système de sauvegarde (v2)
// ============================================

const SaveSystem = {
    KEY: 'echoclicker_save_v2',
    // Clés des anciennes versions pour la migration
    OLD_KEYS: ['echoclicker_save', 'echoclicker_save_v1'],
    CURRENT_VERSION: 4,

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
            v: 4, // Version mise à jour pour inclure les quêtes
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
                inventory: Game.state.inventory || [],
                mine: Mine.toJSON(),
                hatchery: Hatchery.toJSON(),
                quests: questSystem.toJSON() // Sauvegarder les quêtes
            }
        };
    },

    load() {
        try {
            // D'abord vérifier la clé actuelle
            let json = localStorage.getItem(this.KEY);
            let data = null;
            let sourceKey = this.KEY;

            if (json) {
                data = JSON.parse(json);
            } else {
                // Chercher dans les anciennes clés pour migration
                for (const oldKey of this.OLD_KEYS) {
                    json = localStorage.getItem(oldKey);
                    if (json) {
                        data = JSON.parse(json);
                        sourceKey = oldKey;
                        console.log(`Migration: sauvegarde trouvée dans ${oldKey}`);
                        break;
                    }
                }
            }

            if (!data) return false;

            // Migrer si nécessaire
            if (data.v < this.CURRENT_VERSION) {
                console.log(`Migration: version ${data.v} -> ${this.CURRENT_VERSION}`);
                data = this.migrateSave(data);
            }

            // Charger les données (skipMigration = true car déjà migré ci-dessus)
            const result = this.loadFromData(data, true);

            // Si la migration a réussi, sauvegarder dans la nouvelle clé et supprimer l'ancienne
            if (result && sourceKey !== this.KEY) {
                this.save();
                localStorage.removeItem(sourceKey);
                console.log(`Migration: sauvegarde migrée de ${sourceKey} vers ${this.KEY}`);
            }

            return result;
        } catch (e) {
            console.error('Load error:', e);
            return false;
        }
    },

    /**
     * Fusionner les anciennes régions avec les nouvelles
     * Préserve la progression du joueur tout en ajoutant les nouvelles régions
     * @param {Array} oldRegions - Régions de l'ancienne sauvegarde
     * @returns {Array} - Régions fusionnées
     */
    mergeRegions(oldRegions) {
        if (!oldRegions || !Array.isArray(oldRegions)) {
            return Utils.deepClone(REGIONS);
        }

        const mergedRegions = Utils.deepClone(REGIONS);
        
        // Pour chaque région de l'ancienne sauvegarde
        for (const oldRegion of oldRegions) {
            const newRegion = mergedRegions.find(r => r.id === oldRegion.id);
            if (newRegion) {
                // Préserver le statut unlocked et bossDefeated
                newRegion.unlocked = oldRegion.unlocked;
                newRegion.bossDefeated = oldRegion.bossDefeated;
                
                // Fusionner les routes si elles existent
                if (oldRegion.routes && Array.isArray(oldRegion.routes)) {
                    for (const oldRoute of oldRegion.routes) {
                        const newRoute = newRegion.routes.find(r => r.id === oldRoute.id);
                        if (newRoute) {
                            newRoute.unlocked = oldRoute.unlocked;
                        }
                    }
                }
            }
        }
        
        // Propager le déblocage des régions basé sur les boss vaincus
        // Si le boss d'une région est vaincu, la région suivante doit être débloquée
        for (let i = 0; i < mergedRegions.length - 1; i++) {
            const currentRegion = mergedRegions[i];
            const nextRegion = mergedRegions[i + 1];
            
            if (currentRegion.bossDefeated && !nextRegion.unlocked) {
                nextRegion.unlocked = true;
                // Débloquer aussi la première route de la nouvelle région
                if (nextRegion.routes && nextRegion.routes.length > 0) {
                    nextRegion.routes[0].unlocked = true;
                }
                console.log(`Migration: région ${nextRegion.name} débloquée car le boss de ${currentRegion.name} est vaincu`);
            }
        }
        
        return mergedRegions;
    },

    /**
     * Migrer une sauvegarde d'une ancienne version vers la version actuelle
     * @param {Object} data - Données de sauvegarde à migrer
     * @returns {Object} - Données migrées
     */
    migrateSave(data) {
        const migrated = { ...data };
        
        // Migration de la version 3 vers 4
        if (data.v === 3) {
            console.log('Migration v3 -> v4: ajout des quêtes et inventaire');
            
            // Ajouter les champs manquants avec des valeurs par défaut
            if (!migrated.s) migrated.s = {};
            
            // Nouveaux champs ajoutés en v4
            if (!migrated.s.quests) {
                migrated.s.quests = null; // Sera initialisé par questSystem
            }
            if (!migrated.s.inventory) {
                migrated.s.inventory = [];
            }
            if (!migrated.s.startTime) {
                migrated.s.startTime = Date.now() - (migrated.s.playTime || 0) * 1000;
            }
            
            // Fusionner les régions pour ajouter les nouvelles zones
            if (migrated.s.regions) {
                migrated.s.regions = this.mergeRegions(migrated.s.regions);
                console.log('Migration: régions fusionnées avec les nouvelles zones');
            }
            
            // Mettre à jour la version
            migrated.v = 4;
        }
        
        // Migration de la version 2 vers 3
        if (data.v === 2) {
            console.log('Migration v2 -> v3: ajout de la mine et incubateur');
            
            if (!migrated.s) migrated.s = {};
            
            // Ajouter les systèmes mine et hatchery s'ils n'existent pas
            if (!migrated.s.mine) {
                migrated.s.mine = null; // Sera initialisé par Mine
            }
            if (!migrated.s.hatchery) {
                migrated.s.hatchery = null; // Sera initialisé par Hatchery
            }
            
            // Continuer la migration vers v4
            return this.migrateSave({ ...migrated, v: 3 });
        }
        
        // Migration de la version 1 vers 2
        if (data.v === 1) {
            console.log('Migration v1 -> v2: ajout des boosts et régions');
            
            if (!migrated.s) migrated.s = {};
            
            if (!migrated.s.boosts) {
                migrated.s.boosts = {};
            }
            if (!migrated.s.regions) {
                migrated.s.regions = Utils.deepClone(REGIONS);
            }
            
            // Continuer la migration vers v3
            return this.migrateSave({ ...migrated, v: 2 });
        }
        
        // Migration de la version 0 ou sans version vers 1
        if (!data.v || data.v === 0) {
            console.log('Migration v0 -> v1: initialisation de base');
            
            if (!migrated.s) migrated.s = {};
            
            // S'assurer que tous les champs de base existent
            migrated.s.energy = migrated.s.energy ?? 0;
            migrated.s.links = migrated.s.links ?? 5;
            migrated.s.crystals = migrated.s.crystals ?? 0;
            migrated.s.shards = migrated.s.shards ?? 0;
            migrated.s.totalEnergy = migrated.s.totalEnergy ?? 0;
            migrated.s.totalClicks = migrated.s.totalClicks ?? 0;
            migrated.s.totalCaptures = migrated.s.totalCaptures ?? 0;
            migrated.s.uniqueCaptures = migrated.s.uniqueCaptures ?? 0;
            migrated.s.primordialCount = migrated.s.primordialCount ?? 0;
            migrated.s.totalWins = migrated.s.totalWins ?? 0;
            migrated.s.bossesDefeated = migrated.s.bossesDefeated ?? 0;
            migrated.s.regionsUnlocked = migrated.s.regionsUnlocked ?? 1;
            migrated.s.maxLevel = migrated.s.maxLevel ?? 1;
            migrated.s.playTime = migrated.s.playTime ?? 0;
            migrated.s.clickPower = migrated.s.clickPower ?? GAME_CONFIG.ENERGY_PER_CLICK_BASE;
            migrated.s.passiveIncome = migrated.s.passiveIncome ?? GAME_CONFIG.PASSIVE_BASE;
            migrated.s.currentRegion = migrated.s.currentRegion ?? 'foret';
            
            // Convertir les Sets si nécessaire
            if (Array.isArray(migrated.s.seenEchoes)) {
                // Déjà un tableau, OK
            } else if (migrated.s.seenEchoes instanceof Set) {
                migrated.s.seenEchoes = [...migrated.s.seenEchoes];
            } else {
                migrated.s.seenEchoes = [];
            }
            
            if (Array.isArray(migrated.s.caughtEchoes)) {
                // Déjà un tableau, OK
            } else if (migrated.s.caughtEchoes instanceof Set) {
                migrated.s.caughtEchoes = [...migrated.s.caughtEchoes];
            } else {
                migrated.s.caughtEchoes = [];
            }
            
            if (Array.isArray(migrated.s.achievements)) {
                // Déjà un tableau, OK
            } else if (migrated.s.achievements instanceof Set) {
                migrated.s.achievements = [...migrated.s.achievements];
            } else {
                migrated.s.achievements = [];
            }
            
            // Continuer la migration vers v1
            return this.migrateSave({ ...migrated, v: 1 });
        }
        
        return migrated;
    },

    loadFromData(data, skipMigration = false) {
        try {
            if (!data?.s) return false;
            
            // Migrer si nécessaire avant de charger (sauf si déjà migré)
            if (!skipMigration && data.v < this.CURRENT_VERSION) {
                console.log(`Migration dans loadFromData: version ${data.v} -> ${this.CURRENT_VERSION}`);
                data = this.migrateSave(data);
            }
            
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
            Game.state.inventory = s.inventory || [];

            // Reconstruire les Échos depuis JSON
            Game.state.party = (s.party || []).map(j => Echo.fromJSON(j));
            Game.state.reserves = (s.reserves || []).map(j => Echo.fromJSON(j));

            Game.state.seenEchoes = new Set(s.seenEchoes || []);
            Game.state.caughtEchoes = new Set(s.caughtEchoes || []);
            Game.state.achievements = new Set(s.achievements || []);

            // Charger les systèmes Mine et Hatchery
            if (s.mine) Mine.fromJSON(s.mine);
            if (s.hatchery) Hatchery.fromJSON(s.hatchery);
            
            // Charger les quêtes
            if (s.quests) {
                questSystem.fromJSON(s.quests);
            }

            return true;
        } catch (e) {
            console.error('Load data error:', e);
            return false;
        }
    },

    /**
     * Importer une sauvegarde depuis un fichier JSON
     * Gère automatiquement la migration des anciennes versions
     * @param {Object} data - Données de sauvegarde importées
     * @returns {boolean} - true si l'import a réussi
     */
    importFromData(data) {
        try {
            if (!data) {
                console.error('Import: données invalides');
                return false;
            }

            // Vérifier la version et migrer si nécessaire
            const originalVersion = data.v || 0;
            if (originalVersion < this.CURRENT_VERSION) {
                console.log(`Import: migration de la version ${originalVersion} vers ${this.CURRENT_VERSION}`);
                data = this.migrateSave(data);
                
                // Notifier l'utilisateur de la migration
                if (typeof UI !== 'undefined' && UI.toast) {
                    UI.toast(`Sauvegarde migrée de la version ${originalVersion} vers ${this.CURRENT_VERSION}`, 'success');
                }
            }

            // Charger les données (skipMigration = true car déjà migré ci-dessus)
            const result = this.loadFromData(data, true);
            
            if (result) {
                // Sauvegarder dans le nouveau format
                this.save();
                console.log('Import: sauvegarde importée avec succès');
            }

            return result;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    hasSave() {
        // Vérifier la clé actuelle
        if (localStorage.getItem(this.KEY) !== null) return true;
        
        // Vérifier les anciennes clés
        for (const oldKey of this.OLD_KEYS) {
            if (localStorage.getItem(oldKey) !== null) return true;
        }
        
        return false;
    },

    deleteSave() {
        localStorage.removeItem(this.KEY);
        // Supprimer aussi les anciennes sauvegardes
        for (const oldKey of this.OLD_KEYS) {
            localStorage.removeItem(oldKey);
        }
    }
};

// Note: Game.loadGame est défini dans game.js pour éviter les erreurs de référence
