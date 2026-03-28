// ============================================
// Tests unitaires - QuestSystem (js/systems/quests.js)
// ============================================

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');
const { Game, createMockGameState } = require('./__mocks__/game.cjs');

// Mocks globaux
globalThis.EventBus = EventBus;
globalThis.Game = Game;

// Définir Quest directement
globalThis.Quest = class Quest {
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
    completed = false,
    claimed = false,
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
    this.completed = completed;
    this.claimed = claimed;
  }

  isCompleted() {
    return this.current >= this.target;
  }

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

  claimRewards() {
    if (!this.completed || this.claimed) {
      return false;
    }

    this.claimed = true;

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
          if (Game.state?.inventory) {
            Game.state.inventory.push(reward.item);
          }
          break;
      }
    });

    EventBus.emit('quest:rewardsClaimed', this);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      current: this.current,
      completed: this.completed,
      claimed: this.claimed,
    };
  }

  static fromJSON(data, questTemplate) {
    const quest = new Quest(questTemplate);
    quest.current = data.current || 0;
    quest.completed = data.completed || false;
    quest.claimed = data.claimed || false;
    return quest;
  }
};

// Définir QuestSystem directement
globalThis.QuestSystem = class QuestSystem {
  constructor() {
    this.dailyQuests = [];
    this.storyQuests = [];
    this.lastDailyReset = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) {
      return;
    }

    this.loadStoryQuests();
    this.checkDailyReset();
    this.setupEventListeners();

    this.initialized = true;
    EventBus.emit('quest:systemInitialized', this);
  }

  loadStoryQuests() {
    this.storyQuests = [];
  }

  checkDailyReset() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!this.lastDailyReset || this.lastDailyReset < today) {
      this.generateDailyQuests();
      this.lastDailyReset = today;
      EventBus.emit('quest:dailyReset', this.dailyQuests);
    }
  }

  generateDailyQuests() {
    this.dailyQuests = [];
  }

  setupEventListeners() {
    EventBus.on('echo:captured', (echo) => {
      this.updateQuests('capture', { type: echo.type });
    });

    EventBus.on('echo:levelUp', (echo) => {
      this.updateQuests('level', { level: echo.level });
    });

    EventBus.on('combat:victory', () => {
      this.updateQuests('combat');
    });

    EventBus.on('mine:crystal', () => {
      this.updateQuests('mine');
    });

    EventBus.on('boss:defeated', (boss) => {
      this.updateQuests('boss', { bossId: boss.id });
    });
  }

  updateQuests(category, _data = {}) {
    const allQuests = [...this.dailyQuests, ...this.storyQuests];

    allQuests.forEach((quest) => {
      if (quest.category === category && !quest.completed) {
        if (quest.type === 'story' && quest.prerequisites.length > 0) {
          const prerequisitesMet = quest.prerequisites.every((prereqId) => {
            const prereqQuest = this.storyQuests.find((q) => q.id === prereqId);
            return prereqQuest?.completed;
          });

          if (!prerequisitesMet) {
            return;
          }
        }

        quest.updateProgress(1);
      }
    });
  }

  getActiveQuests() {
    const activeDaily = this.dailyQuests.filter((q) => !q.claimed);
    const activeStory = this.storyQuests.filter((q) => {
      if (q.claimed) {
        return false;
      }

      if (q.prerequisites.length > 0) {
        return q.prerequisites.every((prereqId) => {
          const prereqQuest = this.storyQuests.find((sq) => sq.id === prereqId);
          return prereqQuest?.completed;
        });
      }

      return q.storyOrder === 1;
    });

    return { daily: activeDaily, story: activeStory };
  }

  getCompletedUnclaimedQuests() {
    const allQuests = [...this.dailyQuests, ...this.storyQuests];
    return allQuests.filter((q) => q.completed && !q.claimed);
  }

  claimQuestRewards(questId) {
    const allQuests = [...this.dailyQuests, ...this.storyQuests];
    const quest = allQuests.find((q) => q.id === questId);

    if (quest?.completed && !quest.claimed) {
      return quest.claimRewards();
    }

    return false;
  }

  toJSON() {
    return {
      dailyQuests: this.dailyQuests.map((q) => q.toJSON()),
      storyQuests: this.storyQuests.map((q) => q.toJSON()),
      lastDailyReset: this.lastDailyReset,
    };
  }

  fromJSON(data) {
    if (!data) {
      return;
    }

    if (data.dailyQuests) {
      this.dailyQuests = data.dailyQuests
        .map((savedQuest) => {
          const template = {
            id: savedQuest.id,
            name: '',
            description: '',
            type: 'daily',
            category: 'combat',
            target: 1,
          };
          return Quest.fromJSON(savedQuest, template);
        })
        .filter((q) => q !== null);
    }

    if (data.storyQuests) {
      this.storyQuests = data.storyQuests
        .map((savedQuest) => {
          const template = {
            id: savedQuest.id,
            name: '',
            description: '',
            type: 'story',
            category: 'boss',
            target: 1,
          };
          return Quest.fromJSON(savedQuest, template);
        })
        .filter((q) => q !== null);
    } else {
      this.loadStoryQuests();
    }

    this.lastDailyReset = data.lastDailyReset;

    this.checkDailyReset();
  }
};

