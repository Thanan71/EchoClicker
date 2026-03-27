// ============================================
// ÉchoClicker - Moteur de jeu principal (v2)
// ============================================

const Game = {
    state: null,
    _clickTimestamps: [],
    _cps: 0,
    _lastSave: 0,

    async init() {
        // Initialiser le système i18n
        await i18n.init();
        
        this.initState();
        SaveSystem.load();
        this.setupEvents();
        this.setupEventBus();
        
        // Initialiser les systèmes
        Mine.init(Game, UI, EventBus);
        Hatchery.init(Game, UI, EventBus);
        MapSystem.init(Game, UI, EventBus);
        Combat.init(Game, UI, EventBus);
        questSystem.init(); // Initialiser le système de quêtes
        
        UI.init();

        // Démarrer la boucle de jeu
        GameLoop.start(
            (dt) => this.update(dt),
            (alpha) => this.render(alpha)
        );

        // Auto-sauvegarde
        setInterval(() => SaveSystem.save(), GAME_CONFIG.AUTO_SAVE_INTERVAL);

        // Traduire le DOM
        i18n.translateDOM();
        
        UI.toast(i18n.t('game.welcome'), 'info');
    },

    initState() {
        this.state = {
            energy: 0,
            links: 5,
            crystals: 0,
            shards: 0,
            totalEnergy: 0,
            totalClicks: 0,
            totalCaptures: 0,
            uniqueCaptures: 0,
            primordialCount: 0,
            totalWins: 0,
            bossesDefeated: 0,
            regionsUnlocked: 1,
            maxLevel: 1,
            playTime: 0,
            clickPower: GAME_CONFIG.ENERGY_PER_CLICK_BASE,
            passiveIncome: GAME_CONFIG.PASSIVE_BASE,
            currentRegion: 'foret',
            currentRoute: null,
            party: [],
            reserves: [],
            seenEchoes: new Set(),
            caughtEchoes: new Set(),
            achievements: new Set(),
            regions: Utils.deepClone(REGIONS),
            boosts: {},
            inventory: [], // Inventaire pour les objets de quêtes
            startTime: Date.now()
        };
    },

    // === Boucle de jeu ===
    update(dt) {
        // Revenu passif (delta time pour précision idle)
        const passive = this.getPassiveIncome() * dt;
        if (passive > 0) {
            this.state.energy += passive;
            this.state.totalEnergy += passive;
        }

        // Temps de jeu (delta time)
        this.state.playTime += dt;

        // Combat automatique
        Combat.update(dt);

        // Mise à jour de l'incubateur
        Hatchery.update(dt);
        Hatchery.updateDisplay();

        // Mise à jour de la mine (régénération d'énergie)
        Mine.update(dt);

        // Calcul du CPS
        this.updateCPS();

        // Mise à jour des boosts
        this.updateBoosts(dt);

        // Vérification des succès
        this.checkAchievements();

        // Émission de l'événement tick
        EventBus.emit(GAME_EVENTS.TICK, { dt });
    },

    render(alpha) {
        UI.render(alpha);
    },

    // === CPS (Clics par seconde) ===
    updateCPS() {
        const now = Date.now();
        const window = GAME_CONFIG.CPS_WINDOW;
        this._clickTimestamps = this._clickTimestamps.filter(t => now - t < window);
        this._cps = this._clickTimestamps.length / (window / 1000);
    },

    getCPS() {
        return this._cps;
    },

    // === Clic ===
    click(event) {
        this.state.totalClicks++;
        this._clickTimestamps.push(Date.now());

        const power = this.getClickPower();
        this.state.energy += power;
        this.state.totalEnergy += power;

        EventBus.emit(GAME_EVENTS.CLICK, { power, event });

        // En combat, fait des dégâts
        if (Combat.inCombat) {
            Combat.playerClick();
        }

        // Particule
        if (event) UI.spawnParticle(event, `+${Utils.formatNumber(power)}`);
    },

    getClickPower() {
        let power = this.state.clickPower;
        if (this.state.boosts.energy) power *= 2;
        // Bonus passif basé sur le nombre d'Échos
        power += this.state.party.length * 0.1;
        return Math.floor(power);
    },

    getPassiveIncome() {
        let income = this.state.passiveIncome;
        // Bonus par Écho en équipe
        income += this.state.party.length * 0.05;
        // Bonus par niveau moyen
        if (this.state.party.length > 0) {
            const avgLv = this.state.party.reduce((s, e) => s + e.level, 0) / this.state.party.length;
            income += avgLv * 0.02;
        }
        if (this.state.boosts.energy) income *= 2;
        return income;
    },

    // === Monnaies ===
    spendEnergy(amount) {
        if (this.state.energy < amount) return false;
        this.state.energy -= amount;
        return true;
    },

    spendLinks(amount) {
        if (this.state.links < amount) return false;
        this.state.links -= amount;
        EventBus.emit(GAME_EVENTS.LINKS_CHANGED, { links: this.state.links });
        return true;
    },

    addLinks(amount) {
        this.state.links += amount;
        EventBus.emit(GAME_EVENTS.LINKS_CHANGED, { links: this.state.links });
    },

    // === Équipe ===
    addToParty(echo) {
        if (this.state.party.length >= GAME_CONFIG.MAX_PARTY) return false;
        this.state.party.push(echo);
        return true;
    },

    buildOptimalTeam() {
        const allEchoes = this.getAllEchoes();
        if (allEchoes.length === 0) {
            UI.toast(i18n.t('combat.noEchoAvailable'), 'warning');
            return;
        }

        // Calculer le score de chaque écho
        const scoredEchoes = allEchoes.map(echo => {
            let score = 0;
            
            // Stats totales
            score += echo.maxHp * 0.3;
            score += echo.atk * 0.4;
            score += echo.def * 0.2;
            score += echo.spd * 0.1;
            
            // Bonus niveau
            score += echo.level * 5;
            
            // Bonus rareté
            const rarityBonus = {
                'common': 0,
                'uncommon': 20,
                'rare': 50,
                'epic': 100,
                'legendary': 200,
                'mythical': 300
            };
            score += rarityBonus[echo.rarity] || 0;
            
            // Bonus primordial
            if (echo.isPrimordial) score += 50;
            
            // Bonus vivant
            if (echo.isAlive()) score += 100;
            
            return { echo, score };
        });

        // Trier par score décroissant
        scoredEchoes.sort((a, b) => b.score - a.score);

        // Vider l'équipe actuelle (mettre en réserve)
        const oldParty = [...this.state.party];
        this.state.party = [];

        // Construire la nouvelle équipe optimale
        const newParty = [];
        const usedIds = new Set();

        for (const { echo } of scoredEchoes) {
            if (newParty.length >= GAME_CONFIG.MAX_PARTY) break;
            
            // Éviter les doublons d'espèces (optionnel)
            if (!usedIds.has(echo.id) || allEchoes.length <= GAME_CONFIG.MAX_PARTY) {
                newParty.push(echo);
                usedIds.add(echo.id);
            }
        }

        // Mettre à jour l'équipe
        this.state.party = newParty;

        // Remettre les autres en réserve
        const partyUids = new Set(newParty.map(e => e.uid));
        const newReserves = allEchoes.filter(e => !partyUids.has(e.uid));
        this.state.reserves = newReserves;

        // Soigner la nouvelle équipe
        this.state.party.forEach(e => e.fullHeal());

        UI.renderParty();
        UI.toast(i18n.t('combat.optimalTeamCreated'), 'success');
        UI.addLog('info', i18n.t('combat.newTeam', { names: newParty.map(e => e.name).join(', ') }));
    },

    removeFromParty(uid) {
        const idx = this.state.party.findIndex(e => e.uid === uid);
        if (idx === -1) return false;
        const echo = this.state.party.splice(idx, 1)[0];
        this.state.reserves.push(echo);
        return true;
    },

    moveToParty(uid) {
        if (this.state.party.length >= GAME_CONFIG.MAX_PARTY) {
            UI.toast(i18n.t('combat.partyFull'), 'warning');
            return false;
        }
        const idx = this.state.reserves.findIndex(e => e.uid === uid);
        if (idx === -1) return false;
        const echo = this.state.reserves.splice(idx, 1)[0];
        this.state.party.push(echo);
        return true;
    },

    getAllEchoes() {
        return [...this.state.party, ...this.state.reserves];
    },

    findEcho(uid) {
        return this.getAllEchoes().find(e => e.uid === uid);
    },

    // === Capture ===
    /**
     * Méthode centralisée de capture d'Écho
     * @param {Echo} wildEcho - L'Écho sauvage à capturer
     * @param {Object} options - Options de capture
     * @param {boolean} options.isAuto - Si c'est une auto-capture
     * @returns {boolean} - true si la capture a réussi
     */
    captureEcho(wildEcho, options = {}) {
        const { isAuto = false } = options;

        // Vérifier les liens disponibles
        if (!this.spendLinks(1)) {
            if (!isAuto) {
                UI.toast(i18n.t('capture.notEnoughLinks'), 'error');
            } else {
                UI.addLog('info', i18n.t('capture.autoNotEnoughLinks', { name: wildEcho.name }));
            }
            return false;
        }

        // Calculer le taux de capture
        let rate = Utils.calculateCaptureRate(
            wildEcho.captureRate || GAME_CONFIG.CAPTURE_BASE_RATE,
            wildEcho.hp, wildEcho.maxHp
        );
        
        // Appliquer le boost de capture si actif
        if (this.state.boosts.capture) {
            rate *= 2; // Double le taux de capture
        }

        // Tenter la capture
        if (Utils.chance(rate)) {
            // Créer l'Écho capturé
            const captured = new Echo(
                getEchoById(wildEcho.id),
                wildEcho.level,
                wildEcho.isPrimordial
            );

            // Mettre à jour les statistiques
            this.state.totalCaptures++;
            
            // Incrémenter uniqueCaptures seulement si c'est une nouvelle capture
            if (!this.state.caughtEchoes.has(wildEcho.id)) {
                this.state.uniqueCaptures++;
            }
            this.state.caughtEchoes.add(wildEcho.id);
            
            // Incrémenter le compteur de primordiaux
            if (wildEcho.isPrimordial) {
                this.state.primordialCount++;
            }

            // Ajouter à l'équipe ou aux réserves
            if (this.state.party.length < GAME_CONFIG.MAX_PARTY) {
                this.addToParty(captured);
            } else {
                this.state.reserves.push(captured);
            }

            // Émettre l'événement de capture
            EventBus.emit(GAME_EVENTS.ECHO_CAPTURED, { echo: captured });
            
            // Émettre l'événement pour les quêtes
            EventBus.emit('echo:captured', captured);

            // Afficher le message de succès
            const prefix = wildEcho.isPrimordial ? '✨ PRIMORDIAL ! ' : '';
            if (isAuto) {
                UI.addLog('capture', i18n.t('combat.autoCaptureSuccess', { name: `${prefix}${wildEcho.name}` }));
                UI.toast(i18n.t('combat.autoCaptureSuccess', { name: `${prefix}${wildEcho.name}` }), 'success');
            } else {
                UI.addLog('capture', i18n.t('combat.captureSuccess', { name: `${prefix}${wildEcho.name}` }));
                UI.toast(i18n.t('combat.captureSuccess', { name: `${prefix}${wildEcho.name}` }), 'success');
            }

            return true;
        }

        // Capture échouée
        if (!isAuto) {
            UI.addLog('info', i18n.t('combat.captureFailed'));
            UI.toast(i18n.t('combat.captureFailed'), 'error');
        } else {
            UI.addLog('info', i18n.t('combat.autoCaptureFailed', { name: wildEcho.name }));
        }

        return false;
    },

    // === Capture (ancienne méthode - redirige vers captureEcho) ===
    attemptCapture(wildEcho) {
        return this.captureEcho(wildEcho);
    },

    // === Routes & Régions ===
    selectRoute(routeId) {
        const region = this.state.regions.find(r => r.id === this.state.currentRegion);
        if (!region) return;
        const route = region.routes.find(r => r.id === routeId);
        if (!route || !route.unlocked) {
            UI.toast(i18n.t('capture.routeLocked'), 'warning');
            return;
        }
        this.state.currentRoute = route;
        Combat.startCombat(route);
        // Plus besoin de changer d'onglet, le combat est sur la même page
        UI.renderRoutes();
        UI.updateCombat();
    },

    selectRegion(regionId) {
        const region = this.state.regions.find(r => r.id === regionId);
        if (!region || !region.unlocked) {
            UI.toast(i18n.t('capture.regionLocked'), 'warning');
            return;
        }
        this.state.currentRegion = regionId;
        this.state.currentRoute = null;
        Combat.endCombat();
        UI.renderRoutes();
    },

    unlockNextRoute() {
        const region = this.state.regions.find(r => r.id === this.state.currentRegion);
        if (!region) return;
        const idx = region.routes.findIndex(r => r.id === this.state.currentRoute?.id);
        if (idx < region.routes.length - 1) {
            const nextRoute = region.routes[idx + 1];
            if (!nextRoute.unlocked) {
                nextRoute.unlocked = true;
                EventBus.emit(GAME_EVENTS.ROUTE_UNLOCKED, { route: nextRoute });
                UI.toast(i18n.t('capture.newRoute', { name: nextRoute.name }), 'success');
            }
        }
    },

    defeatBoss() {
        const region = this.state.regions.find(r => r.id === this.state.currentRegion);
        if (!region) return;
        region.bossDefeated = true;
        this.state.bossesDefeated++;
        EventBus.emit(GAME_EVENTS.BOSS_DEFEATED, { region });
        
            // Émettre l'événement pour les quêtes
            EventBus.emit('boss:defeated', { id: this.state.currentRegion });

        const idx = this.state.regions.findIndex(r => r.id === this.state.currentRegion);
        if (idx < this.state.regions.length - 1) {
            const next = this.state.regions[idx + 1];
            next.unlocked = true;
            next.routes[0].unlocked = true;
            this.state.regionsUnlocked++;
            EventBus.emit(GAME_EVENTS.REGION_UNLOCKED, { region: next });
            UI.toast(i18n.t('capture.newRegion', { name: next.name }), 'success');
        } else {
            UI.toast(i18n.t('notifications.success'), 'success');
        }
    },

    // === Boutique ===
    buyItem(item) {
        if (item.currency === 'energy' && !this.spendEnergy(item.price)) {
            UI.toast(i18n.t('notifications.error'), 'error'); return false;
        }
        if (item.currency === 'shards' && this.state.shards < item.price) {
            UI.toast(i18n.t('notifications.error'), 'error'); return false;
        }
        if (item.currency === 'shards') this.state.shards -= item.price;

        if (item.amount && item.id.startsWith('l')) this.addLinks(item.amount);
        if (item.id === 'evo') this.state.crystals++;
        if (item.id === 'candy' && this.state.party[0]) {
            this.state.party[0].gainXp(this.state.party[0].xpToNext);
        }
        if (item.id === 'potion') this.getAllEchoes().forEach(e => e.fullHeal());
        if (item.duration) this.state.boosts[item.type] = { endTime: Date.now() + item.duration * 1000 };

        EventBus.emit(GAME_EVENTS.ITEM_PURCHASED, { item });
        UI.toast(i18n.t('shop.purchaseSuccess'), 'success');
        return true;
    },

    // === Boosts ===
    updateBoosts(dt) {
        const now = Date.now();
        for (const [key, boost] of Object.entries(this.state.boosts)) {
            if (boost.endTime && now > boost.endTime) {
                delete this.state.boosts[key];
            }
        }
    },

    // === Succès ===
    checkAchievements() {
        const stats = this.getStats();
        ACHIEVEMENTS.forEach(ach => {
            if (!this.state.achievements.has(ach.id) && ach.cond(stats)) {
                this.state.achievements.add(ach.id);
                EventBus.emit(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, { achievement: ach });
                UI.toast(i18n.t('achievements.unlocked'), 'success');
            }
        });
    },

    getStats() {
        return {
            totalClicks: this.state.totalClicks,
            totalCaptures: this.state.totalCaptures,
            uniqueCaptures: this.state.uniqueCaptures,
            primordialCount: this.state.primordialCount,
            totalWins: this.state.totalWins,
            totalEnergy: this.state.totalEnergy,
            maxLevel: this.state.maxLevel,
            bossesDefeated: this.state.bossesDefeated,
            regionsUnlocked: this.state.regionsUnlocked,
            playTime: Math.floor(this.state.playTime)
        };
    },

    // === Événements ===
    setupEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => UI.switchTab(btn.dataset.tab));
        });

        // Combat
        document.getElementById('btn-tisser-coup').addEventListener('click', e => this.click(e));
        document.getElementById('btn-capture-combat').addEventListener('click', () => Combat.attemptCapture());
        document.getElementById('btn-flee').addEventListener('click', () => { 
            Combat.endCombat(); 
            UI.renderRoutes();
            UI.updateCombat();
        });

        // Capture
        document.getElementById('btn-capture').addEventListener('click', () => UI.captureClick());

        // Auto-capture toggle
        const autoCaptureToggle = document.getElementById('auto-capture-toggle');
        if (autoCaptureToggle) {
            autoCaptureToggle.addEventListener('change', (e) => {
                Combat.autoCaptureEnabled = e.target.checked;
                UI.toast(e.target.checked ? '🔮 Auto-capture activé' : '🔮 Auto-capture désactivé', 'info');
            });
        }

        // Équipe optimale
        const btnAutoTeam = document.getElementById('btn-auto-team');
        if (btnAutoTeam) {
            btnAutoTeam.addEventListener('click', () => this.buildOptimalTeam());
        }

        // Soigner tout
        const btnHealAll = document.getElementById('btn-heal-all');
        if (btnHealAll) {
            btnHealAll.addEventListener('click', () => {
                Combat.healParty();
                UI.renderParty();
                UI.toast('❤️ Équipe soignée !', 'success');
            });
        }

        // Sauvegarde & Settings
        document.getElementById('btn-save').addEventListener('click', () => { SaveSystem.save(); UI.toast(i18n.t('notifications.saved'), 'success'); });
        document.getElementById('btn-settings').addEventListener('click', () => UI.showSettings());
        
        // Language selector
        const btnLang = document.getElementById('btn-lang');
        const langDropdown = document.getElementById('lang-dropdown');
        if (btnLang && langDropdown) {
            btnLang.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.classList.toggle('active');
            });
            
            document.querySelectorAll('.lang-option').forEach(option => {
                option.addEventListener('click', async (e) => {
                    const lang = e.target.dataset.lang;
                    await i18n.setLanguage(lang);
                    i18n.translateDOM();
                    langDropdown.classList.remove('active');
                    
                    // Update active state
                    document.querySelectorAll('.lang-option').forEach(opt => {
                        opt.classList.toggle('active', opt.dataset.lang === lang);
                    });
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.classList.remove('active');
            });
        }
        document.getElementById('modal-close').addEventListener('click', () => UI.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') UI.closeModal(); });

        // Clic global pour énergie
        document.getElementById('game-main').addEventListener('click', e => {
            if (e.target.closest('button, .route-card, .shop-item, .party-slot, .reserve-slot, .pokedex-card, .mine-tile, .nav-btn, .filter-btn, .shop-cat, .parent-slot, .combat-arena')) return;
            if (document.getElementById('tab-capture').classList.contains('active')) return;
            this.click(e);
        });
    },

    setupEventBus() {
        EventBus.on(GAME_EVENTS.ECHO_LEVELED_UP, ({ echo }) => {
            if (echo.level > this.state.maxLevel) this.state.maxLevel = echo.level;
            // Émettre l'événement pour les quêtes
            EventBus.emit('echo:levelUp', echo);
        });

        EventBus.on(GAME_EVENTS.ECHO_CAPTURED, () => {
            UI.renderParty();
            UI.renderPokedex();
        });

        EventBus.on(GAME_EVENTS.ECHO_EVOLVED, ({ oldName, echo }) => {
            UI.toast(`✨ ${oldName} évolue en ${echo.name} !`, 'success');
        });
        
        // Écouter les événements de quêtes pour les notifications
        EventBus.on('quest:completed', (quest) => {
            UI.toast(`🎉 Quête complétée : ${quest.name}`, 'success');
        });
        
        EventBus.on('quest:rewardsClaimed', (quest) => {
            UI.toast(`🎁 Récompenses réclamées pour : ${quest.name}`, 'success');
        });
    },

    // === Sauvegarde / Export ===
    exportSave() {
        const data = SaveSystem.getSaveData();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'echoclicker_save.json';
        a.click();
        URL.revokeObjectURL(a.href);
        UI.toast(i18n.t('notifications.success'), 'success');
    },

    importSave() {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.json';
        input.onchange = e => {
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const data = JSON.parse(ev.target.result);
                    // Utiliser importFromData pour gérer la migration automatiquement
                    if (SaveSystem.importFromData(data)) {
                        UI.toast(i18n.t('notifications.loaded'), 'success');
                        UI.updateAll();
                    } else {
                        UI.toast(i18n.t('notifications.error'), 'error');
                    }
                } catch { UI.toast(i18n.t('notifications.error'), 'error'); }
            };
            reader.readAsText(e.target.files[0]);
        };
        input.click();
    },

    resetGame() {
        if (confirm(i18n.t('settings.reset') + ' ?')) {
            SaveSystem.deleteSave();
            location.reload();
        }
    },

    // Charger la sauvegarde au démarrage
    loadGame() {
        if (SaveSystem.hasSave()) {
            if (SaveSystem.load()) {
                console.log('Sauvegarde chargée');
            } else {
                console.log('Erreur de chargage, nouveau jeu');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Game.init());
