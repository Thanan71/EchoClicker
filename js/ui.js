// ============================================
// ÉchoClicker - Interface utilisateur (v2)
// ============================================

// Helper function to get echo image path
function getEchoImagePath(echo) {
    const id = String(echo.id).padStart(3, '0');
    const suffix = echo.isShiny ? '_shiny_no_bg' : '_no_bg';
    return `assets/echos-no-bg/echo_${id}${suffix}.png`;
}

function getEchoImagePathById(id, isShiny = false) {
    const idStr = String(id).padStart(3, '0');
    const suffix = isShiny ? '_shiny_no_bg' : '_no_bg';
    return `assets/echos-no-bg/echo_${idStr}${suffix}.png`;
}

const UI = {
    currentTab: 'map',
    captureWildEcho: null,
    // Filtres du Pokédex
    pokedexStatusFilter: 'all',  // 'all', 'caught', 'unseen'
    pokedexTypeFilter: null,     // null = tous, ou nom du type

    init() {
        this.renderRoutes();
        this.renderShop();
        this.renderAchievements();
        this.initPokedexFilters();
        this.renderPokedex();
        this.updateAll();
        this.setupEventBus();
    },

    // === Render loop (appelé par GameLoop) ===
    render(alpha) {
        this.updateCurrencies();
        this.updateFooter();
    },

    // === EventBus listeners ===
    setupEventBus() {
        EventBus.on(GAME_EVENTS.ECHO_CAPTURED, () => { this.renderParty(); this.renderPokedex(); });
        EventBus.on(GAME_EVENTS.ECHO_LEVELED_UP, ({ echo }) => this.renderParty());
        EventBus.on(GAME_EVENTS.ECHO_EVOLVED, () => this.renderParty());
        EventBus.on(GAME_EVENTS.ROUTE_UNLOCKED, () => this.renderRoutes());
        EventBus.on(GAME_EVENTS.REGION_UNLOCKED, () => this.renderRoutes());
        EventBus.on(GAME_EVENTS.BOSS_DEFEATED, () => this.renderRoutes());
    },

    // === Navigation ===
    switchTab(tabId) {
        this.currentTab = tabId;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelector(`.nav-btn[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`tab-${tabId}`)?.classList.add('active');

        const renderers = {
            map: () => { this.renderRoutes(); this.updateCombat(); },
            party: () => this.renderParty(),
            capture: () => this.renderCaptureZone(),
            pokedex: () => this.renderPokedex(),
            shop: () => this.renderShop(),
            achievements: () => this.renderAchievements(),
            mine: () => this.renderMine(),
            hatchery: () => this.renderHatchery()
        };
        renderers[tabId]?.();
    },

    // === Mise à jour globale ===
    updateAll() {
        this.updateCurrencies();
        this.updateFooter();
        this.updateCombat();
        this.renderRoutes();
        this.updateBoostsDisplay();
    },

    // === Affichage des boosts actifs ===
    updateBoostsDisplay() {
        const container = document.getElementById('boosts-indicator');
        if (!container) return;

        let html = '';
        const now = Date.now();

        // Vérifier chaque boost
        const boostTypes = {
            'xp': { icon: '📈', name: 'XP', cssClass: 'xp' },
            'capture': { icon: '🎯', name: 'Capture', cssClass: 'capture' },
            'energy': { icon: '⚡', name: 'Énergie', cssClass: 'energy' }
        };

        for (const [type, boost] of Object.entries(Game.state.boosts)) {
            if (boost && boost.endTime && now < boost.endTime) {
                const remaining = Math.ceil((boost.endTime - now) / 1000);
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                const timerText = minutes > 0 ? `${minutes}m${seconds}s` : `${seconds}s`;
                const config = boostTypes[type] || { icon: '✨', name: type, cssClass: '' };
                
                html += `<div class="boost-badge ${config.cssClass}">
                    <span class="boost-icon">${config.icon}</span>
                    <span class="boost-name">${config.name}</span>
                    <span class="boost-timer">${timerText}</span>
                </div>`;
            }
        }

        container.innerHTML = html;
    },

    updateCurrencies() {
        const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = Utils.formatNumber(v); };
        el('energy-value', Game.state.energy);
        el('links-value', Game.state.links);
        el('crystals-value', Game.state.crystals);
        el('shards-value', Game.state.shards);
    },

    updateFooter() {
        const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        el('play-time', Utils.formatTime(Game.state.playTime));
        el('total-clicks', Utils.formatNumber(Game.state.totalClicks));
        el('total-echoes', Game.state.caughtEchoes.size);
        el('cps-display', Game.getCPS().toFixed(1));
    },

    // === Carte & Routes ===
    renderRoutes() {
        const region = Game.state.regions.find(r => r.id === Game.state.currentRegion);
        if (!region) return;

        // Mettre à jour le panneau d'info de la région
        const regionNameEl = document.getElementById('region-name');
        const regionDescEl = document.getElementById('region-desc');
        if (regionNameEl) regionNameEl.textContent = `${region.emoji} ${region.name}`;
        if (regionDescEl) regionDescEl.textContent = region.desc;

        // Mettre à jour les boutons de navigation de la carte
        if (MapSystem.createNavigationButtons) {
            MapSystem.createNavigationButtons();
        }
    },

    // === Combat ===
    updateCombat() {
        const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        const setHTML = (id, v) => { const e = document.getElementById(id); if (e) e.innerHTML = v; };
        const setStyle = (id, prop, v) => { const e = document.getElementById(id); if (e) e.style.setProperty(prop, v); };

        if (Combat.enemy) {
            const e = Combat.enemy;
            const imgPath = getEchoImagePath(e);
            const primordialBadge = e.isPrimordial ? '<span style="position:absolute;top:-5px;right:-5px;font-size:1rem">⭐</span>' : '';
            setHTML('enemy-sprite', `<div style="position:relative;display:inline-block">${primordialBadge}<img src="${imgPath}" alt="${e.name}" style="width:64px;height:64px;object-fit:contain"></div>`);
            set('enemy-name', e.bossName || e.name);
            const hpPct = Math.max(0, e.getHpPercent());
            setStyle('enemy-hp-bar', '--hp-percent', hpPct+'%');
            set('enemy-hp-text', `${Math.max(0,Math.floor(e.hp))}/${Math.floor(e.maxHp)}`);
            const t = TYPES[e.type];
            const et = document.getElementById('enemy-type');
            if (et) { et.textContent = `${t.emoji} ${t.name}`; et.style.background = t.color; et.style.color = '#fff'; }
            document.getElementById('btn-capture-combat').disabled = false;
        } else {
            set('enemy-sprite', '❓'); set('enemy-name', '???');
            setStyle('enemy-hp-bar', '--hp-percent', '100%');
            set('enemy-hp-text', '???/???');
            const et = document.getElementById('enemy-type'); if (et) et.textContent = '';
            document.getElementById('btn-capture-combat').disabled = true;
        }

        if (Combat.activeEcho) {
            const p = Combat.activeEcho;
            const imgPath = getEchoImagePath(p);
            const primordialBadge = p.isPrimordial ? '<span style="position:absolute;top:-5px;right:-5px;font-size:1rem">⭐</span>' : '';
            setHTML('player-sprite', `<div style="position:relative;display:inline-block">${primordialBadge}<img src="${imgPath}" alt="${p.name}" style="width:64px;height:64px;object-fit:contain"></div>`);
            set('player-name', p.name);
            const hpPct = Math.max(0, p.getHpPercent());
            setStyle('player-hp-bar', '--hp-percent', hpPct+'%');
            set('player-hp-text', `${Math.max(0,Math.floor(p.hp))}/${Math.floor(p.maxHp)}`);
            const t = TYPES[p.type];
            const pt = document.getElementById('player-type');
            if (pt) { pt.textContent = `${t.emoji} ${t.name}`; pt.style.background = t.color; pt.style.color = '#fff'; }
            document.getElementById('btn-tisser-coup').disabled = false;
            const dmg = p.calculateDamageAgainst(Combat.enemy || p) * GAME_CONFIG.COMBAT_CLICK_MULTIPLIER;
            set('dmg-preview', `+${dmg} dégâts`);
        } else {
            set('player-sprite', '❓'); set('player-name', 'Aucun Écho');
            setStyle('player-hp-bar', '--hp-percent', '100%');
            set('player-hp-text', '???/???');
            const pt = document.getElementById('player-type'); if (pt) pt.textContent = '';
            document.getElementById('btn-tisser-coup').disabled = true;
            set('dmg-preview', '+0 dégâts');
        }
    },

    // === Équipe ===
    renderParty() {
        const pg = document.getElementById('party-grid');
        const rg = document.getElementById('reserves-grid');
        if (!pg || !rg) return;

        let ph = '';
        for (let i = 0; i < 6; i++) {
            const echo = Game.state.party[i];
            if (echo) {
                const active = Combat.activeEcho?.uid === echo.uid;
                const hpPct = echo.getHpPercent();
                const imgPath = getEchoImagePath(echo);
                ph += `<div class="party-slot ${active?'active-combat':''}" onclick="UI.showEchoDetail('${echo.uid}')">`;
                if (echo.isPrimordial) ph += '<span class="primordial-badge">⭐</span>';
                ph += `<div class="party-echo-icon"><img src="${imgPath}" alt="${echo.name}" style="width:48px;height:48px;object-fit:contain"></div>`;
                ph += `<div class="party-echo-name">${echo.name}</div>`;
                ph += `<div class="party-echo-level">Nv. ${echo.level}</div>`;
                ph += `<div class="party-echo-hp" style="color:${hpPct<30?'var(--accent-red)':hpPct<60?'var(--accent-gold)':'var(--accent-green)'}">❤️ ${Math.floor(echo.hp)}/${Math.floor(echo.maxHp)}</div>`;
                ph += '</div>';
            } else {
                ph += '<div class="party-slot empty"><div class="party-echo-icon">➕</div><div class="party-echo-name">Vide</div></div>';
            }
        }
        pg.innerHTML = ph;

        let rh = '';
        Game.state.reserves.forEach(echo => {
            const imgPath = getEchoImagePath(echo);
            rh += `<div class="reserve-slot" onclick="UI.showEchoDetail('${echo.uid}')" title="${echo.name} Nv.${echo.level}">${echo.isPrimordial?'⭐':''}<img src="${imgPath}" alt="${echo.name}" style="width:32px;height:32px;object-fit:contain"></div>`;
        });
        if (!Game.state.reserves.length) rh = '<div style="color:var(--text-muted);padding:20px;text-align:center">Aucun Écho en réserve</div>';
        rg.innerHTML = rh;
    },

    showEchoDetail(uid) {
        const echo = Game.findEcho(uid);
        if (!echo) return;
        const t = TYPES[echo.type];
        const inParty = Game.state.party.some(e => e.uid === uid);
        const imgPath = getEchoImagePath(echo);

        let html = `<div style="text-align:center">
            <div style="margin:10px 0;position:relative;display:inline-block">
                ${echo.isPrimordial?'<span style="position:absolute;top:0;right:0;font-size:1.5rem">⭐</span>':''}
                <img src="${imgPath}" alt="${echo.name}" style="width:128px;height:128px;object-fit:contain">
            </div>
            <h3 style="font-family:var(--font-title)">${echo.name}</h3>
            <span class="type-badge" style="background:${t.color};color:#fff;padding:4px 12px;border-radius:12px;font-size:0.8rem">${t.emoji} ${t.name}</span>
            ${echo.isPrimordial?'<div style="color:var(--accent-gold);margin-top:8px">✨ Primordial (+10%)</div>':''}
            <p style="color:var(--text-secondary);margin:12px 0;font-style:italic">${echo.description}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0">
            <div class="stat"><span class="stat-label">Niveau</span><span class="stat-value">${echo.level}</span></div>
            <div class="stat"><span class="stat-label">XP</span><span class="stat-value">${Math.floor(echo.xp)}/${echo.xpToNext}</span></div>
            <div class="stat"><span class="stat-label">HP</span><span class="stat-value">${Math.floor(echo.hp)}/${Math.floor(echo.maxHp)}</span></div>
            <div class="stat"><span class="stat-label">ATK</span><span class="stat-value">${Math.floor(echo.atk)}</span></div>
            <div class="stat"><span class="stat-label">DEF</span><span class="stat-value">${Math.floor(echo.def)}</span></div>
            <div class="stat"><span class="stat-label">SPD</span><span class="stat-value">${Math.floor(echo.spd)}</span></div>
        </div>`;

        if (echo.evolution) {
            const evo = getEchoById(echo.evolution.to);
            const evoImgPath = evo ? getEchoImagePathById(evo.id) : '';
            html += `<div style="text-align:center;margin:12px 0;color:var(--accent-gold)">📈 Évolue en ${evo?`<img src="${evoImgPath}" alt="${evo.name}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle">`:''} ${evo?.name||'?'} au niveau ${echo.evolution.lv}</div>`;
        }

        const footer = inParty
            ? `<button class="btn-combat secondary" onclick="Game.removeFromParty('${uid}');UI.closeModal();UI.renderParty()">📦 Réserve</button>`
            : `<button class="btn-combat" onclick="Game.moveToParty('${uid}');UI.closeModal();UI.renderParty()">👥 Équipe</button>`;

        this.showModal(echo.name, html, footer);
    },

    // === Capture ===
    renderCaptureZone() {
        if (!this.captureWildEcho) this.generateCaptureEcho();
        this.updateCaptureDisplay();
    },

    generateCaptureEcho() {
        const region = Game.state.regions.find(r => r.id === Game.state.currentRegion);
        if (!region) return;
        const unlocked = region.routes.filter(r => r.unlocked);
        if (!unlocked.length) return;
        const route = unlocked[unlocked.length - 1];
        this.captureWildEcho = generateWildEcho(route.ids, route.lv);
        if (this.captureWildEcho) Game.state.seenEchoes.add(this.captureWildEcho.id);
    },

    updateCaptureDisplay() {
        const e = this.captureWildEcho;
        if (!e) return;
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        const setHTML = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };
        const setStyle = (id, prop, v) => { const el = document.getElementById(id); if (el) el.style.setProperty(prop, v); };

        const imgPath = getEchoImagePath(e);
        const primordialBadge = e.isPrimordial ? '<span style="position:absolute;top:0;right:0;font-size:1.5rem">⭐</span>' : '';
        setHTML('wild-echo', `<div style="position:relative;display:inline-block">${primordialBadge}<img src="${imgPath}" alt="${e.name}" style="width:96px;height:96px;object-fit:contain"></div>`);
        set('wild-echo-name', e.name + (e.isPrimordial ? ' (Primordial)' : ''));
        setStyle('wild-hp-bar', '--hp-percent', e.getHpPercent()+'%');
        set('wild-hp-text', `${Math.floor(e.hp)}/${Math.floor(e.maxHp)}`);
        const rate = Utils.calculateCaptureRate(e.captureRate || 30, e.hp, e.maxHp);
        set('capture-rate', rate.toFixed(1)+'%');
        set('total-captures', Game.state.totalCaptures);
        set('unique-captures', Game.state.uniqueCaptures);
        set('primordial-count', Game.state.primordialCount);
        document.getElementById('btn-capture').disabled = Game.state.links < 1;
        const cr = document.getElementById('capture-result');
        if (cr) { cr.textContent = ''; cr.className = 'capture-result'; }
    },

    captureClick() {
        if (!this.captureWildEcho) return;
        if (Game.state.links < 1) { this.toast('Pas assez de Liens !', 'error'); return; }

        const dmg = Math.max(1, Math.floor(this.captureWildEcho.maxHp * 0.15));
        this.captureWildEcho.takeDamage(dmg);

        const success = Game.attemptCapture(this.captureWildEcho);
        const cr = document.getElementById('capture-result');
        if (cr) {
            cr.textContent = success ? '✨ Capture réussie !' : '💥 Capture échouée !';
            cr.className = `capture-result ${success?'success':'fail'}`;
        }
        if (success) setTimeout(() => this.generateCaptureEcho(), 1000);
        this.updateCaptureDisplay();
    },

    // === Pokédex ===
    initPokedexFilters() {
        // Générer les boutons de filtre par type
        const typeFiltersContainer = document.getElementById('type-filters');
        if (typeFiltersContainer) {
            let typeHtml = '<button class="type-filter-btn active" data-type="all">Tous</button>';
            Object.entries(TYPES).forEach(([key, type]) => {
                typeHtml += `<button class="type-filter-btn" data-type="${key}" style="--type-color:${type.color}">${type.emoji} ${type.name}</button>`;
            });
            typeFiltersContainer.innerHTML = typeHtml;
        }

        // Attacher les gestionnaires d'événements pour les filtres de statut
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.pokedexStatusFilter = btn.dataset.filter;
                this.renderPokedex();
            });
        });

        // Attacher les gestionnaires d'événements pour les filtres par type
        document.querySelectorAll('.type-filter-btn[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-filter-btn[data-type]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.pokedexTypeFilter = btn.dataset.type === 'all' ? null : btn.dataset.type;
                this.renderPokedex();
            });
        });
    },

    renderPokedex() {
        const grid = document.getElementById('pokedex-grid');
        if (!grid) return;

        // Filtrer les Échos selon les critères actifs
        const filteredEchoes = ECHOES_DB.filter(echo => {
            const caught = Game.state.caughtEchoes.has(echo.id);
            const seen = Game.state.seenEchoes.has(echo.id);

            // Filtre par statut
            let statusMatch = true;
            if (this.pokedexStatusFilter === 'caught') {
                statusMatch = caught;
            } else if (this.pokedexStatusFilter === 'unseen') {
                statusMatch = !seen;
            }

            // Filtre par type
            let typeMatch = true;
            if (this.pokedexTypeFilter) {
                typeMatch = echo.type === this.pokedexTypeFilter;
            }

            return statusMatch && typeMatch;
        });

        // Mettre à jour le compteur de résultats
        const counterEl = document.getElementById('pokedex-counter');
        if (counterEl) {
            counterEl.textContent = `${filteredEchoes.length} / ${ECHOES_DB.length} Échos`;
        }

        // Générer le HTML
        let html = '';
        filteredEchoes.forEach(echo => {
            const caught = Game.state.caughtEchoes.has(echo.id);
            const seen = Game.state.seenEchoes.has(echo.id);
            const status = caught ? 'caught' : seen ? 'seen' : 'unseen';
            const t = TYPES[echo.type];
            const imgPath = getEchoImagePathById(echo.id);
            html += `<div class="pokedex-card ${status}" onclick="UI.showPokedexDetail(${echo.id})">`;
            html += `<span class="pokedex-number">#${echo.id.toString().padStart(3,'0')}</span>`;
            html += `<div class="pokedex-echo-icon">${seen ? `<img src="${imgPath}" alt="${echo.name}" style="width:48px;height:48px;object-fit:contain">` : '❓'}</div>`;
            if (seen) {
                html += `<div class="pokedex-echo-name">${echo.name}</div>`;
                html += `<span class="pokedex-echo-type" style="background:${t.color};color:#fff">${t.emoji} ${t.name}</span>`;
            } else {
                html += '<div class="pokedex-echo-name">???</div>';
            }
            html += '</div>';
        });

        if (filteredEchoes.length === 0) {
            html = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px">Aucun Écho trouvé avec ces filtres</div>';
        }

        grid.innerHTML = html;
    },

    showPokedexDetail(id) {
        const echo = getEchoById(id);
        if (!echo) return;
        if (!Game.state.seenEchoes.has(id)) {
            this.showModal('Écho Inconnu', '<p style="text-align:center;color:var(--text-muted)">Non rencontré.</p>');
            return;
        }
        const t = TYPES[echo.type];
        const caught = Game.state.caughtEchoes.has(id);
        const imgPath = getEchoImagePathById(echo.id);
        let html = `<div style="text-align:center">
            <div style="margin:10px 0"><img src="${imgPath}" alt="${echo.name}" style="width:128px;height:128px;object-fit:contain"></div>
            <h3 style="font-family:var(--font-title)">${echo.name}</h3>
            <span class="type-badge" style="background:${t.color};color:#fff;padding:4px 12px;border-radius:12px">${t.emoji} ${t.name}</span>
            <p style="color:var(--text-secondary);margin:12px 0;font-style:italic">${echo.desc}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0">
            <div class="stat"><span class="stat-label">HP</span><span class="stat-value">${echo.baseHp}</span></div>
            <div class="stat"><span class="stat-label">ATK</span><span class="stat-value">${echo.baseAtk}</span></div>
            <div class="stat"><span class="stat-label">DEF</span><span class="stat-value">${echo.baseDef}</span></div>
        </div>
        <div style="text-align:center;margin:8px 0"><span style="color:${caught?'var(--accent-green)':'var(--accent-red)'}">${caught?'✅ Capturé':'❌ Non capturé'}</span></div>`;
        if (echo.evo) {
            const evo = getEchoById(echo.evo.to);
            const evoImgPath = evo ? getEchoImagePathById(evo.id) : '';
            html += `<div style="text-align:center;color:var(--accent-gold)">📈 Évolue en ${evo?`<img src="${evoImgPath}" alt="${evo.name}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle">`:''} ${evo?.name||'?'} au niveau ${echo.evo.lv}</div>`;
        }
        this.showModal(`#${echo.id.toString().padStart(3,'0')} - ${echo.name}`, html);
    },

    // === Boutique ===
    renderShop() {
        const container = document.getElementById('shop-items');
        if (!container) return;
        const activeCat = document.querySelector('.shop-cat.active')?.dataset.cat || 'links';
        const items = SHOP[activeCat] || [];

        let html = '';
        items.forEach(item => {
            const canBuy = item.currency === 'energy' ? Game.state.energy >= item.price : Game.state.shards >= item.price;
            html += `<div class="shop-item">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">${item.currency==='shards'?'✨':'💎'} ${item.price}</div>
                <button class="btn-buy" ${canBuy?'':'disabled'} onclick='Game.buyItem(${JSON.stringify(item)})'>Acheter</button>
            </div>`;
        });
        container.innerHTML = html;

        document.querySelectorAll('.shop-cat').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.shop-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderShop();
            };
        });
    },

    // === Succès ===
    renderAchievements() {
        const list = document.getElementById('achievements-list');
        if (!list) return;
        const unlocked = Game.state.achievements.size;
        const total = ACHIEVEMENTS.length;
        const pct = total > 0 ? (unlocked / total) * 100 : 0;
        const prog = document.getElementById('achievement-progress');
        if (prog) prog.style.width = pct + '%';
        const cnt = document.getElementById('achievement-count');
        if (cnt) cnt.textContent = `${unlocked} / ${total}`;

        let html = '';
        ACHIEVEMENTS.forEach(ach => {
            const done = Game.state.achievements.has(ach.id);
            html += `<div class="achievement-card ${done?'unlocked':'locked'}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info"><div class="achievement-name">${ach.name}</div><div class="achievement-desc">${ach.desc}</div></div>
                ${done?'<span style="color:var(--accent-gold)">✅</span>':''}
            </div>`;
        });
        list.innerHTML = html;
    },

    // === Mine ===
    renderMine() {
        Mine.updateDisplay();
    },

    // === Élevage ===
    renderHatchery() {
        Hatchery.updateDisplay();
    },

    // === Logs ===
    addLog(type, message) {
        const log = document.getElementById('combat-log');
        if (!log) return;
        const entry = document.createElement('p');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        while (log.children.length > GAME_CONFIG.MAX_LOG_ENTRIES) log.removeChild(log.firstChild);
    },

    // === Particules ===
    spawnParticle(event, text) {
        const container = document.getElementById('click-particles');
        if (!container) return;
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = text;
        p.style.left = (event?.clientX || 300) + 'px';
        p.style.top = (event?.clientY || 300) + 'px';
        p.style.color = 'var(--accent-gold)';
        p.style.fontWeight = '700';
        container.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    },

    spawnDamageParticle(dmg) {
        const container = document.getElementById('click-particles');
        if (!container) return;
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = `-${dmg}`;
        p.style.left = (Math.random() * 300 + 100) + 'px';
        p.style.top = '120px';
        p.style.color = 'var(--accent-red)';
        p.style.fontWeight = '700';
        container.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    },

    // === Toast ===
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = message;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },

    // === Modal ===
    showModal(title, bodyHtml, footerHtml = '') {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal-footer').innerHTML = footerHtml;
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    // === Paramètres ===
    showSettings() {
        this.showModal('⚙️ Paramètres', `
            <div style="display:flex;flex-direction:column;gap:12px">
                <button class="btn-combat" onclick="SaveSystem.save();UI.toast('Sauvegardé !','success');UI.closeModal()">💾 Sauvegarder</button>
                <button class="btn-combat secondary" onclick="Game.exportSave();UI.closeModal()">📤 Exporter</button>
                <button class="btn-combat secondary" onclick="Game.importSave();UI.closeModal()">📥 Importer</button>
                <button class="btn-combat" style="background:linear-gradient(135deg,var(--accent-red),#dc2626)" onclick="Game.resetGame()">🗑️ Réinitialiser</button>
            </div>
        `);
    }
};