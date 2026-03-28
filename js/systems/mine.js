// ============================================
// ÉchoClicker - Système de Mine Souterraine
// ============================================

import { GAME_CONFIG } from '../data/game-config.js';

export const Mine = {
    grid: [],
    gridSize: 48,
    energy: 100,
    maxEnergy: 100,
    crystalsFound: 0,
    currentTool: 'pick',
    regenTimer: 0,

    // Dépendances injectées (DIP)
    _game: null,
    _ui: null,
    _eventBus: null,

    tools: {
        pick: { name: 'Pioche', emoji: '⛏️', cost: 1, power: 1, area: 1 },
        bomb: { name: 'Bombe', emoji: '💣', cost: 5, power: 3, area: 3 },
        radar: { name: 'Radar', emoji: '📡', cost: 10, power: 0, area: 5, reveal: true },
    },
    rewards: {
        crystal: { emoji: '💎', chance: 15, value: 1 },
        gold: { emoji: '💰', chance: 25, value: 5 },
        shard: { emoji: '✨', chance: 10, value: 1 },
        gem: { emoji: '💠', chance: 5, value: 3 },
        rock: { emoji: '🪨', chance: 45, value: 0 },
    },

    /**
     * Initialise les dépendances et la grille de mine.
     * @param {IGameStateProvider} gameRef - Référence au provider d'état de jeu
     * @param {IUIRenderer} uiRef - Référence au renderer UI
     * @param {IEventBus} eventBusRef - Référence au bus d'événements
     */
    init(gameRef, uiRef, eventBusRef) {
        this._game = gameRef;
        this._ui = uiRef;
        this._eventBus = eventBusRef;
        this.generateGrid();
        this.setupEventListeners();
    },

    generateGrid() {
        this.grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid.push({
                dug: false,
                revealed: false,
                reward: this.getRandomReward(),
                depth: Math.floor(Math.random() * 3),
            });
        }
    },

    getRandomReward() {
        const rand = Math.random() * 100;
        let cumulative = 0;
        for (const [key, reward] of Object.entries(this.rewards)) {
            cumulative += reward.chance;
            if (rand < cumulative) return key;
        }
        return 'rock';
    },

    setupEventListeners() {
        document.querySelectorAll('.tool-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
    },

    dig(index) {
        if (index < 0 || index >= this.gridSize) return;
        const tile = this.grid[index];
        if (tile.dug) return;

        const tool = this.tools[this.currentTool];
        if (this.energy < tool.cost) {
            this._ui.toast(i18n.t('mine.energyNotEnough'), 'error');
            return;
        }

        this.energy -= tool.cost;

        if (tool.reveal) {
            this.revealArea(index, tool.area);
        } else {
            this.digArea(index, tool.area);
        }

        this.updateDisplay();
        this.checkEnergy();
    },

    digArea(center, radius) {
        const positions = this.getAreaPositions(center, radius);
        positions.forEach((pos) => {
            if (pos >= 0 && pos < this.gridSize) {
                const tile = this.grid[pos];
                if (!tile.dug) {
                    tile.dug = true;
                    this.collectReward(tile, pos);
                }
            }
        });
    },

    revealArea(center, radius) {
        const positions = this.getAreaPositions(center, radius);
        positions.forEach((pos) => {
            if (pos >= 0 && pos < this.gridSize) {
                this.grid[pos].revealed = true;
            }
        });
    },

    getAreaPositions(center, radius) {
        const positions = [center];
        const cols = 8;
        const row = Math.floor(center / cols);
        const col = center % cols;

        for (let r = -radius; r <= radius; r++) {
            for (let c = -radius; c <= radius; c++) {
                if (r === 0 && c === 0) continue;
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < cols) {
                    positions.push(newRow * cols + newCol);
                }
            }
        }
        return positions;
    },

    collectReward(tile, index) {
        const reward = this.rewards[tile.reward];
        if (reward.value > 0) {
            if (tile.reward === 'crystal') {
                this._game.state.crystals += reward.value;
                this.crystalsFound += reward.value;
            } else if (tile.reward === 'shard') {
                this._game.state.shards += reward.value;
            } else if (tile.reward === 'gold') {
                this._game.state.energy += reward.value;
            } else if (tile.reward === 'gem') {
                this._game.state.crystals += reward.value;
            }
            this._ui.toast(i18n.t('mine.found', { item: `${reward.emoji} +${reward.value}` }), 'success');
        }
    },

    checkEnergy() {
        if (this.energy <= 0) {
            this._ui.toast(i18n.t('mine.energyDepletedWait'), 'warning');
        }
    },

    update(dt) {
        this.regenTimer += dt * 1000;
        if (this.regenTimer >= GAME_CONFIG.MINE_ENERGY_REGEN_INTERVAL) {
            this.regenTimer -= GAME_CONFIG.MINE_ENERGY_REGEN_INTERVAL;
            if (this.energy < this.maxEnergy) {
                this.energy = Math.min(this.maxEnergy, this.energy + GAME_CONFIG.MINE_ENERGY_REGEN_RATE);
                this.updateDisplay();
            }
        }
    },

    rechargeEnergy(amount = 50) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        this.updateDisplay();
        this._ui.toast(i18n.t('mine.rechargeSuccess', { amount }), 'success');
    },

    reset() {
        this.energy = this.maxEnergy;
        this.crystalsFound = 0;
        this.generateGrid();
        this.updateDisplay();
    },

    updateDisplay() {
        const grid = document.getElementById('mine-grid');
        if (!grid) return;

        let html = '';
        this.grid.forEach((tile, i) => {
            let content = '🟫';
            let classes = 'mine-tile';

            if (tile.dug) {
                classes += ' dug';
                content = this.rewards[tile.reward].emoji;
            } else if (tile.revealed) {
                classes += ' revealed';
                content = this.rewards[tile.reward].emoji;
            }

            html += `<div class="${classes}" data-tile-index="${i}">${content}</div>`;
        });
        grid.innerHTML = html;

        // Add event listeners to mine tiles
        document.querySelectorAll('.mine-tile[data-tile-index]').forEach((tile) => {
            tile.addEventListener('click', () => {
                const index = parseInt(tile.dataset.tileIndex);
                this.dig(index);
            });
        });

        const energyEl = document.getElementById('mine-energy');
        if (energyEl) energyEl.textContent = this.energy;

        const crystalsEl = document.getElementById('mine-crystals');
        if (crystalsEl) crystalsEl.textContent = this.crystalsFound;
    },

    toJSON() {
        return {
            grid: this.grid,
            energy: this.energy,
            crystalsFound: this.crystalsFound,
            regenTimer: this.regenTimer,
        };
    },

    fromJSON(data) {
        if (data) {
            this.grid = data.grid || this.grid;
            this.energy = data.energy ?? this.maxEnergy;
            this.crystalsFound = data.crystalsFound ?? 0;
            this.regenTimer = data.regenTimer ?? 0;
        }
    },
};
