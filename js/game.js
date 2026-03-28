// ============================================
// EchoClicker - Moteur de jeu principal (orchestrateur)
// ============================================
// Compose les modules SRP : GameState, GameParty, GameCurrency, GameRoutes
// Responsabilite propre : boucle de jeu, capture, boutique, evenements DOM

const Game = Object.assign({}, GameState, GameParty, GameCurrency, GameRoutes, {
    state: null,
    _clickTimestamps: [],
    _cps: 0,
    _lastSave: 0,

    async init() {
        await i18n.init();
        this.initState();
        SaveSystem.load();
        this.setupEvents();
        this.setupEventBus();
        Mine.init(Game, UI, EventBus);
        Hatchery.init(Game, UI, EventBus);
        MapSystem.init(Game, UI, EventBus);
        Combat.init(Game, UI, EventBus);
        questSystem.init();
        NarrativeSystem.init();
        UI.init();
        GameLoop.start(
            (dt) => this.update(dt),
            (alpha) => this.render(alpha)
        );
        setInterval(() => SaveSystem.save(), GAME_CONFIG.AUTO_SAVE_INTERVAL);
        i18n.translateDOM();
        UI.toast(i18n.t('game.welcome'), 'info');
        EventBus.emit(GAME_EVENTS.GAME_START);
    },

    update(dt) {
        const passive = this.getPassiveIncome() * dt;
        if (passive > 0) {
            this.state.energy += passive;
            this.state.totalEnergy += passive;
        }
        this.state.playTime += dt;
        Combat.update(dt);
        Hatchery.update(dt);
        Hatchery.updateDisplay();
        Mine.update(dt);
        this.updateCPS();
        this.updateBoosts(dt);
        this.checkAchievements();
        EventBus.emit(GAME_EVENTS.TICK, { dt });
    },

    render(alpha) {
        UI.render(alpha);
    },

    updateCPS() {
        const now = Date.now();
        const window = GAME_CONFIG.CPS_WINDOW;
        this._clickTimestamps = this._clickTimestamps.filter(t => now - t < window);
        this._cps = this._clickTimestamps.length / (window / 1000);
    },

    getCPS() {
        return this._cps;
    },

    click(event) {
        this.state.totalClicks++;
        this._clickTimestamps.push(Date.now());
        const power = this.getClickPower();
        this.state.energy += power;
        this.state.totalEnergy += power;
        EventBus.emit(GAME_EVENTS.CLICK, { power, event });
        if (Combat.inCombat) {
            Combat.playerClick();
        }
        if (event) UI.spawnParticle(event, '+' + Utils.formatNumber(power));
    },

    captureEcho(wildEcho, options = {}) {
        const { isAuto = false } = options;
        if (!this.spendLinks(1)) {
            if (!isAuto) {
                UI.toast(i18n.t('capture.notEnoughLinks'), 'error');
            } else {
                UI.addLog('info', i18n.t('capture.autoNotEnoughLinks', { name: wildEcho.name }));
            }
            return false;
        }
        let rate = Utils.calculateCaptureRate(
            wildEcho.captureRate || GAME_CONFIG.CAPTURE_BASE_RATE,
            wildEcho.hp, wildEcho.maxHp
        );
        if (this.state.boosts.capture) {
            rate *= 2;
        }
        if (Utils.chance(rate)) {
            const captured = new Echo(
                getEchoById(wildEcho.id),
                wildEcho.level,
                wildEcho.isPrimordial
            );
            this.state.totalCaptures++;
            if (!this.state.caughtEchoes.has(wildEcho.id)) {
                this.state.uniqueCaptures++;
            }
            this.state.caughtEchoes.add(wildEcho.id);
            if (wildEcho.isPrimordial) {
                this.state.primordialCount++;
            }
            if (this.state.party.length < GAME_CONFIG.MAX_PARTY) {
                this.addToParty(captured);
            } else {
                this.state.reserves.push(captured);
            }
            EventBus.emit(GAME_EVENTS.ECHO_CAPTURED, { echo: captured });
            EventBus.emit('echo:captured', captured);
            const prefix = wildEcho.isPrimordial ? 'PRIMORDIAL ! ' : '';
            if (isAuto) {
                UI.addLog('capture', i18n.t('combat.autoCaptureSuccess', { name: prefix + wildEcho.name }));
                UI.toast(i18n.t('combat.autoCaptureSuccess', { name: prefix + wildEcho.name }), 'success');
            } else {
                UI.addLog('capture', i18n.t('combat.captureSuccess', { name: prefix + wildEcho.name }));
                UI.toast(i18n.t('combat.captureSuccess', { name: prefix + wildEcho.name }), 'success');
            }
            return true;
        }
        if (!isAuto) {
            UI.addLog('info', i18n.t('combat.captureFailed'));
            UI.toast(i18n.t('combat.captureFailed'), 'error');
        } else {
            UI.addLog('info', i18n.t('combat.autoCaptureFailed', { name: wildEcho.name }));
        }
        return false;
    },

    attemptCapture(wildEcho) {
        return this.captureEcho(wildEcho);
    },

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

    setupEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => UI.switchTab(btn.dataset.tab));
        });
        document.getElementById('btn-tisser-coup').addEventListener('click', e => this.click(e));
        document.getElementById('btn-capture-combat').addEventListener('click', () => Combat.attemptCapture());
        document.getElementById('btn-flee').addEventListener('click', () => {
            Combat.endCombat();
            UI.renderRoutes();
            UI.updateCombat();
        });
        document.getElementById('btn-capture').addEventListener('click', () => UI.captureClick());
        const autoCaptureToggle = document.getElementById('auto-capture-toggle');
        if (autoCaptureToggle) {
            autoCaptureToggle.addEventListener('change', (e) => {
                Combat.autoCaptureEnabled = e.target.checked;
                UI.toast(e.target.checked ? 'Auto-capture active' : 'Auto-capture desactive', 'info');
            });
        }
        const btnAutoTeam = document.getElementById('btn-auto-team');
        if (btnAutoTeam) {
            btnAutoTeam.addEventListener('click', () => this.buildOptimalTeam());
        }
        const btnHealAll = document.getElementById('btn-heal-all');
        if (btnHealAll) {
            btnHealAll.addEventListener('click', () => {
                Combat.healParty();
                UI.renderParty();
                UI.toast('Equipe soignee !', 'success');
            });
        }
        document.getElementById('btn-save').addEventListener('click', () => { SaveSystem.save(); UI.toast(i18n.t('notifications.saved'), 'success'); });
        document.getElementById('btn-logbook').addEventListener('click', () => NarrativeSystem.showLogbook());
        document.getElementById('btn-settings').addEventListener('click', () => UI.showSettings());
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
                    document.querySelectorAll('.lang-option').forEach(opt => {
                        opt.classList.toggle('active', opt.dataset.lang === lang);
                    });
                });
            });
            document.addEventListener('click', () => {
                langDropdown.classList.remove('active');
            });
        }
        document.getElementById('modal-close').addEventListener('click', () => UI.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') UI.closeModal(); });
        document.getElementById('game-main').addEventListener('click', e => {
            if (e.target.closest('button, .route-card, .shop-item, .party-slot, .reserve-slot, .pokedex-card, .mine-tile, .nav-btn, .filter-btn, .shop-cat, .parent-slot, .combat-arena')) return;
            if (document.getElementById('tab-capture').classList.contains('active')) return;
            this.click(e);
        });
    },

    setupEventBus() {
        EventBus.on(GAME_EVENTS.ECHO_LEVELED_UP, ({ echo }) => {
            if (echo.level > this.state.maxLevel) this.state.maxLevel = echo.level;
            EventBus.emit('echo:levelUp', echo);
        });
        EventBus.on(GAME_EVENTS.ECHO_CAPTURED, () => {
            UI.renderParty();
            UI.renderPokedex();
        });
        EventBus.on(GAME_EVENTS.ECHO_EVOLVED, ({ oldName, echo }) => {
            UI.toast(oldName + ' evolue en ' + echo.name + ' !', 'success');
        });
        EventBus.on('quest:completed', (quest) => {
            UI.toast('Quete completee : ' + quest.name, 'success');
        });
        EventBus.on('quest:rewardsClaimed', (quest) => {
            UI.toast('Recompenses reclamees pour : ' + quest.name, 'success');
        });
    },

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

    loadGame() {
        if (SaveSystem.hasSave()) {
            if (SaveSystem.load()) {
                console.log('Sauvegarde chargee');
            } else {
                console.log('Erreur de chargage, nouveau jeu');
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => Game.init());
