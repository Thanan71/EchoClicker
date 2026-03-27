// ============================================
// ÉchoClicker - Système de combat (v2)
// ============================================

const Combat = {
    inCombat: false,
    enemy: null,
    activeEcho: null,
    autoTimer: 0,
    routeKills: 0,
    isBoss: false,
    autoCaptureEnabled: false,

    // Dépendances injectées (DIP)
    _game: null,
    _ui: null,
    _eventBus: null,

    /**
     * Initialise les dépendances du système.
     * @param {IGameStateProvider} gameRef - Référence au provider d'état de jeu
     * @param {IUIRenderer} uiRef - Référence au renderer UI
     * @param {IEventBus} eventBusRef - Référence au bus d'événements
     */
    init(gameRef, uiRef, eventBusRef) {
        this._game = gameRef;
        this._ui = uiRef;
        this._eventBus = eventBusRef;
    },

    startCombat(route) {
        this.inCombat = true;
        this.routeKills = 0;
        this.isBoss = false;
        this.spawnEnemy(route);
        this._eventBus.emit(GAME_EVENTS.COMBAT_START, { route });
        this._ui.addLog('info', `Exploration de ${route.name}...`);
    },

    spawnEnemy(route) {
        if (!route) return;

        // Vérifier boss
        const region = this._game.state.regions.find(r => r.id === this._game.state.currentRegion);
        if (region && !region.bossDefeated && this.routeKills >= GAME_CONFIG.KILLS_FOR_ROUTE) {
            const last = region.routes[region.routes.length - 1];
            if (route.id === last.id && region.bosses.length) {
                this.spawnBoss(region);
                return;
            }
        }

        this.enemy = generateWildEcho(route.ids, route.lv);
        this.activeEcho = this.getActiveEcho();
        if (this.enemy) {
            this._game.state.seenEchoes.add(this.enemy.id);
            
            // Auto-capture pour les nouveaux échos non capturés
            if (this.autoCaptureEnabled && !this._game.state.caughtEchoes.has(this.enemy.id)) {
                this.autoCaptureNewEcho();
            }
        }
        this._ui.updateCombat();
    },

    autoCaptureNewEcho() {
        if (!this.enemy) return;
        this._game.captureEcho(this.enemy, { isAuto: true });
    },

    spawnBoss(region) {
        const boss = region.bosses[0];
        const data = getEchoById(boss.echoId);
        if (!data) return;

        this.isBoss = true;
        this.enemy = new Echo(data, boss.level, false);
        this.enemy.isBoss = true;
        this.enemy.bossName = boss.name;
        this.enemy.maxHp = Math.floor(this.enemy.maxHp * 2);
        this.enemy.hp = this.enemy.maxHp;
        this.enemy.atk = Math.floor(this.enemy.atk * 1.5);

        this.activeEcho = this.getActiveEcho();
        this._game.state.seenEchoes.add(this.enemy.id);
        this._ui.updateCombat();
        this._ui.addLog('info', `⚔️ BOSS : ${boss.name} !`);
        this._ui.toast(`⚔️ Boss : ${boss.name} !`, 'warning');
    },

    getActiveEcho() {
        return this._game.state.party.find(e => e.isAlive()) || null;
    },

    update(dt) {
        if (!this.inCombat || !this.enemy || !this.activeEcho) return;

        this.autoTimer -= dt * 1000;
        if (this.autoTimer <= 0) {
            this.autoAttack();
            this.autoTimer = this.activeEcho.getAttackInterval();
        }
    },

    autoAttack() {
        if (!this.inCombat || !this.enemy || !this.activeEcho) return;

        const dmg = this.activeEcho.calculateDamageAgainst(this.enemy);
        this.enemy.takeDamage(dmg);

        if (!this.enemy.isAlive()) {
            this.onEnemyDefeated();
            return;
        }

        const enemyDmg = this.enemy.calculateDamageAgainst(this.activeEcho);
        this.activeEcho.takeDamage(enemyDmg);

        if (!this.activeEcho.isAlive()) {
            this.onPlayerFainted();
        }

        this._ui.updateCombat();
    },

    playerClick() {
        if (!this.inCombat || !this.enemy || !this.activeEcho) return;

        const dmg = this.activeEcho.calculateDamageAgainst(this.enemy) * GAME_CONFIG.COMBAT_CLICK_MULTIPLIER;
        this.enemy.takeDamage(dmg);
        this._ui.spawnDamageParticle(dmg);

        if (!this.enemy.isAlive()) {
            this.onEnemyDefeated();
        }

        this._ui.updateCombat();
    },

    onEnemyDefeated() {
        this._game.state.totalWins++;
        this.routeKills++;

        let xpGain = this.enemy.level * 5 + (this.isBoss ? 50 : 0);
        
        if (this._game.state.boosts.xp) {
            xpGain *= 2;
        }
        
        this._game.state.party.forEach(e => {
            if (e.isAlive()) e.gainXp(Math.floor(xpGain / Math.max(1, this._game.state.party.length)));
        });

        const energyGain = this.enemy.level * 3 + (this.isBoss ? 100 : 0);
        this._game.state.energy += energyGain;
        this._game.state.totalEnergy += energyGain;

        const name = this.enemy.bossName || this.enemy.name;
        this._ui.addLog('damage', `${name} vaincu ! +${energyGain}⚡ +${xpGain}XP`);
        this._eventBus.emit(GAME_EVENTS.ENEMY_DEFEATED, { enemy: this.enemy, energyGain, xpGain });

        if (this.isBoss) {
            this._game.defeatBoss();
            this.isBoss = false;
            this.endCombat();
            return;
        }

        if (this.routeKills >= GAME_CONFIG.KILLS_FOR_ROUTE) {
            this._game.unlockNextRoute();
        }

        const route = this._game.state.currentRoute;
        if (route) setTimeout(() => this.spawnEnemy(route), 500);
    },

    onPlayerFainted() {
        this._ui.addLog('damage', `${this.activeEcho.name} est K.O. !`);
        const next = this._game.state.party.find(e => e.isAlive() && e.uid !== this.activeEcho.uid);
        if (next) {
            this.activeEcho = next;
            this._ui.addLog('info', `${next.name} entre en combat !`);
            this._ui.updateCombat();
        } else {
            this._ui.addLog('damage', 'Tous tes Échos sont K.O. !');
            this.endCombat();
            this._ui.toast('Tous tes Échos sont K.O. !', 'error');
        }
    },

    attemptCapture() {
        if (!this.inCombat || !this.enemy) return;

        const success = this._game.captureEcho(this.enemy);

        if (success) {
            const route = this._game.state.currentRoute;
            if (route) setTimeout(() => this.spawnEnemy(route), 500);
        }

        this._ui.updateCombat();
    },

    endCombat() {
        this.inCombat = false;
        this.enemy = null;
        this.activeEcho = null;
        this.isBoss = false;
        this._eventBus.emit(GAME_EVENTS.COMBAT_END, {});
        this._ui.updateCombat();
    },

    healParty() {
        this._game.state.party.forEach(e => e.fullHeal());
        this._game.state.reserves.forEach(e => e.fullHeal());
    }
};