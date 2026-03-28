// ============================================
// CIEL ETHERE
// ============================================

import { RegionRegistry } from './RegionRegistry.js';

(() => {
  function drawSkyBackground(map) {
    const ctx = map.ctx;
    const w = map.width;
    const h = map.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a1a40');
    g.addColorStop(0.3, '#2a2a60');
    g.addColorStop(0.6, '#1a2040');
    g.addColorStop(1, '#151535');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const x = (i * 137.5) % w;
      const y = (i * 73.7) % (h * 0.6);
      const twinkle = 0.4 + Math.sin(map.time * 2.5 + i * 0.8) * 0.4;
      const size = 1 + (i % 3) * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,200,${twinkle})`;
      ctx.fill();
      if (i % 5 === 0) {
        ctx.strokeStyle = `rgba(255,255,200,${twinkle * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y + 4);
        ctx.stroke();
      }
    }
  }

  function drawClouds(map) {
    const ctx = map.ctx;
    for (const c of [
      { x: 0.15, y: 0.3, s: 1.2 },
      { x: 0.5, y: 0.25, s: 1.5 },
      { x: 0.8, y: 0.35, s: 1.0 },
      { x: 0.35, y: 0.55, s: 0.8 },
      { x: 0.65, y: 0.5, s: 1.1 },
    ]) {
      const cx = c.x * map.width + Math.sin(map.time * 0.3 + c.x * 10) * 15;
      const cy = c.y * map.height;
      const s = 30 * c.s;
      for (let i = 0; i < 4; i++) {
        const ox = (i - 1.5) * s * 0.4;
        const oy = Math.sin(i * 1.5) * s * 0.15;
        const r = s * (0.3 + Math.sin(i * 2) * 0.1);
        ctx.beginPath();
        ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
        const cg = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r);
        cg.addColorStop(0, 'rgba(200,210,255,0.15)');
        cg.addColorStop(0.7, 'rgba(150,170,220,0.08)');
        cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg;
        ctx.fill();
      }
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.8);
      aura.addColorStop(0, 'rgba(200,200,255,0.05)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.fillRect(cx - s, cy - s, s * 2, s * 2);
    }
  }

  function drawLightRays(map) {
    const ctx = map.ctx;
    for (let i = 0; i < 4; i++) {
      const x = map.width * (0.2 + i * 0.2);
      const alpha = 0.04 + Math.sin(map.time * 0.8 + i * 1.5) * 0.02;
      ctx.beginPath();
      ctx.moveTo(x - 15, 0);
      ctx.lineTo(x + 30, map.height * 0.7);
      ctx.lineTo(x - 30, map.height * 0.7);
      ctx.closePath();
      const rg = ctx.createLinearGradient(x, 0, x, map.height * 0.7);
      rg.addColorStop(0, `rgba(255,240,200,${alpha})`);
      rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg;
      ctx.fill();
    }
  }

  function drawEtherealParticles(map) {
    const ctx = map.ctx;
    for (let i = 0; i < 25; i++) {
      const x = (Math.sin(map.time * 0.4 + i * 1.8) * 0.45 + 0.5) * map.width;
      const y = (Math.cos(map.time * 0.3 + i * 2.2) * 0.4 + 0.5) * map.height;
      const alpha = 0.3 + Math.sin(map.time * 3 + i) * 0.2;
      const size = 2 + (i % 3);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
      glow.addColorStop(0, `rgba(255,230,150,${alpha})`);
      glow.addColorStop(0.5, `rgba(200,200,255,${alpha * 0.5})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fill();
    }
  }

  function drawSkyPaths(map) {
    const ctx = map.ctx;
    const routes = map.getRoutePositions();
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [2, 3],
      [1, 4],
    ]) {
      if (!routes[a] || !routes[b]) {
        return;
      }
      const ra = routes[a];
      const rb = routes[b];
      const ul = ra.route.unlocked && rb.route.unlocked;
      ctx.beginPath();
      ctx.moveTo(ra.x, ra.y);
      const cp1x = ra.x + (rb.x - ra.x) * 0.3 + Math.sin(map.time + a) * 12;
      const cp1y = ra.y + (rb.y - ra.y) * 0.3 - 20;
      const cp2x = ra.x + (rb.x - ra.x) * 0.7 + Math.cos(map.time + b) * 12;
      const cp2y = ra.y + (rb.y - ra.y) * 0.7 - 20;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, rb.x, rb.y);
      ctx.strokeStyle = ul ? 'rgba(255,230,150,0.4)' : 'rgba(100,100,140,0.2)';
      ctx.lineWidth = ul ? 3 : 2;
      ctx.setLineDash(ul ? [] : [6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  RegionRegistry.register('ciel_ethere', (map) => {
    drawSkyBackground(map);
    drawClouds(map);
    drawLightRays(map);
    drawEtherealParticles(map);
    drawSkyPaths(map);
    map.drawRoutes();
  });
})();
