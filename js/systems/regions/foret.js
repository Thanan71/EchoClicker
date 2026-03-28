// ============================================
// FORÊT ÉVEILLÉE
// ============================================

import { RegionRegistry } from './RegionRegistry.js';

(function () {
    function drawTree(map, x, y, size) {
        const ctx = map.ctx;
        const sway = Math.sin(map.time * 1.5 + x * 0.01) * 2;
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(x - size * 0.1, y - size * 0.3, size * 0.2, size * 0.6);
        const colors = ['#1a5a1a', '#2d7a2d', '#1a6a1a'];
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                x + sway + (i - 1) * size * 0.25,
                y - size * 0.5 - i * size * 0.15,
                size * (0.4 - i * 0.05),
                0,
                Math.PI * 2,
            );
            ctx.fillStyle = colors[i];
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x + sway, y - size * 0.5, size * 0.5, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x + sway, y - size * 0.5, 0, x + sway, y - size * 0.5, size * 0.5);
        glow.addColorStop(0, 'rgba(85, 166, 48, 0.1)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fill();
    }

    function drawGrassGround(map) {
        const ctx = map.ctx;
        const w = map.width;
        const h = map.height;
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
        gradient.addColorStop(0, '#2d5a2d');
        gradient.addColorStop(0.5, '#1a3a1a');
        gradient.addColorStop(1, '#0d200d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(85, 166, 48, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const len = 5 + Math.random() * 10;
            const sway = Math.sin(map.time * 2 + x * 0.01) * 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + sway, y - len / 2, x + sway * 1.5, y - len);
            ctx.stroke();
        }
    }

    function drawForestTrees(map) {
        const trees = [
            { x: 0.08, y: 0.2, s: 1.2 },
            { x: 0.92, y: 0.15, s: 1.4 },
            { x: 0.05, y: 0.7, s: 1.0 },
            { x: 0.95, y: 0.75, s: 1.3 },
            { x: 0.15, y: 0.85, s: 0.9 },
            { x: 0.85, y: 0.9, s: 1.1 },
            { x: 0.25, y: 0.1, s: 0.8 },
            { x: 0.75, y: 0.08, s: 0.9 },
        ];
        trees.forEach((t) => {
            drawTree(map, t.x * map.width, t.y * map.height, 40 * t.s);
        });
    }

    function drawGlowMushrooms(map) {
        const ctx = map.ctx;
        const mushrooms = [
            { x: 0.3, y: 0.4 },
            { x: 0.6, y: 0.35 },
            { x: 0.45, y: 0.6 },
            { x: 0.7, y: 0.55 },
        ];
        mushrooms.forEach((m) => {
            const mx = m.x * map.width,
                my = m.y * map.height;
            const pulse = 0.7 + Math.sin(map.time * 3 + mx) * 0.3;
            ctx.beginPath();
            ctx.arc(mx, my, 15, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 15);
            glow.addColorStop(0, `rgba(180, 255, 100, ${0.3 * pulse})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(mx - 2, my, 4, 8);
            ctx.beginPath();
            ctx.arc(mx, my, 6, Math.PI, 0);
            ctx.fillStyle = `rgba(200, 255, 150, ${pulse})`;
            ctx.fill();
        });
    }

    function drawFireflies(map) {
        const ctx = map.ctx;
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(map.time * 0.5 + i * 1.5) * 0.4 + 0.5) * map.width;
            const y = (Math.cos(map.time * 0.3 + i * 2) * 0.4 + 0.5) * map.height;
            const alpha = 0.3 + Math.sin(map.time * 4 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
            glow.addColorStop(0, `rgba(255, 255, 150, ${alpha})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();
        }
    }

    function drawForestPaths(map) {
        const ctx = map.ctx;
        const routes = map.getRoutePositions();
        const paths = [
            [0, 1],
            [1, 3],
            [0, 2],
            [2, 4],
            [1, 4],
            [3, 4],
        ];
        const curveOffsets = [
            { dx: 15, dy: -10 },
            { dx: -20, dy: 15 },
            { dx: 10, dy: 20 },
            { dx: -15, dy: -15 },
            { dx: 20, dy: 10 },
            { dx: -10, dy: -20 },
        ];
        paths.forEach(([a, b], i) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a],
                rb = routes[b];
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
            if (unlocked) {
                for (let t = 0.2; t < 1; t += 0.2) {
                    const px = ra.x + (rb.x - ra.x) * t + Math.sin(t * 10) * 5;
                    const py = ra.y + (rb.y - ra.y) * t + Math.cos(t * 10) * 5;
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(139, 119, 101, 0.4)';
                    ctx.fill();
                }
            }
        });
    }

    RegionRegistry.register('foret', function (map) {
        drawGrassGround(map);
        drawForestTrees(map);
        drawGlowMushrooms(map);
        drawFireflies(map);
        drawForestPaths(map);
        map.drawRoutes();
    });
})();
