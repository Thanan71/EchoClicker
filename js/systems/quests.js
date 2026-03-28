/**
 * Système de quêtes pour EchoClicker
 * Gère les quêtes quotidiennes et les quêtes d'histoire
 */

import { EventBus } from '../core/eventBus.js';
import { getEchoById } from '../data/constants.js';
import { Game } from '../game.js';

// Types de quêtes
export const QUEST_TYPES = {
  DAILY: 'daily',
  STORY: 'story',
};

// Catégories de quêtes
export const QUEST_CATEGORIES = {
  CAPTURE: 'capture',
  LEVEL: 'level',
  COMBAT: 'combat',
  MINE: 'mine',
  BOSS: 'boss',
  COLLECTION: 'collection',
};

// Structure d'une quête
export class Quest {
  constructor({
    id,
    name,
    description,
    type,
    category,
    target,
    current = 0,
    rewards = [],
    prerequisites = [],
    storyOrder = null,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.category = category;
    this.target = target;
    this.current = current;
    this.rewards = rewards;
    this.prerequisites = prerequisites;
    this.storyOrder = storyOrder;
    this.completed = false;
    this.claimed = false;
  }

  // Vérifie si la quête est complétée
  isCompleted() {
    return this.current >= this.target;
  }

  // Met à jour la progression
  updateProgress(amount = 1) {
    if (this.completed) {
      return false;
    }

    this.current = Math.min(this.current + amount, this.target);

    if (this.isCompleted()) {
      this.completed = true;
      EventBus.emit('quest:completed', this);
      return true;
    }

    EventBus.emit('quest:progress', this);
    return false;
  }

  _applyReward(reward) {
    const handlers = {
      xp: () => {
        if (Game.state?.player) {
          Game.state.player.xp = (Game.state.player.xp || 0) + reward.amount;
        }
      },
      crystals: () => {
        if (Game.state) {
          Game.state.crystals = (Game.state.crystals || 0) + reward.amount;
        }
      },
      energy: () => {
        if (Game.state) {
          Game.state.energy = (Game.state.energy || 0) + reward.amount;
        }
      },
      item: () => {
        if (Game.state?.inventory) {
          Game.state.inventory.push(reward.item);
        }
      },
    };
    const handler = handlers[reward.type];
    if (handler) {
      handler();
    }
  }

  claimRewards() {
    if (!this.completed || this.claimed) {
      return false;
    }
    this.claimed = true;
    for (const reward of this.rewards) {
      this._applyReward(reward);
    }
    EventBus.emit('quest:rewardsClaimed', this);
    return true;
  }

  // Sérialisation pour la sauvegarde
  toJSON() {
    return {
      id: this.id,
      current: this.current,
      completed: this.completed,
      claimed: this.claimed,
    };
  }

  // Chargement depuis la sauvegarde
  static fromJSON(data, questTemplate) {
    const quest = new Quest(questTemplate);
    quest.current = data.current || 0;
    quest.completed = data.completed || false;
    quest.claimed = data.claimed || false;
    return quest;
  }
}

// Templates de quêtes quotidiennes
export const DAILY_QUEST_TEMPLATES = [
  {
    id: 'daily_capture_flore',
    name: 'Chasseur de Flore',
    description: 'Capture 5 Échos de type Flore',
    type: QUEST_TYPES.DAILY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 5,
    rewards: [
      { type: 'xp', amount: 100 },
      { type: 'crystals', amount: 50 },
    ],
  },
  {
    id: 'daily_level_10',
    name: 'Entraînement Intensif',
    description: 'Atteins le niveau 10 avec un Écho',
    type: QUEST_TYPES.DAILY,
    category: QUEST_CATEGORIES.LEVEL,
    target: 1,
    rewards: [
      { type: 'xp', amount: 200 },
      { type: 'crystals', amount: 100 },
    ],
  },
  {
    id: 'daily_combat_3',
    name: 'Guerrier du Jour',
    description: 'Gagne 3 combats',
    type: QUEST_TYPES.DAILY,
    category: QUEST_CATEGORIES.COMBAT,
    target: 3,
    rewards: [
      { type: 'xp', amount: 150 },
      { type: 'energy', amount: 50 },
    ],
  },
  {
    id: 'daily_mine_10',
    name: 'Mineur Assidu',
    description: 'Mine 10 cristaux',
    type: QUEST_TYPES.DAILY,
    category: QUEST_CATEGORIES.MINE,
    target: 10,
    rewards: [
      { type: 'crystals', amount: 75 },
      { type: 'energy', amount: 30 },
    ],
  },
  {
    id: 'daily_capture_any',
    name: 'Collectionneur',
    description: "Capture 3 Échos de n'importe quel type",
    type: QUEST_TYPES.DAILY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 3,
    rewards: [
      { type: 'xp', amount: 80 },
      { type: 'crystals', amount: 40 },
    ],
  },
  {
    id: 'daily_combat_5',
    name: 'Batailleur',
    description: 'Gagne 5 combats',
    type: QUEST_TYPES.DAILY,
    category: QUEST_CATEGORIES.COMBAT,
    target: 5,
    rewards: [
      { type: 'xp', amount: 250 },
      { type: 'crystals', amount: 120 },
    ],
  },
];

// Templates de quêtes d'histoire
export const STORY_QUEST_TEMPLATES = [
  // ===== FORÊT ÉVEILLÉE =====
  {
    id: 'story_boss_forest',
    name: 'Le Gardien de la Forêt',
    description: 'Bat le boss de la Forêt Éveillée',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 1,
    rewards: [
      { type: 'xp', amount: 500 },
      { type: 'crystals', amount: 200 },
      { type: 'item', item: { id: 'forest_badge', name: 'Badge de la Forêt', rarity: 'rare' } },
    ],
  },
  {
    id: 'story_capture_flore',
    name: 'Ami de la Nature',
    description: 'Capture 3 Échos de type Flore',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 3,
    storyOrder: 2,
    prerequisites: ['story_boss_forest'],
    rewards: [
      { type: 'xp', amount: 300 },
      { type: 'crystals', amount: 150 },
    ],
  },
  {
    id: 'story_level_15',
    name: 'Tisseur Confirmé',
    description: 'Atteins le niveau 15',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.LEVEL,
    target: 1,
    storyOrder: 3,
    prerequisites: ['story_capture_flore'],
    rewards: [
      { type: 'xp', amount: 600 },
      { type: 'crystals', amount: 300 },
    ],
  },

  // ===== MONTAGNES CRISTALLINES =====
  {
    id: 'story_boss_montagnes',
    name: 'Le Colosse de Pierre',
    description: 'Bat le boss des Montagnes Cristallines',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 4,
    prerequisites: ['story_level_15'],
    rewards: [
      { type: 'xp', amount: 1200 },
      { type: 'crystals', amount: 600 },
      { type: 'item', item: { id: 'mountain_badge', name: 'Badge des Montagnes', rarity: 'epic' } },
    ],
  },
  {
    id: 'story_capture_terre',
    name: 'Maître de la Roche',
    description: 'Capture 2 Échos de type Terre',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 2,
    storyOrder: 5,
    prerequisites: ['story_boss_montagnes'],
    rewards: [
      { type: 'xp', amount: 400 },
      { type: 'crystals', amount: 200 },
    ],
  },
  {
    id: 'story_capture_cristal',
    name: 'Chasseur de Cristal',
    description: 'Capture 2 Échos de type Cristal',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 2,
    storyOrder: 6,
    prerequisites: ['story_boss_montagnes'],
    rewards: [
      { type: 'xp', amount: 400 },
      { type: 'crystals', amount: 200 },
    ],
  },

  // ===== OCÉAN ABYSSAL =====
  {
    id: 'story_boss_ocean',
    name: 'Le Léviathan',
    description: "Bat le boss de l'Océan Abyssal",
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 7,
    prerequisites: ['story_capture_terre', 'story_capture_cristal'],
    rewards: [
      { type: 'xp', amount: 1800 },
      { type: 'crystals', amount: 900 },
      { type: 'item', item: { id: 'ocean_badge', name: "Badge de l'Océan", rarity: 'epic' } },
    ],
  },
  {
    id: 'story_capture_ocean',
    name: 'Dompteur des Mers',
    description: 'Capture 2 Échos de type Océan',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 2,
    storyOrder: 8,
    prerequisites: ['story_boss_ocean'],
    rewards: [
      { type: 'xp', amount: 500 },
      { type: 'crystals', amount: 250 },
    ],
  },
  {
    id: 'story_level_30',
    name: 'Tisseur Émérite',
    description: 'Atteins le niveau 30',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.LEVEL,
    target: 1,
    storyOrder: 9,
    prerequisites: ['story_capture_ocean'],
    rewards: [
      { type: 'xp', amount: 2000 },
      { type: 'crystals', amount: 1000 },
      { type: 'item', item: { id: 'emeritus_badge', name: 'Badge Émérite', rarity: 'legendary' } },
    ],
  },

  // ===== VOLCAN INFERNAL =====
  {
    id: 'story_boss_volcan',
    name: 'Le Seigneur Pyrodrak',
    description: 'Bat le boss du Volcan Infernal',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 10,
    prerequisites: ['story_level_30'],
    rewards: [
      { type: 'xp', amount: 2500 },
      { type: 'crystals', amount: 1250 },
      { type: 'item', item: { id: 'volcano_badge', name: 'Badge du Volcan', rarity: 'legendary' } },
    ],
  },
  {
    id: 'story_capture_feu',
    name: 'Maître des Flammes',
    description: 'Capture 3 Échos de type Feu',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 3,
    storyOrder: 11,
    prerequisites: ['story_boss_volcan'],
    rewards: [
      { type: 'xp', amount: 600 },
      { type: 'crystals', amount: 300 },
    ],
  },
  {
    id: 'story_collect_25',
    name: 'Collectionneur Expert',
    description: 'Capture 25 Échos différents',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.COLLECTION,
    target: 25,
    storyOrder: 12,
    prerequisites: ['story_capture_feu'],
    rewards: [
      { type: 'xp', amount: 1500 },
      { type: 'crystals', amount: 750 },
    ],
  },

  // ===== FORÊT MAUDITE =====
  {
    id: 'story_capture_shadow',
    name: "L'Ombre Capturée",
    description: 'Capture ton premier Écho de type Ombre',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 1,
    storyOrder: 13,
    prerequisites: ['story_collect_25'],
    rewards: [
      { type: 'xp', amount: 800 },
      { type: 'crystals', amount: 400 },
    ],
  },
  {
    id: 'story_boss_cave',
    name: "L'Obscurité Vaincue",
    description: 'Bat le boss de la Forêt Maudite',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 14,
    prerequisites: ['story_capture_shadow'],
    rewards: [
      { type: 'xp', amount: 3000 },
      { type: 'crystals', amount: 1500 },
      {
        type: 'item',
        item: { id: 'cursed_badge', name: 'Badge Maudit', rarity: 'legendary' },
      },
    ],
  },
  {
    id: 'story_level_40',
    name: 'Tisseur Légendaire',
    description: 'Atteins le niveau 40',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.LEVEL,
    target: 1,
    storyOrder: 15,
    prerequisites: ['story_boss_cave'],
    rewards: [
      { type: 'xp', amount: 3500 },
      { type: 'crystals', amount: 1750 },
      {
        type: 'item',
        item: { id: 'legendary_badge', name: 'Badge Légendaire', rarity: 'mythical' },
      },
    ],
  },

  // ===== CIEL ÉTHÉRÉ =====
  {
    id: 'story_capture_lumiere',
    name: 'Porteur de Lumière',
    description: 'Capture 2 Échos de type Lumière',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 2,
    storyOrder: 16,
    prerequisites: ['story_level_40'],
    rewards: [
      { type: 'xp', amount: 1000 },
      { type: 'crystals', amount: 500 },
    ],
  },
  {
    id: 'story_boss_ciel',
    name: 'Le Solarius Éternel',
    description: 'Bat le boss du Ciel Éthéré',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 17,
    prerequisites: ['story_capture_lumiere'],
    rewards: [
      { type: 'xp', amount: 4000 },
      { type: 'crystals', amount: 2000 },
      { type: 'item', item: { id: 'celestial_badge', name: 'Badge Céleste', rarity: 'mythical' } },
    ],
  },
  {
    id: 'story_collect_40',
    name: 'Grand Collectionneur',
    description: 'Capture 40 Échos différents',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.COLLECTION,
    target: 40,
    storyOrder: 18,
    prerequisites: ['story_boss_ciel'],
    rewards: [
      { type: 'xp', amount: 2500 },
      { type: 'crystals', amount: 1250 },
    ],
  },

  // ===== DIMENSION ARCANE =====
  {
    id: 'story_capture_arcane',
    name: "Maître de l'Arcane",
    description: 'Capture 2 Échos de type Arcane',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 2,
    storyOrder: 19,
    prerequisites: ['story_collect_40'],
    rewards: [
      { type: 'xp', amount: 1500 },
      { type: 'crystals', amount: 750 },
    ],
  },
  {
    id: 'story_boss_dimension',
    name: "L'Arcanexus Absolu",
    description: 'Bat le boss de la Dimension Arcane',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 20,
    prerequisites: ['story_capture_arcane'],
    rewards: [
      { type: 'xp', amount: 5000 },
      { type: 'crystals', amount: 2500 },
      { type: 'item', item: { id: 'arcane_badge', name: "Badge de l'Arcane", rarity: 'mythical' } },
    ],
  },
  {
    id: 'story_level_50',
    name: 'Maître Absolu',
    description: 'Atteins le niveau 50',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.LEVEL,
    target: 1,
    storyOrder: 21,
    prerequisites: ['story_boss_dimension'],
    rewards: [
      { type: 'xp', amount: 6000 },
      { type: 'crystals', amount: 3000 },
      { type: 'item', item: { id: 'absolute_badge', name: 'Badge Absolu', rarity: 'mythical' } },
    ],
  },
  {
    id: 'story_collect_50',
    name: 'Collectionneur Ultime',
    description: 'Capture 50 Échos différents',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.COLLECTION,
    target: 50,
    storyOrder: 22,
    prerequisites: ['story_level_50'],
    rewards: [
      { type: 'xp', amount: 4000 },
      { type: 'crystals', amount: 2000 },
      { type: 'item', item: { id: 'ultimate_badge', name: 'Badge Ultime', rarity: 'mythical' } },
    ],
  },
];

// Classe principale du système de quêtes
export class QuestSystem {
  constructor() {
    this.dailyQuests = [];
    this.storyQuests = [];
    this.lastDailyReset = null;
    this.initialized = false;
  }