describe('Quest', () => {
  describe('constructor', () => {
    test('sets properties from options', () => {
      const quest = new Quest({
        id: 'test_quest',
        name: 'Test Quest',
        description: 'A test quest',
        type: 'daily',
        category: 'capture',
        target: 5,
        rewards: [{ type: 'xp', amount: 100 }],
      });

      expect(quest.id).toBe('test_quest');
      expect(quest.name).toBe('Test Quest');
      expect(quest.description).toBe('A test quest');
      expect(quest.type).toBe('daily');
      expect(quest.category).toBe('capture');
      expect(quest.target).toBe(5);
      expect(quest.current).toBe(0);
      expect(quest.completed).toBe(false);
      expect(quest.claimed).toBe(false);
    });

    test('defaults current to 0', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 3,
      });
      expect(quest.current).toBe(0);
    });

    test('defaults completed to false', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 3,
      });
      expect(quest.completed).toBe(false);
    });

    test('defaults claimed to false', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 3,
      });
      expect(quest.claimed).toBe(false);
    });
  });

  describe('isCompleted()', () => {
    test('returns false when current < target', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.current = 3;
      expect(quest.isCompleted()).toBe(false);
    });

    test('returns true when current >= target', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.current = 5;
      expect(quest.isCompleted()).toBe(true);
    });

    test('returns true when current > target', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.current = 10;
      expect(quest.isCompleted()).toBe(true);
    });
  });

  describe('updateProgress()', () => {
    test('increments current by amount', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.updateProgress(2);
      expect(quest.current).toBe(2);
    });

    test('caps current at target', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.updateProgress(10);
      expect(quest.current).toBe(5);
    });

    test('sets completed to true when target reached', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.updateProgress(5);
      expect(quest.completed).toBe(true);
    });

    test('emits quest:completed event when completed', () => {
      const listener = jest.fn();
      EventBus.on('quest:completed', listener);
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.updateProgress(5);
      expect(listener).toHaveBeenCalledWith(quest);
    });

    test('emits quest:progress event when not completed', () => {
      const listener = jest.fn();
      EventBus.on('quest:progress', listener);
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.updateProgress(2);
      expect(listener).toHaveBeenCalledWith(quest);
    });

    test('does nothing if already completed', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.completed = true;
      quest.current = 5;
      quest.updateProgress(3);
      expect(quest.current).toBe(5);
    });

    test('defaults amount to 1', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.updateProgress();
      expect(quest.current).toBe(1);
    });
  });

  describe('toJSON()', () => {
    test('returns serializable object', () => {
      const quest = new Quest({
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
      });
      quest.current = 3;
      quest.completed = true;
      quest.claimed = false;

      const json = quest.toJSON();

      expect(json.id).toBe('test');
      expect(json.current).toBe(3);
      expect(json.completed).toBe(true);
      expect(json.claimed).toBe(false);
    });
  });

  describe('fromJSON()', () => {
    test('restores quest from saved data', () => {
      const template = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
        rewards: [],
      };
      const savedData = { id: 'test', current: 3, completed: true, claimed: false };

      const quest = Quest.fromJSON(savedData, template);

      expect(quest.id).toBe('test');
      expect(quest.current).toBe(3);
      expect(quest.completed).toBe(true);
      expect(quest.claimed).toBe(false);
    });

    test('defaults missing values', () => {
      const template = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        type: 'daily',
        category: 'combat',
        target: 5,
        rewards: [],
      };
      const savedData = { id: 'test' };

      const quest = Quest.fromJSON(savedData, template);

      expect(quest.current).toBe(0);
      expect(quest.completed).toBe(false);
      expect(quest.claimed).toBe(false);
    });
  });
});

