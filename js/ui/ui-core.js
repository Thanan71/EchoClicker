// ============================================
// UICore - Helpers communs et orchestration
// ============================================

function getEchoImagePath(echo) {
    const id = String(echo.id).padStart(3, '0');
    return `assets/echos-no-bg/echo_${id}_no_bg.png`;
}

function getEchoImagePathById(id) {
    const idStr = String(id).padStart(3, '0');
    return `assets/echos-no-bg/echo_${idStr}_no_bg.png`;
}

function applyShinyToImage(imgElement, echo) {
    if (!imgElement || !echo) return;
    if (echo.isPrimordial || echo.isShiny) {
        ShinyEffect.makeShiny(imgElement, echo.rarity || 'common', true);
    }
}

function createEchoImageHTML(echo, size = 64) {
    const imgPath = getEchoImagePath(echo);
    const isShiny = echo.isPrimordial || echo.isShiny;
    if (isShiny) {
        const config = ShinyEffect.SHINY_CONFIGS[echo.rarity] || ShinyEffect.SHINY_CONFIGS.common;
        return `<div class="shiny-wrapper" style="position:relative;display:inline-block;width:${size}px;height:${size}px;"><img src="${imgPath}" alt="${echo.name}" style="width:100%;height:100%;object-fit:contain;filter:hue-rotate(${config.hueRotate}deg) saturate(${config.saturate}) brightness(${config.brightness}) contrast(${config.contrast});" class="shiny-sprite" data-shiny-rarity="${echo.rarity}"><div class="shiny-sparkles" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;"><div class="sparkle" style="position:absolute;width:4px;height:4px;background:${config.sparkleColor};border-radius:50%;animation:sparkle 1.5s ease-in-out infinite;animation-delay:0s;left:20%;top:30%;box-shadow:0 0 6px ${config.sparkleColor};"></div><div class="sparkle" style="position:absolute;width:4px;height:4px;background:${config.sparkleColor};border-radius:50%;animation:sparkle 1.5s ease-in-out infinite;animation-delay:0.25s;left:70%;top:20%;box-shadow:0 0 6px ${config.sparkleColor};"></div><div class="sparkle" style="position:absolute;width:4px;height:4px;background:${config.sparkleColor};border-radius:50%;animation:sparkle 1.5s ease-in-out infinite;animation-delay:0.5s;left:50%;top:70%;box-shadow:0 0 6px ${config.sparkleColor};"></div><div class="sparkle" style="position:absolute;width:4px;height:4px;background:${config.sparkleColor};border-radius:50%;animation:sparkle 1.5s ease-in-out infinite;animation-delay:0.75s;left:80%;top:60%;box-shadow:0 0 6px ${config.sparkleColor};"></div><div class="sparkle" style="position:absolute;width:4px;height:4px;background:${config.sparkleColor};border-radius:50%;animation:sparkle 1.5s ease-in-out infinite;animation-delay:1s;left:30%;top:80%;box-shadow:0 0 6px ${config.sparkleColor};"></div><div class="sparkle" style="position:absolute;width:4px;height:4px;background:${config.sparkleColor};border-radius:50%;animation:sparkle 1.5s ease-in-out infinite;animation-delay:1.25s;left:60%;top:40%;box-shadow:0 0 6px ${config.sparkleColor};"></div></div></div>`;
    }
    return `<img src="${imgPath}" alt="${echo.name}" style="width:${size}px;height:${size}px;object-fit:contain;">`;
}

const UICore = {
    currentTab: 'map',
    captureWildEcho: null,
    pokedexStatusFilter: 'all',
    pokedexTypeFilter: null,

    init() {
        this.renderRoutes();
        this.renderShop();
        this.renderAchievements();
        this.initPokedexFilters();
        this.renderPokedex();
        this.renderQuests();
        this.updateAll();
        this.setupEventBus();
    },

    render(alpha) {
        this.updateCurrencies();
        this.updateFooter();
    },

    setupEventBus() {
        EventBus.on(GAME_EVENTS.ECHO_CAPTURED, () => { this.renderParty(); this.renderPokedex(); });
        EventBus.on(GAME_EVENTS.ECHO_LEVELED_UP, () => this.renderParty());
        EventBus.on(GAME_EVENTS.ECHO_EVOLVED, () => this.renderParty());
        EventBus.on(GAME_EVENTS.ROUTE_UNLOCKED, () => this.renderRoutes());
        EventBus.on(GAME_EVENTS.REGION_UNLOCKED, () => this.renderRoutes());
        EventBus.on(GAME_EVENTS.BOSS_DEFEATED, () => this.renderRoutes());
        EventBus.on('quest:completed', () => this.renderQuests());
        EventBus.on('quest:progress', () => this.renderQuests());
        EventBus.on('quest:rewardsClaimed', () => this.renderQuests());
        EventBus.on('quest:dailyReset', () => this.renderQuests());
    },

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
            hatchery: () => this.renderHatchery(),
            quests: () => this.renderQuests()
        };
        renderers[tabId]?.();
    },

    updateAll() {
        this.updateCurrencies();
        this.updateFooter();
        this.updateCombat();
        this.renderRoutes();
        this.updateBoostsDisplay();
    },

    updateBoostsDisplay() {
        const container = document.getElementById('boosts-indicator');
        if (!container) return;
        let html = '';
        const now = Date.now();
        const boostTypes = {
            'xp': { icon: '\u{1F4C8}', name: 'XP', cssClass: 'xp' },
            'capture': { icon: '\u{1F3AF}', name: 'Capture', cssClass: 'capture' },
            'energy': { icon: '\u26A1', name: '\u00C9nergie', cssClass: 'energy' }
        };
        for (const [type, boost] of Object.entries(Game.state.boosts)) {
            if (boost && boost.endTime && now < boost.endTime) {
                const remaining = Math.ceil((boost.endTime - now) / 1000);
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                const timerText = minutes > 0 ? `${minutes}m${seconds}s` : `${seconds}s`;
                const config = boostTypes[type] || { icon: '\u2728', name: type, cssClass: '' };
                html += `<div class="boost-badge ${config.cssClass}"><span class="boost-icon">${config.icon}</span><span class="boost-name">${config.name}</span><span class="boost-timer">${timerText}</span></div>`;
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

    renderMine() { Mine.updateDisplay(); },
    renderHatchery() { Hatchery.updateDisplay(); },

    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = message;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },

    showModal(title, bodyHtml, footerHtml = '') {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal-footer').innerHTML = footerHtml;
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    showSettings() {
        this.showModal('\u2699\uFE0F Param\u00E8tres', `
            <div style="display:flex;flex-direction:column;gap:12px">
                <button class="btn-combat" onclick="SaveSystem.save();UI.toast('Sauvegard\u00E9 !','success');UI.closeModal()">\u{1F4BE} Sauvegarder</button>
                <button class="btn-combat secondary" onclick="Game.exportSave();UI.closeModal()">\u{1F4E4} Exporter</button>
                <button class="btn-combat secondary" onclick="Game.importSave();UI.closeModal()">\u{1F4E5} Importer</button>
                <button class="btn-combat" style="background:linear-gradient(135deg,var(--accent-red),#dc2626)" onclick="Game.resetGame()">\u{1F5D1}\uFE0F R\u00E9initialiser</button>
            </div>
        `);
    },

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
};
