// ============================================
// CombatEngine - Logique de combat (spawn, enemy, damage, rewards)
// ============================================

const CombatEngine = {
    _state: null,
    _game: null,
    _ui: null,
    _eventBus: null,
    _onEnemyDefeated: null,

    init({ state, game, ui, eventBus, onEnemyDefeated }) {
        this._state = state;
        this._game = game;
        this._ui = ui;
        this._eventBus = eventBus;
        this._onEnemyDefeated = onEnemyDefeated;
    },

    startCombat(route) {
        const s = this._state;
        s.inCombat = true;
        s.routeKills = 0;
        s.isBoss = false;
        this.spawnEnemy(route);
        this._eventBus.emit(GAME_EVENTS.COMBAT_START, { route });
        this._ui.addLog('info', 'Exploration de ' + route.name + '...');
    },

    spawnEnemy(route) {
        const s = this._state;
        if (!route) return;

        // Check for boss spawn
        const region = this._game.state.regions.find(r => r.id === this._game.state.currentRegion);
        if (region && !region.bossDefeated && s.routeKills >= GAME_CONFIG.KILLS_FOR_ROUTE) {
            const last = region.routes[region.routes.length - 1];
            if (route.id === last.id && region.bosses.length) {
                this.spawnBoss(region);
                return;
            }
        }

        s.enemy = generateWildEcho(route.ids, route.lv);
        s.activeEcho = CombatParty.getActiveEcho();
        if (s.enemy) {
            this._game.state.seenEchoes.add(s.enemy.id);
            if (s.autoCaptureEnabled && !this._game.state.caughtEchoes.has(s.enemy.id)) {
                CombatCapture.autoCaptureNewEcho();
            }
        }
        this._ui.updateCombat();
    },

    spawnBoss(region) {
        const s = this._state;
        const boss = region.bosses[0];
        const data = getEchoById(boss.echoId);
        if (!data) return;

        s.isBoss = true;
        s.enemy = new Echo(data, boss.level, false);
        s.enemy.isBoss = true;
        s.enemy.bossName = boss.name;
        s.enemy.maxHp = Math.floor(s.enemy.maxHp * 2);
        s.enemy.hp = s.enemy.maxHp;
        s.enemy.atk = Math.floor(s.enemy.atk * 1.5);

        s.activeEcho = CombatParty.getActiveEcho();
        this._game.state.seenEchoes.add(s.enemy.id);
        this._ui.updateCombat();
        this._ui.addLog('info', '⚔️ BOSS : ' + boss.name + ' !');
        this._ui.toast('⚔️ Boss : ' + boss.name + ' !', 'warning');
    },

    autoAttack() {
        const s = this._state;
        if (!s.inCombat || !s.enemy || !s.activeEcho) return;

        const dmg = s.activeEcho.calculateDamageAgainst(s.enemy);
        s.enemy.takeDamage(dmg);

        if (!s.enemy.isAlive()) {
            this.onEnemyDefeated();
            return;
        }

        const enemyDmg = s.enemy.calculateDamageAgainst(s.activeEcho);
        s.activeEcho.takeDamage(enemyDmg);

        if (!s.activeEcho.isAlive()) {
            this.onPlayerFainted();
        }

        this._ui.updateCombat();
    },

    playerClick() {
        const s = this._state;
        if (!s.inCombat || !s.enemy || !s.activeEcho) return;

        const dmg = s.activeEcho.calculateDamageAgainst(s.enemy) * GAME_CONFIG.COMBAT_CLICK_MULTIPLIER;
        s.enemy.takeDamage(dmg);
        this._ui.spawnDamageParticle(dmg);

        if (!s.enemy.isAlive()) {
            this.onEnemyDefeated();
        }

        this._ui.updateCombat();
    },

    onEnemyDefeated() {
        const s = this._state;
        this._game.state.totalWins++;
        s.routeKills++;

        let xpGain = s.enemy.level * 5 + (s.isBoss ? 50 : 0);

        if (this._game.state.boosts.xp) {
            xpGain *= 2;
        }

        this._game.state.party.forEach(e => {
            if (e.isAlive()) e.gainXp(Math.floor(xpGain / Math.max(1, this._game.state.party.length)));
        });

        const energyGain = s.enemy.level * 3 + (s.isBoss ? 100 : 0);
        this._game.state.energy += energyGain;
        this._game.state.totalEnergy += energyGain;

        const name = s.enemy.bossName || s.enemy.name;
        this._ui.addLog('damage', name + ' vaincu ! +' + energyGain + '⚡ +' + xpGain + 'XP');
        this._eventBus.emit(GAME_EVENTS.ENEMY_DEFEATED, { enemy: s.enemy, energyGain, xpGain });

        // Let facade handle boss/route/spawn logic
        if (this._onEnemyDefeated) this._onEnemyDefeated();
    },

    onPlayerFainted() {
        const s = this._state;
        this._ui.addLog('damage', s.activeEcho.name + ' est K.O. !');
        const next = CombatParty.getNextAliveEcho();
        if (next) {
            s.activeEcho = next;
            this._ui.addLog('info', next.name + ' entre en combat !');
            this._ui.updateCombat();
        } else {
            this._ui.addLog('damage', 'Tous tes Echos sont K.O. !');
            this.endCombat();
            this._ui.toast('Tous tes Echos sont K.O. !', 'error');
        }
    },

    endCombat() {
        const s = this._state;
        s.inCombat = false;
        s.enemy = null;
        s.activeEcho = null;
        s.isBoss = false;
        this._eventBus.emit(GAME_EVENTS.COMBAT_END, {});
        this._ui.updateCombat();
    }
};
