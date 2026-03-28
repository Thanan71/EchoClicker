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

  // Réclame les récompenses
  claimRewards() {
    if (!this.completed || this.claimed) {
      return false;
    }

    this.claimed = true;

    // Appliquer les récompenses
    this.rewards.forEach((reward) => {
      switch (reward.type) {
        case 'xp':
          if (Game.state?.player) {
            Game.state.player.xp = (Game.state.player.xp || 0) + reward.amount;
          }
          break;
        case 'crystals':
          if (Game.state) {
            Game.state.crystals = (Game.state.crystals || 0) + reward.amount;
          }
          break;
        case 'energy':
          if (Game.state) {
            Game.state.energy = (Game.state.energy || 0) + reward.amount;
          }
          break;
        case 'item':
          // Logique pour ajouter un objet rare
          if (Game.state?.inventory) {
            Game.state.inventory.push(reward.item);
          }
          break;
      }
    });

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
  {
    id: 'story_boss_forest',
    name: 'Le Gardien de la Forêt',
    description: 'Bat le boss de la Forêt',
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
    id: 'story_capture_shadow',
    name: "L'Ombre Capturée",
    description: 'Capture ton premier Écho de type Ombre',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.CAPTURE,
    target: 1,
    storyOrder: 2,
    prerequisites: ['story_boss_forest'],
    rewards: [
      { type: 'xp', amount: 300 },
      { type: 'crystals', amount: 150 },
    ],
  },
  {
    id: 'story_level_20',
    name: 'Maître en Devenir',
    description: 'Atteins le niveau 20',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.LEVEL,
    target: 1,
    storyOrder: 3,
    prerequisites: ['story_capture_shadow'],
    rewards: [
      { type: 'xp', amount: 1000 },
      { type: 'crystals', amount: 500 },
      { type: 'item', item: { id: 'master_badge', name: 'Badge de Maître', rarity: 'epic' } },
    ],
  },
  {
    id: 'story_collect_10',
    name: 'Collectionneur Avisé',
    description: 'Capture 10 Échos différents',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.COLLECTION,
    target: 10,
    storyOrder: 4,
    prerequisites: ['story_level_20'],
    rewards: [
      { type: 'xp', amount: 800 },
      { type: 'crystals', amount: 400 },
    ],
  },
  {
    id: 'story_boss_cave',
    name: "L'Obscurité Vaincue",
    description: 'Bat le boss de la Caverne',
    type: QUEST_TYPES.STORY,
    category: QUEST_CATEGORIES.BOSS,
    target: 1,
    storyOrder: 5,
    prerequisites: ['story_collect_10'],
    rewards: [
      { type: 'xp', amount: 1500 },
      { type: 'crystals', amount: 750 },
      {
        type: 'item',
        item: { id: 'cave_badge', name: 'Badge de la Caverne', rarity: 'legendary' },
      },
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

  // Met à jour les quêtes d'une catégorie
  updateQuests(category, data = {}) {
    const allQuests = [...this.dailyQuests, ...this.storyQuests];

    allQuests.forEach((quest) => {
      if (quest.category === category && !quest.completed) {
        // Vérifier les prérequis pour les quêtes d'histoire
        if (quest.type === QUEST_TYPES.STORY && quest.prerequisites.length > 0) {
          const prerequisitesMet = quest.prerequisites.every((prereqId) => {
            const prereqQuest = this.storyQuests.find((q) => q.id === prereqId);
            return prereqQuest?.completed;
          });

          if (!prerequisitesMet) {
            return;
          }
        }

        // Logique spécifique par catégorie
        switch (category) {
          case QUEST_CATEGORIES.CAPTURE: {
            if (quest.id.includes('flore') && data.type !== 'FLORE') {
              return;
            }
            if (quest.id.includes('shadow') && data.type !== 'OMBRE') {
              return;
            }
            break;
          }
          case QUEST_CATEGORIES.LEVEL: {
            if (quest.id.includes('level_10') && data.level < 10) {
              return;
            }
            if (quest.id.includes('level_20') && data.level < 20) {
              return;
            }
            break;
          }
        }

        quest.updateProgress(1);
      }
    });
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

  // Vérifie si le progrès existe déjà pour une quête
  checkExistingProgress(quest) {
    if (quest.completed) {
      return;
    }

    // Vérifier selon la catégorie de la quête
    switch (quest.category) {
      case QUEST_CATEGORIES.CAPTURE:
        // Vérifier si le joueur a déjà capturé un Echo du type requis
        if (quest.id.includes('shadow')) {
          // Vérifier si un Echo de type Ombre a été capturé
          if (Game.state?.caughtEchoes) {
            const hasShadowEcho = Array.from(Game.state.caughtEchoes).some((echoId) => {
              const echoData = getEchoById(echoId);
              return echoData && echoData.type === 'OMBRE';
            });

            if (hasShadowEcho) {
              quest.current = quest.target;
              quest.completed = true;
              EventBus.emit('quest:completed', quest);
            }
          }
        }
        break;

      case QUEST_CATEGORIES.LEVEL:
        // Vérifier si le joueur a déjà un Echo au niveau requis
        if (quest.id.includes('level_20')) {
          if (Game.state?.party) {
            const hasLevel20 = Game.state.party.some((echo) => echo.level >= 20);
            if (hasLevel20) {
              quest.current = quest.target;
              quest.completed = true;
              EventBus.emit('quest:completed', quest);
            }
          }
        }
        break;

      case QUEST_CATEGORIES.COLLECTION:
        // Vérifier si le joueur a déjà capturé le nombre requis d'Échos différents
        if (quest.id.includes('collect_10')) {
          if (Game.state?.caughtEchoes) {
            const uniqueCount = Game.state.caughtEchoes.size;
            if (uniqueCount >= 10) {
              quest.current = quest.target;
              quest.completed = true;
              EventBus.emit('quest:completed', quest);
            }
          }
        }
        break;

      case QUEST_CATEGORIES.BOSS: {
        // Vérifier si le boss a déjà été vaincu
        if (quest.id.includes('boss_forest')) {
          if (Game.state?.regions) {
            const region = Game.state.regions.find((r) => r.id === 'foret');
            if (region?.bossDefeated) {
              quest.current = quest.target;
              quest.completed = true;
              EventBus.emit('quest:completed', quest);
            }
          }
        }
        if (quest.id.includes('boss_cave')) {
          if (Game.state?.regions) {
            const region = Game.state.regions.find((r) => r.id === 'foret_maudite');
            if (region?.bossDefeated) {
              quest.current = quest.target;
              quest.completed = true;
              EventBus.emit('quest:completed', quest);
            }
          }
        }
        break;
      }
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
      STORY_QUEST_TEMPLATES.forEach((template) => {
        const existingQuest = this.storyQuests.find((q) => q.id === template.id);
        if (!existingQuest) {
          this.storyQuests.push(new Quest(template));
        }
      });
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
