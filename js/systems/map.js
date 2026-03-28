// ============================================
// EchoClicker - MapSystem (Orchestrator)
// Uses MapCore for canvas/nav/particles/tooltip/routes
// Uses RegionRegistry for dynamic region renderers
// ============================================

import { MapCore } from './map-core.js';
import { GAME_EVENTS } from '../core/eventBus.js';
import { RegionRegistry } from './regions/RegionRegistry.js';

export const MapSystem = Object.assign({}, MapCore, {
    // Dependances injectees (DIP)
    _game: null,
    _ui: null,
    _eventBus: null,

    /**
     * Initialise les dependances et le canvas de la carte.
     */
    init(gameRef, uiRef, eventBusRef) {
        this._game = gameRef;
        this._ui = uiRef;
        this._eventBus = eventBusRef;
        this.canvas = document.getElementById('map-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.setupEvents();

        this._eventBus.on(GAME_EVENTS.REGION_UNLOCKED, () => this.updateRegionInfo());
        this._eventBus.on(GAME_EVENTS.ROUTE_UNLOCKED, () => this.updateRegionInfo());

        this.currentRegionId = this._game.state.currentRegion;
        this.createNavigationButtons();
        this.updateRegionInfo();
        this.animate();
    },

    animate() {
        this.time += 0.016;
        this.update();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    draw() {
        const ctx = this.ctx;

        // Fond avec transition
        if (this.transitioningFrom && this.transitionProgress < 1) {
            const alpha = this.transitionProgress;
            this.drawRegionBackground(this.transitioningFrom, 1 - alpha);
            this.drawRegionBackground(this.currentRegionId, alpha);
        } else {
            this.drawRegionBackground(this.currentRegionId, 1);
        }

        // Dessiner la region via le registry
        this.drawRegion(this.currentRegionId);

        // Particules
        this.drawParticles();

        // Tooltip
        if (this.hoveredLocation) {
            this.drawTooltip(this.hoveredLocation);
        }
    },

    drawRegionBackground(regionId, alpha) {
        const ctx = this.ctx;
        const configs = {
            foret: { c1: '#0a1a0a', c2: '#1a3a1a', c3: '#0d200d' },
            montagnes: { c1: '#0a0a1a', c2: '#1a1a3e', c3: '#12122a' },
            ocean: { c1: '#0a1020', c2: '#0a1a3a', c3: '#0d1530' },
            volcan: { c1: '#1a0500', c2: '#3a1000', c3: '#200a00' },
            foret_maudite: { c1: '#0a0510', c2: '#1a0a2a', c3: '#0d0515' },
            ciel_ethere: { c1: '#1a1a30', c2: '#2a2a50', c3: '#151535' },
            dimension_arcane: { c1: '#10051a', c2: '#200a3a', c3: '#150525' }
        };
        const c = configs[regionId] || configs.foret;

        ctx.globalAlpha = alpha;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, c.c1);
        gradient.addColorStop(0.5, c.c2);
        gradient.addColorStop(1, c.c3);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1;
    },

    drawRegion(regionId) {
        RegionRegistry.render(regionId, this);
    }
});