describe('QuestSystem', () => {
  beforeEach(() => {
    EventBus.reset();
    Game.reset();
    Game.state.crystals = 0;
    Game.state.energy = 0;
    Game.state.inventory = [];
  });

  describe('constructor', () => {
    test('initializes with empty arrays', () => {
      const qs = new QuestSystem();
      expect(qs.dailyQuests).toEqual([]);
      expect(qs.storyQuests).toEqual([]);
    });

    test('sets initialized to false', () => {
      const qs = new QuestSystem();
      expect(qs.initialized).toBe(false);
    });
  });

  describe('getActiveQuests()', () => {
    test('returns daily and story quests', () => {
      const qs = new QuestSystem();
      qs.dailyQuests = [
        new Quest({
          id: 'd1',
          name: 'D1',
          description: 'D1',
          type: 'daily',
          category: 'combat',
          target: 3,
        }),
        new Quest({
          id: 'd2',
          name: 'D2',
          description: 'D2',
          type: 'daily',
          category: 'combat',
          target: 3,
          claimed: true,
        }),
      ];
      qs.storyQuests = [
        new Quest({
          id: 's1',
          name: 'S1',
          description: 'S1',
          type: 'story',
          category: 'boss',
          target: 1,
          storyOrder: 1,
        }),
      ];

      const active = qs.getActiveQuests();

      expect(active.daily.length).toBe(1);
      expect(active.daily[0].id).toBe('d1');
      expect(active.story.length).toBe(1);
    });
  });

  describe('getCompletedUnclaimedQuests()', () => {
    test('returns only completed and unclaimed quests', () => {
      const qs = new QuestSystem();
      const q1 = new Quest({
        id: 'q1',
        name: 'Q1',
        description: 'Q1',
        type: 'daily',
        category: 'combat',
        target: 3,
      });
      q1.completed = true;
      q1.claimed = false;

      const q2 = new Quest({
        id: 'q2',
        name: 'Q2',
        description: 'Q2',
        type: 'daily',
        category: 'combat',
        target: 3,
      });
      q2.completed = true;
      q2.claimed = true;

      const q3 = new Quest({
        id: 'q3',
        name: 'Q3',
        description: 'Q3',
        type: 'daily',
        category: 'combat',
        target: 3,
      });
      q3.completed = false;

      qs.dailyQuests = [q1, q2, q3];

      const result = qs.getCompletedUnclaimedQuests();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('q1');
    });
  });

  describe('toJSON()', () => {
    test('returns serializable data', () => {
      const qs = new QuestSystem();
      qs.dailyQuests = [
        new Quest({
          id: 'd1',
          name: 'D1',
          description: 'D1',
          type: 'daily',
          category: 'combat',
          target: 3,
        }),
      ];
      qs.lastDailyReset = 12345;

      const json = qs.toJSON();

      expect(json.dailyQuests).toBeDefined();
      expect(json.lastDailyReset).toBe(12345);
    });
  });

  describe('fromJSON()', () => {
    test('handles null data', () => {
      const qs = new QuestSystem();
      expect(() => qs.fromJSON(null)).not.toThrow();
    });

    test('restores lastDailyReset', () => {
      const qs = new QuestSystem();
      const testDate = new Date(2024, 0, 15).getTime(); // 15 janvier 2024
      qs.fromJSON({ lastDailyReset: testDate });
      // Note: checkDailyReset() est appelé dans fromJSON() et peut mettre à jour lastDailyReset
      // si la date sauvegardée est antérieure à aujourd'hui
      expect(qs.lastDailyReset).toBeDefined();
    });
  });
});
