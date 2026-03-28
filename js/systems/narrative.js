// ============================================
// EchoClicker - Systeme de Narration
// ============================================
// Gere les dialogues du PNJ guide, les dialogues de boss,
// le lore débloquable, les cinematiques et le Logbook.

const NarrativeSystem = {
    state: {
        seenDialogues: new Set(),
        unlockedLore: new Set(),
        seenCinematics: new Set(),
        currentGuideDialogue: null,
        dialogueQueue: []
    },

    init() {
        this.setupEventBus();
        this.checkInitialLore();
    },

    setupEventBus() {
        // Dialogues du guide
        EventBus.on(GAME_EVENTS.GAME_START, () => this.triggerGuideDialogue('game_start'));
        EventBus.on('combat:first', () => this.triggerGuideDialogue('first_combat'));
        EventBus.on('party:full', () => this.triggerGuideDialogue('party_full'));
        EventBus.on('echo:evolved', () => this.triggerGuideDialogue('first_evolution'));
        EventBus.on('boss:first', () => this.triggerGuideDialogue('first_boss'));
        
        // Evenements
        EventBus.on('echo:captured', (echo) => {
            if (echo.isPrimordial || echo.isShiny) {
                this.triggerGuideDialogue('shiny_captured');
            }
        });
        EventBus.on(GAME_EVENTS.REGION_UNLOCKED, () => this.triggerGuideDialogue('region_unlocked'));
        EventBus.on(GAME_EVENTS.BOSS_DEFEATED, () => this.triggerGuideDialogue('boss_defeated'));

        // Lore
        EventBus.on('echo:captured', () => this.checkLoreUnlocks());
        EventBus.on(GAME_EVENTS.REGION_UNLOCKED, () => this.checkLoreUnlocks());
        EventBus.on(GAME_EVENTS.BOSS_DEFEATED, () => this.checkLoreUnlocks());

        // Cinematiques
        EventBus.on(GAME_EVENTS.GAME_START, () => this.playCinematic('game_start'));
        EventBus.on('boss:first', () => this.playCinematic('first_boss'));
        EventBus.on('region:final', () => this.playCinematic('final_region'));
    },

    // ============================================
    // Dialogues du PNJ Guide
    // ============================================

    triggerGuideDialogue(trigger) {
        const guide = NARRATIVE_DATA.guide;
        let dialogue = null;

        // Chercher dans les introductions
        dialogue = guide.dialogues.introduction.find(d => d.trigger === trigger && !this.state.seenDialogues.has(d.id));
        if (dialogue) {
            this.showGuideDialogue(dialogue);
            return;
        }

        // Chercher dans les astuces
        dialogue = guide.dialogues.tips.find(d => d.trigger === trigger && !this.state.seenDialogues.has(d.id));
        if (dialogue) {
            this.showGuideDialogue(dialogue);
            return;
        }

        // Chercher dans les evenements
        dialogue = guide.dialogues.events.find(d => d.trigger === trigger && !this.state.seenDialogues.has(d.id));
        if (dialogue) {
            this.showGuideDialogue(dialogue);
            return;
        }
    },

    showGuideDialogue(dialogue) {
        this.state.seenDialogues.add(dialogue.id);
        this.state.currentGuideDialogue = dialogue;

        const guide = NARRATIVE_DATA.guide;
        UI.showModal(
            `${guide.avatar} ${guide.name}`,
            `<div class="narrative-dialogue">
                <p class="dialogue-text">${dialogue.text}</p>
            </div>`,
            `<button class="btn-combat" onclick="UI.closeModal()">Continuer</button>`
        );

        EventBus.emit('narrative:dialogue', { type: 'guide', dialogue });
    },

    // ============================================
    // Dialogues de Boss
    // ============================================

    showBossDialogue(regionId, isBefore = true) {
        const bossData = NARRATIVE_DATA.bosses[regionId];
        if (!bossData) return null;

        const dialogues = isBefore ? bossData.before : bossData.after;
        const randomIndex = Math.floor(Math.random() * dialogues.length);
        const dialogue = dialogues[randomIndex];

        return {
            name: bossData.name,
            text: dialogue
        };
    },

    showBossDialogueModal(regionId, isBefore = true) {
        const dialogue = this.showBossDialogue(regionId, isBefore);
        if (!dialogue) return;

        const emoji = isBefore ? '⚔️' : '🏆';
        UI.showModal(
            `${emoji} ${dialogue.name}`,
            `<div class="narrative-dialogue boss-dialogue">
                <p class="dialogue-text">"${dialogue.text}"</p>
            </div>`,
            `<button class="btn-combat" onclick="UI.closeModal()">${isBefore ? 'Combattre' : 'Continuer'}</button>`
        );

        EventBus.emit('narrative:dialogue', { type: 'boss', regionId, isBefore, dialogue });
    },

    // ============================================
    // Lore débloquable
    // ============================================

    checkLoreUnlocks() {
        const stats = Game.getStats();
        const state = Game.state;

        // Verifier le lore du monde
        NARRATIVE_DATA.lore.world.forEach(lore => {
            if (this.state.unlockedLore.has(lore.id)) return;
            
            if (this.checkUnlockCondition(lore.unlockCondition, stats, state)) {
                this.unlockLore(lore);
            }
        });

        // Verifier le lore des regions
        Object.entries(NARRATIVE_DATA.lore.regions).forEach(([regionId, lores]) => {
            lores.forEach(lore => {
                if (this.state.unlockedLore.has(lore.id)) return;
                
                if (this.checkUnlockCondition(lore.unlockCondition, stats, state)) {
                    this.unlockLore(lore);
                }
            });
        });

        // Verifier le lore des Echoes
        NARRATIVE_DATA.lore.echoes.forEach(lore => {
            if (this.state.unlockedLore.has(lore.id)) return;
            
            if (this.checkUnlockCondition(lore.unlockCondition, stats, state)) {
                this.unlockLore(lore);
            }
        });
    },

    checkUnlockCondition(condition, stats, state) {
        switch (condition.type) {
            case 'start':
                return true;
            case 'captures':
                return stats.totalCaptures >= condition.value;
            case 'unique_captures':
                return stats.uniqueCaptures >= condition.value;
            case 'region':
                const region = state.regions.find(r => r.id === condition.value);
                return region && region.unlocked;
            case 'boss_defeated':
                const regionBoss = state.regions.find(r => r.id === condition.value);
                return regionBoss && regionBoss.bossDefeated;
            case 'primordial_captured':
                return stats.primordialCount > 0;
            default:
                return false;
        }
    },

    unlockLore(lore) {
        this.state.unlockedLore.add(lore.id);
        
        UI.toast(`📖 Nouveau lore débloqué : ${lore.title}`, 'info');
        
        EventBus.emit('narrative:lore_unlocked', lore);
    },

    checkInitialLore() {
        // Debloquer le lore initial
        const initialLore = NARRATIVE_DATA.lore.world.find(l => l.unlockCondition.type === 'start');
        if (initialLore && !this.state.unlockedLore.has(initialLore.id)) {
            this.state.unlockedLore.add(initialLore.id);
        }
    },

    // ============================================
    // Cinematiques textuelles
    // ============================================

    playCinematic(cinematicId) {
        if (this.state.seenCinematics.has(cinematicId)) return;

        const cinematic = NARRATIVE_DATA.cinematics[cinematicId];
        if (!cinematic) return;

        this.state.seenCinematics.add(cinematicId);
        this.showCinematicScene(cinematic, 0);
    },

    showCinematicScene(cinematic, sceneIndex) {
        if (sceneIndex >= cinematic.scenes.length) {
            UI.closeModal();
            EventBus.emit('narrative:cinematic_complete', cinematic);
            return;
        }

        const scene = cinematic.scenes[sceneIndex];
        
        UI.showModal(
            `🎬 ${cinematic.title}`,
            `<div class="narrative-cinematic">
                <p class="cinematic-text">${scene.text}</p>
                <div class="cinematic-progress">
                    ${cinematic.scenes.map((_, i) => `<span class="progress-dot ${i <= sceneIndex ? 'active' : ''}"></span>`).join('')}
                </div>
            </div>`,
            `<button class="btn-combat secondary" onclick="NarrativeSystem.skipCinematic()">Passer</button>
             <button class="btn-combat" onclick="NarrativeSystem.nextCinematicScene('${cinematic.title}', ${sceneIndex + 1})">Suivant</button>`
        );
    },

    nextCinematicScene(cinematicTitle, nextIndex) {
        // Trouver la cinematique par son titre
        const cinematic = Object.values(NARRATIVE_DATA.cinematics).find(c => c.title === cinematicTitle);
        if (cinematic) {
            this.showCinematicScene(cinematic, nextIndex);
        }
    },

    skipCinematic() {
        UI.closeModal();
    },

    // ============================================
    // Logbook
    // ============================================

    getLogbookData() {
        const guide = NARRATIVE_DATA.guide;
        const allDialogues = [
            ...guide.dialogues.introduction,
            ...guide.dialogues.tips,
            ...guide.dialogues.events
        ];

        const seenGuideDialogues = allDialogues.filter(d => this.state.seenDialogues.has(d.id));
        
        const unlockedLoreEntries = [];
        Object.values(NARRATIVE_DATA.lore).forEach(category => {
            if (Array.isArray(category)) {
                category.forEach(lore => {
                    if (this.state.unlockedLore.has(lore.id)) {
                        unlockedLoreEntries.push(lore);
                    }
                });
            } else {
                Object.values(category).forEach(regionLores => {
                    regionLores.forEach(lore => {
                        if (this.state.unlockedLore.has(lore.id)) {
                            unlockedLoreEntries.push(lore);
                        }
                    });
                });
            }
        });

        return {
            guideDialogues: seenGuideDialogues,
            lore: unlockedLoreEntries,
            cinematics: this.state.seenCinematics
        };
    },

    showLogbook() {
        const data = this.getLogbookData();
        
        let html = `
            <div class="logbook-container">
                <div class="logbook-tabs">
                    <button class="logbook-tab active" onclick="NarrativeSystem.switchLogbookTab('guide')">📜 Dialogues</button>
                    <button class="logbook-tab" onclick="NarrativeSystem.switchLogbookTab('lore')">📖 Lore</button>
                    <button class="logbook-tab" onclick="NarrativeSystem.switchLogbookTab('cinematics')">🎬 Cinematiques</button>
                </div>
                <div class="logbook-content" id="logbook-content">
                    ${this.renderLogbookGuide(data.guideDialogues)}
                </div>
            </div>
        `;

        UI.showModal('📕 Logbook', html, '<button class="btn-combat secondary" onclick="UI.closeModal()">Fermer</button>');
    },

    switchLogbookTab(tab) {
        const data = this.getLogbookData();
        const content = document.getElementById('logbook-content');
        
        // Mettre a jour les onglets
        document.querySelectorAll('.logbook-tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');

        switch (tab) {
            case 'guide':
                content.innerHTML = this.renderLogbookGuide(data.guideDialogues);
                break;
            case 'lore':
                content.innerHTML = this.renderLogbookLore(data.lore);
                break;
            case 'cinematics':
                content.innerHTML = this.renderLogbookCinematics(data.cinematics);
                break;
        }
    },

    renderLogbookGuide(dialogues) {
        if (dialogues.length === 0) {
            return '<p class="logbook-empty">Aucun dialogue vu pour le moment.</p>';
        }

        return `
            <div class="logbook-section">
                <h3>Dialogues du Tisseur Ancien</h3>
                ${dialogues.map(d => `
                    <div class="logbook-entry">
                        <p class="entry-text">${d.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderLogbookLore(loreEntries) {
        if (loreEntries.length === 0) {
            return '<p class="logbook-empty">Aucun lore débloqué pour le moment.</p>';
        }

        return `
            <div class="logbook-section">
                <h3>Entrées de Lore</h3>
                ${loreEntries.map(lore => `
                    <div class="logbook-entry lore-entry">
                        <h4 class="entry-title">${lore.title}</h4>
                        <p class="entry-text">${lore.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderLogbookCinematics(cinematics) {
        if (cinematics.size === 0) {
            return '<p class="logbook-empty">Aucune cinematique vue pour le moment.</p>';
        }

        const cinematicEntries = Array.from(cinematics).map(id => {
            return Object.values(NARRATIVE_DATA.cinematics).find(c => c.title === id || Object.keys(NARRATIVE_DATA.cinematics).find(k => k === id));
        }).filter(Boolean);

        return `
            <div class="logbook-section">
                <h3>Cinematiques</h3>
                ${cinematicEntries.map(c => `
                    <div class="logbook-entry cinematic-entry">
                        <h4 class="entry-title">🎬 ${c.title}</h4>
                        <p class="entry-text">${c.scenes.length} scenes</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ============================================
    // Sauvegarde
    // ============================================

    toJSON() {
        return {
            seenDialogues: [...this.state.seenDialogues],
            unlockedLore: [...this.state.unlockedLore],
            seenCinematics: [...this.state.seenCinematics]
        };
    },

    fromJSON(data) {
        if (!data) return;
        
        this.state.seenDialogues = new Set(data.seenDialogues || []);
        this.state.unlockedLore = new Set(data.unlockedLore || []);
        this.state.seenCinematics = new Set(data.seenCinematics || []);
    }
};