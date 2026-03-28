// ============================================
// DIMENSION ARCANE
// ============================================

import { RegionRegistry } from './RegionRegistry.js';

(() => {
  function drawArcaneBackground(map) {
    const ctx = map.ctx;
    const w = map.width;
    const h = map.height;
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
    g.addColorStop(0, '#200a3a');
    g.addColorStop(0.5, '#150525');
    g.addColorStop(1, '#0a0215');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(120,80,200,0.08)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawRuneCircles(map) {
    const ctx = map.ctx;
    for (const c of [
      { x: 0.25, y: 0.35, r: 50, s: 0.5 },
      { x: 0.7, y: 0.3, r: 40, s: -0.7 },
      { x: 0.5, y: 0.7, r: 60, s: 0.3 },
    ]) {
      const cx = c.x * map.width;
      const cy = c.y * map.height;
      const rot = map.time * c.s;
      ctx.beginPath();
      ctx.arc(cx, cy, c.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168,85,247,${0.2 + Math.sin(map.time + c.x * 5) * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, c.r * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,150,255,${0.15 + Math.sin(map.time * 1.5 + c.y * 5) * 0.08})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + rot;
        const rx = cx + Math.cos(a) * c.r * 0.8;
        const ry = cy + Math.sin(a) * c.r * 0.8;
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(a + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(3, 3);
        ctx.lineTo(-3, 3);
        ctx.closePath();
        ctx.fillStyle = `rgba(200,150,255,${0.4 + Math.sin(map.time * 2 + i) * 0.2})`;
        ctx.fill();
        ctx.restore();
      }
      const gw = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.r * 0.4);
      gw.addColorStop(0, 'rgba(168,85,247,0.1)');
      gw.addColorStop(1, 'transparent');
      ctx.fillStyle = gw;
      ctx.fillRect(cx - c.r, cy - c.r, c.r * 2, c.r * 2);
    }
  }

  function drawFloatingCrystals(map) {
    const ctx = map.ctx;
    for (const c of [
      { x: 0.15, y: 0.2, s: 12, r: 0 },
      { x: 0.85, y: 0.25, s: 15, r: 1 },
      { x: 0.1, y: 0.75, s: 10, r: 2 },
      { x: 0.9, y: 0.7, s: 14, r: 3 },
      { x: 0.5, y: 0.15, s: 11, r: 4 },
    ]) {
      const cx = c.x * map.width + Math.sin(map.time * 0.5 + c.r) * 10;
      const cy = c.y * map.height + Math.cos(map.time * 0.4 + c.r) * 8;
      const p = 0.6 + Math.sin(map.time * 2 + c.r * 1.5) * 0.4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(map.time * 0.3 + c.r);
      ctx.beginPath();
      ctx.moveTo(0, -c.s);
      ctx.lineTo(c.s * 0.5, 0);
      ctx.lineTo(0, c.s * 0.6);
      ctx.lineTo(-c.s * 0.5, 0);
      ctx.closePath();
      const cg = ctx.createLinearGradient(-c.s, -c.s, c.s, c.s);
      cg.addColorStop(0, `rgba(180,130,255,${0.5 * p})`);
      cg.addColorStop(1, `rgba(120,80,200,${0.3 * p})`);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = `rgba(200,170,255,${0.6 * p})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      const gw = ctx.createRadialGradient(cx, cy, 0, cx, cy, c.s * 2);
      gw.addColorStop(0, `rgba(168,85,247,${0.15 * p})`);
      gw.addColorStop(1, 'transparent');
      ctx.fillStyle = gw;
      ctx.fillRect(cx - c.s * 2, cy - c.s * 2, c.s * 4, c.s * 4);
    }
  }

  function drawArcaneParticles(map) {
    const ctx = map.ctx;
    for (let i = 0; i < 35; i++) {
      const a = (map.time * 0.3 + i * 0.5) % (Math.PI * 2);
      const r = 50 + (i % 5) * 40 + Math.sin(map.time + i) * 20;
      const x = map.width / 2 + Math.cos(a + i * 0.8) * r;
      const y = map.height / 2 + Math.sin(a + i * 0.8) * r * 0.7;
      const al = 0.3 + Math.sin(map.time * 2 + i * 0.7) * 0.2;
      const sz = 1.5 + (i % 3);
      ctx.beginPath();
      ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,150,255,${al})`;
      ctx.fill();
      const tx = x - Math.cos(a + i * 0.8) * 8;
      const ty = y - Math.sin(a + i * 0.8) * 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = `rgba(200,150,255,${al * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawDimensionRifts(map) {
    const ctx = map.ctx;
    for (const r of [
      { x: 0.3, y: 0.5, a: 0.3 },
      { x: 0.7, y: 0.45, a: -0.2 },
    ]) {
      const rx = r.x * map.width;
      const ry = r.y * map.height;
      const p = 0.5 + Math.sin(map.time * 1.5 + r.a * 10) * 0.3;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(r.a + Math.sin(map.time * 0.5) * 0.1);
      ctx.beginPath();
      ctx.moveTo(-30, -5 + Math.sin(map.time * 2) * 3);
      ctx.quadraticCurveTo(
        0,
        -15 + Math.cos(map.time * 3) * 5,
        30,
        -3 + Math.sin(map.time * 2.5) * 4,
      );
      ctx.quadraticCurveTo(5, 5, -25, 3 + Math.cos(map.time * 2) * 3);
      ctx.closePath();
      const rg = ctx.createLinearGradient(-30, 0, 30, 0);
      rg.addColorStop(0, `rgba(255,200,100,${0.3 * p})`);
      rg.addColorStop(0.5, `rgba(200,100,255,${0.4 * p})`);
      rg.addColorStop(1, `rgba(100,200,255,${0.3 * p})`);
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.restore();
      const gw = ctx.createRadialGradient(rx, ry, 0, rx, ry, 40);
      gw.addColorStop(0, `rgba(200,150,255,${0.1 * p})`);
      gw.addColorStop(1, 'transparent');
      ctx.fillStyle = gw;
      ctx.fillRect(rx - 50, ry - 50, 100, 100);
    }
  }

  function drawArcanePath(ctx, ra, rb, unlocked, time, a, b) {
    ctx.beginPath();
    ctx.moveTo(ra.x, ra.y);
    const mx = (ra.x + rb.x) / 2 + Math.sin(time + a * 1.5) * 15;
    const my = (ra.y + rb.y) / 2 + Math.cos(time * 1.2 + b) * 10;
    ctx.quadraticCurveTo(mx, my, rb.x, rb.y);
    const al = unlocked ? 0.5 + Math.sin(time * 2 + a) * 0.15 : 0.2;
    ctx.strokeStyle = unlocked ? `rgba(168,85,247,${al})` : 'rgba(80,50,120,0.2)';
    ctx.lineWidth = unlocked ? 3 : 2;
    ctx.setLineDash(unlocked ? [] : [6, 6]);
    ctx.stroke();
    if (unlocked) {
      ctx.shadowColor = 'rgba(168,85,247,0.3)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.setLineDash([]);
    if (unlocked) {
      for (let t = 0.25; t < 1; t += 0.25) {
        const px = ra.x + (rb.x - ra.x) * t;
        const py = ra.y + (rb.y - ra.y) * t + Math.sin(time * 2 + t * 10) * 3;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,170,255,${0.4 + Math.sin(time * 3 + t * 5) * 0.2})`;
        ctx.fill();
      }
    }
  }

  function drawArcanePaths(map) {
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
      drawArcanePath(ctx, ra, rb, ul, map.time, a, b);
    }
  }

  RegionRegistry.register('dimension_arcane', (map) => {
    drawArcaneBackground(map);
    drawRuneCircles(map);
    drawFloatingCrystals(map);
    drawArcaneParticles(map);
    drawDimensionRifts(map);
    drawArcanePaths(map);
    map.drawRoutes();
  });
})();
