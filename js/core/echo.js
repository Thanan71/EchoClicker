// ============================================
// ÉchoClicker - Classe Echo
// ============================================

class Echo {
    constructor(data, level = 1, isPrimordial = false) {
        this.uid = Utils.uid();
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.emoji = data.emoji;
        this.rarity = data.rarity || 'common';
        this.isPrimordial = isPrimordial;
        this.description = data.desc || '';

        // Stats de base
        this.baseHp = data.baseHp;
        this.baseAtk = data.baseAtk;
        this.baseDef = data.baseDef;
        this.baseSpd = data.baseSpd;

        // Niveau & XP
        this.level = level;
        this.xp = 0;
        this.xpToNext = Utils.xpForLevel(level);

        // Stats calculées
        this.recalcStats();

        // HP actuels
        this.hp = this.maxHp;

        // Évolution
        this.evolution = data.evo || null;
    }

    recalcStats() {
        const primMult = this.isPrimordial ? 1.1 : 1;
        this.maxHp  = Math.floor((this.baseHp  + this.level * 3) * primMult);
        this.atk    = Math.floor((this.baseAtk + this.level * 2) * primMult);
        this.def    = Math.floor((this.baseDef + this.level * 2) * primMult);
        this.spd    = Math.floor((this.baseSpd + this.level * 1.5) * primMult);
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    gainXp(amount) {
        if (globalThis.Game && globalThis.Game.state && globalThis.Game.state.boosts && globalThis.Game.state.boosts.xp) amount = Math.floor(amount * 1.5);
        this.xp += amount;
        const leveledUp = [];
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Utils.xpForLevel(this.level);
            this.recalcStats();
            this.hp = this.maxHp; // Heal on level up
            leveledUp.push(this.level);
            EventBus.emit(GAME_EVENTS.ECHO_LEVELED_UP, { echo: this, level: this.level });
            if (this.evolution && this.level >= this.evolution.lv) {
                this.evolve();
            }
        }
        return leveledUp;
    }

    evolve() {
        if (!this.evolution) return;
        const evoData = getEchoById(this.evolution.to);
        if (!evoData) return;

        const oldName = this.name;
        this.id = evoData.id;
        this.name = evoData.name;
        this.emoji = evoData.emoji;
        this.type = evoData.type;
        this.rarity = evoData.rarity;
        this.description = evoData.desc;
        this.baseHp = evoData.baseHp;
        this.baseAtk = evoData.baseAtk;
        this.baseDef = evoData.baseDef;
        this.baseSpd = evoData.baseSpd;
        this.evolution = evoData.evo || null;
        this.recalcStats();
        this.hp = this.maxHp;

        EventBus.emit(GAME_EVENTS.ECHO_EVOLVED, { echo: this, oldName });
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp <= 0) {
            EventBus.emit(GAME_EVENTS.ECHO_FAINTED, { echo: this });
            return true; // is fainted
        }
        return false;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    fullHeal() {
        this.hp = this.maxHp;
    }

    isAlive() {
        return this.hp > 0;
    }

    getHpPercent() {
        return (this.hp / this.maxHp) * 100;
    }

    calculateDamageAgainst(defender) {
        return Utils.calculateDamage(this.atk, this.type, defender.def, defender.type, this.level);
    }

    getAttackInterval() {
        return Math.max(500, 3000 - this.spd * 30);
    }

    // Sérialisation pour la sauvegarde
    toJSON() {
        return {
            uid: this.uid,
            id: this.id,
            name: this.name,
            type: this.type,
            emoji: this.emoji,
            rarity: this.rarity,
            isPrimordial: this.isPrimordial,
            description: this.description,
            baseHp: this.baseHp,
            baseAtk: this.baseAtk,
            baseDef: this.baseDef,
            baseSpd: this.baseSpd,
            level: this.level,
            xp: this.xp,
            xpToNext: this.xpToNext,
            hp: this.hp,
            maxHp: this.maxHp,
            atk: this.atk,
            def: this.def,
            spd: this.spd,
            evolution: this.evolution
        };
    }

    // Reconstruction depuis JSON
    static fromJSON(json) {
        const data = getEchoById(json.id) || json;
        const echo = new Echo(data, json.level, json.isPrimordial);
        echo.uid = json.uid;
        echo.xp = json.xp || 0;
        echo.xpToNext = json.xpToNext || Utils.xpForLevel(json.level);
        echo.hp = json.hp || echo.maxHp;
        echo.rarity = json.rarity || 'common';
        echo.description = json.description || '';
        return echo;
    }
}

// Génération d'un Écho sauvage
function generateWildEcho(routeIds, routeLv) {
    const id = routeIds[Utils.randInt(0, routeIds.length - 1)];
    const data = getEchoById(id);
    if (!data) return null;
    const lvRange = routeLv.split('-').map(Number);
    const level = Utils.randInt(lvRange[0], lvRange[1]);
    const primordial = Utils.chance(GAME_CONFIG.PRIMORDIAL_CHANCE * 100);
    return new Echo(data, level, primordial);
}