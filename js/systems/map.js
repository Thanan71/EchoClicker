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
            ocean: '#0984e3',
            volcan: '#ff6b35',
            foret_maudite: '#6c5ce7',
            ciel_ethere: '#ffeaa7',
            dimension_arcane: '#a855f7'
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
        switch (regionId) {
            case 'foret': this.drawForest(); break;
            case 'montagnes': this.drawMountains(); break;
            case 'ocean': this.drawOcean(); break;
            case 'volcan': this.drawVolcan(); break;
            case 'foret_maudite': this.drawForetMaudite(); break;
            case 'ciel_ethere': this.drawCielEthere(); break;
            case 'dimension_arcane': this.drawDimensionArcane(); break;
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
    // VOLCAN INFERNAL
    // ============================================
    drawVolcan() {
        this.drawVolcanBackground();
        this.drawLavaRivers();
        this.drawVolcanRocks();
        this.drawEmbers();
        this.drawVolcanSmoke();
        this.drawVolcanPaths();
        this.drawRoutes();
    },

    drawVolcanBackground() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a0500');
        gradient.addColorStop(0.3, '#2a0a00');
        gradient.addColorStop(0.7, '#3a1000');
        gradient.addColorStop(1, '#200800');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.moveTo(0, h * 0.6);
        ctx.lineTo(w * 0.2, h * 0.6);
        ctx.lineTo(w * 0.35, h * 0.15);
        ctx.lineTo(w * 0.5, h * 0.08);
        ctx.lineTo(w * 0.65, h * 0.15);
        ctx.lineTo(w * 0.8, h * 0.6);
        ctx.lineTo(w, h * 0.6);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const volcGrad = ctx.createLinearGradient(0, h * 0.08, 0, h);
        volcGrad.addColorStop(0, '#4a1a05');
        volcGrad.addColorStop(0.3, '#3a1205');
        volcGrad.addColorStop(1, '#1a0800');
        ctx.fillStyle = volcGrad;
        ctx.fill();

        const cx = w * 0.5;
        const cy = h * 0.08;
        const craterGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        craterGlow.addColorStop(0, 'rgba(255, 100, 0, 0.6)');
        craterGlow.addColorStop(0.5, 'rgba(255, 50, 0, 0.2)');
        craterGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = craterGlow;
        ctx.fillRect(cx - 80, cy - 80, 160, 160);
    },

    drawLavaRivers() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const t = this.time;

        const lavaPoints = [
            { x: w * 0.5, y: h * 0.15 },
            { x: w * 0.45, y: h * 0.3 },
            { x: w * 0.35, y: h * 0.5 },
            { x: w * 0.3, y: h * 0.7 },
            { x: w * 0.25, y: h * 0.9 }
        ];

        for (let i = 0; i < lavaPoints.length - 1; i++) {
            const p1 = lavaPoints[i];
            const p2 = lavaPoints[i + 1];
            const flow = Math.sin(t * 2 + i) * 5;

            ctx.beginPath();
            ctx.moveTo(p1.x - 8 + flow, p1.y);
            ctx.quadraticCurveTo((p1.x + p2.x) / 2 + flow, (p1.y + p2.y) / 2, p2.x - 6 + flow, p2.y);
            ctx.lineTo(p2.x + 6 + flow, p2.y);
            ctx.quadraticCurveTo((p1.x + p2.x) / 2 + flow + 4, (p1.y + p2.y) / 2, p1.x + 8 + flow, p1.y);
            ctx.closePath();

            const lavaGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            lavaGrad.addColorStop(0, "rgba(255, " + (150 + Math.sin(t + i) * 50) + ", 0, 0.9)");
            lavaGrad.addColorStop(0.5, "rgba(255, " + (100 + Math.sin(t * 2 + i) * 30) + ", 0, 0.8)");
            lavaGrad.addColorStop(1, "rgba(200, " + (50 + Math.sin(t + i) * 20) + ", 0, 0.7)");
            ctx.fillStyle = lavaGrad;
            ctx.fill();

            ctx.shadowColor = 'rgba(255, 80, 0, 0.5)';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    },

    drawVolcanRocks() {
        const ctx = this.ctx;
        const rocks = [
            { x: 0.1, y: 0.55, s: 18 },
            { x: 0.85, y: 0.6, s: 22 },
            { x: 0.15, y: 0.8, s: 15 },
            { x: 0.8, y: 0.75, s: 20 },
            { x: 0.6, y: 0.85, s: 16 },
            { x: 0.4, y: 0.7, s: 14 }
        ];

        rocks.forEach(r => {
            const rx = r.x * this.width;
            const ry = r.y * this.height;

            ctx.beginPath();
            ctx.moveTo(rx - r.s, ry + r.s * 0.3);
            ctx.lineTo(rx - r.s * 0.5, ry - r.s * 0.6);
            ctx.lineTo(rx + r.s * 0.3, ry - r.s * 0.8);
            ctx.lineTo(rx + r.s, ry - r.s * 0.2);
            ctx.lineTo(rx + r.s * 0.7, ry + r.s * 0.4);
            ctx.closePath();

            const rockGrad = ctx.createRadialGradient(rx, ry - r.s * 0.3, 0, rx, ry, r.s);
            rockGrad.addColorStop(0, '#3a2015');
            rockGrad.addColorStop(1, '#1a0a05');
            ctx.fillStyle = rockGrad;
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 80, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    },

    drawEmbers() {
        const ctx = this.ctx;
        for (let i = 0; i < 30; i++) {
            const baseX = (i * 29) % this.width;
            const x = baseX + Math.sin(this.time * 1.5 + i * 0.7) * 20;
            const y = (this.height - ((this.time * 25 + i * 41) % (this.height + 40)));
            const size = 1.5 + (i % 3);
            const alpha = 0.4 + Math.sin(this.time * 3 + i) * 0.3;
            const pulse = 0.7 + Math.sin(this.time * 4 + i * 2) * 0.3;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, " + (100 + i * 5) + ", 0, " + alpha + ")";
            ctx.fill();

            const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
            glow.addColorStop(0, "rgba(255, 80, 0, " + (0.2 * pulse) + ")");
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
        }
    },

    drawVolcanSmoke() {
        const ctx = this.ctx;
        const cx = this.width * 0.5;
        const cy = this.height * 0.08;

        for (let i = 0; i < 5; i++) {
            const offset = Math.sin(this.time * 0.5 + i * 1.2) * 20;
            const riseY = cy - 20 - i * 30 + Math.sin(this.time + i) * 5;
            const size = 15 + i * 8;
            const alpha = 0.15 - i * 0.02;

            ctx.beginPath();
            ctx.arc(cx + offset, riseY, size, 0, Math.PI * 2);
            const smokeGrad = ctx.createRadialGradient(cx + offset, riseY, 0, cx + offset, riseY, size);
            smokeGrad.addColorStop(0, "rgba(80, 60, 50, " + alpha + ")");
            smokeGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = smokeGrad;
            ctx.fill();
        }
    },

    drawVolcanPaths() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const paths = [[0,1],[1,2],[0,3],[3,4],[2,3],[1,4]];

        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;

            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            const midX = (ra.x + rb.x) / 2 + Math.sin(this.time + a) * 8;
            const midY = (ra.y + rb.y) / 2;
            ctx.quadraticCurveTo(midX, midY, rb.x, rb.y);
            ctx.strokeStyle = unlocked ? 'rgba(255, 100, 0, 0.5)' : 'rgba(100, 50, 30, 0.3)';
            ctx.lineWidth = unlocked ? 4 : 2;
            ctx.setLineDash(unlocked ? [] : [6, 6]);
            ctx.stroke();

            if (unlocked) {
                ctx.shadowColor = 'rgba(255, 60, 0, 0.4)';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.setLineDash([]);
        });
    },

    // ============================================
    // FORET MAUDITE
    // ============================================
    drawForetMaudite() {
        this.drawMauditeGround();
        this.drawDeadTrees();
        this.drawMushrooms();
        this.drawMist();
        this.drawMauditePaths();
        this.drawRoutes();
    },

    drawMauditeGround() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
        gradient.addColorStop(0, '#1a0f2e');
        gradient.addColorStop(0.5, '#0d0815');
        gradient.addColorStop(1, '#05030a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(60, 40, 80, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 150; i++) {
            const x = (i * 137.5 + 42) % w;
            const y = (i * 73.7 + 19) % h;
            const len = 4 + (i % 5) * 2;
            const sway = Math.sin(this.time * 1.5 + x * 0.02) * 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + sway, y - len / 2, x + sway * 1.2, y - len);
            ctx.stroke();
        }
    },

    drawDeadTrees() {
        const ctx = this.ctx;
        const trees = [
            { x: 0.08, y: 0.25, s: 1.3 },
            { x: 0.92, y: 0.2, s: 1.1 },
            { x: 0.05, y: 0.7, s: 1.0 },
            { x: 0.95, y: 0.72, s: 1.4 },
            { x: 0.18, y: 0.88, s: 0.9 },
            { x: 0.82, y: 0.9, s: 1.2 },
            { x: 0.3, y: 0.08, s: 0.8 },
            { x: 0.72, y: 0.1, s: 0.85 }
        ];

        trees.forEach(t => {
            const tx = t.x * this.width;
            const ty = t.y * this.height;
            const s = 35 * t.s;
            const sway = Math.sin(this.time * 0.8 + tx * 0.01) * 2;

            ctx.fillStyle = '#1a0a20';
            ctx.fillRect(tx - s * 0.08, ty - s * 0.5, s * 0.16, s * 0.7);

            ctx.strokeStyle = '#2a1530';
            ctx.lineWidth = 3;
            for (let b = 0; b < 4; b++) {
                const angle = (b / 4) * Math.PI - Math.PI / 4 + sway * 0.02;
                const blen = s * (0.4 + ((b * 7 + 3) % 5) * 0.06);
                ctx.beginPath();
                ctx.moveTo(tx, ty - s * 0.3 - b * s * 0.12);
                ctx.lineTo(tx + Math.cos(angle) * blen, ty - s * 0.3 - b * s * 0.12 + Math.sin(angle) * blen * 0.5);
                ctx.stroke();
            }

            const glow = ctx.createRadialGradient(tx, ty - s * 0.3, 0, tx, ty - s * 0.3, s * 0.6);
            glow.addColorStop(0, 'rgba(100, 50, 150, 0.08)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(tx - s, ty - s, s * 2, s * 2);
        });
    },

    drawMushrooms() {
        const ctx = this.ctx;
        const shrooms = [
            { x: 0.25, y: 0.5 },
            { x: 0.55, y: 0.45 },
            { x: 0.4, y: 0.7 },
            { x: 0.7, y: 0.6 },
            { x: 0.15, y: 0.4 }
        ];

        shrooms.forEach(m => {
            const mx = m.x * this.width;
            const my = m.y * this.height;
            const pulse = 0.6 + Math.sin(this.time * 2.5 + mx) * 0.4;

            const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 20);
            glow.addColorStop(0, 'rgba(100, 255, 50, ' + (0.15 * pulse) + ')');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(mx - 25, my - 25, 50, 50);

            ctx.fillStyle = '#2a1a30';
            ctx.fillRect(mx - 2, my, 4, 10);

            ctx.beginPath();
            ctx.arc(mx, my, 8, Math.PI, 0);
            ctx.fillStyle = 'rgba(80, 40, 120, ' + pulse + ')';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(mx - 3, my - 3, 1.5, 0, Math.PI * 2);
            ctx.arc(mx + 4, my - 2, 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(150, 255, 100, ' + (pulse * 0.8) + ')';
            ctx.fill();
        });
    },

    drawMist() {
        const ctx = this.ctx;
        for (let i = 0; i < 8; i++) {
            const x = ((this.time * 15 + i * 100) % (this.width + 200)) - 100;
            const y = this.height * (0.3 + i * 0.08);
            const alpha = 0.06 + Math.sin(this.time + i) * 0.03;

            ctx.beginPath();
            ctx.ellipse(x, y, 80, 20, 0, 0, Math.PI * 2);
            const mistGrad = ctx.createRadialGradient(x, y, 0, x, y, 80);
            mistGrad.addColorStop(0, 'rgba(80, 50, 120, ' + alpha + ')');
            mistGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = mistGrad;
            ctx.fill();
        }
    },

    drawMauditePaths() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const paths = [[0,1],[1,2],[0,3],[3,4],[2,3],[1,4]];

        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;

            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            const midX = (ra.x + rb.x) / 2 + Math.sin(this.time * 0.5 + a * 2) * 12;
            const midY = (ra.y + rb.y) / 2 + Math.cos(this.time * 0.7 + b) * 8;
            ctx.quadraticCurveTo(midX, midY, rb.x, rb.y);
            ctx.strokeStyle = unlocked ? 'rgba(100, 60, 150, 0.5)' : 'rgba(60, 40, 80, 0.2)';
            ctx.lineWidth = unlocked ? 3 : 2;
            ctx.setLineDash(unlocked ? [] : [8, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    },

    // ============================================
    // CIEL ETHERE
    // ============================================
    drawCielEthere() {
        this.drawSkyBackground();
        this.drawClouds();
        this.drawLightRays();
        this.drawEtherealParticles();
        this.drawSkyPaths();
        this.drawRoutes();
    },

    drawSkyBackground() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1a1a40');
        gradient.addColorStop(0.3, '#2a2a60');
        gradient.addColorStop(0.6, '#1a2040');
        gradient.addColorStop(1, '#151535');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < 60; i++) {
            const x = (i * 137.5) % w;
            const y = (i * 73.7) % (h * 0.6);
            const twinkle = 0.4 + Math.sin(this.time * 2.5 + i * 0.8) * 0.4;
            const size = 1 + (i % 3) * 0.5;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 200, ' + twinkle + ')';
            ctx.fill();

            if (i % 5 === 0) {
                ctx.strokeStyle = 'rgba(255, 255, 200, ' + (twinkle * 0.3) + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x - 4, y);
                ctx.lineTo(x + 4, y);
                ctx.moveTo(x, y - 4);
                ctx.lineTo(x, y + 4);
                ctx.stroke();
            }
        }
    },

    drawClouds() {
        const ctx = this.ctx;
        const clouds = [
            { x: 0.15, y: 0.3, s: 1.2 },
            { x: 0.5, y: 0.25, s: 1.5 },
            { x: 0.8, y: 0.35, s: 1.0 },
            { x: 0.35, y: 0.55, s: 0.8 },
            { x: 0.65, y: 0.5, s: 1.1 }
        ];

        clouds.forEach(c => {
            const cx = c.x * this.width + Math.sin(this.time * 0.3 + c.x * 10) * 15;
            const cy = c.y * this.height;
            const s = 30 * c.s;

            for (let i = 0; i < 4; i++) {
                const ox = (i - 1.5) * s * 0.4;
                const oy = Math.sin(i * 1.5) * s * 0.15;
                const r = s * (0.3 + Math.sin(i * 2) * 0.1);

                ctx.beginPath();
                ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
                const cloudGrad = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r);
                cloudGrad.addColorStop(0, 'rgba(200, 210, 255, 0.15)');
                cloudGrad.addColorStop(0.7, 'rgba(150, 170, 220, 0.08)');
                cloudGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = cloudGrad;
                ctx.fill();
            }

            const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.8);
            aura.addColorStop(0, 'rgba(200, 200, 255, 0.05)');
            aura.addColorStop(1, 'transparent');
            ctx.fillStyle = aura;
            ctx.fillRect(cx - s, cy - s, s * 2, s * 2);
        });
    },

    drawLightRays() {
        const ctx = this.ctx;
        const w = this.width;

        for (let i = 0; i < 4; i++) {
            const x = w * (0.2 + i * 0.2);
            const alpha = 0.04 + Math.sin(this.time * 0.8 + i * 1.5) * 0.02;

            ctx.beginPath();
            ctx.moveTo(x - 15, 0);
            ctx.lineTo(x + 30, this.height * 0.7);
            ctx.lineTo(x - 30, this.height * 0.7);
            ctx.closePath();

            const rayGrad = ctx.createLinearGradient(x, 0, x, this.height * 0.7);
            rayGrad.addColorStop(0, 'rgba(255, 240, 200, ' + alpha + ')');
            rayGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = rayGrad;
            ctx.fill();
        }
    },

    drawEtherealParticles() {
        const ctx = this.ctx;
        for (let i = 0; i < 25; i++) {
            const x = (Math.sin(this.time * 0.4 + i * 1.8) * 0.45 + 0.5) * this.width;
            const y = (Math.cos(this.time * 0.3 + i * 2.2) * 0.4 + 0.5) * this.height;
            const alpha = 0.3 + Math.sin(this.time * 3 + i) * 0.2;
            const size = 2 + (i % 3);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
            glow.addColorStop(0, 'rgba(255, 230, 150, ' + alpha + ')');
            glow.addColorStop(0.5, 'rgba(200, 200, 255, ' + (alpha * 0.5) + ')');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();
        }
    },

    drawSkyPaths() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const paths = [[0,1],[1,2],[0,3],[3,4],[2,3],[1,4]];

        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;

            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            const cp1x = ra.x + (rb.x - ra.x) * 0.3 + Math.sin(this.time + a) * 12;
            const cp1y = ra.y + (rb.y - ra.y) * 0.3 - 20;
            const cp2x = ra.x + (rb.x - ra.x) * 0.7 + Math.cos(this.time + b) * 12;
            const cp2y = ra.y + (rb.y - ra.y) * 0.7 - 20;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, rb.x, rb.y);
            ctx.strokeStyle = unlocked ? 'rgba(255, 230, 150, 0.4)' : 'rgba(100, 100, 140, 0.2)';
            ctx.lineWidth = unlocked ? 3 : 2;
            ctx.setLineDash(unlocked ? [] : [6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    },

    // ============================================
    // DIMENSION ARCANE
    // ============================================
    drawDimensionArcane() {
        this.drawArcaneBackground();
        this.drawRuneCircles();
        this.drawFloatingCrystals();
        this.drawArcaneParticles();
        this.drawDimensionRifts();
        this.drawArcanePaths();
        this.drawRoutes();
    },

    drawArcaneBackground() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
        gradient.addColorStop(0, '#200a3a');
        gradient.addColorStop(0.5, '#150525');
        gradient.addColorStop(1, '#0a0215');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(120, 80, 200, 0.08)';
        ctx.lineWidth = 0.5;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    },

    drawRuneCircles() {
        const ctx = this.ctx;
        const circles = [
            { x: 0.25, y: 0.35, r: 50, speed: 0.5 },
            { x: 0.7, y: 0.3, r: 40, speed: -0.7 },
            { x: 0.5, y: 0.7, r: 60, speed: 0.3 }
        ];

        circles.forEach(c => {
            const cx = c.x * this.width;
            const cy = c.y * this.height;
            const rotation = this.time * c.speed;

            ctx.beginPath();
            ctx.arc(cx, cy, c.r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(168, 85, 247, ' + (0.2 + Math.sin(this.time + c.x * 5) * 0.1) + ')';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, c.r * 0.6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(200, 150, 255, ' + (0.15 + Math.sin(this.time * 1.5 + c.y * 5) * 0.08) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();

            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + rotation;
                const rx = cx + Math.cos(angle) * c.r * 0.8;
                const ry = cy + Math.sin(angle) * c.r * 0.8;

                ctx.save();
                ctx.translate(rx, ry);
                ctx.rotate(angle + Math.PI / 2);

                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.lineTo(3, 3);
                ctx.lineTo(-3, 3);
                ctx.closePath();
                ctx.fillStyle = 'rgba(200, 150, 255, ' + (0.4 + Math.sin(this.time * 2 + i) * 0.2) + ')';
                ctx.fill();

                ctx.restore();
            }

            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.r * 0.4);
            glow.addColorStop(0, 'rgba(168, 85, 247, 0.1)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(cx - c.r, cy - c.r, c.r * 2, c.r * 2);
        });
    },

    drawFloatingCrystals() {
        const ctx = this.ctx;
        const crystals = [
            { x: 0.15, y: 0.2, s: 12, rot: 0 },
            { x: 0.85, y: 0.25, s: 15, rot: 1 },
            { x: 0.1, y: 0.75, s: 10, rot: 2 },
            { x: 0.9, y: 0.7, s: 14, rot: 3 },
            { x: 0.5, y: 0.15, s: 11, rot: 4 }
        ];

        crystals.forEach(c => {
            const cx = c.x * this.width + Math.sin(this.time * 0.5 + c.rot) * 10;
            const cy = c.y * this.height + Math.cos(this.time * 0.4 + c.rot) * 8;
            const pulse = 0.6 + Math.sin(this.time * 2 + c.rot * 1.5) * 0.4;
            const rotation = this.time * 0.3 + c.rot;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);

            ctx.beginPath();
            ctx.moveTo(0, -c.s);
            ctx.lineTo(c.s * 0.5, 0);
            ctx.lineTo(0, c.s * 0.6);
            ctx.lineTo(-c.s * 0.5, 0);
            ctx.closePath();

            const crystalGrad = ctx.createLinearGradient(-c.s, -c.s, c.s, c.s);
            crystalGrad.addColorStop(0, 'rgba(180, 130, 255, ' + (0.5 * pulse) + ')');
            crystalGrad.addColorStop(1, 'rgba(120, 80, 200, ' + (0.3 * pulse) + ')');
            ctx.fillStyle = crystalGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(200, 170, 255, ' + (0.6 * pulse) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();

            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.s * 2);
            glow.addColorStop(0, 'rgba(168, 85, 247, ' + (0.15 * pulse) + ')');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(cx - c.s * 2, cy - c.s * 2, c.s * 4, c.s * 4);
        });
    },

    drawArcaneParticles() {
        const ctx = this.ctx;
        for (let i = 0; i < 35; i++) {
            const angle = (this.time * 0.3 + i * 0.5) % (Math.PI * 2);
            const radius = 50 + (i % 5) * 40 + Math.sin(this.time + i) * 20;
            const x = this.width / 2 + Math.cos(angle + i * 0.8) * radius;
            const y = this.height / 2 + Math.sin(angle + i * 0.8) * radius * 0.7;
            const alpha = 0.3 + Math.sin(this.time * 2 + i * 0.7) * 0.2;
            const size = 1.5 + (i % 3);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 150, 255, ' + alpha + ')';
            ctx.fill();

            const trailX = x - Math.cos(angle + i * 0.8) * 8;
            const trailY = y - Math.sin(angle + i * 0.8) * 8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(trailX, trailY);
            ctx.strokeStyle = 'rgba(200, 150, 255, ' + (alpha * 0.3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    },

    drawDimensionRifts() {
        const ctx = this.ctx;
        const rifts = [
            { x: 0.3, y: 0.5, angle: 0.3 },
            { x: 0.7, y: 0.45, angle: -0.2 }
        ];

        rifts.forEach(r => {
            const rx = r.x * this.width;
            const ry = r.y * this.height;
            const pulse = 0.5 + Math.sin(this.time * 1.5 + r.angle * 10) * 0.3;

            ctx.save();
            ctx.translate(rx, ry);
            ctx.rotate(r.angle + Math.sin(this.time * 0.5) * 0.1);

            ctx.beginPath();
            ctx.moveTo(-30, -5 + Math.sin(this.time * 2) * 3);
            ctx.quadraticCurveTo(0, -15 + Math.cos(this.time * 3) * 5, 30, -3 + Math.sin(this.time * 2.5) * 4);
            ctx.quadraticCurveTo(5, 5, -25, 3 + Math.cos(this.time * 2) * 3);
            ctx.closePath();

            const riftGrad = ctx.createLinearGradient(-30, 0, 30, 0);
            riftGrad.addColorStop(0, 'rgba(255, 200, 100, ' + (0.3 * pulse) + ')');
            riftGrad.addColorStop(0.5, 'rgba(200, 100, 255, ' + (0.4 * pulse) + ')');
            riftGrad.addColorStop(1, 'rgba(100, 200, 255, ' + (0.3 * pulse) + ')');
            ctx.fillStyle = riftGrad;
            ctx.fill();

            ctx.restore();

            const glow = ctx.createRadialGradient(rx, ry, 0, rx, ry, 40);
            glow.addColorStop(0, 'rgba(200, 150, 255, ' + (0.1 * pulse) + ')');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(rx - 50, ry - 50, 100, 100);
        });
    },

    drawArcanePaths() {
        const ctx = this.ctx;
        const routes = this.getRoutePositions();
        const paths = [[0,1],[1,2],[0,3],[3,4],[2,3],[1,4]];

        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;

            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            const midX = (ra.x + rb.x) / 2 + Math.sin(this.time + a * 1.5) * 15;
            const midY = (ra.y + rb.y) / 2 + Math.cos(this.time * 1.2 + b) * 10;
            ctx.quadraticCurveTo(midX, midY, rb.x, rb.y);

            const alpha = unlocked ? (0.5 + Math.sin(this.time * 2 + a) * 0.15) : 0.2;
            ctx.strokeStyle = unlocked ? 'rgba(168, 85, 247, ' + alpha + ')' : 'rgba(80, 50, 120, 0.2)';
            ctx.lineWidth = unlocked ? 3 : 2;
            ctx.setLineDash(unlocked ? [] : [6, 6]);
            ctx.stroke();

            if (unlocked) {
                ctx.shadowColor = 'rgba(168, 85, 247, 0.3)';
                ctx.shadowBlur = 6;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            ctx.setLineDash([]);

            if (unlocked) {
                for (let t = 0.25; t < 1; t += 0.25) {
                    const px = ra.x + (rb.x - ra.x) * t;
                    const py = ra.y + (rb.y - ra.y) * t + Math.sin(this.time * 2 + t * 10) * 3;
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 170, 255, ' + (0.4 + Math.sin(this.time * 3 + t * 5) * 0.2) + ')';
                    ctx.fill();
                }
            }
        });
    },
    // ============================================
    // ROUTES (commun à toutes les régions)
    // ============================================
    
    // Calculer le nombre de kills nécessaires pour débloquer une route
    getKillsNeededForRoute(routeIndex) {
        const region = Game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return GAME_CONFIG.KILLS_FOR_ROUTE;
        
        // La première route est toujours débloquée
        if (routeIndex === 0) return 0;
        
        // Vérifier si la route précédente est débloquée
        const prevRoute = region.routes[routeIndex - 1];
        if (!prevRoute || !prevRoute.unlocked) return -1; // Route inaccessible
        
        return GAME_CONFIG.KILLS_FOR_ROUTE;
    },
    
    // Obtenir la progression actuelle pour débloquer la prochaine route
    getCurrentRouteProgress() {
        const region = Game.state.regions.find(r => r.id === this.currentRegionId);
        if (!region) return { current: 0, needed: 0, routeIndex: -1 };
        
        // Trouver la première route verrouillée
        for (let i = 0; i < region.routes.length; i++) {
            if (!region.routes[i].unlocked) {
                // Vérifier si la route précédente est débloquée
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
            const isActive = Game.state.currentRoute?.id === r.route.id;
            const unlocked = r.route.unlocked;
            
            // Couleur verrouillée plus distincte
            const lockedColor = '#1a1a2e';
            const lockedBorderColor = '#3a3a5e';
            const lockedTextColor = '#4a4a6a';

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
                // Fond verrouillé plus distinctif
                const lockedBg = ctx.createRadialGradient(r.x - 8, r.y - 8, 0, r.x, r.y, 28);
                lockedBg.addColorStop(0, lockedColor);
                lockedBg.addColorStop(1, '#0d0d1a');
                ctx.fillStyle = lockedBg;
            }
            ctx.fill();

            // Bordure
            ctx.strokeStyle = unlocked ? color : lockedBorderColor;
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();
            
            // Effet de verrouillage - hachures sur le contour
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

            // Numéro de route
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = unlocked ? '#fff' : lockedTextColor;
            ctx.fillText(idx + 1, r.x, r.y);

            // Nom sous le cercle
            ctx.font = '10px Inter, sans-serif';
            ctx.fillStyle = unlocked ? '#ccc' : lockedTextColor;
            ctx.fillText(r.route.name, r.x, r.y + 40);

            // Indicateur de progression pour la prochaine route à débloquer
            if (!unlocked && progress.routeIndex === idx && progress.needed > 0) {
                const progressBarWidth = 50;
                const progressBarHeight = 6;
                const progressX = r.x - progressBarWidth / 2;
                const progressY = r.y + 52;
                const progressPercent = Math.min(1, progress.current / progress.needed);
                
                // Fond de la barre
                ctx.fillStyle = '#1a1a2e';
                ctx.strokeStyle = lockedBorderColor;
                ctx.lineWidth = 1;
                this.roundRect(progressX, progressY, progressBarWidth, progressBarHeight, 3);
                ctx.fill();
                ctx.stroke();
                
                // Remplissage de la barre
                if (progressPercent > 0) {
                    const fillWidth = progressBarWidth * progressPercent;
                    const gradient = ctx.createLinearGradient(progressX, 0, progressX + fillWidth, 0);
                    gradient.addColorStop(0, '#f59e0b');
                    gradient.addColorStop(1, '#fbbf24');
                    ctx.fillStyle = gradient;
                    this.roundRect(progressX, progressY, fillWidth, progressBarHeight, 3);
                    ctx.fill();
                }
                
                // Texte de progression
                ctx.font = '9px Inter, sans-serif';
                ctx.fillStyle = '#f59e0b';
                ctx.textAlign = 'center';
                ctx.fillText(`${progress.current}/${progress.needed}`, r.x, progressY + progressBarHeight + 10);
            }

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
                ctx.font = '14px serif';
                ctx.fillText('🔒', r.x, r.y);
            }
        });
        
        // Afficher l'indicateur global de progression en bas de la carte
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
        
        // Fond du panneau
        ctx.fillStyle = 'rgba(20, 20, 40, 0.9)';
        ctx.strokeStyle = 'rgba(100, 100, 140, 0.5)';
        ctx.lineWidth = 1;
        this.roundRect(x - barWidth / 2 - 15, y - 25, barWidth + 30, 50, 8);
        ctx.fill();
        ctx.stroke();
        
        // Texte d'instruction
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⚔️ Prochaine route: ${progress.routeName}`, x, y - 12);
        
        // Fond de la barre
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = 'rgba(100, 100, 140, 0.5)';
        this.roundRect(x - barWidth / 2, y, barWidth, barHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        // Remplissage de la barre
        if (progressPercent > 0) {
            const fillWidth = barWidth * progressPercent;
            const gradient = ctx.createLinearGradient(x - barWidth / 2, 0, x - barWidth / 2 + fillWidth, 0);
            gradient.addColorStop(0, '#f59e0b');
            gradient.addColorStop(1, '#fbbf24');
            ctx.fillStyle = gradient;
            this.roundRect(x - barWidth / 2, y, fillWidth, barHeight, 5);
            ctx.fill();
        }
        
        // Texte de progression
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${progress.current} / ${progress.needed} échos vaincus`, x, y + barHeight + 10);
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