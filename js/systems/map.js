// ============================================
// ÉchoClicker - Système de Carte Canvas
// ============================================

const MapSystem = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 500,
    locations: [],
    hoveredLocation: null,
    particles: [],
    stars: [],
    animationFrame: null,

    // Configuration des contrées sur la carte
    regionPositions: {
        foret: { x: 150, y: 250, icon: '🌲', color: '#55a630' },
        montagnes: { x: 400, y: 150, icon: '🏔️', color: '#74b9ff' },
        ocean: { x: 650, y: 350, icon: '🌊', color: '#0984e3' }
    },

    init() {
        this.canvas = document.getElementById('map-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Générer les étoiles de fond
        this.generateStars();

        // Configurer les événements
        this.setupEvents();

        // Démarrer l'animation
        this.animate();

        // Écouter les événements
        EventBus.on(GAME_EVENTS.REGION_UNLOCKED, () => this.updateLocations());
        EventBus.on(GAME_EVENTS.ROUTE_UNLOCKED, () => this.updateLocations());
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

        this.updateLocations();
    },

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01
            });
        }
    },

    updateLocations() {
        this.locations = [];

        Game.state.regions.forEach(region => {
            const pos = this.regionPositions[region.id];
            if (!pos) return;

            // Ajuster les positions selon la taille du canvas
            const scaleX = this.width / 800;
            const scaleY = this.height / 500;

            const regionX = pos.x * scaleX;
            const regionY = pos.y * scaleY;

            // Ajouter la contrée
            this.locations.push({
                type: 'region',
                id: region.id,
                name: region.name,
                emoji: region.emoji,
                x: regionX,
                y: regionY,
                radius: 45,
                color: pos.color,
                unlocked: region.unlocked,
                bossDefeated: region.bossDefeated,
                desc: region.desc
            });

            // Ajouter les routes de la contrée
            if (region.unlocked) {
                const routeCount = region.routes.length;
                region.routes.forEach((route, idx) => {
                    const angle = (idx / routeCount) * Math.PI * 2 - Math.PI / 2;
                    const routeRadius = 80 * scaleX;
                    const rx = regionX + Math.cos(angle) * routeRadius;
                    const ry = regionY + Math.sin(angle) * routeRadius;

                    this.locations.push({
                        type: 'route',
                        id: route.id,
                        regionId: region.id,
                        name: route.name,
                        x: rx,
                        y: ry,
                        radius: 25,
                        color: route.unlocked ? pos.color : '#444',
                        unlocked: route.unlocked,
                        level: route.lv,
                        isActive: Game.state.currentRoute?.id === route.id
                    });
                });
            }
        });
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

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        let found = null;

        // Vérifier les locations en ordre inverse (dessus en premier)
        for (let i = this.locations.length - 1; i >= 0; i--) {
            const loc = this.locations[i];
            const dist = Math.hypot(pos.x - loc.x, pos.y - loc.y);
            if (dist <= loc.radius) {
                found = loc;
                break;
            }
        }

        this.hoveredLocation = found;
        this.canvas.style.cursor = found && (found.unlocked || found.type === 'region') ? 'pointer' : 'not-allowed';
    },

    handleClick(e) {
        const pos = this.getMousePos(e);

        for (let i = this.locations.length - 1; i >= 0; i--) {
            const loc = this.locations[i];
            const dist = Math.hypot(pos.x - loc.x, pos.y - loc.y);

            if (dist <= loc.radius) {
                if (loc.type === 'region') {
                    if (loc.unlocked) {
                        Game.selectRegion(loc.id);
                        this.spawnClickParticles(loc.x, loc.y, loc.color);
                    } else {
                        UI.toast('🔒 Contrée verrouillée !', 'warning');
                    }
                } else if (loc.type === 'route') {
                    if (loc.unlocked) {
                        Game.selectRoute(loc.id);
                        this.spawnClickParticles(loc.x, loc.y, loc.color);
                    } else {
                        UI.toast('🔒 Route verrouillée !', 'warning');
                    }
                }
                break;
            }
        }
    },

    spawnClickParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: 3 + Math.random() * 3
            });
        }
    },

    animate() {
        this.update();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    },

    update() {
        // Mettre à jour les particules
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.size *= 0.98;
            return p.life > 0;
        });

        // Mettre à jour les étoiles
        this.stars.forEach(star => {
            star.twinkle += star.speed;
        });
    },

    draw() {
        const ctx = this.ctx;

        // Fond dégradé
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#12122a');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Dessiner les étoiles
        this.drawStars();

        // Dessiner les connexions entre contrées
        this.drawConnections();

        // Dessiner les routes
        this.locations.filter(l => l.type === 'route').forEach(loc => this.drawLocation(loc));

        // Dessiner les contrées
        this.locations.filter(l => l.type === 'region').forEach(loc => this.drawLocation(loc));

        // Dessiner les particules
        this.drawParticles();

        // Dessiner le tooltip
        if (this.hoveredLocation) {
            this.drawTooltip(this.hoveredLocation);
        }
    },

    drawStars() {
        const ctx = this.ctx;
        this.stars.forEach(star => {
            const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        });
    },

    drawConnections() {
        const ctx = this.ctx;
        const regions = this.locations.filter(l => l.type === 'region');

        // Connexions entre contrées adjacentes
        const connections = [
            ['foret', 'montagnes'],
            ['montagnes', 'ocean'],
            ['foret', 'ocean']
        ];

        connections.forEach(([id1, id2]) => {
            const r1 = regions.find(r => r.id === id1);
            const r2 = regions.find(r => r.id === id2);
            if (!r1 || !r2) return;

            const bothUnlocked = r1.unlocked && r2.unlocked;

            ctx.beginPath();
            ctx.moveTo(r1.x, r1.y);

            // Courbe de Bézier pour un effet plus joli
            const midX = (r1.x + r2.x) / 2;
            const midY = (r1.y + r2.y) / 2 - 30;
            ctx.quadraticCurveTo(midX, midY, r2.x, r2.y);

            ctx.strokeStyle = bothUnlocked ? 'rgba(139, 92, 246, 0.4)' : 'rgba(100, 100, 100, 0.2)';
            ctx.lineWidth = bothUnlocked ? 3 : 2;
            ctx.setLineDash(bothUnlocked ? [] : [8, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    },

    drawLocation(loc) {
        const ctx = this.ctx;
        const isHovered = this.hoveredLocation === loc;
        const time = Date.now() / 1000;

        // Rayonnement pour les éléments actifs/hovered
        if ((loc.unlocked && isHovered) || loc.isActive) {
            const glowRadius = loc.radius + 15 + Math.sin(time * 3) * 5;
            const glowGradient = ctx.createRadialGradient(loc.x, loc.y, loc.radius, loc.x, loc.y, glowRadius);
            glowGradient.addColorStop(0, loc.color + '60');
            glowGradient.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
        }

        // Cercle de fond
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, loc.radius, 0, Math.PI * 2);

        if (loc.unlocked) {
            const bgGradient = ctx.createRadialGradient(loc.x - loc.radius / 3, loc.y - loc.radius / 3, 0, loc.x, loc.y, loc.radius);
            bgGradient.addColorStop(0, loc.color + 'cc');
            bgGradient.addColorStop(1, loc.color + '66');
            ctx.fillStyle = bgGradient;
        } else {
            ctx.fillStyle = '#2a2a3e';
        }
        ctx.fill();

        // Bordure
        ctx.strokeStyle = loc.unlocked ? loc.color : '#444';
        ctx.lineWidth = isHovered ? 4 : 2;
        ctx.stroke();

        // Icône
        const icon = loc.type === 'region' ? loc.emoji : (loc.unlocked ? '📍' : '🔒');
        ctx.font = loc.type === 'region' ? '28px serif' : '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, loc.x, loc.y);

        // Nom sous l'icône
        if (loc.type === 'region') {
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillStyle = loc.unlocked ? '#fff' : '#666';
            ctx.fillText(loc.name, loc.x, loc.y + loc.radius + 15);
        }

        // Indicateur de boss vaincu
        if (loc.type === 'region' && loc.bossDefeated) {
            ctx.font = '14px serif';
            ctx.fillText('✅', loc.x + loc.radius - 10, loc.y - loc.radius + 10);
        }

        // Indicateur de route active
        if (loc.isActive) {
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, loc.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
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

    drawTooltip(loc) {
        const ctx = this.ctx;
        const padding = 12;
        const lineHeight = 20;

        // Préparer le texte
        const lines = [];
        if (loc.type === 'region') {
            lines.push(loc.name);
            lines.push(loc.desc || '');
            if (!loc.unlocked) lines.push('🔒 Verrouillé');
            else if (loc.bossDefeated) lines.push('✅ Terminé');
        } else {
            lines.push(loc.name);
            lines.push(`Niveau ${loc.level}`);
            if (!loc.unlocked) lines.push('🔒 Verrouillé');
            else if (loc.isActive) lines.push('⚔️ En combat');
        }

        // Calculer la taille du tooltip
        ctx.font = 'bold 13px Inter, sans-serif';
        const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
        const tooltipWidth = maxWidth + padding * 2;
        const tooltipHeight = lines.length * lineHeight + padding * 2;

        // Position du tooltip (éviter de sortir de l'écran)
        let tx = loc.x + loc.radius + 15;
        let ty = loc.y - tooltipHeight / 2;

        if (tx + tooltipWidth > this.width) {
            tx = loc.x - loc.radius - tooltipWidth - 15;
        }
        if (ty < 10) ty = 10;
        if (ty + tooltipHeight > this.height - 10) ty = this.height - tooltipHeight - 10;

        // Fond du tooltip
        ctx.fillStyle = 'rgba(30, 30, 66, 0.95)';
        ctx.strokeStyle = loc.unlocked ? loc.color : '#444';
        ctx.lineWidth = 2;

        // Rectangle arrondi
        const r = 8;
        ctx.beginPath();
        ctx.moveTo(tx + r, ty);
        ctx.lineTo(tx + tooltipWidth - r, ty);
        ctx.quadraticCurveTo(tx + tooltipWidth, ty, tx + tooltipWidth, ty + r);
        ctx.lineTo(tx + tooltipWidth, ty + tooltipHeight - r);
        ctx.quadraticCurveTo(tx + tooltipWidth, ty + tooltipHeight, tx + tooltipWidth - r, ty + tooltipHeight);
        ctx.lineTo(tx + r, ty + tooltipHeight);
        ctx.quadraticCurveTo(tx, ty + tooltipHeight, tx, ty + tooltipHeight - r);
        ctx.lineTo(tx, ty + r);
        ctx.quadraticCurveTo(tx, ty, tx + r, ty);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Texte
        lines.forEach((line, i) => {
            ctx.font = i === 0 ? 'bold 13px Inter, sans-serif' : '11px Inter, sans-serif';
            ctx.fillStyle = i === 0 ? '#fff' : '#a0a0c0';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(line, tx + padding, ty + padding + i * lineHeight);
        });
    },

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}; 