// ============================================
// ÉchoClicker - Système de Carte Canvas v2
// Focus sur une contrée avec vrais dessins
// ============================================

const MapSystem = {
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

    init() {
        this.canvas = document.getElementById('map-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.setupEvents();
        this.animate();

        EventBus.on(GAME_EVENTS.REGION_UNLOCKED, () => this.updateRegionInfo());
        EventBus.on(GAME_EVENTS.ROUTE_UNLOCKED, () => this.updateRegionInfo());
        
        // Synchroniser avec l'état du jeu
        this.currentRegionId = Game.state.currentRegion;
        
        // Créer les boutons de navigation
        this.createNavigationButtons();
        
        // Mettre à jour l'info de la région
        this.updateRegionInfo();
    },

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
        
        // Supprimer l'ancien s'il existe
        const oldNav = container.querySelector('.map-nav-buttons');
        if (oldNav) oldNav.remove();

        const nav = document.createElement('div');
        nav.className = 'map-nav-buttons';

        const regions = Game.state.regions;
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
                    UI.toast('🔒 Contrée verrouillée !', 'warning');
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
        
        // Synchroniser avec l'état du jeu
        Game.state.currentRegion = regionId;
        Game.state.currentRoute = null;

        // Mettre à jour les boutons
        document.querySelectorAll('.map-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.region === regionId);
        });

        this.updateRegionInfo();
    },

    updateRegionInfo() {
        const region = Game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return;

        const nameEl = document.getElementById('region-name');
        const descEl = document.getElementById('region-desc');

        if (nameEl) nameEl.textContent = region.name;
        if (descEl) descEl.textContent = region.desc;
    },

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
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },

    getRoutePositions() {
        const region = Game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return [];

        const routes = region.routes;
        const positions = [];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.3;

        // Positions fixes basées sur l'index (pas de random)
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
                route, // Ceci est une référence directe à l'objet route dans Game.state.regions
                x: centerX + Math.cos(angle) * spread,
                y: centerY + Math.sin(angle) * spread
            });
        });

        return positions;
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
                // Debug: vérifier le statut de déverrouillage
                console.log(`Route ${r.route.id} (${r.route.name}): unlocked=${r.route.unlocked}`);
                
                if (r.route.unlocked) {
                    Game.selectRoute(r.route.id);
                    this.spawnParticles(r.x, r.y, this.getRegionColor());
                } else {
                    UI.toast('🔒 Route verrouillée ! Termine les routes précédentes pour débloquer celle-ci.', 'warning');
                }
                break;
            }
        }
    },

    getRegionColor() {
        const colors = {
            foret: '#55a630',
            montagnes: '#74b9ff',
            ocean: '#0984e3'
        };
        return colors[this.currentRegionId] || '#8b5cf6';
    },

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

    animate() {
        this.time += 0.016;
        this.update();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    update() {
        // Transition
        if (this.transitionProgress < 1) {
            this.transitionProgress += 0.03;
            if (this.transitionProgress >= 1) {
                this.transitionProgress = 1;
                this.transitioningFrom = null;
                this.transitioningTo = null;
            }
        }

        // Particules
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.025;
            p.size *= 0.97;
            return p.life > 0;
        });
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

        // Dessiner la région
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
            ocean: { c1: '#0a1020', c2: '#0a1a3a', c3: '#0d1530' }
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
        switch (regionId) {
            case 'foret': this.drawForest(); break;
            case 'montagnes': this.drawMountains(); break;
            case 'ocean': this.drawOcean(); break;
        }
    },

    // ============================================
    // FORÊT ÉVEILLÉE
    // ============================================
    drawForest() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Sol avec herbe
        this.drawGrassGround();

        // Arbres en arrière-plan
        this.drawForestTrees();

        // Champignons lumineux
        this.drawGlowMushrooms();

        // Lucioles
        this.drawFireflies();

        // Chemins entre routes
        this.drawForestPaths();

        // Routes (points d'intérêt)
        this.drawRoutes();
    },

    drawGrassGround() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Base du sol
        const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.6);
        gradient.addColorStop(0, '#2d5a2d');
        gradient.addColorStop(0.5, '#1a3a1a');
        gradient.addColorStop(1, '#0d200d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Herbe
        ctx.strokeStyle = 'rgba(85, 166, 48, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const len = 5 + Math.random() * 10;
            const sway = Math.sin(this.time * 2 + x * 0.01) * 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + sway, y - len/2, x + sway*1.5, y - len);
            ctx.stroke();
        }
    },

    drawForestTrees() {
        const ctx = this.ctx;
        const trees = [
            { x: 0.08, y: 0.2, s: 1.2 },
            { x: 0.92, y: 0.15, s: 1.4 },
            { x: 0.05, y: 0.7, s: 1.0 },
            { x: 0.95, y: 0.75, s: 1.3 },
            { x: 0.15, y: 0.85, s: 0.9 },
            { x: 0.85, y: 0.9, s: 1.1 },
            { x: 0.25, y: 0.1, s: 0.8 },
            { x: 0.75, y: 0.08, s: 0.9 }
        ];

        trees.forEach(t => {
            this.drawTree(t.x * this.width, t.y * this.height, 40 * t.s);
        });
    },

    drawTree(x, y, size) {
        const ctx = this.ctx;
        const sway = Math.sin(this.time * 1.5 + x * 0.01) * 2;

        // Tronc
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(x - size * 0.1, y - size * 0.3, size * 0.2, size * 0.6);

        // Feuillage (plusieurs cercles)
        const colors = ['#1a5a1a', '#2d7a2d', '#1a6a1a'];
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                x + sway + (i - 1) * size * 0.25,
                y - size * 0.5 - i * size * 0.15,
                size * (0.4 - i * 0.05),
                0, Math.PI * 2
            );
            ctx.fillStyle = colors[i];
            ctx.fill();
        }

        // Lueur
        ctx.beginPath();
        ctx.arc(x + sway, y - size * 0.5, size * 0.5, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x + sway, y - size * 0.5, 0, x + sway, y - size * 0.5, size * 0.5);
        glow.addColorStop(0, 'rgba(85, 166, 48, 0.1)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fill();
    },

    drawGlowMushrooms() {
        const ctx = this.ctx;
        const mushrooms = [
            { x: 0.3, y: 0.4 },
            { x: 0.6, y: 0.35 },
            { x: 0.45, y: 0.6 },
            { x: 0.7, y: 0.55 }
        ];

        mushrooms.forEach(m => {
            const mx = m.x * this.width;
            const my = m.y * this.height;
            const pulse = 0.7 + Math.sin(this.time * 3 + mx) * 0.3;

            // Lueur
            ctx.beginPath();
            ctx.arc(mx, my, 15, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 15);
            glow.addColorStop(0, `rgba(180, 255, 100, ${0.3 * pulse})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();

            // Champignon
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(mx - 2, my, 4, 8);
            ctx.beginPath();
            ctx.arc(mx, my, 6, Math.PI, 0);
            ctx.fillStyle = `rgba(200, 255, 150, ${pulse})`;
            ctx.fill();
        });
    },

    drawFireflies() {
        const ctx = this.ctx;
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(this.time * 0.5 + i * 1.5) * 0.4 + 0.5) * this.width;
            const y = (Math.cos(this.time * 0.3 + i * 2) * 0.4 + 0.5) * this.height;
            const alpha = 0.3 + Math.sin(this.time * 4 + i) * 0.3;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
            glow.addColorStop(0, `rgba(255, 255, 150, ${alpha})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();
        }
    },

    drawForestPaths() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const paths = [[0,1],[1,3],[0,2],[2,4],[1,4],[3,4]];

        // Seed fixe pour les courbes
        const curveOffsets = [
            { dx: 15, dy: -10 },
            { dx: -20, dy: 15 },
            { dx: 10, dy: 20 },
            { dx: -15, dy: -15 },
            { dx: 20, dy: 10 },
            { dx: -10, dy: -20 }
        ];

        paths.forEach(([a, b], i) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;
            const curve = curveOffsets[i % curveOffsets.length];

            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            const midX = (ra.x + rb.x) / 2 + curve.dx;
            const midY = (ra.y + rb.y) / 2 + curve.dy;
            ctx.quadraticCurveTo(midX, midY, rb.x, rb.y);
            ctx.strokeStyle = unlocked ? 'rgba(85, 166, 48, 0.5)' : 'rgba(100, 100, 100, 0.2)';
            ctx.lineWidth = unlocked ? 3 : 2;
            ctx.setLineDash(unlocked ? [] : [8, 8]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Petites pierres sur le chemin
            if (unlocked) {
                for (let t = 0.2; t < 1; t += 0.2) {
                    const px = ra.x + (rb.x - ra.x) * t + (Math.sin(t * 10) * 5);
                    const py = ra.y + (rb.y - ra.y) * t + (Math.cos(t * 10) * 5);
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(139, 119, 101, 0.4)';
                    ctx.fill();
                }
            }
        });
    },

    // ============================================
    // MONTAGNES CRISTALLINES
    // ============================================
    drawMountains() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Ciel étoilé
        this.drawStarrySky();

        // Montagnes en arrière-plan
        this.drawMountainRange();

        // Cristaux
        this.drawCrystals();

        // Neige qui tombe
        this.drawSnowfall();

        // Éclairs occasionnels
        this.drawLightning();

        // Chemins
        this.drawMountainPaths();

        // Routes
        this.drawRoutes();
    },

    drawStarrySky() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Fond
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#050510');
        gradient.addColorStop(0.4, '#0a0a20');
        gradient.addColorStop(1, '#151530');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Étoiles
        for (let i = 0; i < 80; i++) {
            const x = (i * 137.5) % w;
            const y = (i * 73.7) % (h * 0.5);
            const twinkle = 0.3 + Math.sin(this.time * 3 + i) * 0.3;
            const size = 1 + (i % 3);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.fill();
        }
    },

    drawMountainRange() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Montagne arrière
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        ctx.lineTo(w * 0.15, h * 0.35);
        ctx.lineTo(w * 0.3, h * 0.5);
        ctx.lineTo(w * 0.45, h * 0.2);
        ctx.lineTo(w * 0.55, h * 0.25);
        ctx.lineTo(w * 0.7, h * 0.15);
        ctx.lineTo(w * 0.85, h * 0.4);
        ctx.lineTo(w, h * 0.55);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const grad1 = ctx.createLinearGradient(0, h * 0.15, 0, h);
        grad1.addColorStop(0, '#2a2a4a');
        grad1.addColorStop(0.5, '#1a1a35');
        grad1.addColorStop(1, '#151530');
        ctx.fillStyle = grad1;
        ctx.fill();

        // Neige sur les pics
        ctx.beginPath();
        ctx.moveTo(w * 0.45, h * 0.2);
        ctx.lineTo(w * 0.42, h * 0.28);
        ctx.lineTo(w * 0.48, h * 0.28);
        ctx.closePath();
        ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(w * 0.7, h * 0.15);
        ctx.lineTo(w * 0.67, h * 0.25);
        ctx.lineTo(w * 0.73, h * 0.25);
        ctx.closePath();
        ctx.fill();
    },

    drawCrystals() {
        const ctx = this.ctx;
        const crystals = [
            { x: 0.2, y: 0.6, s: 1.5, c: '#74b9ff' },
            { x: 0.5, y: 0.5, s: 2, c: '#a855f7' },
            { x: 0.8, y: 0.55, s: 1.3, c: '#06b6d4' },
            { x: 0.35, y: 0.7, s: 1, c: '#74b9ff' },
            { x: 0.65, y: 0.65, s: 1.2, c: '#a855f7' }
        ];

        crystals.forEach(c => {
            const cx = c.x * this.width;
            const cy = c.y * this.height;
            const size = 12 * c.s;
            const pulse = 0.6 + Math.sin(this.time * 2 + cx * 0.01) * 0.4;

            // Lueur
            ctx.beginPath();
            ctx.arc(cx, cy, size * 1.5, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.5);
            glow.addColorStop(0, c.c + '40');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();

            // Cristal (losange)
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx + size * 0.5, cy);
            ctx.lineTo(cx, cy + size * 0.6);
            ctx.lineTo(cx - size * 0.5, cy);
            ctx.closePath();
            ctx.fillStyle = c.c;
            ctx.globalAlpha = pulse;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    },

    drawSnowfall() {
        const ctx = this.ctx;
        for (let i = 0; i < 50; i++) {
            const x = ((this.time * 20 + i * 37) % (this.width + 20)) - 10;
            const y = ((this.time * 30 + i * 53) % (this.height + 20)) - 10;
            const size = 1 + (i % 3);
            const alpha = 0.3 + (i % 5) * 0.1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
            ctx.fill();
        }
    },

    drawLightning() {
        const ctx = this.ctx;
        if (Math.sin(this.time * 0.5) > 0.95) {
            const x = this.width * (0.3 + Math.random() * 0.4);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            let ly = 0;
            while (ly < this.height * 0.4) {
                ly += 20 + Math.random() * 30;
                ctx.lineTo(x + (Math.random() - 0.5) * 30, ly);
            }
            ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Flash
            ctx.fillStyle = 'rgba(200, 200, 255, 0.05)';
            ctx.fillRect(0, 0, this.width, this.height);
        }
    },

    drawMountainPaths() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const paths = [[0,1],[1,2],[0,3],[3,4],[1,3],[1,4],[2,4]];

        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;

            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            ctx.lineTo(rb.x, rb.y);
            ctx.strokeStyle = unlocked ? 'rgba(116, 185, 255, 0.4)' : 'rgba(100, 100, 100, 0.2)';
            ctx.lineWidth = unlocked ? 3 : 2;
            ctx.setLineDash(unlocked ? [] : [6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    },

    // ============================================
    // OCÉAN ABYSSAL
    // ============================================
    drawOcean() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Fond océanique
        this.drawOceanBackground();

        // Vagues
        this.drawWaves();

        // Bulles
        this.drawBubbles();

        // Poissons
        this.drawFish();

        // Coraux
        this.drawCorals();

        // Chemins sous-marins
        this.drawOceanPaths();

        // Routes
        this.drawRoutes();
    },

    drawOceanBackground() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a1525');
        gradient.addColorStop(0.3, '#0a2040');
        gradient.addColorStop(0.7, '#081830');
        gradient.addColorStop(1, '#050f20');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Rayons de lumière
        for (let i = 0; i < 5; i++) {
            const x = w * (0.1 + i * 0.2);
            ctx.beginPath();
            ctx.moveTo(x - 20, 0);
            ctx.lineTo(x + 40, h * 0.6);
            ctx.lineTo(x - 40, h * 0.6);
            ctx.closePath();
            const ray = ctx.createLinearGradient(x, 0, x, h * 0.6);
            ray.addColorStop(0, 'rgba(100, 180, 255, 0.08)');
            ray.addColorStop(1, 'transparent');
            ctx.fillStyle = ray;
            ctx.fill();
        }
    },

    drawWaves() {
        const ctx = this.ctx;
        const w = this.width;

        for (let layer = 0; layer < 3; layer++) {
            ctx.beginPath();
            ctx.moveTo(0, 30 + layer * 15);
            for (let x = 0; x <= w; x += 10) {
                const y = 30 + layer * 15 + Math.sin(x * 0.02 + this.time * (1 + layer * 0.3) + layer) * 8;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(100, 180, 255, ${0.15 - layer * 0.04})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    },

    drawBubbles() {
        const ctx = this.ctx;
        for (let i = 0; i < 25; i++) {
            const baseX = (i * 37) % this.width;
            const x = baseX + Math.sin(this.time + i) * 10;
            const y = (this.height - ((this.time * 40 + i * 73) % (this.height + 30)));
            const size = 2 + (i % 4);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Reflet
            ctx.beginPath();
            ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
            ctx.fill();
        }
    },

    drawFish() {
        const ctx = this.ctx;
        const fish = [
            { x: 0.2, y: 0.4, dir: 1, speed: 0.3, size: 12, color: '#ff6b6b' },
            { x: 0.7, y: 0.3, dir: -1, speed: 0.4, size: 10, color: '#ffd93d' },
            { x: 0.5, y: 0.6, dir: 1, speed: 0.25, size: 14, color: '#6bcb77' }
        ];

        fish.forEach(f => {
            const fx = ((f.x * this.width + this.time * f.speed * 50 * f.dir) % (this.width + 40)) - 20;
            const fy = f.y * this.height + Math.sin(this.time * 2 + fx * 0.01) * 15;

            ctx.save();
            ctx.translate(fx, fy);
            ctx.scale(f.dir, 1);

            // Corps
            ctx.beginPath();
            ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = f.color;
            ctx.fill();

            // Queue
            ctx.beginPath();
            ctx.moveTo(-f.size, 0);
            ctx.lineTo(-f.size - 8, -6);
            ctx.lineTo(-f.size - 8, 6);
            ctx.closePath();
            ctx.fill();

            // Œil
            ctx.beginPath();
            ctx.arc(f.size * 0.4, -2, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();

            ctx.restore();
        });
    },

    drawCorals() {
        const ctx = this.ctx;
        const corals = [
            { x: 0.15, y: 0.85, type: 'branch' },
            { x: 0.4, y: 0.9, type: 'fan' },
            { x: 0.65, y: 0.88, type: 'branch' },
            { x: 0.85, y: 0.92, type: 'fan' }
        ];

        corals.forEach(c => {
            const cx = c.x * this.width;
            const cy = c.y * this.height;

            if (c.type === 'branch') {
                // Corail branche
                const colors = ['#ff6b6b', '#ff8e8e'];
                for (let b = 0; b < 3; b++) {
                    ctx.beginPath();
                    ctx.moveTo(cx + b * 8 - 8, cy);
                    const sway = Math.sin(this.time + b) * 3;
                    ctx.quadraticCurveTo(cx + b * 8 - 8 + sway, cy - 25, cx + b * 8 - 4 + sway, cy - 40);
                    ctx.strokeStyle = colors[b % 2];
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            } else {
                // Corail éventail
                ctx.beginPath();
                ctx.arc(cx, cy - 15, 20, Math.PI, 0);
                ctx.fillStyle = '#e056fd';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx, cy - 15, 15, Math.PI, 0);
                ctx.fillStyle = '#be2edd';
                ctx.fill();
            }
        });
    },

    drawOceanPaths() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const paths = [[0,1],[1,2],[0,3],[3,4],[1,3],[2,4]];

        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;

            // Courbe fluide
            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            const cp1x = ra.x + (rb.x - ra.x) * 0.3 + Math.sin(this.time + a) * 10;
            const cp1y = ra.y + (rb.y - ra.y) * 0.3 + Math.cos(this.time + b) * 10;
            const cp2x = ra.x + (rb.x - ra.x) * 0.7 + Math.sin(this.time + b) * 10;
            const cp2y = ra.y + (rb.y - ra.y) * 0.7 + Math.cos(this.time + a) * 10;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, rb.x, rb.y);
            ctx.strokeStyle = unlocked ? 'rgba(9, 132, 227, 0.4)' : 'rgba(100, 100, 100, 0.2)';
            ctx.lineWidth = unlocked ? 3 : 2;
            ctx.setLineDash(unlocked ? [] : [6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    },

    // ============================================
    // ROUTES (commun à toutes les régions)
    // ============================================
    drawRoutes() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const color = this.getRegionColor();

        routes.forEach((r, idx) => {
            const isHovered = this.hoveredLocation && this.hoveredLocation.route.id === r.route.id;
            const isActive = Game.state.currentRoute?.id === r.route.id;
            const unlocked = r.route.unlocked;

            // Rayonnement
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

            // Cercle de fond
            ctx.beginPath();
            ctx.arc(r.x, r.y, 28, 0, Math.PI * 2);

            if (unlocked) {
                const bg = ctx.createRadialGradient(r.x - 8, r.y - 8, 0, r.x, r.y, 28);
                bg.addColorStop(0, color + 'cc');
                bg.addColorStop(1, color + '66');
                ctx.fillStyle = bg;
            } else {
                ctx.fillStyle = '#2a2a3e';
            }
            ctx.fill();

            // Bordure
            ctx.strokeStyle = unlocked ? color : '#444';
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();

            // Numéro de route
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = unlocked ? '#fff' : '#666';
            ctx.fillText(idx + 1, r.x, r.y);

            // Nom sous le cercle
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = unlocked ? '#ccc' : '#555';
            ctx.fillText(r.route.name, r.x, r.y + 40);

            // Indicateur actif
            if (isActive) {
                ctx.beginPath();
                ctx.arc(r.x, r.y, 32, 0, Math.PI * 2);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Cadenas si verrouillé
            if (!unlocked) {
                ctx.font = '12px serif';
                ctx.fillText('🔒', r.x, r.y);
            }
        });
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

        // Fond
        ctx.fillStyle = 'rgba(30, 30, 66, 0.95)';
        ctx.strokeStyle = route.unlocked ? this.getRegionColor() : '#444';
        ctx.lineWidth = 1;
        this.roundRect(tx, ty, tw, th, 6);
        ctx.fill();
        ctx.stroke();

        // Texte
        lines.forEach((line, i) => {
            ctx.font = i === 0 ? 'bold 12px Inter, sans-serif' : '10px Inter, sans-serif';
            ctx.fillStyle = i === 0 ? '#fff' : '#a0a0c0';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(line, tx + padding, ty + padding + i * 18);
        });
    },

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