// ============================================
// MONTAGNES CRISTALLINES
// ============================================

import { RegionRegistry } from './RegionRegistry.js';

(() => {
    function drawStarrySky(map) {
        const ctx = map.ctx;
        const w = map.width;
        const h = map.height;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#050510');
        gradient.addColorStop(0.4, '#0a0a20');
        gradient.addColorStop(1, '#151530');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 80; i++) {
            const x = (i * 137.5) % w;
            const y = (i * 73.7) % (h * 0.5);
            const twinkle = 0.3 + Math.sin(map.time * 3 + i) * 0.3;
            const size = 1 + (i % 3);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.fill();
        }
    }

    function drawMountainRange(map) {
        const ctx = map.ctx;
        const w = map.width;
        const h = map.height;
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
    }

    function drawCrystals(map) {
        const ctx = map.ctx;
        const crystals = [
            { x: 0.2, y: 0.6, s: 1.5, c: '#74b9ff' },
            { x: 0.5, y: 0.5, s: 2, c: '#a855f7' },
            { x: 0.8, y: 0.55, s: 1.3, c: '#06b6d4' },
            { x: 0.35, y: 0.7, s: 1, c: '#74b9ff' },
            { x: 0.65, y: 0.65, s: 1.2, c: '#a855f7' },
        ];
        crystals.forEach((c) => {
            const cx = c.x * map.width;
            const cy = c.y * map.height;
            const size = 12 * c.s;
            const pulse = 0.6 + Math.sin(map.time * 2 + cx * 0.01) * 0.4;
            ctx.beginPath();
            ctx.arc(cx, cy, size * 1.5, 0, Math.PI * 2);
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.5);
            glow.addColorStop(0, c.c + '40');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fill();
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
    }

    function drawSnowfall(map) {
        const ctx = map.ctx;
        for (let i = 0; i < 50; i++) {
            const x = ((map.time * 20 + i * 37) % (map.width + 20)) - 10;
            const y = ((map.time * 30 + i * 53) % (map.height + 20)) - 10;
            const size = 1 + (i % 3);
            const alpha = 0.3 + (i % 5) * 0.1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
            ctx.fill();
        }
    }

    function drawLightning(map) {
        const ctx = map.ctx;
        if (Math.sin(map.time * 0.5) > 0.95) {
            const x = map.width * (0.3 + Math.random() * 0.4);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            let ly = 0;
            while (ly < map.height * 0.4) {
                ly += 20 + Math.random() * 30;
                ctx.lineTo(x + (Math.random() - 0.5) * 30, ly);
            }
            ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(200, 200, 255, 0.05)';
            ctx.fillRect(0, 0, map.width, map.height);
        }
    }

    function drawMountainPaths(map) {
        const ctx = map.ctx;
        const routes = map.getRoutePositions();
        const paths = [
            [0, 1],
            [1, 2],
            [0, 3],
            [3, 4],
            [1, 3],
            [1, 4],
            [2, 4],
        ];
        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a],
                rb = routes[b];
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
    }

    RegionRegistry.register('montagnes', (map) => {
        drawStarrySky(map);
        drawMountainRange(map);
        drawCrystals(map);
        drawSnowfall(map);
        drawLightning(map);
        drawMountainPaths(map);
        map.drawRoutes();
    });
})();
