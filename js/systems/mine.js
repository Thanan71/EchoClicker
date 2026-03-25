// ============================================
// ÉchoClicker - Système de Mine Souterraine
// ============================================

const Mine = {
    grid: [],
    gridSize: 48,
    energy: 100,
    maxEnergy: 100,
    crystalsFound: 0,
    currentTool: 'pick',
    tools: {
        pick: { name: 'Pioche', emoji: '⛏️', cost: 1, power: 1, area: 1 },
        bomb: { name: 'Bombe', emoji: '💣', cost: 5, power: 3, area: 3 },
        radar: { name: 'Radar', emoji: '📡', cost: 10, power: 0, area: 5, reveal: true }
    },
    rewards: {
        crystal: { emoji: '💎', chance: 15, value: 1 },
        gold: { emoji: '💰', chance: 25, value: 5 },
        shard: { emoji: '✨', chance: 10, value: 1 },
        gem: { emoji: '💠', chance: 5, value: 3 },
        rock: { emoji: '🪨', chance: 45, value: 0 }
    },

    init() {
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
                depth: Math.floor(Math.random() * 3)
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
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
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
            UI.toast('Pas assez d\'énergie de mine !', 'error');
            return;
        }

        this.energy -= tool.cost;

        if (tool.reveal) {
            // Radar révèle les tuiles adjacentes
            this.revealArea(index, tool.area);
        } else {
            // Pioche/Bombe creuse
            this.digArea(index, tool.area);
        }

        this.updateDisplay();
        this.checkEnergy();
    },

    digArea(center, radius) {
        const positions = this.getAreaPositions(center, radius);
        positions.forEach(pos => {
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
        positions.forEach(pos => {
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
                Game.state.crystals += reward.value;
                this.crystalsFound += reward.value;
            } else if (tile.reward === 'shard') {
                Game.state.shards += reward.value;
            } else if (tile.reward === 'gold') {
                Game.state.energy += reward.value;
            } else if (tile.reward === 'gem') {
                Game.state.crystals += reward.value;
            }
            UI.toast(`${reward.emoji} +${reward.value} !`, 'success');
        }
    },

    checkEnergy() {
        if (this.energy <= 0) {
            UI.toast('Énergie de mine épuisée ! Attendez ou achetez un rechargement.', 'warning');
        }
    },

    rechargeEnergy(amount = 50) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        this.updateDisplay();
        UI.toast(`⛏️ +${amount} énergie de mine !`, 'success');
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
                content = this.rewards[tile.reward].emoji;
                opacity = 0.6;
            }
            
            html += `<div class="${classes}" onclick="Mine.dig(${i})">${content}</div>`;
        });
        grid.innerHTML = html;

        const energyEl = document.getElementById('mine-energy');
        if (energyEl) energyEl.textContent = this.energy;
        
        const crystalsEl = document.getElementById('mine-crystals');
        if (crystalsEl) crystalsEl.textContent = this.crystalsFound;
    },

    // Sauvegarde
    toJSON() {
        return {
            grid: this.grid,
            energy: this.energy,
            crystalsFound: this.crystalsFound
        };
    },

    fromJSON(data) {
        if (data) {
            this.grid = data.grid || this.grid;
            this.energy = data.energy ?? this.maxEnergy;
            this.crystalsFound = data.crystalsFound ?? 0;
        }
    }
};