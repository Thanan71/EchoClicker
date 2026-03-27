// ============================================
// DIMENSION ARCANE
// ============================================

(function() {
    function drawArcaneBackground(map) {
        const ctx = map.ctx, w = map.width, h = map.height;
        const g = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w*0.6);
        g.addColorStop(0,'#200a3a'); g.addColorStop(0.5,'#150525'); g.addColorStop(1,'#0a0215');
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
        ctx.strokeStyle='rgba(120,80,200,0.08)'; ctx.lineWidth=0.5;
        for(let x=0;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
        for(let y=0;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    }

    function drawRuneCircles(map) {
        const ctx = map.ctx;
        [{x:.25,y:.35,r:50,s:.5},{x:.7,y:.3,r:40,s:-.7},{x:.5,y:.7,r:60,s:.3}].forEach(c => {
            const cx=c.x*map.width,cy=c.y*map.height,rot=map.time*c.s;
            ctx.beginPath();ctx.arc(cx,cy,c.r,0,Math.PI*2);
            ctx.strokeStyle='rgba(168,85,247,'+(0.2+Math.sin(map.time+c.x*5)*.1)+')';
            ctx.lineWidth=1.5;ctx.stroke();
            ctx.beginPath();ctx.arc(cx,cy,c.r*.6,0,Math.PI*2);
            ctx.strokeStyle='rgba(200,150,255,'+(0.15+Math.sin(map.time*1.5+c.y*5)*.08)+')';
            ctx.lineWidth=1;ctx.stroke();
            for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+rot;
            const rx=cx+Math.cos(a)*c.r*.8,ry=cy+Math.sin(a)*c.r*.8;
            ctx.save();ctx.translate(rx,ry);ctx.rotate(a+Math.PI/2);
            ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(3,3);ctx.lineTo(-3,3);ctx.closePath();
            ctx.fillStyle='rgba(200,150,255,'+(0.4+Math.sin(map.time*2+i)*.2)+')';
            ctx.fill();ctx.restore();}
            const gw=ctx.createRadialGradient(cx,cy,0,cx,cy,c.r*.4);
            gw.addColorStop(0,'rgba(168,85,247,0.1)');gw.addColorStop(1,'transparent');
            ctx.fillStyle=gw;ctx.fillRect(cx-c.r,cy-c.r,c.r*2,c.r*2);
        });
    }

    function drawFloatingCrystals(map) {
        const ctx = map.ctx;
        [{x:.15,y:.2,s:12,r:0},{x:.85,y:.25,s:15,r:1},{x:.1,y:.75,s:10,r:2},{x:.9,y:.7,s:14,r:3},{x:.5,y:.15,s:11,r:4}].forEach(c => {
            const cx=c.x*map.width+Math.sin(map.time*.5+c.r)*10;
            const cy=c.y*map.height+Math.cos(map.time*.4+c.r)*8;
            const p=.6+Math.sin(map.time*2+c.r*1.5)*.4;
            ctx.save();ctx.translate(cx,cy);ctx.rotate(map.time*.3+c.r);
            ctx.beginPath();ctx.moveTo(0,-c.s);ctx.lineTo(c.s*.5,0);ctx.lineTo(0,c.s*.6);ctx.lineTo(-c.s*.5,0);ctx.closePath();
            const cg=ctx.createLinearGradient(-c.s,-c.s,c.s,c.s);
            cg.addColorStop(0,'rgba(180,130,255,'+(.5*p)+')');cg.addColorStop(1,'rgba(120,80,200,'+(.3*p)+')');
            ctx.fillStyle=cg;ctx.fill();
            ctx.strokeStyle='rgba(200,170,255,'+(.6*p)+')';ctx.lineWidth=1;ctx.stroke();ctx.restore();
            const gw=ctx.createRadialGradient(cx,cy,0,cx,cy,c.s*2);
            gw.addColorStop(0,'rgba(168,85,247,'+(.15*p)+')');gw.addColorStop(1,'transparent');
            ctx.fillStyle=gw;ctx.fillRect(cx-c.s*2,cy-c.s*2,c.s*4,c.s*4);
        });
    }

    function drawArcaneParticles(map) {
        const ctx = map.ctx;
        for(let i=0;i<35;i++){
            const a=(map.time*.3+i*.5)%(Math.PI*2);
            const r=50+(i%5)*40+Math.sin(map.time+i)*20;
            const x=map.width/2+Math.cos(a+i*.8)*r;
            const y=map.height/2+Math.sin(a+i*.8)*r*.7;
            const al=.3+Math.sin(map.time*2+i*.7)*.2,sz=1.5+(i%3);
            ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);
            ctx.fillStyle='rgba(200,150,255,'+al+')';ctx.fill();
            const tx=x-Math.cos(a+i*.8)*8,ty=y-Math.sin(a+i*.8)*8;
            ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);
            ctx.strokeStyle='rgba(200,150,255,'+(al*.3)+')';ctx.lineWidth=1;ctx.stroke();
        }
    }

    function drawDimensionRifts(map) {
        const ctx = map.ctx;
        [{x:.3,y:.5,a:.3},{x:.7,y:.45,a:-.2}].forEach(r => {
            const rx=r.x*map.width,ry=r.y*map.height;
            const p=.5+Math.sin(map.time*1.5+r.a*10)*.3;
            ctx.save();ctx.translate(rx,ry);ctx.rotate(r.a+Math.sin(map.time*.5)*.1);
            ctx.beginPath();ctx.moveTo(-30,-5+Math.sin(map.time*2)*3);
            ctx.quadraticCurveTo(0,-15+Math.cos(map.time*3)*5,30,-3+Math.sin(map.time*2.5)*4);
            ctx.quadraticCurveTo(5,5,-25,3+Math.cos(map.time*2)*3);ctx.closePath();
            const rg=ctx.createLinearGradient(-30,0,30,0);
            rg.addColorStop(0,'rgba(255,200,100,'+(.3*p)+')');
            rg.addColorStop(.5,'rgba(200,100,255,'+(.4*p)+')');
            rg.addColorStop(1,'rgba(100,200,255,'+(.3*p)+')');
            ctx.fillStyle=rg;ctx.fill();ctx.restore();
            const gw=ctx.createRadialGradient(rx,ry,0,rx,ry,40);
            gw.addColorStop(0,'rgba(200,150,255,'+(.1*p)+')');gw.addColorStop(1,'transparent');
            ctx.fillStyle=gw;ctx.fillRect(rx-50,ry-50,100,100);
        });
    }

    function drawArcanePaths(map) {
        const ctx = map.ctx, routes = map.getRoutePositions();
        [[0,1],[1,2],[0,3],[3,4],[2,3],[1,4]].forEach(([a,b]) => {
            if(!routes[a]||!routes[b]) return;
            const ra=routes[a],rb=routes[b],ul=ra.route.unlocked&&rb.route.unlocked;
            ctx.beginPath();ctx.moveTo(ra.x,ra.y);
            const mx=(ra.x+rb.x)/2+Math.sin(map.time+a*1.5)*15;
            const my=(ra.y+rb.y)/2+Math.cos(map.time*1.2+b)*10;
            ctx.quadraticCurveTo(mx,my,rb.x,rb.y);
            const al=ul?(.5+Math.sin(map.time*2+a)*.15):.2;
            ctx.strokeStyle=ul?'rgba(168,85,247,'+al+')':'rgba(80,50,120,0.2)';
            ctx.lineWidth=ul?3:2;ctx.setLineDash(ul?[]:[6,6]);ctx.stroke();
            if(ul){ctx.shadowColor='rgba(168,85,247,0.3)';ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;}
            ctx.setLineDash([]);
            if(ul) for(let t=.25;t<1;t+=.25){
                const px=ra.x+(rb.x-ra.x)*t,py=ra.y+(rb.y-ra.y)*t+Math.sin(map.time*2+t*10)*3;
                ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);
                ctx.fillStyle='rgba(200,170,255,'+(.4+Math.sin(map.time*3+t*5)*.2)+')';ctx.fill();
            }
        });
    }

    RegionRegistry.register('dimension_arcane', function(map) {
        drawArcaneBackground(map);
        drawRuneCircles(map);
        drawFloatingCrystals(map);
        drawArcaneParticles(map);
        drawDimensionRifts(map);
        drawArcanePaths(map);
        map.drawRoutes();
    });
})();
