// ============================================
// MapCore - Canvas, Navigation, Particles, Tooltip, Routes
// Responsibility: UI rendering and interaction for the map
// ============================================

import { GAME_CONFIG } from '../data/game-config.js';

export const MapCore = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 500,
    currentRegionId: 'foret',
    hoveredLocation: null,
    particles: [],
    animationFrame: null,
    transitionProgress: 1,
    transitioningFrom: null,
    transitioningTo: null,
    time: 0,

    // ============================================
    // NAVIGATION
    // ============================================

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.width = Math.min(900, rect.width - 40);
        this.height = Math.min(550, this.width * 0.6);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
    },

    createNavigationButtons() {
        const container = this.canvas.parentElement;
        const oldNav = container.querySelector('.map-nav-buttons');
        if (oldNav) oldNav.remove();
        const nav = document.createElement('div');
        nav.className = 'map-nav-buttons';
        const regions = this._game.state.regions;
        regions.forEach(region => {
            const btn = document.createElement('button');
            btn.className = 'map-nav-btn' + (region.id === this.currentRegionId ? ' active' : '');
            btn.dataset.region = region.id;
            btn.innerHTML = `${region.emoji} ${region.name}`;
            btn.disabled = !region.unlocked;
            btn.addEventListener('click', () => {
                if (region.unlocked) {
                    this.navigateToRegion(region.id);
                } else {
                    this._ui.toast('🔒 Contrée verrouillée !', 'warning');
                }
            });
            nav.appendChild(btn);
        });
        container.insertBefore(nav, this.canvas);
    },

    navigateToRegion(regionId) {
        if (regionId === this.currentRegionId || this.transitioningFrom) return;
        this.transitioningFrom = this.currentRegionId;
        this.transitioningTo = regionId;
        this.transitionProgress = 0;
        this.currentRegionId = regionId;
        this._game.state.currentRegion = regionId;
        this._game.state.currentRoute = null;
        document.querySelectorAll('.map-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.region === regionId);
        });
        this.updateRegionInfo();
    },

    updateRegionInfo() {
        const region = this._game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return;
        const nameEl = document.getElementById('region-name');
        const descEl = document.getElementById('region-desc');
        if (nameEl) nameEl.textContent = region.name;
        if (descEl) descEl.textContent = region.desc;
    },

    // ============================================
    // EVENTS & INPUT
    // ============================================

    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredLocation = null;
            this.canvas.style.cursor = 'default';
        });
        window.addEventListener('resize', () => this.resize());
    },

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        const routes = this.getRoutePositions();
        let found = null;
        for (const r of routes) {
            const dist = Math.hypot(pos.x - r.x, pos.y - r.y);
            if (dist <= 30) {
                found = { type: 'route', ...r };
                break;
            }
        }
        this.hoveredLocation = found;
        this.canvas.style.cursor = found && found.route.unlocked ? 'pointer' : 'default';
    },

    handleClick(e) {
        const pos = this.getMousePos(e);
        const routes = this.getRoutePositions();
        for (const r of routes) {
            const dist = Math.hypot(pos.x - r.x, pos.y - r.y);
            if (dist <= 30) {
                if (r.route.unlocked) {
                    this._game.selectRoute(r.route.id);
                    this.spawnParticles(r.x, r.y, this.getRegionColor());
                } else {
                    this._ui.toast('🔒 Route verrouillée ! Termine les routes précédentes pour débloquer celle-ci.', 'warning');
                }
                break;
            }
        }
    },

    // ============================================
    // ROUTE POSITIONS
    // ============================================

    getRoutePositions() {
        const region = this._game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return [];
        const routes = region.routes;
        const positions = [];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.3;
        const offsets = [
            { angle: 0, dist: 0.85 },
            { angle: 0.5, dist: 0.7 },
            { angle: 1.2, dist: 0.9 },
            { angle: 2.0, dist: 0.75 },
            { angle: 2.8, dist: 0.8 }
        ];
        routes.forEach((route, idx) => {
            const offset = offsets[idx % offsets.length];
            const angle = (idx / routes.length) * Math.PI * 2 - Math.PI / 2 + offset.angle * 0.3;
            const spread = radius * offset.dist;
            positions.push({
                route,
                x: centerX + Math.cos(angle) * spread,
                y: centerY + Math.sin(angle) * spread
            });
        });
        return positions;
    },

    getRegionColor() {
        const colors = {
            foret: '#55a630',
            montagnes: '#74b9ff',
            ocean: '#0984e3',
            volcan: '#ff6b35',
            foret_maudite: '#6c5ce7',
            ciel_ethere: '#ffeaa7',
            dimension_arcane: '#a855f7'
        };
        return colors[this.currentRegionId] || '#8b5cf6';
    },

    // ============================================
    // ANIMATION LOOP
    // ============================================

    update() {
        if (this.transitionProgress < 1) {
            this.transitionProgress += 0.03;
            if (this.transitionProgress >= 1) {
                this.transitionProgress = 1;
                this.transitioningFrom = null;
                this.transitioningTo = null;
            }
        }
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.025;
            p.size *= 0.97;
            return p.life > 0;
        });
    },

    // ============================================
    // PARTICLES
    // ============================================

    spawnParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: 3 + Math.random() * 4
            });
        }
    },

    drawParticles() {
        const ctx = this.ctx;
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.fill();
        });
    },

    // ============================================
    // TOOLTIP
    // ============================================

    drawTooltip(loc) {
        const ctx = this.ctx;
        const route = loc.route;
        const padding = 10;
        const lines = [
            route.name,
            `Niveau ${route.lv}`,
            route.unlocked ? '⚔️ Cliquer pour combattre' : '🔒 Verrouillé'
        ];
        ctx.font = 'bold 12px Inter, sans-serif';
        const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
        const tw = maxWidth + padding * 2;
        const th = lines.length * 18 + padding * 2;
        let tx = loc.x + 35;
        let ty = loc.y - th / 2;
        if (tx + tw > this.width) tx = loc.x - tw - 35;
        if (ty < 5) ty = 5;
        if (ty + th > this.height - 5) ty = this.height - th - 5;
        ctx.fillStyle = 'rgba(30, 30, 66, 0.95)';
        ctx.strokeStyle = route.unlocked ? this.getRegionColor() : '#444';
        ctx.lineWidth = 1;
        this.roundRect(tx, ty, tw, th, 6);
        ctx.fill();
        ctx.stroke();
        lines.forEach((line, i) => {
            ctx.font = i === 0 ? 'bold 12px Inter, sans-serif' : '10px Inter, sans-serif';
            ctx.fillStyle = i === 0 ? '#fff' : '#a0a0c0';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(line, tx + padding, ty + padding + i * 18);
        });
    },

    // ============================================
    // ROUTES RENDERING
    // ============================================

    getKillsNeededForRoute(routeIndex) {
        const region = this._game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return GAME_CONFIG.KILLS_FOR_ROUTE;
        if (routeIndex === 0) return 0;
        const prevRoute = region.routes[routeIndex - 1];
        if (!prevRoute || !prevRoute.unlocked) return -1;
        return GAME_CONFIG.KILLS_FOR_ROUTE;
    },

    getCurrentRouteProgress() {
        const region = this._game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return { current: 0, needed: 0, routeIndex: -1 };
        for (let i = 0; i < region.routes.length; i++) {
            if (!region.routes[i].unlocked) {
                if (i === 0 || region.routes[i - 1].unlocked) {
                    return {
                        current: Combat.routeKills || 0,
                        needed: GAME_CONFIG.KILLS_FOR_ROUTE,
                        routeIndex: i,
                        routeName: region.routes[i].name
                    };
                }
            }
        }
        return { current: 0, needed: 0, routeIndex: -1 };
    },

    drawRoutes() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const color = this.getRegionColor();
        const progress = this.getCurrentRouteProgress();
        routes.forEach((r, idx) => {
            const isHovered = this.hoveredLocation && this.hoveredLocation.route.id === r.route.id;
            const isActive = this._game.state.currentRoute?.id === r.route.id;
            const unlocked = r.route.unlocked;
            const lockedColor = '#1a1a2e';
            const lockedBorderColor = '#3a3a5e';
            const lockedTextColor = '#4a4a6a';
            if ((unlocked && isHovered) || isActive) {
                const glowRadius = 35 + Math.sin(this.time * 3) * 5;
                const glow = ctx.createRadialGradient(r.x, r.y, 20, r.x, r.y, glowRadius);
                glow.addColorStop(0, color + '60');
                glow.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(r.x, r.y, glowRadius, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(r.x, r.y, 28, 0, Math.PI * 2);
            if (unlocked) {
                const bg = ctx.createRadialGradient(r.x - 8, r.y - 8, 0, r.x, r.y, 28);
                bg.addColorStop(0, color + 'cc');
                bg.addColorStop(1, color + '66');
                ctx.fillStyle = bg;
            } else {
                const lockedBg = ctx.createRadialGradient(r.x - 8, r.y - 8, 0, r.x, r.y, 28);
                lockedBg.addColorStop(0, lockedColor);
                lockedBg.addColorStop(1, '#0d0d1a');
                ctx.fillStyle = lockedBg;
            }
            ctx.fill();
            ctx.strokeStyle = unlocked ? color : lockedBorderColor;
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();
            if (!unlocked) {
                ctx.save();
                ctx.clip();
                ctx.strokeStyle = 'rgba(100, 100, 140, 0.3)';
                ctx.lineWidth = 1;
                for (let i = -40; i < 40; i += 6) {
                    ctx.beginPath();
                    ctx.moveTo(r.x + i, r.y - 30);
                    ctx.lineTo(r.x + i + 20, r.y + 30);
                    ctx.stroke();
                }
                ctx.restore();
            }
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = unlocked ? '#fff' : lockedTextColor;
            ctx.fillText(idx + 1, r.x, r.y);
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = unlocked ? '#ccc' : lockedTextColor;
            ctx.fillText(r.route.name, r.x, r.y + 40);
            if (!unlocked && progress.routeIndex === idx && progress.needed > 0) {
                const progressBarWidth = 50;
                const progressBarHeight = 6;
                const progressX = r.x - progressBarWidth / 2;
                const progressY = r.y + 52;
                const progressPercent = Math.min(1, progress.current / progress.needed);
                ctx.fillStyle = '#1a1a2e';
                ctx.strokeStyle = lockedBorderColor;
                ctx.lineWidth = 1;
                this.roundRect(progressX, progressY, progressBarWidth, progressBarHeight, 3);
                ctx.fill();
                ctx.stroke();
                if (progressPercent > 0) {
                    const fillWidth = progressBarWidth * progressPercent;
                    const gradient = ctx.createLinearGradient(progressX, 0, progressX + fillWidth, 0);
                    gradient.addColorStop(0, '#f59e0b');
                    gradient.addColorStop(1, '#fbbf24');
                    ctx.fillStyle = gradient;
                    this.roundRect(progressX, progressY, fillWidth, progressBarHeight, 3);
                    ctx.fill();
                }
                ctx.font = '9px Inter, sans-serif';
                ctx.fillStyle = '#f59e0b';
                ctx.textAlign = 'center';
                ctx.fillText(`${progress.current}/${progress.needed}`, r.x, progressY + progressBarHeight + 10);
            }
            if (isActive) {
                ctx.beginPath();
                ctx.arc(r.x, r.y, 32, 0, Math.PI * 2);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            if (!unlocked) {
                ctx.font = '14px serif';
                ctx.fillText('🔒', r.x, r.y);
            }
        });
        if (progress.routeIndex >= 0 && progress.needed > 0) {
            this.drawProgressIndicator(progress);
        }
    },

    drawProgressIndicator(progress) {
        const ctx = this.ctx;
        const x = this.width / 2;
        const y = this.height - 30;
        const barWidth = 200;
        const barHeight = 10;
        const progressPercent = Math.min(1, progress.current / progress.needed);
        ctx.fillStyle = 'rgba(20, 20, 40, 0.9)';
        ctx.strokeStyle = 'rgba(100, 100, 140, 0.5)';
        ctx.lineWidth = 1;
        this.roundRect(x - barWidth / 2 - 15, y - 25, barWidth + 30, 50, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⚔️ Prochaine route: ${progress.routeName}`, x, y - 12);
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = 'rgba(100, 100, 140, 0.5)';
        this.roundRect(x - barWidth / 2, y, barWidth, barHeight, 5);
        ctx.fill();
        ctx.stroke();
        if (progressPercent > 0) {
            const fillWidth = barWidth * progressPercent;
            const gradient = ctx.createLinearGradient(x - barWidth / 2, 0, x - barWidth / 2 + fillWidth, 0);
            gradient.addColorStop(0, '#f59e0b');
            gradient.addColorStop(1, '#fbbf24');
            ctx.fillStyle = gradient;
            this.roundRect(x - barWidth / 2, y, fillWidth, barHeight, 5);
            ctx.fill();
        }
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${progress.current} / ${progress.needed} échos vaincus`, x, y + barHeight + 10);
    },

    // ============================================
    // CANVAS UTILITIES
    // ============================================

    roundRect(x, y, w, h, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
};