  // Initialisation du système
  init() {
    if (this.initialized) {
      return;
    }

    // Charger les quêtes d'histoire
    this.loadStoryQuests();

    // Vérifier et générer les quêtes quotidiennes
    this.checkDailyReset();

    // Écouter les événements du jeu
    this.setupEventListeners();

    this.initialized = true;
    EventBus.emit('quest:systemInitialized', this);
  }

  // Charge les quêtes d'histoire
  loadStoryQuests() {
    this.storyQuests = STORY_QUEST_TEMPLATES.map((template) => new Quest(template));
  }

  // Vérifie si un reset quotidien est nécessaire
  checkDailyReset() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!this.lastDailyReset || this.lastDailyReset < today) {
      this.generateDailyQuests();
      this.lastDailyReset = today;
      EventBus.emit('quest:dailyReset', this.dailyQuests);
    }
  }

  // Génère les quêtes quotidiennes
  generateDailyQuests() {
    // Sélectionner 3 quêtes quotidiennes aléatoires
    const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    this.dailyQuests = selected.map((template) => new Quest(template));
  }

  // Configure les écouteurs d'événements
  setupEventListeners() {
    // Capture d'Échos
    EventBus.on('echo:captured', (echo) => {
      this.updateQuests(QUEST_CATEGORIES.CAPTURE, { type: echo.type });
    });

    // Montée de niveau
    EventBus.on('echo:levelUp', (echo) => {
      this.updateQuests(QUEST_CATEGORIES.LEVEL, { level: echo.level });
    });

    // Victoire en combat
    EventBus.on('combat:victory', () => {
      this.updateQuests(QUEST_CATEGORIES.COMBAT);
    });

    // Minage de cristaux
    EventBus.on('mine:crystal', () => {
      this.updateQuests(QUEST_CATEGORIES.MINE);
    });

    // Défaite de boss
    EventBus.on('boss:defeated', (boss) => {
      this.updateQuests(QUEST_CATEGORIES.BOSS, { bossId: boss.id });
    });
  }

  _isQuestEligible(quest, category, data) {
    if (quest.category !== category || quest.completed) {
      return false;
    }
    if (quest.type === QUEST_TYPES.STORY && quest.prerequisites.length > 0) {
      const prerequisitesMet = quest.prerequisites.every((prereqId) => {
        const prereqQuest = this.storyQuests.find((q) => q.id === prereqId);
        return prereqQuest?.completed;
      });
      if (!prerequisitesMet) {
        return false;
      }
    }
    return this._matchesCategoryFilter(quest, category, data);
  }

  _matchesCategoryFilter(quest, category, data) {
    if (category === QUEST_CATEGORIES.CAPTURE) {
      // Vérifier les types spécifiques pour les quêtes de capture
      const typeFilters = {
        flore: 'FLORE',
        shadow: 'OMBRE',
        terre: 'TERRE',
        cristal: 'CRISTAL',
        ocean: 'OCEAN',
        feu: 'FEU',
        lumiere: 'LUMIERE',
        arcane: 'ARCANE',
      };

      for (const [keyword, type] of Object.entries(typeFilters)) {
        if (quest.id.includes(keyword) && data.type !== type) {
          return false;
        }
      }
    }
    if (category === QUEST_CATEGORIES.LEVEL) {
      // Vérifier les niveaux spécifiques pour les quêtes de niveau
      const levelFilters = {
        level_10: 10,
        level_15: 15,
        level_20: 20,
        level_30: 30,
        level_40: 40,
        level_50: 50,
      };

      for (const [keyword, requiredLevel] of Object.entries(levelFilters)) {
        if (quest.id.includes(keyword) && data.level < requiredLevel) {
          return false;
        }
      }
    }
    return true;
  }

  // Met à jour les quêtes d'une catégorie
  updateQuests(category, data = {}) {
    const allQuests = [...this.dailyQuests, ...this.storyQuests];
    for (const quest of allQuests) {
      if (this._isQuestEligible(quest, category, data)) {
        quest.updateProgress(1);
      }
    }
  }

  // Récupère toutes les quêtes actives
  getActiveQuests() {
    const activeDaily = this.dailyQuests.filter((q) => !q.claimed);
    const activeStory = this.storyQuests.filter((q) => {
      if (q.claimed) {
        return false;
      }

      // Vérifier si les prérequis sont remplis
      if (q.prerequisites.length > 0) {
        const prerequisitesMet = q.prerequisites.every((prereqId) => {
          const prereqQuest = this.storyQuests.find((sq) => sq.id === prereqId);
          return prereqQuest?.completed;
        });

        // Si les prérequis sont remplis et la quête n'est pas encore complétée,
        // vérifier si l'objectif est déjà accompli
        if (prerequisitesMet && !q.completed) {
          this.checkExistingProgress(q);
        }

        return prerequisitesMet;
      }

      return q.storyOrder === 1; // Première quête d'histoire toujours visible
    });

    return { daily: activeDaily, story: activeStory };
  }

  _completeQuest(quest) {
    quest.current = quest.target;
    quest.completed = true;
    EventBus.emit('quest:completed', quest);
  }

  _checkCaptureProgress(quest) {
    if (!Game.state?.caughtEchoes) {
      return;
    }

    // Vérifier les captures de types spécifiques
    const typeChecks = {
      shadow: 'OMBRE',
      flore: 'FLORE',
      terre: 'TERRE',
      cristal: 'CRISTAL',
      ocean: 'OCEAN',
      feu: 'FEU',
      lumiere: 'LUMIERE',
      arcane: 'ARCANE',
    };

    for (const [keyword, type] of Object.entries(typeChecks)) {
      if (quest.id.includes(keyword)) {
        const hasType = Array.from(Game.state.caughtEchoes).some((echoId) => {
          const echoData = getEchoById(echoId);
          return echoData && echoData.type === type;
        });
        if (hasType) {
          this._completeQuest(quest);
        }
        return;
      }
    }
  }

  _checkLevelProgress(quest) {
    if (!Game.state?.party) {
      return;
    }

    // Vérifier les niveaux spécifiques
    const levelChecks = {
      level_10: 10,
      level_15: 15,
      level_20: 20,
      level_30: 30,
      level_40: 40,
      level_50: 50,
    };

    for (const [keyword, requiredLevel] of Object.entries(levelChecks)) {
      if (quest.id.includes(keyword)) {
        const hasLevel = Game.state.party.some((echo) => echo.level >= requiredLevel);
        if (hasLevel) {
          this._completeQuest(quest);
        }
        return;
      }
    }
  }

  _checkCollectionProgress(quest) {
    if (!Game.state?.caughtEchoes) {
      return;
    }

    // Vérifier les collections spécifiques
    const collectionChecks = {
      collect_10: 10,
      collect_25: 25,
      collect_40: 40,
      collect_50: 50,
    };

    for (const [keyword, requiredCount] of Object.entries(collectionChecks)) {
      if (quest.id.includes(keyword)) {
        if (Game.state.caughtEchoes.size >= requiredCount) {
          this._completeQuest(quest);
        }
        return;
      }
    }
  }

  _checkBossProgress(quest) {
    if (!Game.state?.regions) {
      return;
    }

    // Vérifier les boss de toutes les régions
    const bossChecks = {
      boss_forest: 'foret',
      boss_montagnes: 'montagnes',
      boss_ocean: 'ocean',
      boss_volcan: 'volcan',
      boss_cave: 'foret_maudite',
      boss_ciel: 'ciel_ethere',
      boss_dimension: 'dimension_arcane',
    };

    for (const [keyword, regionId] of Object.entries(bossChecks)) {
      if (quest.id.includes(keyword)) {
        const region = Game.state.regions.find((r) => r.id === regionId);
        if (region?.bossDefeated) {
          this._completeQuest(quest);
        }
        return;
      }
    }
  }

  // Vérifie si le progrès existe déjà pour une quête
  checkExistingProgress(quest) {
    if (quest.completed) {
      return;
    }
    const categoryCheckers = {
      [QUEST_CATEGORIES.CAPTURE]: () => this._checkCaptureProgress(quest),
      [QUEST_CATEGORIES.LEVEL]: () => this._checkLevelProgress(quest),
      [QUEST_CATEGORIES.COLLECTION]: () => this._checkCollectionProgress(quest),
      [QUEST_CATEGORIES.BOSS]: () => this._checkBossProgress(quest),
    };
    const checker = categoryCheckers[quest.category];
    if (checker) {
      checker();
    }
  }

  // Récupère les quêtes complétées non réclamées
  getCompletedUnclaimedQuests() {
    const allQuests = [...this.dailyQuests, ...this.storyQuests];
    return allQuests.filter((q) => q.completed && !q.claimed);
  }

  // Réclame les récompenses d'une quête
  claimQuestRewards(questId) {
    const allQuests = [...this.dailyQuests, ...this.storyQuests];
    const quest = allQuests.find((q) => q.id === questId);

    if (quest?.completed && !quest.claimed) {
      return quest.claimRewards();
    }

    return false;
  }

  // Sérialisation pour la sauvegarde
  toJSON() {
    return {
      dailyQuests: this.dailyQuests.map((q) => q.toJSON()),
      storyQuests: this.storyQuests.map((q) => q.toJSON()),
      lastDailyReset: this.lastDailyReset,
    };
  }

  // Chargement depuis la sauvegarde
  fromJSON(data) {
    if (!data) {
      return;
    }

    // Restaurer les quêtes quotidiennes
    if (data.dailyQuests) {
      this.dailyQuests = data.dailyQuests
        .map((savedQuest) => {
          const template = DAILY_QUEST_TEMPLATES.find((t) => t.id === savedQuest.id);
          return template ? Quest.fromJSON(savedQuest, template) : null;
        })
        .filter((q) => q !== null);
    }

    // Restaurer les quêtes d'histoire
    if (data.storyQuests) {
      // Charger depuis la sauvegarde
      this.storyQuests = data.storyQuests
        .map((savedQuest) => {
          const template = STORY_QUEST_TEMPLATES.find((t) => t.id === savedQuest.id);
          return template ? Quest.fromJSON(savedQuest, template) : null;
        })
        .filter((q) => q !== null);

      // Ajouter les quêtes d'histoire manquantes (nouvelles quêtes ajoutées après la sauvegarde)
      for (const template of STORY_QUEST_TEMPLATES) {
        const existingQuest = this.storyQuests.find((q) => q.id === template.id);
        if (!existingQuest) {
          this.storyQuests.push(new Quest(template));
        }
      }
    } else {
      // Pas de sauvegarde de quêtes d'histoire, initialiser depuis les templates
      this.loadStoryQuests();
    }

    this.lastDailyReset = data.lastDailyReset;

    // Vérifier si un reset quotidien est nécessaire seulement si pas de quêtes quotidiennes sauvegardées
    if (!data.dailyQuests || data.dailyQuests.length === 0) {
      this.checkDailyReset();
    }
  }
}

// Instance singleton
export const questSystem = new QuestSystem();
