// ============================================
// OCÉAN ABYSSAL
// ============================================

import { RegionRegistry } from './RegionRegistry.js';

(function() {
    function drawOceanBackground(map) {
        const ctx = map.ctx, w = map.width, h = map.height;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a1525');
        gradient.addColorStop(0.3, '#0a2040');
        gradient.addColorStop(0.7, '#081830');
        gradient.addColorStop(1, '#050f20');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 5; i++) {
            const x = w * (0.1 + i * 0.2);
            ctx.beginPath();
            ctx.moveTo(x - 20, 0); ctx.lineTo(x + 40, h * 0.6); ctx.lineTo(x - 40, h * 0.6);
            ctx.closePath();
            const ray = ctx.createLinearGradient(x, 0, x, h * 0.6);
            ray.addColorStop(0, 'rgba(100, 180, 255, 0.08)');
            ray.addColorStop(1, 'transparent');
            ctx.fillStyle = ray; ctx.fill();
        }
    }

    function drawWaves(map) {
        const ctx = map.ctx;
        for (let layer = 0; layer < 3; layer++) {
            ctx.beginPath();
            ctx.moveTo(0, 30 + layer * 15);
            for (let x = 0; x <= map.width; x += 10) {
                const y = 30 + layer * 15 + Math.sin(x * 0.02 + map.time * (1 + layer * 0.3) + layer) * 8;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(100, 180, 255, ${0.15 - layer * 0.04})`;
            ctx.lineWidth = 2; ctx.stroke();
        }
    }

    function drawBubbles(map) {
        const ctx = map.ctx;
        for (let i = 0; i < 25; i++) {
            const baseX = (i * 37) % map.width;
            const x = baseX + Math.sin(map.time + i) * 10;
            const y = (map.height - ((map.time * 40 + i * 73) % (map.height + 30)));
            const size = 2 + (i % 4);
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
            ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 230, 255, 0.5)'; ctx.fill();
        }
    }

    function drawFish(map) {
        const ctx = map.ctx;
        const fish = [
            { x: 0.2, y: 0.4, dir: 1, speed: 0.3, size: 12, color: '#ff6b6b' },
            { x: 0.7, y: 0.3, dir: -1, speed: 0.4, size: 10, color: '#ffd93d' },
            { x: 0.5, y: 0.6, dir: 1, speed: 0.25, size: 14, color: '#6bcb77' }
        ];
        fish.forEach(f => {
            const fx = ((f.x * map.width + map.time * f.speed * 50 * f.dir) % (map.width + 40)) - 20;
            const fy = f.y * map.height + Math.sin(map.time * 2 + fx * 0.01) * 15;
            ctx.save(); ctx.translate(fx, fy); ctx.scale(f.dir, 1);
            ctx.beginPath(); ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = f.color; ctx.fill();
            ctx.beginPath(); ctx.moveTo(-f.size, 0);
            ctx.lineTo(-f.size - 8, -6); ctx.lineTo(-f.size - 8, 6);
            ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.arc(f.size * 0.4, -2, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#fff'; ctx.fill();
            ctx.restore();
        });
    }

    function drawCorals(map) {
        const ctx = map.ctx;
        const corals = [{ x: 0.15, y: 0.85, type: 'branch' }, { x: 0.4, y: 0.9, type: 'fan' }, { x: 0.65, y: 0.88, type: 'branch' }, { x: 0.85, y: 0.92, type: 'fan' }];
        corals.forEach(c => {
            const cx = c.x * map.width, cy = c.y * map.height;
            if (c.type === 'branch') {
                const colors = ['#ff6b6b', '#ff8e8e'];
                for (let b = 0; b < 3; b++) {
                    ctx.beginPath(); ctx.moveTo(cx + b * 8 - 8, cy);
                    const sway = Math.sin(map.time + b) * 3;
                    ctx.quadraticCurveTo(cx + b * 8 - 8 + sway, cy - 25, cx + b * 8 - 4 + sway, cy - 40);
                    ctx.strokeStyle = colors[b % 2]; ctx.lineWidth = 4;
                    ctx.lineCap = 'round'; ctx.stroke();
                }
            } else {
                ctx.beginPath(); ctx.arc(cx, cy - 15, 20, Math.PI, 0);
                ctx.fillStyle = '#e056fd'; ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy - 15, 15, Math.PI, 0);
                ctx.fillStyle = '#be2edd'; ctx.fill();
            }
        });
    }

    function drawOceanPaths(map) {
        const ctx = map.ctx;
        const routes = map.getRoutePositions();
        const paths = [[0,1],[1,2],[0,3],[3,4],[1,3],[2,4]];
        paths.forEach(([a, b]) => {
            if (!routes[a] || !routes[b]) return;
            const ra = routes[a], rb = routes[b];
            const unlocked = ra.route.unlocked && rb.route.unlocked;
            ctx.beginPath(); ctx.moveTo(ra.x, ra.y);
            const cp1x = ra.x + (rb.x - ra.x) * 0.3 + Math.sin(map.time + a) * 10;
            const cp1y = ra.y + (rb.y - ra.y) * 0.3 + Math.cos(map.time + b) * 10;
            const cp2x = ra.x + (rb.x - ra.x) * 0.7 + Math.sin(map.time + b) * 10;
            const cp2y = ra.y + (rb.y - ra.y) * 0.7 + Math.cos(map.time + a) * 10;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, rb.x, rb.y);
            ctx.strokeStyle = unlocked ? 'rgba(9, 132, 227, 0.4)' : 'rgba(100, 100, 100, 0.2)';
            ctx.lineWidth = unlocked ? 3 : 2;
            ctx.setLineDash(unlocked ? [] : [6, 6]); ctx.stroke(); ctx.setLineDash([]);
        });
    }

    RegionRegistry.register('ocean', function(map) {
        drawOceanBackground(map);
        drawWaves(map);
        drawBubbles(map);
        drawFish(map);
        drawCorals(map);
        drawOceanPaths(map);
        map.drawRoutes();
    });
})();
