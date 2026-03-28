// ============================================
// EchoClicker - Systeme de sauvegarde (v3)
// ============================================
// Orchestration : localStorage, migration, versioning.
// La conversion state <-> JSON est deleguee a SaveSerializer.

import { Echo } from './core/echo.js';
import { EventBus, GAME_EVENTS } from './core/eventBus.js';
import { GAME_CONFIG } from './data/game-config.js';
import { REGIONS } from './data/regions-data.js';
import { Utils } from './data/utils.js';
import { Game } from './game.js';
import { SaveSerializer } from './save-serializer.js';
import { Hatchery } from './systems/hatchery.js';
import { Mine } from './systems/mine.js';
import { NarrativeSystem } from './systems/narrative.js';
import { questSystem } from './systems/quests.js';

export const SaveSystem = {
  KEY: 'echoclicker_save_v2',
  // Cles des anciennes versions pour la migration
  OLD_KEYS: ['echoclicker_save', 'echoclicker_save_v1'],
  CURRENT_VERSION: SaveSerializer.CURRENT_VERSION,

  save() {
    try {
      const systemState = {
        mine: Mine.toJSON(),
        hatchery: Hatchery.toJSON(),
        quests: questSystem.toJSON(),
        narrative: NarrativeSystem.toJSON(),
      };
      const saveData = SaveSerializer.serialize(Game.state, systemState);
      localStorage.setItem(this.KEY, JSON.stringify(saveData));
      EventBus.emit(GAME_EVENTS.SAVE_COMPLETE, {});
      return true;
    } catch (_e) {
      return false;
    }
  },

  getSaveData() {
    const systemState = {
      mine: Mine.toJSON(),
      hatchery: Hatchery.toJSON(),
      quests: questSystem.toJSON(),
      narrative: NarrativeSystem.toJSON(),
    };
    return SaveSerializer.serialize(Game.state, systemState);
  },

  load() {
    try {
      // D'abord verifier la cle actuelle
      let json = localStorage.getItem(this.KEY);
      let data = null;
      let sourceKey = this.KEY;

      if (json) {
        data = JSON.parse(json);
      } else {
        // Chercher dans les anciennes cles pour migration
        for (const oldKey of this.OLD_KEYS) {
          json = localStorage.getItem(oldKey);
          if (json) {
            data = JSON.parse(json);
            sourceKey = oldKey;
            break;
          }
        }
      }

      if (!data) {
        return false;
      }

      // Migrer si necessaire
      if (data.v < this.CURRENT_VERSION) {
        data = this.migrateSave(data);
      }

      // Charger les donnees (skipMigration = true car deja migre ci-dessus)
      const result = this.loadFromData(data, true);

      // Si la migration a reussi, sauvegarder dans la nouvelle cle et supprimer l'ancienne
      if (result && sourceKey !== this.KEY) {
        this.save();
        localStorage.removeItem(sourceKey);
      }

      return result;
    } catch (_e) {
      return false;
    }
  },

  /**
   * Fusionner les anciennes regions avec les nouvelles
   * Preserve la progression du joueur tout en ajoutant les nouvelles regions
   * @param {Array} oldRegions - Regions de l'ancienne sauvegarde
   * @returns {Array} - Regions fusionnees
   */
  mergeRegions(oldRegions) {
    if (!oldRegions || !Array.isArray(oldRegions)) {
      return Utils.deepClone(REGIONS);
    }

    const mergedRegions = Utils.deepClone(REGIONS);

    // Pour chaque region de l'ancienne sauvegarde
    for (const oldRegion of oldRegions) {
      const newRegion = mergedRegions.find((r) => r.id === oldRegion.id);
      if (newRegion) {
        // Preserver le statut unlocked et bossDefeated
        newRegion.unlocked = oldRegion.unlocked;
        newRegion.bossDefeated = oldRegion.bossDefeated;

        // Fusionner les routes si elles existent
        if (oldRegion.routes && Array.isArray(oldRegion.routes)) {
          for (const oldRoute of oldRegion.routes) {
            const newRoute = newRegion.routes.find((r) => r.id === oldRoute.id);
            if (newRoute) {
              newRoute.unlocked = oldRoute.unlocked;
            }
          }
        }
      }
    }

    // Propager le deblocage des regions base sur les boss vaincus
    for (let i = 0; i < mergedRegions.length - 1; i++) {
      const currentRegion = mergedRegions[i];
      const nextRegion = mergedRegions[i + 1];

      if (currentRegion.bossDefeated && !nextRegion.unlocked) {
        nextRegion.unlocked = true;
        if (nextRegion.routes && nextRegion.routes.length > 0) {
          nextRegion.routes[0].unlocked = true;
        }
      }
    }

    return mergedRegions;
  },

  /**
   * Migrer une sauvegarde d'une ancienne version vers la version actuelle
   * @param {Object} data - Donnees de sauvegarde a migrer
   * @returns {Object} - Donnees migrees
   */
  migrateSave(data) {
    const migrated = { ...data };

    // Migration de la version 3 vers 4
    if (data.v === 3) {
      if (!migrated.s) {
        migrated.s = {};
      }
      if (!migrated.s.quests) {
        migrated.s.quests = null;
      }
      if (!migrated.s.inventory) {
        migrated.s.inventory = [];
      }
      if (!migrated.s.startTime) {
        migrated.s.startTime = Date.now() - (migrated.s.playTime || 0) * 1000;
      }
      if (migrated.s.regions) {
        migrated.s.regions = this.mergeRegions(migrated.s.regions);
      }
      migrated.v = 4;
    }

    // Migration de la version 2 vers 3
    if (data.v === 2) {
      if (!migrated.s) {
        migrated.s = {};
      }
      if (!migrated.s.mine) {
        migrated.s.mine = null;
      }
      if (!migrated.s.hatchery) {
        migrated.s.hatchery = null;
      }
      return this.migrateSave({ ...migrated, v: 3 });
    }

    // Migration de la version 1 vers 2
    if (data.v === 1) {
      if (!migrated.s) {
        migrated.s = {};
      }
      if (!migrated.s.boosts) {
        migrated.s.boosts = {};
      }
      if (!migrated.s.regions) {
        migrated.s.regions = Utils.deepClone(REGIONS);
      }
      return this.migrateSave({ ...migrated, v: 2 });
    }

    // Migration de la version 0 ou sans version vers 1
    if (!data.v || data.v === 0) {
      if (!migrated.s) {
        migrated.s = {};
      }

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

      // Convertir les Sets si necessaire
      if (!Array.isArray(migrated.s.seenEchoes)) {
        if (migrated.s.seenEchoes instanceof Set) {
          migrated.s.seenEchoes = [...migrated.s.seenEchoes];
        } else {
          migrated.s.seenEchoes = [];
        }
      }
      if (!Array.isArray(migrated.s.caughtEchoes)) {
        if (migrated.s.caughtEchoes instanceof Set) {
          migrated.s.caughtEchoes = [...migrated.s.caughtEchoes];
        } else {
          migrated.s.caughtEchoes = [];
        }
      }
      if (!Array.isArray(migrated.s.achievements)) {
        if (migrated.s.achievements instanceof Set) {
          migrated.s.achievements = [...migrated.s.achievements];
        } else {
          migrated.s.achievements = [];
        }
      }

      return this.migrateSave({ ...migrated, v: 1 });
    }

    return migrated;
  },

  loadFromData(data, skipMigration = false) {
    try {
      if (!data?.s) {
        return false;
      }

      let dataToLoad = data;
      // Migrer si necessaire avant de charger (sauf si deja migre)
      if (!skipMigration && data.v < this.CURRENT_VERSION) {
        dataToLoad = this.migrateSave(data);
      }

      // Deleguer la deserialisation a SaveSerializer
      return SaveSerializer.deserialize(dataToLoad, Game.state, {
        Mine,
        Hatchery,
        questSystem,
        NarrativeSystem,
        Echo,
      });
    } catch (_e) {
      return false;
    }
  },

  /**
   * Importer une sauvegarde depuis un fichier JSON
   * @param {Object} data - Donnees de sauvegarde importees
   * @returns {boolean} - true si l'import a reussi
   */
  importFromData(data) {
    try {
      if (!data) {
        return false;
      }

      const originalVersion = data.v || 0;
      let migratedData = data;
      if (originalVersion < this.CURRENT_VERSION) {
        migratedData = this.migrateSave(data);

        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast(
            `Sauvegarde migree de la version ${originalVersion} vers ${this.CURRENT_VERSION}`,
            'success',
          );
        }
      }

      const result = this.loadFromData(migratedData, true);

      if (result) {
        this.save();
      }

      return result;
    } catch (_e) {
      return false;
    }
  },

  hasSave() {
    if (localStorage.getItem(this.KEY) !== null) {
      return true;
    }
    for (const oldKey of this.OLD_KEYS) {
      if (localStorage.getItem(oldKey) !== null) {
        return true;
      }
    }
    return false;
  },

  deleteSave() {
    localStorage.removeItem(this.KEY);
    for (const oldKey of this.OLD_KEYS) {
      localStorage.removeItem(oldKey);
    }
  },
};

// Note: Game.loadGame est defini dans game.js pour eviter les erreurs de reference
