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

    startCombat(route) {
        this.inCombat = true;
        this.routeKills = 0;
        this.isBoss = false;
        this.spawnEnemy(route);
        EventBus.emit(GAME_EVENTS.COMBAT_START, { route });
        UI.addLog('info', `Exploration de ${route.name}...`);
    },

    spawnEnemy(route) {
        if (!route) return;

        // Vérifier boss
        const region = Game.state.regions.find(r => r.id === Game.state.currentRegion);
        if (region && !region.bossDefeated && this.routeKills >= GAME_CONFIG.KILLS_FOR_ROUTE) {
            const last = region.routes[region.routes.length - 1];
            if (route.id === last.id && region.bosses.length) {
                this.spawnBoss(region);
                return;
            }
        }

        this.enemy = generateWildEcho(route.ids, route.lv);
        this.activeEcho = this.getActiveEcho();
        if (this.enemy) Game.state.seenEchoes.add(this.enemy.id);
        UI.updateCombat();
    },

    spawnBoss(region) {
        const boss = region.bosses[0];
        const data = getEchoById(boss.echoId);
        if (!data) return;

        this.isBoss = true;
        this.enemy = new Echo(data, boss.level, false);
        this.enemy.isBoss = true;
        this.enemy.bossName = boss.name;
        // Boss = stats boostées
        this.enemy.maxHp = Math.floor(this.enemy.maxHp * 2);
        this.enemy.hp = this.enemy.maxHp;
        this.enemy.atk = Math.floor(this.enemy.atk * 1.5);

        this.activeEcho = this.getActiveEcho();
        Game.state.seenEchoes.add(this.enemy.id);
        UI.updateCombat();
        UI.addLog('info', `⚔️ BOSS : ${boss.name} !`);
        UI.toast(`⚔️ Boss : ${boss.name} !`, 'warning');
    },

    getActiveEcho() {
        return Game.state.party.find(e => e.isAlive()) || null;
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

        // Attaque joueur
        const dmg = this.activeEcho.calculateDamageAgainst(this.enemy);
        this.enemy.takeDamage(dmg);

        if (!this.enemy.isAlive()) {
            this.onEnemyDefeated();
            return;
        }

        // Attaque ennemi
        const enemyDmg = this.enemy.calculateDamageAgainst(this.activeEcho);
        this.activeEcho.takeDamage(enemyDmg);

        if (!this.activeEcho.isAlive()) {
            this.onPlayerFainted();
        }

        UI.updateCombat();
    },

    playerClick() {
        if (!this.inCombat || !this.enemy || !this.activeEcho) return;

        const dmg = this.activeEcho.calculateDamageAgainst(this.enemy) * GAME_CONFIG.COMBAT_CLICK_MULTIPLIER;
        this.enemy.takeDamage(dmg);
        UI.spawnDamageParticle(dmg);

        if (!this.enemy.isAlive()) {
            this.onEnemyDefeated();
        }

        UI.updateCombat();
    },

    onEnemyDefeated() {
        Game.state.totalWins++;
        this.routeKills++;

        // XP
        const xpGain = this.enemy.level * 5 + (this.isBoss ? 50 : 0);
        Game.state.party.forEach(e => {
            if (e.isAlive()) e.gainXp(Math.floor(xpGain / Math.max(1, Game.state.party.length)));
        });

        // Énergie
        const energyGain = this.enemy.level * 3 + (this.isBoss ? 100 : 0);
        Game.state.energy += energyGain;
        Game.state.totalEnergy += energyGain;

        const name = this.enemy.bossName || this.enemy.name;
        UI.addLog('damage', `${name} vaincu ! +${energyGain}⚡ +${xpGain}XP`);
        EventBus.emit(GAME_EVENTS.ENEMY_DEFEATED, { enemy: this.enemy, energyGain, xpGain });

        if (this.isBoss) {
            Game.defeatBoss();
            this.isBoss = false;
            this.endCombat();
            return;
        }

        if (this.routeKills >= GAME_CONFIG.KILLS_FOR_ROUTE) {
            Game.unlockNextRoute();
        }

        // Nouvel ennemi
        const route = Game.state.currentRoute;
        if (route) setTimeout(() => this.spawnEnemy(route), 500);
    },

    onPlayerFainted() {
        UI.addLog('damage', `${this.activeEcho.name} est K.O. !`);
        const next = Game.state.party.find(e => e.isAlive() && e.uid !== this.activeEcho.uid);
        if (next) {
            this.activeEcho = next;
            UI.addLog('info', `${next.name} entre en combat !`);
            UI.updateCombat();
        } else {
            UI.addLog('damage', 'Tous tes Échos sont K.O. !');
            this.endCombat();
            UI.toast('Tous tes Échos sont K.O. !', 'error');
        }
    },

    attemptCapture() {
        if (!this.inCombat || !this.enemy) return;
        if (!Game.spendLinks(1)) {
            UI.toast('Pas assez de Liens !', 'error');
            return;
        }

        const rate = Utils.calculateCaptureRate(
            this.enemy.captureRate || GAME_CONFIG.CAPTURE_BASE_RATE,
            this.enemy.hp, this.enemy.maxHp
        );

        if (Utils.chance(rate)) {
            const captured = new Echo(getEchoById(this.enemy.id), this.enemy.level, this.enemy.isPrimordial);
            Game.state.totalCaptures++;
            Game.state.caughtEchoes.add(this.enemy.id);
            if (!Game.state.seenEchoes.has(this.enemy.id)) Game.state.uniqueCaptures++;
            if (this.enemy.isPrimordial) Game.state.primordialCount++;

            if (Game.state.party.length < GAME_CONFIG.MAX_PARTY) {
                Game.addToParty(captured);
            } else {
                Game.state.reserves.push(captured);
            }

            EventBus.emit(GAME_EVENTS.ECHO_CAPTURED, { echo: captured });
            const prefix = this.enemy.isPrimordial ? '✨ PRIMORDIAL ! ' : '';
            UI.addLog('capture', `${prefix}${this.enemy.name} capturé !`);
            UI.toast(`${prefix}${this.enemy.name} capturé !`, 'success');

            const route = Game.state.currentRoute;
            if (route) setTimeout(() => this.spawnEnemy(route), 500);
        } else {
            UI.addLog('info', 'Capture échouée...');
            UI.toast('Capture échouée !', 'error');
        }
        UI.updateCombat();
    },

    endCombat() {
        this.inCombat = false;
        this.enemy = null;
        this.activeEcho = null;
        this.isBoss = false;
        EventBus.emit(GAME_EVENTS.COMBAT_END, {});
        UI.updateCombat();
    },

    healParty() {
        Game.state.party.forEach(e => e.fullHeal());
        Game.state.reserves.forEach(e => e.fullHeal());
    }
};