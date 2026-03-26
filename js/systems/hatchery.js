// ============================================
// ÉchoClicker - Système d'Élevage / Incubateur
// ============================================

const Hatchery = {
    slots: [],
    maxSlots: 4,
    parents: [null, null],

    init() {
        this.slots = Array(this.maxSlots).fill(null);
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('btn-breed')?.addEventListener('click', () => this.breed());
        document.getElementById('parent-1')?.addEventListener('click', () => this.selectParent(0));
        document.getElementById('parent-2')?.addEventListener('click', () => this.selectParent(1));
    },

    selectParent(slotIndex) {
        const party = [...Game.state.party, ...Game.state.reserves];
        if (party.length === 0) {
            UI.toast('Aucun Écho disponible !', 'error');
            return;
        }

        let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
        party.forEach(echo => {
            const t = TYPES[echo.type];
            const imgPath = getEchoImagePath(echo);
            html += `<div class="party-slot" onclick="Hatchery.setParent(${slotIndex}, '${echo.uid}')">
                <div class="party-echo-icon">${echo.isPrimordial ? '⭐' : ''}<img src="${imgPath}" alt="${echo.name}" style="width:48px;height:48px;object-fit:contain"></div>
                <div class="party-echo-name">${echo.name}</div>
                <div class="party-echo-level">Nv. ${echo.level}</div>
            </div>`;
        });
        html += '</div>';

        UI.showModal('Sélectionner un parent', html);
    },

    setParent(slotIndex, uid) {
        const echo = Game.findEcho(uid);
        if (!echo) return;

        // Vérifier que le même Écho n'est pas dans l'autre slot
        const otherSlot = slotIndex === 0 ? 1 : 0;
        if (this.parents[otherSlot]?.uid === uid) {
            UI.toast('Cet Écho est déjà sélectionné !', 'warning');
            return;
        }

        this.parents[slotIndex] = echo;
        UI.closeModal();
        this.updateDisplay();
        this.checkCanBreed();
    },

    checkCanBreed() {
        const btn = document.getElementById('btn-breed');
        if (!btn) return;

        const canBreed = this.parents[0] && this.parents[1] && this.hasFreeSlot();
        btn.disabled = !canBreed;
    },

    hasFreeSlot() {
        return this.slots.some(s => s === null);
    },

    breed() {
        if (!this.parents[0] || !this.parents[1]) {
            UI.toast('Sélectionne deux parents !', 'error');
            return;
        }

        if (!this.hasFreeSlot()) {
            UI.toast('Tous les incubateurs sont occupés !', 'error');
            return;
        }

        // Vérifier la compatibilité (même type ou types compatibles)
        const p1 = this.parents[0];
        const p2 = this.parents[1];

        // Calculer le résultat
        const offspring = this.calculateOffspring(p1, p2);
        
        // Trouver un slot libre
        const slotIndex = this.slots.findIndex(s => s === null);
        
        // Calculer le temps d'incubation basé sur la rareté
        const incubationTime = this.getIncubationTime(offspring.rarity);
        
        this.slots[slotIndex] = {
            egg: offspring,
            startTime: Date.now(),
            duration: incubationTime,
            parent1: p1.id,
            parent2: p2.id
        };

        // Réinitialiser les parents
        this.parents = [null, null];

        UI.toast('🥚 Œuf créé ! Incubation en cours...', 'success');
        this.updateDisplay();
    },

    calculateOffspring(p1, p2) {
        // Déterminer le type de l'offspring
        const type = this.determineOffspringType(p1, p2);
        
        // Trouver les Échos possibles de ce type
        const possibleEchoes = ECHOES_DB.filter(e => e.type === type);
        
        // Choisir en fonction de la rareté des parents
        const avgRarity = this.getAverageRarity(p1, p2);
        const filteredEchoes = possibleEchoes.filter(e => 
            this.getRarityWeight(e.rarity) <= avgRarity + 1
        );

        const chosen = filteredEchoes.length > 0 
            ? filteredEchoes[Math.floor(Math.random() * filteredEchoes.length)]
            : possibleEchoes[0];

        // Chance de Primordial basée sur les parents
        const primordialChance = (p1.isPrimordial ? 0.02 : 0) + (p2.isPrimordial ? 0.02 : 0) + 0.005;
        const isPrimordial = Math.random() < primordialChance;

        // Niveau basé sur la moyenne des parents
        const avgLevel = Math.floor((p1.level + p2.level) / 2);
        const level = Math.max(1, avgLevel - 2 + Math.floor(Math.random() * 5));

        return {
            id: chosen.id,
            name: chosen.name,
            emoji: chosen.emoji,
            type: chosen.type,
            rarity: chosen.rarity,
            level: level,
            isPrimordial: isPrimordial,
            baseHp: chosen.baseHp,
            baseAtk: chosen.baseAtk,
            baseDef: chosen.baseDef,
            baseSpd: chosen.baseSpd
        };
    },

    determineOffspringType(p1, p2) {
        // 60% chance d'avoir le type du parent 1, 40% du parent 2
        // Ou un type mixte si les parents sont de types différents
        if (p1.type === p2.type) return p1.type;
        
        const rand = Math.random();
        if (rand < 0.45) return p1.type;
        if (rand < 0.9) return p2.type;
        
        // 10% de chance d'avoir un type aléatoire
        const types = Object.keys(TYPES);
        return types[Math.floor(Math.random() * types.length)];
    },

    getAverageRarity(p1, p2) {
        return (this.getRarityWeight(p1.rarity) + this.getRarityWeight(p2.rarity)) / 2;
    },

    getRarityWeight(rarity) {
        const weights = {
            common: 1,
            uncommon: 2,
            rare: 3,
            epic: 4,
            legendary: 5,
            mythical: 6
        };
        return weights[rarity] || 1;
    },

    getIncubationTime(rarity) {
        const times = {
            common: 30000,      // 30 secondes
            uncommon: 60000,    // 1 minute
            rare: 120000,       // 2 minutes
            epic: 300000,       // 5 minutes
            legendary: 600000,  // 10 minutes
            mythical: 900000    // 15 minutes
        };
        return times[rarity] || 30000;
    },

    update(dt) {
        const now = Date.now();
        this.slots.forEach((slot, index) => {
            if (slot && now >= slot.startTime + slot.duration) {
                this.hatch(index);
            }
        });
    },

    hatch(index) {
        const slot = this.slots[index];
        if (!slot) return;

        const eggData = slot.egg;
        const echo = new Echo(
            getEchoById(eggData.id),
            eggData.level,
            eggData.isPrimordial
        );

        // Ajouter à l'équipe ou aux réserves
        if (Game.state.party.length < GAME_CONFIG.MAX_PARTY) {
            Game.addToParty(echo);
        } else {
            Game.state.reserves.push(echo);
        }

        // Stats pour les succès
        Game.state.totalCaptures++;
        Game.state.caughtEchoes.add(echo.id);
        if (echo.isPrimordial) Game.state.primordialCount++;

        const prefix = echo.isPrimordial ? '✨ PRIMORDIAL ! ' : '';
        UI.toast(`${prefix}🥚 ${echo.name} est éclos !`, 'success');
        
        EventBus.emit(GAME_EVENTS.ECHO_CAPTURED, { echo });

        this.slots[index] = null;
        this.updateDisplay();
    },

    collectEgg(index) {
        const slot = this.slots[index];
        if (!slot) return;

        const now = Date.now();
        const elapsed = now - slot.startTime;
        const remaining = slot.duration - elapsed;

        if (remaining > 0) {
            // Accélérer avec des cristaux
            const cost = Math.ceil(remaining / 10000); // 1 cristal par 10 secondes
            if (Game.state.crystals >= cost) {
                if (confirm(`Accélérer pour ${cost} cristaux ?`)) {
                    Game.state.crystals -= cost;
                    slot.startTime = now - slot.duration;
                    this.updateDisplay();
                }
            } else {
                const timeStr = Utils.formatTime(Math.ceil(remaining / 1000));
                UI.toast(`Encore ${timeStr} avant l'éclosion`, 'info');
            }
        } else {
            this.hatch(index);
        }
    },

    updateDisplay() {
        // Mettre à jour les slots d'incubation
        const slotsEl = document.getElementById('hatchery-slots');
        if (slotsEl) {
            let html = '';
            this.slots.forEach((slot, i) => {
                if (slot) {
                    const now = Date.now();
                    const elapsed = now - slot.startTime;
                    const remaining = Math.max(0, slot.duration - elapsed);
                    const progress = Math.min(100, (elapsed / slot.duration) * 100);
                    const isReady = remaining <= 0;

                    html += `<div class="incubator-slot occupied" onclick="Hatchery.collectEgg(${i})">
                        <div class="incubator-egg">${isReady ? '✨' : '🥚'}</div>
                        <div class="incubator-progress">
                            <div class="progress-bar" style="width:${progress}%"></div>
                        </div>
                        <div class="incubator-timer">${isReady ? 'Prêt !' : Utils.formatTime(Math.ceil(remaining / 1000))}</div>
                    </div>`;
                } else {
                    html += `<div class="incubator-slot">
                        <div style="color:var(--text-muted)">🥚 Vide</div>
                    </div>`;
                }
            });
            slotsEl.innerHTML = html;
        }

        // Mettre à jour les parents
        const p1 = document.getElementById('parent-1');
        const p2 = document.getElementById('parent-2');
        
        if (p1) {
            if (this.parents[0]) {
                const imgPath1 = getEchoImagePath(this.parents[0]);
                p1.innerHTML = `<span class="slot-label">Parent 1</span>
                    <div class="slot-content"><img src="${imgPath1}" alt="${this.parents[0].name}" style="width:48px;height:48px;object-fit:contain"></div>
                    <div style="font-size:0.7rem">${this.parents[0].name}</div>`;
                p1.classList.add('filled');
            } else {
                p1.innerHTML = `<span class="slot-label">Parent 1</span><div class="slot-content">+</div>`;
                p1.classList.remove('filled');
            }
        }

        if (p2) {
            if (this.parents[1]) {
                const imgPath2 = getEchoImagePath(this.parents[1]);
                p2.innerHTML = `<span class="slot-label">Parent 2</span>
                    <div class="slot-content"><img src="${imgPath2}" alt="${this.parents[1].name}" style="width:48px;height:48px;object-fit:contain"></div>
                    <div style="font-size:0.7rem">${this.parents[1].name}</div>`;
                p2.classList.add('filled');
            } else {
                p2.innerHTML = `<span class="slot-label">Parent 2</span><div class="slot-content">+</div>`;
                p2.classList.remove('filled');
            }
        }

        this.checkCanBreed();
    },

    // Sauvegarde
    toJSON() {
        return {
            slots: this.slots,
            parents: this.parents.map(p => p ? p.uid : null)
        };
    },

    fromJSON(data) {
        if (data) {
            this.slots = data.slots || Array(this.maxSlots).fill(null);
            if (data.parents) {
                this.parents = [
                    data.parents[0] ? Game.findEcho(data.parents[0]) : null,
                    data.parents[1] ? Game.findEcho(data.parents[1]) : null
                ];
            }
        }
    }
};