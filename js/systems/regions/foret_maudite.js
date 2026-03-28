// ============================================
// FORET MAUDITE
// ============================================

import { RegionRegistry } from './RegionRegistry.js';

(function () {
    function drawMauditeGround(map) {
        const ctx = map.ctx,
            w = map.width,
            h = map.height;
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
        g.addColorStop(0, '#1a0f2e');
        g.addColorStop(0.5, '#0d0815');
        g.addColorStop(1, '#05030a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(60, 40, 80, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 150; i++) {
            const x = (i * 137.5 + 42) % w,
                y = (i * 73.7 + 19) % h,
                len = 4 + (i % 5) * 2;
            const sway = Math.sin(map.time * 1.5 + x * 0.02) * 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + sway, y - len / 2, x + sway * 1.2, y - len);
            ctx.stroke();
        }
    }

    function drawDeadTrees(map) {
        const ctx = map.ctx;
        const trees = [
            { x: 0.08, y: 0.25, s: 1.3 },
            { x: 0.92, y: 0.2, s: 1.1 },
            { x: 0.05, y: 0.7, s: 1.0 },
            { x: 0.95, y: 0.72, s: 1.4 },
            { x: 0.18, y: 0.88, s: 0.9 },
            { x: 0.82, y: 0.9, s: 1.2 },
            { x: 0.3, y: 0.08, s: 0.8 },
            { x: 0.72, y: 0.1, s: 0.85 },
        ];
        trees.forEach((t) => {
            const tx = t.x * map.width,
                ty = t.y * map.height,
                s = 35 * t.s;
            const sway = Math.sin(map.time * 0.8 + tx * 0.01) * 2;
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
            glow.addColorStop(0, 'rgba(100,50,150,0.08)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(tx - s, ty - s, s * 2, s * 2);
        });
    }

    function drawMushrooms(map) {
        const ctx = map.ctx;
        [
            { x: 0.25, y: 0.5 },
            { x: 0.55, y: 0.45 },
            { x: 0.4, y: 0.7 },
            { x: 0.7, y: 0.6 },
            { x: 0.15, y: 0.4 },
        ].forEach((m) => {
            const mx = m.x * map.width,
                my = m.y * map.height;
            const pulse = 0.6 + Math.sin(map.time * 2.5 + mx) * 0.4;
            const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 20);
            glow.addColorStop(0, 'rgba(100,255,50,' + 0.15 * pulse + ')');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(mx - 25, my - 25, 50, 50);
            ctx.fillStyle = '#2a1a30';
            ctx.fillRect(mx - 2, my, 4, 10);
            ctx.beginPath();
            ctx.arc(mx, my, 8, Math.PI, 0);
            ctx.fillStyle = 'rgba(80,40,120,' + pulse + ')';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mx - 3, my - 3, 1.5, 0, Math.PI * 2);
            ctx.arc(mx + 4, my - 2, 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(150,255,100,' + pulse * 0.8 + ')';
            ctx.fill();
        });
    }

    function drawMist(map) {
        const ctx = map.ctx;
        for (let i = 0; i < 8; i++) {
            const x = ((map.time * 15 + i * 100) % (map.width + 200)) - 100;
            const y = map.height * (0.3 + i * 0.08);
            const alpha = 0.06 + Math.sin(map.time + i) * 0.03;
            ctx.beginPath();
            ctx.ellipse(x, y, 80, 20, 0, 0, Math.PI * 2);
            const mg = ctx.createRadialGradient(x, y, 0, x, y, 80);
            mg.addColorStop(0, 'rgba(80,50,120,' + alpha + ')');
            mg.addColorStop(1, 'transparent');
            ctx.fillStyle = mg;
            ctx.fill();
        }
    }

    function drawMauditePaths(map) {
        const ctx = map.ctx,
            routes = map.getRoutePositions();
        [
            [0, 1],
            [1, 2],
            [0, 3],
            [3, 4],
            [2, 3],
            [1, 4],
        ].forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a],
                rb = routes[b],
                ul = ra.route.unlocked && rb.route.unlocked;
            ctx.beginPath();
            ctx.moveTo(ra.x, ra.y);
            const mx = (ra.x + rb.x) / 2 + Math.sin(map.time * 0.5 + a * 2) * 12;
            const my = (ra.y + rb.y) / 2 + Math.cos(map.time * 0.7 + b) * 8;
            ctx.quadraticCurveTo(mx, my, rb.x, rb.y);
            ctx.strokeStyle = ul ? 'rgba(100,60,150,0.5)' : 'rgba(60,40,80,0.2)';
            ctx.lineWidth = ul ? 3 : 2;
            ctx.setLineDash(ul ? [] : [8, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    }

    RegionRegistry.register('foret_maudite', function (map) {
        drawMauditeGround(map);
        drawDeadTrees(map);
        drawMushrooms(map);
        drawMist(map);
        drawMauditePaths(map);
        map.drawRoutes();
    });
})();
