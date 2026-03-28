// ============================================
// VOLCAN INFERNAL
// ============================================

import { RegionRegistry } from './RegionRegistry.js';

(() => {
  function drawVolcanBackground(map) {
    const ctx = map.ctx;
    const w = map.width;
    const h = map.height;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a0500');
    g.addColorStop(0.3, '#2a0a00');
    g.addColorStop(0.7, '#3a1000');
    g.addColorStop(1, '#200800');
    ctx.fillStyle = g;
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
    const vg = ctx.createLinearGradient(0, h * 0.08, 0, h);
    vg.addColorStop(0, '#4a1a05');
    vg.addColorStop(0.3, '#3a1205');
    vg.addColorStop(1, '#1a0800');
    ctx.fillStyle = vg;
    ctx.fill();
    const cx = w * 0.5;
    const cy = h * 0.08;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    cg.addColorStop(0, 'rgba(255,100,0,0.6)');
    cg.addColorStop(0.5, 'rgba(255,50,0,0.2)');
    cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg;
    ctx.fillRect(cx - 80, cy - 80, 160, 160);
  }

  function drawLavaRivers(map) {
    const ctx = map.ctx;
    const w = map.width;
    const h = map.height;
    const t = map.time;
    const pts = [
      { x: w * 0.5, y: h * 0.15 },
      { x: w * 0.45, y: h * 0.3 },
      { x: w * 0.35, y: h * 0.5 },
      { x: w * 0.3, y: h * 0.7 },
      { x: w * 0.25, y: h * 0.9 },
    ];
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const flow = Math.sin(t * 2 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(p1.x - 8 + flow, p1.y);
      ctx.quadraticCurveTo((p1.x + p2.x) / 2 + flow, (p1.y + p2.y) / 2, p2.x - 6 + flow, p2.y);
      ctx.lineTo(p2.x + 6 + flow, p2.y);
      ctx.quadraticCurveTo((p1.x + p2.x) / 2 + flow + 4, (p1.y + p2.y) / 2, p1.x + 8 + flow, p1.y);
      ctx.closePath();
      const lg = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      lg.addColorStop(0, `rgba(255,${150 + Math.sin(t + i) * 50},0,0.9)`);
      lg.addColorStop(0.5, `rgba(255,${100 + Math.sin(t * 2 + i) * 30},0,0.8)`);
      lg.addColorStop(1, `rgba(200,${50 + Math.sin(t + i) * 20},0,0.7)`);
      ctx.fillStyle = lg;
      ctx.fill();
      ctx.shadowColor = 'rgba(255,80,0,0.5)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawVolcanRocks(map) {
    const ctx = map.ctx;
    [
      { x: 0.1, y: 0.55, s: 18 },
      { x: 0.85, y: 0.6, s: 22 },
      { x: 0.15, y: 0.8, s: 15 },
      { x: 0.8, y: 0.75, s: 20 },
      { x: 0.6, y: 0.85, s: 16 },
      { x: 0.4, y: 0.7, s: 14 },
    ].forEach((r) => {
      const rx = r.x * map.width;
      const ry = r.y * map.height;
      ctx.beginPath();
      ctx.moveTo(rx - r.s, ry + r.s * 0.3);
      ctx.lineTo(rx - r.s * 0.5, ry - r.s * 0.6);
      ctx.lineTo(rx + r.s * 0.3, ry - r.s * 0.8);
      ctx.lineTo(rx + r.s, ry - r.s * 0.2);
      ctx.lineTo(rx + r.s * 0.7, ry + r.s * 0.4);
      ctx.closePath();
      const rg = ctx.createRadialGradient(rx, ry - r.s * 0.3, 0, rx, ry, r.s);
      rg.addColorStop(0, '#3a2015');
      rg.addColorStop(1, '#1a0a05');
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,80,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function drawEmbers(map) {
    const ctx = map.ctx;
    for (let i = 0; i < 30; i++) {
      const bx = (i * 29) % map.width;
      const x = bx + Math.sin(map.time * 1.5 + i * 0.7) * 20;
      const y = map.height - ((map.time * 25 + i * 41) % (map.height + 40));
      const size = 1.5 + (i % 3);
      const alpha = 0.4 + Math.sin(map.time * 3 + i) * 0.3;
      const pulse = 0.7 + Math.sin(map.time * 4 + i * 2) * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${100 + i * 5},0,${alpha})`;
      ctx.fill();
      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      g.addColorStop(0, `rgba(255,80,0,${0.2 * pulse})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
    }
  }

  function drawVolcanSmoke(map) {
    const ctx = map.ctx;
    const cx = map.width * 0.5;
    const cy = map.height * 0.08;
    for (let i = 0; i < 5; i++) {
      const o = Math.sin(map.time * 0.5 + i * 1.2) * 20;
      const ry = cy - 20 - i * 30 + Math.sin(map.time + i) * 5;
      const s = 15 + i * 8;
      const a = 0.15 - i * 0.02;
      ctx.beginPath();
      ctx.arc(cx + o, ry, s, 0, Math.PI * 2);
      const sg = ctx.createRadialGradient(cx + o, ry, 0, cx + o, ry, s);
      sg.addColorStop(0, `rgba(80,60,50,${a})`);
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.fill();
    }
  }

  function drawVolcanPaths(map) {
    const ctx = map.ctx;
    const routes = map.getRoutePositions();
    [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [2, 3],
      [1, 4],
    ].forEach(([a, b]) => {
      if (!routes[a] || !routes[b]) {
        return;
      }
      const ra = routes[a];
      const rb = routes[b];
      const ul = ra.route.unlocked && rb.route.unlocked;
      ctx.beginPath();
      ctx.moveTo(ra.x, ra.y);
      const mx = (ra.x + rb.x) / 2 + Math.sin(map.time + a) * 8;
      const my = (ra.y + rb.y) / 2;
      ctx.quadraticCurveTo(mx, my, rb.x, rb.y);
      ctx.strokeStyle = ul ? 'rgba(255,100,0,0.5)' : 'rgba(100,50,30,0.3)';
      ctx.lineWidth = ul ? 4 : 2;
      ctx.setLineDash(ul ? [] : [6, 6]);
      ctx.stroke();
      if (ul) {
        ctx.shadowColor = 'rgba(255,60,0,0.4)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.setLineDash([]);
    });
  }

  RegionRegistry.register('volcan', (map) => {
    drawVolcanBackground(map);
    drawLavaRivers(map);
    drawVolcanRocks(map);
    drawEmbers(map);
    drawVolcanSmoke(map);
    drawVolcanPaths(map);
    map.drawRoutes();
  });
})();
