import {palettes,type Light,type Palette} from './Palette'
import type {Scenery} from './routeData'
import type {MomentAction} from './PlaceMoment'
import {W,H,TAU,clamp,lerp,mix,rgba,fbm,rng,surface,ctxOf,Lru,disc,glow,softEllipse,line,polygon,vgrad,sparkle,drawCloud,cloudTexture,grainPattern,drawPlanet,ridgeLayer,type Ctx,type PlanetOpts} from './PaintKit'

export type Weather = 'clear'|'rain'|'snow'|'meteor'|'aurora'
function random(seed:number){let n=seed>>>0;return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296}}
const rnd=random(44073)
const stars=Array.from({length:210},(_,i)=>({x:rnd()*W,y:rnd()*395,r: i%19===0?2.1:i%7===0?1.15:.35+rnd()*.65,a:.28+rnd()*.6,twinkle:i%5===0,phase:rnd()*TAU,cross:i%29===0}))
const closeDust=Array.from({length:52},(_,i)=>({x:rnd()*W,y:160+rnd()*330,r:.5+rnd()*1.6,phase:rnd()*TAU,i}))
const snow=Array.from({length:85},(_,i)=>({x:rnd()*W,y:rnd()*H,r: .9+rnd()*2.1,v:10+rnd()*25,phase:rnd()*TAU,i}))
const rain=Array.from({length:89},(_,i)=>({x:rnd()*W,y:rnd()*H,shift:rnd()*H,len:10+rnd()*22,v:90+rnd()*70,i}))
function circle(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,opacity=1){c.save();c.globalAlpha=opacity;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string,opacity=1,rotation=0){c.save();c.globalAlpha=opacity;c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fill();c.restore()}
function poly(c:CanvasRenderingContext2D,points:number[][],fill:string,opacity=1){c.save();c.globalAlpha=opacity;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.restore()}
function stroke(c:CanvasRenderingContext2D,pts:number[][],color:string|CanvasGradient,width=1,opacity=1){c.save();c.globalAlpha=opacity;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore()}
function gradient(c:CanvasRenderingContext2D,colors:string[],start=0,end=H){const g=c.createLinearGradient(0,start,50,end);colors.forEach((x,i)=>g.addColorStop(i/(colors.length-1),x));return g}
function halo(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,a=.6){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.2,color);g.addColorStop(1,'transparent');c.save();c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
function wave(c:CanvasRenderingContext2D,y:number,amplitude:number,period:number,phase:number,fill:string,opacity=1){c.save();c.globalAlpha=opacity;c.fillStyle=fill;c.beginPath();c.moveTo(0,y);for(let x=0;x<=W+12;x+=12)c.lineTo(x,y+Math.sin(x/period+phase)*amplitude+Math.sin(x/(period*.43)+phase*.75)*amplitude*.25);c.lineTo(W,H+5);c.lineTo(0,H+5);c.closePath();c.fill();c.restore()}
function ribbon(c:CanvasRenderingContext2D,y:number,amount:number,phase:number,color:string|CanvasGradient,width:number,a:number){c.save();c.globalAlpha=a;c.strokeStyle=color;c.lineCap='round';c.lineWidth=width;c.beginPath();for(let x=-50;x<=W+50;x+=15){const yy=y+Math.sin(x/155+phase)*amount+Math.sin(x/76+phase*.6)*amount*.25;if(x===-50)c.moveTo(x,yy);else c.lineTo(x,yy)}c.stroke();c.restore()}
/* ───────────────────────── v2.7 풍경 붓질 ─────────────────────────
 * 정적인 하늘·행성·지형은 (풍경, 빛) 조합마다 오프스크린 캔버스에 한 번만 그리고,
 * 매 프레임에는 구름 흐름·별 깜빡임·물결·불빛 같은 움직임만 덧그립니다. */
type Twinkle={x:number;y:number;r:number;a:number;phase:number;cross:boolean}
type Layers={bg:HTMLCanvasElement;ground:HTMLCanvasElement;cloudA:HTMLCanvasElement;cloudB:HTMLCanvasElement;twink:Twinkle[]}
const layerCache=new Lru<Layers>(8)
const seedOf:Record<Scenery,number>={nebula:101,ringsea:202,snowfield:303,auroraforest:404,canyon:505,city:606,dunes:707,garden:808,ruins:909,volcano:1010}
const ridgeFn=(seed:number,base:number,amp:number,scale:number,oct=4,slope=0)=>(x:number)=>base+slope*(x-480)+(fbm(x/scale+seed*3.1,seed*1.7,oct,seed)-.5)*2*amp
const moonOpts=(p:Palette,extra:Partial<PlanetOpts>={}):PlanetOpts=>({base:p.moon,lit:mix(p.moon,'#ffffff',.55),shade:mix(p.moon,p.sky[1],.72),atmos:mix(p.moon,'#ffffff',.25),alpha:clamp(.52+p.moonOpacity*.5),...extra})

function paintBodies(c:Ctx,kind:Scenery,p:Palette){
  const ring=(tilt:number,inner:number,outer:number)=>({color:'#f1e3f7',tilt,inner,outer,alpha:.5})
  if(kind==='nebula')drawPlanet(c,782,140,50,moonOpts(p,{ring:ring(-.30,1.55,2.15),bands:[{c:'#ffffff',a:.15},{c:p.cloudB,a:.26},{c:'#ffe6f4',a:.14}],seed:5}))
  else if(kind==='ringsea')drawPlanet(c,717,160,74,moonOpts(p,{ring:ring(-.30,1.5,2.13),bands:[{c:'#ffffff',a:.17},{c:p.cloudA,a:.3},{c:p.deep,a:.2}],seed:2}))
  else if(kind==='canyon'){glow(c,773,141,120,'#ffe7b2',.3);drawPlanet(c,773,142,49,moonOpts(p,{craters:true,bands:[{c:'#ffd9a8',a:.16}],seed:8}))}
  else if(kind==='snowfield'){drawPlanet(c,744,135,53,moonOpts(p,{craters:true,seed:3}));drawPlanet(c,838,178,16,moonOpts(p,{craters:true,alpha:.7,seed:6}))}
  else if(kind==='dunes'){glow(c,700,140,150,'#fff0d0',.22);drawPlanet(c,700,140,58,moonOpts(p,{craters:true,bands:[{c:'#ffe9c8',a:.14}],seed:21}));drawPlanet(c,808,104,20,moonOpts(p,{craters:true,alpha:.8,seed:22}))}
  else if(kind==='garden'){drawPlanet(c,772,128,48,moonOpts(p,{atmos:'#ffd6ec',bands:[{c:'#ffd6ec',a:.2},{c:p.cloudA,a:.24},{c:'#ffffff',a:.12}],seed:31}));drawPlanet(c,690,190,14,moonOpts(p,{alpha:.72,seed:32}))}
  else if(kind==='ruins'){glow(c,742,126,140,'#fff0c8',.2);drawPlanet(c,742,126,50,moonOpts(p,{craters:true,ring:{color:'#f1e6c4',tilt:.45,inner:1.45,outer:1.75,alpha:.4},seed:41}))}
  else if(kind==='volcano'){glow(c,780,150,170,'#ff9a8a',.22);drawPlanet(c,780,150,60,moonOpts(p,{atmos:'#ff9a8a',bands:[{c:'#ffb88a',a:.2},{c:p.deep,a:.28}],seed:51}))}
  else drawPlanet(c,751,124,45,moonOpts(p,{craters:true,seed:kind==='city'?11:12}))
}

function buildBg(kind:Scenery,p:Palette,twink:Twinkle[]){
  const cv=surface(W,H),c=ctxOf(cv)
  c.fillStyle=vgrad(c,0,H,[[0,p.sky[0]],[.33,p.sky[1]],[.67,p.sky[2]],[1,p.sky[3]]]);c.fillRect(0,0,W,H)
  softEllipse(c,W*.5,400,640,130,p.horizon,.5)
  if(kind==='canyon')glow(c,754,198,185,'#ffe4b9',.1)
  // 별: 은하띠 쪽에 더 촘촘히
  const r=rng(seedOf[kind]+9),yc=(x:number)=>230-.16*(x-480)
  c.save();c.globalAlpha=p.starOpacity
  for(const s of stars){
    if(s.twinkle){twink.push({x:s.x,y:s.y,r:s.r,a:s.a,phase:s.phase,cross:s.cross});continue}
    disc(c,s.x,s.y,s.r,s.x%7<3?'#fff9ee':'#e5efff',s.a)
    if(s.cross)sparkle(c,s.x,s.y,5,'#fff2db',s.a*.8)
  }
  for(let i=0;i<330;i++){
    const x=r()*W,y=r()*390,d=(y-yc(x))/150
    if(r()>.2+.8*Math.exp(-d*d))continue
    disc(c,x,y,.3+r()*.6,r()>.8?'#ffe4cc':'#dfeaff',.18+r()*.5)
  }
  c.restore()
  paintBodies(c,kind,p)
  return cv
}
function buildClouds(kind:Scenery,p:Palette,which:0|1){
  const forest=kind==='auroraforest',s=seedOf[kind]
  return which===0
    ?cloudTexture({seed:s,a:p.cloudA,b:p.cloudB,dust:mix(p.sky[0],'#000000',.25),cover:.38,soft:.34,alpha:.52,band:{cy:forest?120:200,slope:-.16,width:170,floor:.3}})
    :cloudTexture({seed:s+37,a:p.cloudB,b:p.cloudA,dust:mix(p.sky[0],'#000000',.3),cover:.4,soft:.36,alpha:.4,band:{cy:forest?190:275,slope:-.12,width:150,floor:.3}})
}

/* ───────── 지형 도구 ───────── */
function conifer(c:Ctx,x:number,y:number,h:number,col:string,hi:string,rim:string|null,tiers=4){
  c.fillStyle=mix(col,'#000000',.4);c.fillRect(x-h*.025,y-h*.14,h*.05,h*.16)
  for(let i=0;i<tiers;i++){
    const by=y-h*(.1+i*(.74/tiers)),ty=by-h*(.36+.02*i),hw=h*(.33-i*(.26/tiers)*.78)
    const pts=[[x-hw,by],[x-hw*.5,by-h*.05],[x,ty],[x+hw*.5,by-h*.05],[x+hw,by]]
    polygon(c,pts,col)
    polygon(c,[[x-hw,by],[x-hw*.5,by-h*.05],[x,ty],[x,by]],hi,.42)
    if(rim)line(c,[[x-hw,by],[x-hw*.5,by-h*.05],[x,ty]],rim,1,.55)
  }
}
function mist(c:Ctx,y:number,h:number,color:string,a:number){c.fillStyle=vgrad(c,y-h,y+h,[[0,rgba(color,0)],[.5,rgba(color,a)],[1,rgba(color,0)]]);c.fillRect(0,y-h,W,h*2)}

function crystal(c:Ctx,x:number,base:number,h:number,w:number,col:string,hi:string,lean:number){
  const sh=base-h*.78,x0=x-w/2,x1=x+w/2,xm=x+lean*.15,xs=x+lean*.8,tx=x+lean
  glow(c,x+lean*.5,base-h*.45,w*2.1,hi,.3)
  const lg=c.createLinearGradient(x0,base,xm,sh);lg.addColorStop(0,rgba(col,.78));lg.addColorStop(1,rgba(hi,.92))
  polygon(c,[[x0,base],[xm,base],[xs,sh],[x0+lean*.8,sh]],lg)
  polygon(c,[[xm,base],[x1,base],[x1+lean*.8,sh],[xs,sh]],mix(col,'#1a1d4a',.5),.85)
  polygon(c,[[x0+lean*.8,sh],[tx,base-h],[xs,sh]],mix(hi,'#ffffff',.5),.95)
  polygon(c,[[xs,sh],[tx,base-h],[x1+lean*.8,sh]],mix(hi,col,.4),.9)
  line(c,[[x0,base],[x0+lean*.8,sh],[tx,base-h]],'#ffffff',1,.55)
  line(c,[[xs,sh],[xs-lean*.7,base]],'#ffffff',.8,.2)
}
function mountain(c:Ctx,x:number,y:number,w:number,base:number,lit:string,dark:string,snow:string,snowDark:string,seed:number){
  const r=rng(seed),wob=()=>(r()-.5)*w*.12
  const L=[[x-w,base],[x-w*.62,y+(base-y)*.5+wob()],[x-w*.3,y+(base-y)*.2],[x,y]]
  const R=[[x,y],[x+w*.26,y+(base-y)*.24+wob()],[x+w*.55,y+(base-y)*.55],[x+w,base]]
  polygon(c,[...L,[x+wob()*.4,base*.94+y*.06],[x,base]],lit)
  polygon(c,[...R,[x+w*.1,base]],dark)
  polygon(c,[[x,y],[x+w*.1+wob()*.3,y+(base-y)*.5],[x,base],[x-w*.02,base]],mix(lit,dark,.5),.35)
  // 눈 덮인 봉우리: 아래 경계를 들쭉날쭉하게
  const capH=(base-y)*.36
  const edgeL=[[x-w*.34,y+capH*1.02],[x-w*.22,y+capH*.7],[x-w*.14,y+capH*1.05],[x-w*.05,y+capH*.72],[x,y+capH*1.1]]
  const edgeR=[[x,y+capH*1.1],[x+w*.07,y+capH*.75],[x+w*.15,y+capH*1.1],[x+w*.25,y+capH*.8],[x+w*.36,y+capH*1.0]]
  polygon(c,[[x,y],...edgeL.slice().reverse().slice(0),],snow)
  polygon(c,[[x,y],...edgeR],snowDark)
}

/* ───────── 풍경별 지형 ───────── */
function groundNebula(c:Ctx,p:Palette){
  ridgeLayer(c,ridgeFn(1,349,14,150),mix(p.horizon,p.sky[3],.3),mix(p.ridge,p.horizon,.4),{rim:'#fff1e6',rimA:.25,haze:p.horizon,hazeA:.45})
  ridgeLayer(c,ridgeFn(2,386,15,120),mix(p.ridge,p.horizon,.35),p.deep,{rim:'#fff1e6',rimA:.3,haze:p.horizon,hazeA:.28})
  const base=406,cs=surface(W,H),s=ctxOf(cs),r=rng(77),tint=mix(p.cloudA,'#ffffff',.35),tint2=mix(p.cloudB,'#ffffff',.3)
  // 수정 군락: 호수 가장자리에 서 있고 물에 거꾸로 비친다
  for(let i=0;i<10;i++){
    const x=500+i*52+r()*20,big=i%3===1,h=big?84+r()*18:50+r()*24,w=big?26:19
    crystal(s,x,base,h,w,i%2?tint2:tint,mix(i%2?tint2:tint,'#ffffff',.5),(r()-.5)*16)
  }
  for(let i=0;i<9;i++){const x=470+i*56+r()*30;crystal(s,x,base,16+r()*14,9,tint,'#ffffff',(r()-.5)*7)}
  c.fillStyle=vgrad(c,base-2,H,[[0,mix(p.horizon,p.sky[3],.35)],[.2,mix(p.ridge,p.horizon,.25)],[.6,p.deep],[1,p.foreground]]);c.fillRect(0,base-1,W,H-base+1)
  c.drawImage(cs,0,0)
  c.save();c.beginPath();c.rect(0,base,W,H-base);c.clip();c.globalAlpha=.34;c.translate(0,base*2);c.scale(1,-1);c.drawImage(cs,0,0);c.restore()
  c.fillStyle=vgrad(c,base,base+130,[[0,rgba(p.deep,0)],[1,rgba(p.foreground,.85)]]);c.fillRect(0,base,W,130)
  c.fillStyle=vgrad(c,base-2,base+8,[[0,'rgba(255,240,230,0)'],[.4,'rgba(255,240,230,.45)'],[1,'rgba(255,240,230,0)']]);c.fillRect(0,base-2,W,10)
  for(let i=0;i<40;i++){const x=(i*83)%960,y=416+(i*37)%110;line(c,[[x,y],[x+10+i%4*6,y]],i%2?tint:tint2,1,.12+(i%3)*.05)}
}
function groundRingsea(c:Ctx,p:Palette){
  const hy=362
  // 먼 섬
  ridgeLayer(c,x=>{const d=Math.abs(x-190)/150,e=Math.abs(x-880)/110;return hy+2-Math.max(0,1-d*d)*20-Math.max(0,1-e*e)*13},mix(p.horizon,p.ridge,.5),p.ridge,{rim:'#fff0dc',rimA:.3,from:hy+20})
  c.fillStyle=vgrad(c,hy,H,[[0,mix(p.horizon,p.sky[3],.4)],[.12,mix(p.ridge,p.horizon,.4)],[.45,p.deep],[1,p.foreground]])
  c.fillRect(0,hy+2,W,H-hy)
  c.fillStyle=vgrad(c,hy-2,hy+10,[[0,'rgba(255,245,230,0)'],[.4,'rgba(255,245,230,.55)'],[1,'rgba(255,245,230,0)']]);c.fillRect(0,hy-2,W,12)
  // 섬 반사
  c.save();c.globalAlpha=.25;c.fillStyle=p.ridge;c.fillRect(100,hy+3,180,3);c.fillRect(820,hy+3,100,2);c.restore()
}
function groundSnow(c:Ctx,p:Palette){
  const lit=mix(p.horizon,'#ffffff',.55),dark=mix(p.deep,p.sky[1],.35),snowD=mix(p.ridge,'#ffffff',.3)
  ridgeLayer(c,ridgeFn(4,372,18,110,5),mix(p.ridge,p.horizon,.5),p.deep,{rim:'#ffffff',rimA:.3,haze:p.horizon,hazeA:.5,from:430})
  const peaks:[number,number,number,number][]=[[110,356,150,0],[285,284,150,1],[480,310,140,2],[726,275,170,3],[917,316,120,4]]
  peaks.forEach(([x,y,w,i])=>{
    const far=i%2?0:.18
    mountain(c,x,y,w,432,mix(lit,p.horizon,far),mix(dark,p.horizon,far),'#ffffff',mix('#dbe9f7',p.deep,.15),30+i)
  })
  mist(c,410,36,p.horizon,.42)
  ridgeLayer(c,ridgeFn(5,436,8,140),mix(p.horizon,'#ffffff',.3),mix(p.ridge,p.horizon,.4),{rim:'#ffffff',rimA:.55,haze:'#ffffff',hazeA:.15})
  ridgeLayer(c,ridgeFn(6,468,9,110),mix(p.horizon,'#ffffff',.5),mix(p.ridge,p.foreground,.3),{rim:'#ffffff',rimA:.65})
  c.fillStyle=vgrad(c,486,H,[[0,mix(p.ridge,'#ffffff',.25)],[1,p.foreground]]);c.fillRect(0,490,W,H-489)
  // 눈 위의 바람 자국
  for(let i=0;i<26;i++){const x=(i*89)%960,y=470+(i*25)%62;line(c,[[x,y],[x+22,y-1.4],[x+44,y+.5]],'#ffffff',1.2,.2)}
}
function groundForest(c:Ctx,p:Palette){
  const rim=mix(p.cloudA,'#ffffff',.3)
  ridgeLayer(c,ridgeFn(7,398,20,130),mix(p.horizon,p.sky[2],.4),p.ridge,{rim,rimA:.22,haze:p.horizon,hazeA:.5})
  const r=rng(404)
  // 먼 숲 → 가까운 숲 순서로: 점점 크고 짙어진다
  for(let layer=0;layer<3;layer++){
    const by=[430,448,470][layer],n=[58,40,24][layer],hh=[40,58,86][layer]
    const col=mix(p.ridge,p.foreground,layer*.42),hi=mix(col,p.cloudA,.3+layer*.05)
    for(let i=0;i<n;i++){
      const x=-10+i*(W+20)/n+(r()-.5)*(W/n)*.9,h=hh*(.7+r()*.7)
      conifer(c,x,by+(r()-.5)*10,h,col,hi,layer===2?rim:null,layer?4:3)
    }
    mist(c,by-12,26,p.horizon,.25-layer*.05)
  }
  c.fillStyle=vgrad(c,462,H,[[0,p.foreground],[1,mix(p.foreground,'#000000',.45)]]);c.fillRect(0,478,W,H-477)
}
function groundCanyon(c:Ctx,p:Palette){
  const strata=(pts:number[][],c1:string,c2:string,sun:string,seed:number)=>{
    polygon(c,pts,c1)
    c.save();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip()
    const r=rng(seed),top=Math.min(...pts.map(q=>q[1]))
    for(let y=top;y<H;y+=7+r()*9){c.fillStyle=rgba(r()>.5?c2:mix(sun,'#ffffff',.4),.1+r()*.2);c.fillRect(0,y,W,2+r()*5)}
    // 오른쪽 달빛이 닿는 쪽은 따뜻하게, 왼쪽은 그림자
    const hg=c.createLinearGradient(0,0,W,0);hg.addColorStop(0,rgba(p.deep,.42));hg.addColorStop(.55,rgba(p.deep,.05));hg.addColorStop(1,rgba(sun,.22));c.fillStyle=hg;c.fillRect(0,top,W,H-top)
    c.fillStyle=vgrad(c,top,H,[[0,rgba(sun,.2)],[.3,rgba(sun,0)],[1,rgba(p.deep,.6)]]);c.fillRect(0,top,W,H-top)
    // 햇빛 받는 면
    c.fillStyle=rgba(sun,.18);c.fillRect(0,top,W,5)
    c.restore()
  }
  ridgeLayer(c,ridgeFn(8,376,10,160),mix(p.horizon,p.sky[3],.4),mix(p.horizon,p.ridge,.5),{haze:p.horizon,hazeA:.45})
  strata([[0,418],[99,368],[154,367],[192,296],[304,298],[346,365],[471,391],[543,320],[692,321],[732,381],[840,349],[933,350],[960,380],[960,H],[0,H]],mix(p.horizon,p.ridge,.45),p.ridge,'#ffe3bd',21)
  stroke(c,[[191,297],[301,297]],'#ffdfbf',4,.3);stroke(c,[[543,321],[691,321]],'#ffd7bd',3,.3)
  // 마주 보는 어두운 면
  polygon(c,[[304,298],[346,365],[471,391],[390,392],[310,360]],p.deep,.16)
  mist(c,396,34,p.horizon,.4)
  strata([[0,438],[137,421],[168,392],[310,393],[354,429],[475,424],[550,387],[680,391],[738,429],[857,407],[960,420],[960,H],[0,H]],p.ridge,p.deep,'#ffd7ad',22)
  // 바위 기둥
  const r=rng(9)
  for(let i=0;i<4;i++){const x=60+i*250+r()*70,h=26+r()*34;polygon(c,[[x-9,436],[x-6,436-h],[x+5,436-h-3],[x+10,436]],mix(p.ridge,p.deep,.4));polygon(c,[[x+1,436-h-1],[x+5,436-h-3],[x+10,436],[x+2,436]],p.deep,.5)}
  ridgeLayer(c,ridgeFn(10,470,10,100),mix(p.ridge,p.deep,.4),p.foreground,{rim:'#ffdcb3',rimA:.35,haze:p.horizon,hazeA:.18})
  c.fillStyle=vgrad(c,484,H,[[0,p.foreground],[1,mix(p.foreground,'#000000',.4)]]);c.fillRect(0,490,W,H-489)
}
function groundCity(c:Ctx,p:Palette,light:Light){
  const base=392,lit=light==='night'?.8:light==='dusk'?.55:.3
  softEllipse(c,W*.5,base-14,560,70,'#ffd3a0',lit*.3)
  const sk=surface(W,H),s=ctxOf(sk),r=rng(8923)
  ridgeLayer(s,ridgeFn(11,360,16,140),mix(p.horizon,p.sky[3],.3),mix(p.horizon,p.ridge,.5),{haze:p.horizon,hazeA:.4,from:base})
  const row=(y0:number,hMin:number,hVar:number,colA:string,colB:string,a:number,detail:boolean)=>{
    for(let x=-10;x<W;){
      const w=15+r()*(detail?30:20),h=hMin+r()*hVar,y=y0-h
      s.save();s.globalAlpha=a
      const g=s.createLinearGradient(x,y,x+w,y);g.addColorStop(0,colA);g.addColorStop(1,colB);s.fillStyle=g;s.fillRect(x,y,w,h+(base-y0))
      s.fillStyle='rgba(255,255,255,.1)';s.fillRect(x,y,2,h+(base-y0));s.restore()
      const kind=r()
      if(kind<.2)polygon(s,[[x+w*.3,y],[x+w*.5,y-h*.4],[x+w*.7,y]],colB,a)
      else if(kind<.34){s.save();s.globalAlpha=a;s.fillStyle=colA;s.beginPath();s.ellipse(x+w/2,y,w*.5,w*.3,0,Math.PI,TAU);s.fill();s.restore()}
      else if(kind<.46)line(s,[[x+w*.5,y],[x+w*.5,y-14]],'#cfdcee',1.2,a)
      for(let dx=4;dx<w-3;dx+=6)for(let dy=6;dy<h-2+(base-y0);dy+=8)if(r()<lit*(detail?.62:.34)){
        const warm=r()>.35;disc(s,x+dx,y+dy,1.15,warm?'#ffe1a6':'#bfd8f2',a*(.55+r()*.4))
      }
      x+=w+2+r()*5
    }
  }
  row(base-6,26,58,mix(p.ridge,p.horizon,.4),mix(p.deep,p.horizon,.3),.62,false)
  row(base-2,32,92,mix(p.ridge,'#ffffff',.08),mix(p.foreground,p.ridge,.4),.86,true)
  // 두 탑 사이를 잇는 하늘다리
  const bx0=230,bx1=640,by=base-84
  s.save();s.strokeStyle=rgba(p.horizon,.6);s.lineWidth=1.6;s.beginPath();s.moveTo(bx0,by);s.quadraticCurveTo((bx0+bx1)/2,by+22,bx1,by);s.stroke();s.restore()
  for(let i=0;i<=20;i++){const t=i/20,x=bx0+(bx1-bx0)*t,y=by+22*2*t*(1-t);disc(s,x,y,1.3,'#ffe6b0',.8)}
  for(const x of [bx0,bx1]){line(s,[[x,by],[x,by-34]],mix(p.ridge,'#ffffff',.2),2,.9);disc(s,x,by-34,1.8,'#ff9c8a',.5)}
  c.drawImage(sk,0,0)
  // 물에 비친 도시
  c.save();c.beginPath();c.rect(0,base,W,H-base);c.clip();c.globalAlpha=.22;c.translate(0,base*2);c.scale(1,-1);c.drawImage(sk,0,0);c.restore()
  c.fillStyle=vgrad(c,base,base+120,[[0,rgba(p.deep,.35)],[1,rgba(p.foreground,.95)]]);c.fillRect(0,base,W,H-base)
  ridgeLayer(c,ridgeFn(12,438,5,120),p.foreground,mix(p.foreground,'#000000',.3),{rim:'#ffe6b8',rimA:.3})
  for(let i=0;i<30;i++){const x=(i*67)%960,y=452+(i*33)%79;line(c,[[x,y],[x+9+i%3*7,y]],i%3===0?'#fce3bf':'#a6c5db',1,.22)}
}

/* ───────────────────────── v2.8 새 행성 4곳 ─────────────────────────
 * 은모래 사막 · 꽃별 정원 · 멈춘 시계탑 · 불씨 화산.
 * 정적인 지형은 기존처럼 (풍경, 빛)별로 캐시하고, 움직임만 매 프레임 덧그립니다. */
function flower(c:Ctx,x:number,y:number,h:number,petal:string,heart:string,stem:string,n=5,open=1){
  line(c,[[x,y],[x+h*.1,y-h*.5],[x,y-h]],stem,Math.max(1,h*.07),Math.min(.9,open*3))
  const r=h*.22*open
  for(let i=0;i<n;i++){const a=i/n*TAU-Math.PI/2;ellipse(c,x+Math.cos(a)*r*.8,y-h+Math.sin(a)*r*.8,r*.75,r*.36,petal,.95,a)}
  disc(c,x,y-h,Math.max(.8,r*.4),heart,.95*Math.min(1,open*3))
}
function rune(c:Ctx,x:number,y:number,s:number,col:string,a:number){
  stroke(c,[[x,y-s],[x,y+s]],col,1.4,a);stroke(c,[[x-s*.7,y-s*.2],[x,y+s*.3],[x+s*.7,y-s*.2]],col,1.4,a)
  c.save();c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=1.2;c.beginPath();c.arc(x,y-s*1.25,s*.28,0,TAU);c.stroke();c.restore()
}
const RUNES:[number,number][]=[[540,448],[600,464],[682,456],[742,478],[802,458],[862,486],[916,466]]
// 용암은 화산 사면을 따라 부채꼴로 흘러내린다
const lavaPath=(f:number,ph:number)=>Array.from({length:21},(_,i)=>{const t=i/20,off=15*(1-t)+330*Math.pow(t,1.45);return [560+f*off+Math.sin(t*6+ph)*4*t,262+t*176]})
const LAVA:number[][][]=[lavaPath(-.46,0),lavaPath(.1,2),lavaPath(.52,4.1)]

function groundDunes(c:Ctx,p:Palette){
  ridgeLayer(c,ridgeFn(21,372,12,170,3),mix(p.horizon,p.sky[3],.35),mix(p.ridge,p.horizon,.5),{haze:p.horizon,hazeA:.5,rim:'#fff1dc',rimA:.3})
  const lit=mix(p.horizon,'#ffffff',.18)
  // 사구 세 겹: 달빛을 받는 오른쪽 사면은 밝고, 왼쪽 사면은 그늘
  const dune=(seed:number,base:number,amp:number,top:string,bottom:string,from:number)=>{
    const y=(x:number)=>base+Math.sin(x/(150+seed*6)+seed)*amp+Math.sin(x/(61+seed)+seed*2.3)*amp*.28
    ridgeLayer(c,y,top,bottom,{rim:'#fff3df',rimA:.5,from})
    // 달빛을 받는 오른쪽 사면은 밝고, 왼쪽을 보는 사면은 기울기만큼 그늘진다
    for(let x=-6;x<W+6;x+=4){
      const sl=y(x+4)-y(x);if(sl>=-.12)continue
      const yy=y(x),a=Math.min(.55,-sl*.75),g=c.createLinearGradient(0,yy,0,yy+54)
      g.addColorStop(0,rgba(p.deep,a));g.addColorStop(1,rgba(p.deep,0));c.fillStyle=g;c.fillRect(x,yy,4.5,54)
    }
  }
  dune(3,398,16,mix(lit,p.ridge,.3),p.ridge,470)
  // 모래 유리 수정 군락
  const r=rng(2121)
  for(let i=0;i<5;i++){const x=118+i*38+r()*14;crystal(c,x,406,34+r()*40,14,mix(p.cloudB,'#ffffff',.25),mix(p.cloudA,'#ffffff',.5),(r()-.5)*10)}
  dune(5,440,20,mix(lit,p.ridge,.15),mix(p.ridge,p.foreground,.5),520)
  // 이정표와 등불
  const lx=720,ly=480,pole=mix(p.foreground,'#000000',.2)
  line(c,[[lx,ly],[lx,ly-44]],pole,3,1);line(c,[[lx,ly-40],[lx+14,ly-40]],pole,2,1);disc(c,lx+14,ly-34,4,'#ffe1a6',.95)
  dune(7,496,14,mix(p.ridge,p.foreground,.4),p.foreground,H)
  for(let i=0;i<36;i++){const x0=(i*97)%960,y0=502+(i*23)%34;line(c,[[x0,y0],[x0+26,y0-2],[x0+52,y0]],'#ffffff',1,.07+(i%3)*.03)}
}
function animateDunes(c:Ctx,_p:Palette,time:number){
  // 바람에 쓸려 가는 모래 결
  for(let i=0;i<46;i++){const k=(time*.05+i*.0217)%1,x=-40+k*1040,y=410+(i*37)%120+Math.sin(time*.6+i)*3;line(c,[[x,y],[x+22+i%4*8,y-1.5]],'#fff0d8',1.1,.1+.14*Math.sin(k*Math.PI))}
  // 모래 위 반짝임
  for(let i=0;i<40;i++){const t=Math.sin(time*1.3+i*2.1);if(t>.5){const x=(i*71+13)%960,y=414+(i*29)%108;sparkle(c,x,y,2+t*2.2,'#fffbe8',(t-.4)*.9)}}
  // 이정표 등불
  glow(c,734,446,20,'#ffd98a',.34+.12*Math.sin(time*2.2));disc(c,734,446,3.6,'#fff1c4',.95)
}

function groundGarden(c:Ctx,p:Palette){
  const petals=[mix(p.cloudB,'#ffffff',.3),mix(p.cloudA,'#ffffff',.4),'#fff1d4',mix(p.cloudB,'#ffd6e6',.5)]
  ridgeLayer(c,ridgeFn(31,372,16,150),mix(p.horizon,p.sky[3],.3),mix(p.ridge,p.horizon,.45),{haze:p.horizon,hazeA:.45,rim:'#fff6ea',rimA:.3})
  ridgeLayer(c,ridgeFn(32,404,12,120),mix(p.ridge,p.horizon,.3),mix(p.ridge,p.deep,.3),{haze:p.horizon,hazeA:.28,rim:'#fff6ea',rimA:.32})
  // 큰 꽃나무
  const tx=214,r=rng(3131)
  glow(c,tx,336,160,petals[0],.22)
  polygon(c,[[tx-12,424],[tx-5,372],[tx-16,338],[tx+4,338],[tx+6,372],[tx+16,424]],mix(p.foreground,'#000000',.2))
  for(let i=0;i<54;i++){const a=r()*TAU,d=Math.sqrt(r())*78;disc(c,tx+Math.cos(a)*d*1.35,330+Math.sin(a)*d*.62,13+r()*15,mix(petals[3],p.ridge,r()*.25),.9)}
  for(let i=0;i<40;i++){const a=r()*TAU,d=Math.sqrt(r())*78;disc(c,tx+Math.cos(a)*d*1.35-6,322+Math.sin(a)*d*.62,3+r()*6,'#fff7f0',.5)}
  // 언덕과 개울
  ridgeLayer(c,ridgeFn(33,436,8,130),mix(p.ridge,p.foreground,.15),mix(p.foreground,p.ridge,.3),{rim:'#fff6ea',rimA:.3,from:520})
  const sx=(t:number)=>660+Math.sin(t*3.1)*60+t*40,sy=(t:number)=>436+t*108,sw=(t:number)=>4+t*46
  const Lp:number[][]=[],Rp:number[][]=[]
  for(let i=0;i<=24;i++){const t=i/24;Lp.push([sx(t)-sw(t),sy(t)]);Rp.push([sx(t)+sw(t),sy(t)])}
  polygon(c,[...Lp,...Rp.reverse()],mix(p.horizon,'#ffffff',.25),.6)
  for(let i=0;i<14;i++){const t=.1+i/16;line(c,[[sx(t)-10-t*20,sy(t)],[sx(t)+10+t*20,sy(t)-1]],'#ffffff',1.1,.3)}
  // 꽃밭 세 줄
  const rows:[number,number,number][]=[[444,70,13],[464,46,22],[496,28,38]]
  rows.forEach(([by,n,h],row)=>{
    const t=Math.max(0,Math.min(1,(by-436)/108))
    for(let i=0;i<n;i++){
      const x=-10+i*(W+20)/n+(r()-.5)*(W/n)*.9
      if(Math.abs(x-sx(t))<sw(t)+8)continue
      flower(c,x,by+(r()-.5)*8,h*(.7+r()*.6),petals[(i+row)%4],'#ffe7a8',mix(p.foreground,p.ridge,.35),row===0||i%2?5:6)
    }
  })
  c.fillStyle=vgrad(c,510,H,[[0,rgba(p.foreground,0)],[1,rgba(p.foreground,.9)]]);c.fillRect(0,510,W,H-510)
}
function animateGarden(c:Ctx,_p:Palette,time:number){
  // 바람에 날리는 꽃잎
  for(let i=0;i<30;i++){
    const k=(time*.04+i*.0333)%1,x=-20+k*1000+Math.sin(time*.7+i)*30,y=250+k*250+Math.sin(time*.5+i*1.7)*26
    ellipse(c,x,y,3.2,1.5,i%2?'#ffd2e6':'#fff3d8',.55*Math.sin(k*Math.PI),time*.8+i)
  }
  // 반딧불이
  for(let i=0;i<22;i++){const x=(i*83+30)%960,y=450+(i*41)%75,a=.5+.5*Math.sin(time*1.2+i*1.9);glow(c,x,y,10,'#fff0b0',.22*a);disc(c,x,y,1.3,'#fffbd8',.4+a*.5)}
  // 꽃나무의 반짝임
  for(let i=0;i<9;i++)sparkle(c,150+(i*29)%130,300+(i*17)%60,3+(i%3),'#fff8f2',.3+.5*Math.sin(time*1.4+i*1.3)**2)
}

function groundRuins(c:Ctx,p:Palette){
  const stone=mix(p.ridge,p.horizon,.3),stoneD=mix(p.deep,p.foreground,.35),lit=mix(p.horizon,'#ffffff',.25)
  ridgeLayer(c,ridgeFn(41,376,14,160),mix(p.horizon,p.sky[3],.3),mix(p.ridge,p.horizon,.5),{haze:p.horizon,hazeA:.5,rim:'#fff1dc',rimA:.25})
  const arch=(x:number,base:number,w:number,h:number,col:string,a:number,broken=false)=>{
    c.save();c.globalAlpha=a;c.fillStyle=col
    c.fillRect(x-w/2,base-h,w*.17,h);c.fillRect(x+w/2-w*.17,base-h+(broken?h*.45:0),w*.17,broken?h*.55:h)
    const end=broken?Math.PI*1.62:TAU
    c.beginPath();c.arc(x,base-h,w/2,Math.PI,end);c.arc(x,base-h,w/2-w*.17,end,Math.PI,true);c.closePath();c.fill();c.restore()
  }
  const far=mix(stone,p.horizon,.4)
  arch(120,402,92,92,far,.7,true);arch(430,400,70,70,far,.75);arch(850,404,100,100,mix(stone,p.horizon,.35),.7,true)
  mist(c,404,28,p.horizon,.4)
  // 시계탑
  const cx=640
  polygon(c,[[cx-32,438],[cx-26,272],[cx+26,272],[cx+32,438]],stone)
  polygon(c,[[cx,272],[cx+26,272],[cx+32,438],[cx,438]],stoneD,.5)
  polygon(c,[[cx-36,274],[cx,212],[cx+36,274]],mix(stone,p.deep,.35))
  polygon(c,[[cx,212],[cx+36,274],[cx,274]],stoneD,.45)
  line(c,[[cx,194],[cx,214]],lit,2,.8);disc(c,cx,192,2.4,'#ffe2a0',.9)
  glow(c,cx,306,52,'#ffe2a0',.18)
  disc(c,cx,306,28,lit,.95);disc(c,cx,306,24,mix(p.foreground,p.deep,.5),.95)
  for(let i=0;i<12;i++){const a=i/12*TAU;line(c,[[cx+Math.cos(a)*19,306+Math.sin(a)*19],[cx+Math.cos(a)*22,306+Math.sin(a)*22]],lit,i%3===0?2:1,.9)}
  for(let i=0;i<5;i++)line(c,[[cx-28+i*2,338+i*18],[cx+28-i*2,338+i*18]],stoneD,1,.3)
  // 돌계단
  for(let i=0;i<6;i++){const y=440-i*6,w=150-i*14;polygon(c,[[cx-w/2,y],[cx+w/2,y],[cx+w/2,y-6],[cx-w/2,y-6]],mix(stone,'#ffffff',.08+i*.02));line(c,[[cx-w/2,y-6],[cx+w/2,y-6]],lit,1,.5)}
  // 부서진 기둥들
  const col=(x:number,h:number,broken:boolean)=>{
    const top=438-h
    polygon(c,[[x-7,438],[x-6,top],[x+6,top],[x+7,438]],stone);polygon(c,[[x,top],[x+6,top],[x+7,438],[x,438]],stoneD,.45)
    if(broken)polygon(c,[[x-7,top],[x-3,top-6],[x+1,top-2],[x+5,top-7],[x+7,top]],stone)
    else{polygon(c,[[x-11,top],[x+11,top],[x+9,top-5],[x-9,top-5]],lit,.9)}
  }
  col(210,70,false);col(262,48,true);col(314,82,false);col(366,38,true);col(500,56,true);col(756,64,false);col(806,40,true)
  // 포석 바닥
  c.fillStyle=vgrad(c,436,H,[[0,mix(stone,p.deep,.3)],[.35,mix(p.deep,p.foreground,.5)],[1,p.foreground]]);c.fillRect(0,438,W,H-437)
  for(let i=-9;i<=9;i++)line(c,[[480+i*26,438],[480+i*104,540]],stoneD,1,.2)
  for(const y of [448,462,481,508])line(c,[[0,y],[W,y]],stoneD,1,.16)
  line(c,[[0,438],[W,438]],lit,1.2,.4)
}
function animateRuins(c:Ctx,p:Palette,time:number){
  const cx=640,cy=306
  // 시계 바늘은 아주 느리게 돈다
  const m=time*.05,h=time*.004
  stroke(c,[[cx,cy],[cx+Math.sin(h)*13,cy-Math.cos(h)*13]],'#ffe9b8',2.4,.95)
  stroke(c,[[cx,cy],[cx+Math.sin(m)*19,cy-Math.cos(m)*19]],'#fff6dc',1.6,.95)
  disc(c,cx,cy,2,'#ffe2a0',1)
  // 떠다니는 돌조각
  const bits:[number,number,number][]=[[330,236,13],[432,196,9],[522,262,11],[772,222,10],[852,276,14]]
  bits.forEach(([x,y,s],i)=>{
    const by=y+Math.sin(time*.45+i*1.7)*6,bx=x+Math.sin(time*.3+i)*4
    poly(c,[[bx-s,by],[bx-s*.3,by-s*.8],[bx+s*.8,by-s*.4],[bx+s,by+s*.5],[bx-s*.2,by+s*.8]],mix(p.ridge,p.horizon,.2),.92)
    poly(c,[[bx-s*.3,by-s*.8],[bx+s*.8,by-s*.4],[bx+s*.3,by-s*.05]],mix(p.horizon,'#ffffff',.3),.5)
  })
  // 바닥 룬은 은은하게 숨 쉰다
  RUNES.forEach(([x,y],i)=>rune(c,x,y,5,'#ffe2a0',.16+.14*Math.sin(time*.9+i*1.3)))
  for(let i=0;i<20;i++){const ph=(time*.04+i*.05)%1;circle(c,(i*91)%960,470-ph*110,1+(i%3)*.4,'#fff0c8',(1-ph)*.3)}
}

function groundVolcano(c:Ctx,p:Palette){
  ridgeLayer(c,ridgeFn(51,384,14,150),mix(p.horizon,p.sky[3],.3),mix(p.ridge,p.horizon,.4),{haze:p.horizon,hazeA:.5,rim:'#ffd9b0',rimA:.25})
  const cone=(px:number,top:number,base:number,half:number,lit:string,dark:string)=>{
    const Lp:number[][]=[],Rp:number[][]=[]
    for(let i=0;i<=20;i++){const t=i/20,off=15*(1-t)+half*Math.pow(t,1.45),y=top+(base-top)*t;Lp.push([px-off,y]);Rp.push([px+off,y])}
    polygon(c,[...Lp,...Rp.slice().reverse()],lit)
    polygon(c,[[px,top],...Rp,[px,base]],dark,.55)
  }
  const lit=mix(p.ridge,p.horizon,.15),dark=mix(p.deep,p.foreground,.5)
  cone(190,336,440,150,mix(p.ridge,p.horizon,.35),p.deep);cone(905,352,440,130,mix(p.ridge,p.horizon,.35),p.deep)
  mist(c,420,30,p.horizon,.3)
  cone(560,262,440,330,lit,dark)
  glow(c,560,262,130,'#ff9a6a',.3);ellipse(c,560,262,20,5,'#ff7a4a',.95);ellipse(c,560,261,12,3,'#ffd098',.9)
  // 용암 줄기
  for(const pts of LAVA)for(let i=0;i<pts.length-1;i++){const t=i/20,seg=[pts[i],pts[i+1]]
    line(c,seg,'#ff6a3a',5+t*13,.13);line(c,seg,'#ff8a52',1.6+t*3.6,.9);line(c,seg,'#ffe0a0',.6+t*1.2,.85)}
  ridgeLayer(c,ridgeFn(52,452,8,120),mix(p.ridge,p.foreground,.4),p.foreground,{rim:'#ff9a6a',rimA:.3})
  c.fillStyle=vgrad(c,470,H,[[0,p.foreground],[1,mix(p.foreground,'#000000',.45)]]);c.fillRect(0,474,W,H-473)
  // 땅 틈에서 새어 나오는 붉은 빛
  const r=rng(5151)
  for(let i=0;i<14;i++){
    let x=(i*71+20)%900,y=486+(i*19)%40;const pts:number[][]=[[x,y]]
    for(let k=0;k<4;k++){x+=10+r()*20;y+=(r()-.5)*10;pts.push([x,y])}
    line(c,pts,'#ff7a4a',3,.18);line(c,pts,'#ff8a52',1.6,.6);line(c,pts,'#ffd098',.6,.6)
  }
}
function animateVolcano(c:Ctx,p:Palette,time:number){
  const pulse=.7+.3*Math.sin(time*1.1)
  glow(c,560,258,110,'#ff8a5a',.22*pulse)
  // 연기 기둥
  for(let i=0;i<7;i++){const ph=(time*.03+i*.143)%1,x=560+ph*70+Math.sin(time*.4+i)*10,y=256-ph*130;softEllipse(c,x,y,22+ph*50,14+ph*26,mix(p.deep,p.horizon,.4),.22*(1-ph))}
  // 올라가는 불씨
  for(let i=0;i<34;i++){
    const ph=(time*.07+i*.0294)%1,x=560+Math.sin(i*2.3+time*.5)*(10+ph*70)+ph*30,y=256-ph*190,a=1-ph
    glow(c,x,y,6,'#ffb070',.35*a);disc(c,x,y,1+(i%3)*.4,'#ffe2b0',.8*a)
  }
  // 용암 줄기 깜빡임
  LAVA.forEach((pts,k)=>stroke(c,pts,'#ffc080',2,.2+.2*Math.sin(time*1.6+k*2)))
  for(let i=0;i<8;i++){const x=(i*113+50)%960,y=490+(i*31)%36,a=.5+.5*Math.sin(time*1.3+i*1.7);glow(c,x,y,16,'#ff7a4a',.14+.14*a)}
}

function buildGround(kind:Scenery,p:Palette,light:Light){
  const cv=surface(W,H),c=ctxOf(cv)
  if(kind==='nebula')groundNebula(c,p)
  else if(kind==='ringsea')groundRingsea(c,p)
  else if(kind==='snowfield')groundSnow(c,p)
  else if(kind==='auroraforest')groundForest(c,p)
  else if(kind==='canyon')groundCanyon(c,p)
  else if(kind==='dunes')groundDunes(c,p)
  else if(kind==='garden')groundGarden(c,p)
  else if(kind==='ruins')groundRuins(c,p)
  else if(kind==='volcano')groundVolcano(c,p)
  else groundCity(c,p,light)
  return cv
}
function buildLayers(kind:Scenery,light:Light):Layers{
  const p=palettes[kind][light],twink:Twinkle[]=[]
  const bg=buildBg(kind,p,twink)
  const g=ctxOf(bg);g.fillStyle=grainPattern(g);g.fillRect(0,0,W,H)
  return {bg,ground:buildGround(kind,p,light),cloudA:buildClouds(kind,p,0),cloudB:buildClouds(kind,p,1),twink}
}

function comet(c:Ctx,t:number){
  const cc=(t+37)%37
  if(cc<3.7){const x=1044-cc*260,y=57+cc*37,a=Math.min(1,cc,.85,3.7-cc)
    const g=c.createLinearGradient(x+120,y-52,x,y);g.addColorStop(0,'rgba(255,243,221,0)');g.addColorStop(1,rgba('#fff3dd',.9*a))
    stroke(c,[[x+120,y-52],[x,y]],g,2.6,1);glow(c,x,y,22,'#fff7e0',.5*a);circle(c,x,y,2.6,'#fff8e2',a)}
}
function rayAurora(c:Ctx,time:number,strong:boolean){
  const cols:[string,string][]=[['#90eecb','#52d0a8'],['#c5a0ed','#8a78e0'],['#9cdee0','#58bfd0']]
  const k0=Math.sin(time*.15)*12
  for(let k=0;k<3;k++){
    const [top,base]=cols[k],ph=.6+k*.7
    const g=c.createLinearGradient(0,-200,0,8);g.addColorStop(0,rgba(top,0));g.addColorStop(.6,rgba(top,.3));g.addColorStop(.92,rgba(base,.85));g.addColorStop(1,rgba(base,0))
    c.save();c.fillStyle=g
    for(let x=-20;x<W+24;x+=5){
      const by=150+k*30+k0+Math.sin(x/160+time*.17+ph)*30+Math.sin(x/65-time*.12+ph)*11
      const ray=.62+.38*Math.sin(x*.085+time*.45+k*2)*Math.sin(x*.031-time*.2+ph)
      const h=(strong?70:48)+Math.max(0,ray)*(strong?170:110)
      c.save();c.translate(x,by);c.scale(1,h/200);c.globalAlpha=(strong?.2:.11)*(.55+.45*Math.max(0,ray))*(1-k*.14);c.fillRect(0,-200,10,208);c.restore()
    }
    c.restore()
  }
}
function paintAurora(c:CanvasRenderingContext2D,_p:Palette,time:number,strong=false){rayAurora(c,time,strong)}

/** v2.9.2: 행성의 자연 지형을 그대로 이어 놓은 관찰 지면.
 * 캐릭터의 접지점(y=461~464)과 16:9 프레이밍을 유지하며,
 * 타일식 공통 무늬 대신 10개 지역마다 재질·균열·식생을 그립니다.
 * 지면의 작은 장식은 캐릭터가 서는 중앙(x=165~340)을 피합니다. */
function drawLookout(c:Ctx,p:Palette,kind:Scenery){
  // 인물이 서 있는 중앙 지면은 동일하게 유지하고 전면의 바위/눈/흙 단면만 지역에 맞춰 달리합니다.
  const natural=kind!=='city'
  const lip:Record<Scenery,number[][]>={
    nebula:[[553,478],[533,483],[512,487],[477,493],[451,503],[433,505],[365,499],[279,492],[193,488],[95,486]],
    ringsea:[[558,475],[542,481],[521,482],[502,490],[467,498],[433,505],[332,499],[245,492],[168,489],[79,483]],
    snowfield:[[557,477],[535,479],[516,485],[491,487],[472,497],[433,505],[353,498],[275,493],[190,487],[92,487]],
    auroraforest:[[558,476],[540,484],[520,486],[494,496],[466,497],[433,505],[357,498],[275,494],[172,488],[79,486]],
    canyon:[[558,475],[543,486],[520,482],[501,495],[475,491],[433,505],[362,499],[281,497],[178,488],[79,486]],
    city:[],
    dunes:[[558,477],[539,477],[515,488],[487,490],[459,500],[433,505],[362,497],[278,493],[197,490],[95,485]],
    garden:[[559,475],[541,481],[522,485],[491,490],[465,496],[433,505],[350,499],[255,492],[164,490],[73,485]],
    ruins:[[558,480],[535,478],[517,491],[489,490],[471,503],[433,505],[365,496],[286,492],[187,486],[91,487]],
    volcano:[[555,478],[536,486],[515,482],[491,496],[471,493],[433,505],[355,500],[275,494],[188,491],[80,486]]
  }
  const top=natural?[[-29,430],[402,420],[566,473],...lip[kind],[-30,481]]:[[-29,430],[402,420],[566,473],[433,505],[-30,481]]
  const side=natural?[[-36,435],[403,424],[575,477],[560,487],[538,496],[515,510],[481,531],[452,541],[-25,541]]:[[-36,435],[403,424],[575,477],[452,541],[-25,541]]
  const materials:Record<Scenery,[string,string,string]>={
    nebula:['#b7a7d0','#575779','#ebd4ff'],
    ringsea:['#93c9d2','#356b83','#d9fff1'],
    snowfield:['#ebf5fc','#6d9ab9','#ffffff'],
    auroraforest:['#547f70','#234b4c','#aae8ba'],
    canyon:['#d8a17b','#795067','#ffe2ac'],
    city:['#b7c7d2','#576f8b','#f9e8de'],
    dunes:['#dfbea5','#8b6686','#fff0cf'],
    garden:['#84b391','#436d68','#f8d9e6'],
    ruins:['#aaa2ab','#55536e','#efdece'],
    volcano:['#4b4053','#251e34','#ff9568']
  }
  const [base,depth,highlight]=materials[kind]
  // 시간대별 팔레트의 주변광을 재질에 입혀 dawn/dusk/night 일관성을 유지합니다.
  const tint=mix(base,p.platformTop,kind==='snowfield'?.20:.33)
  const shadow=mix(depth,p.platformSide,.42)
  const edge=mix(highlight,p.horizon,.28)
  const sideG=c.createLinearGradient(0,430,130,545)
  sideG.addColorStop(0,mix(shadow,tint,.27));sideG.addColorStop(.3,shadow)
  sideG.addColorStop(1,mix(shadow,'#0a1022',.62))
  polygon(c,side,sideG)
  // 측면은 바위층·얼음·뿌리·화산암의 각기 다른 결로 처리합니다.
  c.save();c.beginPath();side.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip()
  const sr=rng(seedOf[kind]+191)
  if(kind==='snowfield'||kind==='ringsea'){
    for(let i=0;i<17;i++){
      const y=468+i*4.4
      stroke(c,[[-35,y+sr()*2],[200,y+sr()*2],[452,y+sr()*3]],edge,1.2,kind==='snowfield'?.21:.12)
    }
  }else if(kind==='canyon'||kind==='dunes'||kind==='ruins'){
    for(let i=0;i<18;i++){
      const y=460+i*5
      stroke(c,[[-30,y+sr()*4],[145,y-1+sr()*4],[455,y+sr()*3]],edge,.9,.11+sr()*.1)
    }
  }else if(kind==='volcano'){
    for(let i=0;i<13;i++){
      const x=-35+sr()*510,y=480+sr()*58
      stroke(c,[[x-25,y+5],[x,y-3],[x+22,y]],i%4===0?'#ff9868':mix(shadow,'#e6a2af',.35),i%4===0?2:.9,i%4===0?.30:.22)
    }
  }else{
    for(let i=0;i<18;i++){
      const x=-40+sr()*530,y=478+sr()*66
      stroke(c,[[x-13,y],[x,y-2],[x+12,y+1]],edge,1,.09+sr()*.13)
    }
  }
  c.restore()
  // 경계가 지나치게 인공적으로 보이지 않도록 세로가 아닌 은은한 경사 그라데이션.
  const tg=c.createLinearGradient(25,420,345,501)
  tg.addColorStop(0,mix(tint,highlight,.20));tg.addColorStop(.53,tint)
  tg.addColorStop(1,mix(tint,shadow,.29))
  polygon(c,top,tg)
  c.save();c.beginPath();top.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip()
  const r=rng(seedOf[kind]+271)
  if(kind==='nebula'){
    // 별먼지가 스민 매끈한 보랏빛 광물층, 바깥 가장자리의 미세한 수정.
    for(let i=0;i<49;i++){
      const x=-20+r()*530,y=422+r()*84
      disc(c,x,y,.4+r()*.8,i%3===0?'#fff3e6':edge,.24+r()*.34)
    }
    for(const [x,y,h] of [[23,449,11],[87,467,8],[413,438,13],[490,473,9]]){
      poly(c,[[x-4,y],[x,y-h],[x+5,y],[x+1,y+2]],mix('#a6b6ee',tint,.4),.6)
      stroke(c,[[x,y-h],[x-1,y]],'#fff0ff',.75,.65)
    }
    stroke(c,[[12,459],[80,453],[119,456]],'#e7d8ff',1.2,.23)
  }else if(kind==='ringsea'){
    // 물에 닳은 둥근 자갈과 젖은 표면의 가느다란 물결.
    for(let i=0;i<45;i++){
      const x=-15+r()*545,y=422+r()*88,rx=1.4+r()*5,ry=1+r()*1.8
      ellipse(c,x,y,rx,ry,i%4===0?'#c8e6dc':mix('#5b93a6',tint,.45),.16+r()*.21,r()*.3)
    }
    for(let i=0;i<7;i++){
      const x=386+i*20,y=454+i*5
      stroke(c,[[x-12,y],[x+4,y-2],[x+19,y]],edge,1.1,.3)
    }
    for(let i=0;i<6;i++){const x=10+i*24,y=466+(i%2)*6;disc(c,x,y,.8,'#e2fff8',.5)}
  }else if(kind==='snowfield'){
    // 눈층이 살짝 쌓인 얼음 단면. 인물이 서 있는 자리 아래는 평탄하게 유지.
    for(let i=0;i<6;i++){
      const y=440+i*10
      stroke(c,[[-30,y+6],[50,y+Math.sin(i)*5],[115,y+3],[389,y-5],[550,y+16]],'#ffffff',2,.17+i*.025)
    }
    for(let i=0;i<21;i++){
      const x=-20+r()*535,y=431+r()*73
      ellipse(c,x,y,4+r()*10,.8+r()*.9,'#ffffff',.10+r()*.24)
    }
    stroke(c,[[363,466],[384,455],[415,454]],'#84b4d8',1.5,.35)
    for(const [x,y] of [[26,446],[65,470],[417,439],[491,471]])sparkle(c,x,y,2.4,'#ffffff',.6)
  }else if(kind==='auroraforest'){
    // 이끼 카펫·잔뿌리·침엽수 낙엽, 작은 생물 발광.
    for(let i=0;i<38;i++){
      const x=-20+r()*535,y=428+r()*84
      ellipse(c,x,y,3+r()*15,1.2+r()*3.4,i%3===0?'#8fba82':'#376b62',.13+r()*.24,r()*.18)
    }
    for(let i=0;i<16;i++){
      const x=-25+r()*535,y=431+r()*79
      stroke(c,[[x-8,y],[x,y+2],[x+6,y-1]],'#a2d0a4',.7,.23)
    }
    for(const [x,y] of [[20,465],[79,450],[411,445],[466,477]]){
      stroke(c,[[x,y+4],[x,y-3],[x+3,y-8]],'#bbd6a2',1,.65)
      disc(c,x+3,y-8,2.1,'#d5f6bf',.48)
    }
  }else if(kind==='canyon'){
    // 풍화된 사암, 비스듬한 퇴적층과 미세하게 갈라진 절벽의 표면.
    for(let i=0;i<16;i++){
      const y=430+i*5
      stroke(c,[[-28,y+10],[80,y+5],[230,y-2],[370,y+5],[558,y+31]],i%3===0?'#ffe6bd':'#835672',.8,i%3===0?.19:.17)
    }
    for(let i=0;i<10;i++){
      const x=380+r()*140,y=433+r()*54
      stroke(c,[[x,y],[x+4,y+4],[x+1,y+7]],'#704b60',1,.27)
    }
    for(let i=0;i<25;i++)disc(c,-20+r()*540,430+r()*74,.7+r()*.7,'#ffdcad',.18)
  }else if(kind==='city'){
    // 유일한 도심 역: 물결에 닳은 석판과 은은한 유리 조각.
    for(let i=0;i<9;i++){
      const x=-10+i*64
      stroke(c,[[x,431],[x-8,461],[x+7,496]],'#485f83',1.1,.20)
    }
    for(let i=0;i<3;i++)stroke(c,[[-30,440+i*14],[235,440+i*11],[540,470+i*10]],edge,1,.14)
    for(let i=0;i<10;i++){
      const x=-15+r()*535,y=432+r()*74
      poly(c,[[x-2,y],[x+2,y-2],[x+4,y+2],[x,y+4]],i%2?'#b9e6ea':'#fff6e8',.18)
    }
  }else if(kind==='dunes'){
    // 바람이 그은 사구 물결. 직선 타일이 아니라 유선형 모래 결.
    for(let i=0;i<12;i++){
      const y=435+i*6
      stroke(c,[[-35,y+Math.sin(i*.6)*2],[74,y-5],[210,y+3],[365,y-6],[550,y+13]],i%3===0?'#ffe1c4':'#7c607b',i%3===0?1.5:1,.15+i%3*.04)
    }
    for(let i=0;i<46;i++){
      const x=-25+r()*545,y=425+r()*85
      disc(c,x,y,.3+r()*.75,i%3===0?'#ffebd0':'#9f7f90',.17+r()*.25)
    }
  }else if(kind==='garden'){
    // 부드러운 잔디 흙길. 작은 꽃은 중앙의 두 인물을 가리지 않는 가장자리 위주.
    for(let i=0;i<36;i++){
      const x=-25+r()*535,y=421+r()*88
      ellipse(c,x,y,3+r()*9,1+r()*3,i%2?'#4e9876':'#c3d69f',.15+r()*.25)
    }
    for(let i=0;i<35;i++){
      const x=-28+r()*550,y=427+r()*82
      stroke(c,[[x,y+2],[x-1,y-2],[x+2,y-5]],'#b3e0b1',.75,.13+r()*.24)
    }
    for(const [x,y] of [[16,457],[75,460],[407,439],[486,474]]){
      flower(c,x,y,9,x%2===0?'#f6b7d6':'#e2d9fc','#fff0be','#6eab80',5,.76)
    }
  }else if(kind==='ruins'){
    // 풍화된 고대 석판. 틀에 맞춘 타일 대신 끊기고 갈라진 불규칙한 판석.
    for(let i=0;i<15;i++){
      const x=-10+i*40+r()*12,y=433+(i%4)*13
      stroke(c,[[x-19,y],[x-4,y-3],[x+13,y-1],[x+20,y+4]],i%3===0?'#e5d4b6':'#554f70',1,.17)
      if(i%3===0)stroke(c,[[x,y],[x-3,y+6],[x+1,y+10]],'#544665',1,.22)
    }
    for(const [x,y] of [[17,461],[417,449],[462,479]]){
      c.save();c.globalAlpha=.28;c.strokeStyle='#cfc6e9';c.lineWidth=.75
      c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();c.restore()
      stroke(c,[[x,y-7],[x,y+7],[x-5,y-1],[x+5,y-1]],'#dcd4f4',.8,.31)
    }
  }else if(kind==='volcano'){
    // 거친 흑요석 단층과 균열 속 용암의 희미한 잔광.
    for(let i=0;i<22;i++){
      const x=-25+r()*550,y=423+r()*89,sz=2+r()*14
      poly(c,[[x-sz,y],[x-2,y-sz*.28],[x+sz*.7,y+2],[x+1,y+sz*.35]],i%2?'#5e4e68':'#2d243c',.22+r()*.2)
    }
    for(const [x,y,w] of [[8,456,47],[393,447,67],[448,482,80]]){
      const pts=[[x-14,y-8],[x,y],[x+w*.45,y+3],[x+w*.75,y-2],[x+w,y+3]]
      stroke(c,pts,'#ffad70',3,.20)
      stroke(c,pts,'#ffce83',.9,.39)
    }
    for(let i=0;i<12;i++)disc(c,380+r()*150,431+r()*63,.5+r()*.8,'#ff9b72',.37)
  }
  // 광원에 의해 땅 표면에 얇은 반사가 맺히지만 캐릭터 발밑에 덮이지 않습니다.
  const lightG=c.createRadialGradient(240,456,8,240,456,240)
  lightG.addColorStop(0,rgba(p.horizon,.14));lightG.addColorStop(1,rgba(p.horizon,0))
  c.fillStyle=lightG;c.fillRect(-40,410,620,105)
  c.restore()
  // 공통적인 뾰족한 타일 테두리는 없애고, 자연 지형의 상단 윤곽만 남깁니다.
  stroke(c,[[-29,430],[402,420],[566,473]],edge,kind==='snowfield'?2:1.5,kind==='volcano'?.30:.42)
  stroke(c,natural?[[566,473],...lip[kind],[ -30,481]]:[[-22,482],[434,507],[566,473]],shadow,1.1,.24)
  // 공통 타원 그림자 제거: 이제 소녀와 고양이가 각자 부드러운 접지 그림자를 가집니다.
}

/* ───────── 매 프레임 움직임 ───────── */
function animate(c:Ctx,kind:Scenery,p:Palette,light:Light,time:number){
  if(kind==='nebula'){
    for(let i=0;i<22;i++){
      const ph=(time*.045+i*.047)%1,x=500+(i*47)%430+Math.sin(time*.4+i)*9,y=398-ph*130
      glow(c,x,y,7,'#e7f1ff',.22*(1-ph));circle(c,x,y,1+(i%3)*.4,'#f4f0ff',(1-ph)*.7)
    }
    for(let i=0;i<8;i++)sparkle(c,520+i*58,330+(i%3)*18,3+(i%2)*2,'#ffffff',.3+.4*Math.sin(time*1.3+i*1.9)**2)
  }else if(kind==='ringsea'){
    // 고리행성이 물에 길게 비친다
    for(let i=0;i<44;i++){
      const k=i/43,y=368+k*168,w=lerp(54,150,k),x=717+Math.sin(time*.9+i*.7)*(3+k*14)
      const sg=c.createLinearGradient(x-w,0,x+w,0);sg.addColorStop(0,rgba(p.moon,0));sg.addColorStop(.5,rgba(p.moon,(.32-k*.15)*(.6+.4*Math.sin(time*1.1+i))));sg.addColorStop(1,rgba(p.moon,0))
      c.fillStyle=sg;c.fillRect(x-w,y,w*2,2.6+k*2)
    }
    for(let i=0;i<40;i++){const x=(i*73)%960,y=380+(i*31)%150,b=Math.sin(time*.8+i*.9);stroke(c,[[x,y],[x+13+i%5*5,y-1]],i%3===0?'#fff0da':'#c9eeec',1.1,.12+(b+1)*.09)}
  }else if(kind==='snowfield'){
    for(let i=0;i<34;i++){const x=(i*113+31)%960,y=440+(i*47)%90,tw=Math.sin(time*1.4+i*2.3);if(tw>.2)sparkle(c,x,y,2.2+tw*2.2,'#ffffff',tw*.8)}
  }else if(kind==='auroraforest'){
    for(let i=0;i<26;i++){
      const x=(i*89+40+Math.sin(time*.2+i)*18)%960,y=455+(i*37)%70+Math.cos(time*.3+i)*5,a=.5+.5*Math.sin(time*1.1+i*1.7)
      glow(c,x,y,10,'#c6ffd8',.2*a);circle(c,x,y,1.2,'#e9ffe0',.4+a*.5)
    }
    mist(c,470,22,p.cloudA,.07+.04*Math.sin(time*.3))
  }else if(kind==='canyon'){
    for(let i=0;i<18;i++){const ph=(time*.05+i*.0556)%1,x=(i*131)%960+ph*50,y=430-ph*90+Math.sin(time*.5+i)*4;circle(c,x,y,1+(i%3)*.5,'#ffe3bc',(1-ph)*.34)}
    // 지층 사이로 번지는 잔광
    for(let i=0;i<6;i++){const x=120+i*150,a=.12+.12*Math.sin(time*.7+i*1.6);glow(c,x,380+(i%3)*14,26,'#ffd29a',a)}
  }else if(kind==='dunes')animateDunes(c,p,time)
  else if(kind==='garden')animateGarden(c,p,time)
  else if(kind==='ruins')animateRuins(c,p,time)
  else if(kind==='volcano')animateVolcano(c,p,time)
  else{
    const blink=Math.sin(time*2.6)>0
    for(const x of [230,640]){glow(c,x,274,10,'#ff9c8a',blink?.5:.1);circle(c,x,274,2.1,blink?'#ff9c8a':'#ffe9de',.95)}
    for(let i=0;i<22;i++){const t=Math.sin(time*.8+i*2.4);if(t>.55){const x=(i*47+20)%960,y=330+(i*29)%60;c.fillStyle=rgba('#ffe1a6',.5);c.fillRect(x,y,2,3)}}
    // 하늘다리를 지나는 작은 열차 불빛
    const u=(time*.045)%1,bx=230+410*u,by=308+44*u*(1-u)
    glow(c,bx,by,14,'#fff0c0',.55);circle(c,bx,by,1.8,'#fffbe8',1)
  }
}

/** 이벤트는 눌렀을 때부터 8.5초만 지속됩니다. 무한히 깜빡이는 구형 연출 대신
 *  빛이 켜지고 → 주변으로 번지고 → 사라지는 순서를 Canvas에서 직접 그립니다. */
function drawMoment(c:CanvasRenderingContext2D,kind:Scenery,time:number,action:MomentAction|null,age:number){
  if(action===null || age<0 || age>8.5)return
  const appear=Math.min(1,age/.72)
  const fade=Math.max(0,Math.min(1,(8.5-age)/1.65))
  const envelope=appear*fade
  const travel=Math.max(0,Math.min(1,(age-.22)/4.4))
  const flicker=.76+.24*Math.sin(time*3.1)
  const glow=(x:number,y:number,r:number,color:string,strength=.36)=>halo(c,x,y,r,color,envelope*strength*flicker)
  const spark=(x:number,y:number,r:number,color:string)=>{
    glow(x,y,r*6,color,.24)
    circle(c,x,y,r,color,envelope*.94)
    stroke(c,[[x-r*3,y],[x+r*3,y]],color,1.3,envelope*.75)
    stroke(c,[[x,y-r*3],[x,y+r*3]],color,1.3,envelope*.75)
  }
  const lineReveal=(pts:number[][],progress:number,color:string,width=2,opacity=.7)=>{
    // Each segment appears progressively, instead of flashing into existence.
    const max=Math.max(0,Math.min(pts.length-1,progress*(pts.length-1)))
    for(let i=0;i<Math.floor(max);i++)stroke(c,[pts[i],pts[i+1]],color,width,envelope*opacity)
    const partial=Math.floor(max)
    if(partial<pts.length-1){const t=max-partial
      stroke(c,[pts[partial],[pts[partial][0]+(pts[partial+1][0]-pts[partial][0])*t,
        pts[partial][1]+(pts[partial+1][1]-pts[partial][1])*t]],color,width,envelope*opacity)
    }
  }
  if(kind==='nebula'){
    if(action===0){
      const points=[[541,341],[590,319],[636,349],[685,331],[723,360],[767,341]]
      lineReveal(points,travel,'#dcefff',2,.54)
      points.forEach(([x,y],i)=>{const k=Math.max(0,Math.min(1,(travel*6-i)*2));
        if(k>.02){glow(x,y,31,'#bce8ff',k*.52);spark(x,y,2.8+k*1.1,'#f4e7ff')}})
      for(let i=0;i<17;i++){
        const t=(i*.618+age*.08)%1, x=555+i*25+Math.sin(i*3.2)*12,y=340-12*Math.sin(i*1.2)-t*48
        circle(c,x,y,1.1+i%3*.3,'#e8f2ff',envelope*(.2+.35*(1-t)))
      }
    }else{
      const nodes=[[224,173],[284,118],[365,157],[411,99],[492,134],[557,84],[615,152]]
      lineReveal(nodes,travel,'#f7e6fa',1.8,.8)
      nodes.forEach(([x,y],i)=>{if(travel*(nodes.length-1)>=i-.15)spark(x,y,i%3===0?2.9:2.2,'#fdf6db')})
    }
  }else if(kind==='ringsea'){
    if(action===0){
      const x=713,y=471
      for(let i=0;i<4;i++){
        const t=Math.max(0,Math.min(1,(age-i*.67)/4.1))
        if(t>0&&t<1){c.save();c.globalAlpha=envelope*(1-t)*.68;c.strokeStyle=i%2?'#d2fff7':'#fff3db';c.lineWidth=1.6
          c.beginPath();c.ellipse(x,y,9+t*119,2+t*22,0,0,TAU);c.stroke();c.restore()}
      }
      spark(x+Math.sin(age)*7,458+Math.cos(age*.8)*1,3,'#e9ffef')
    }else{
      c.save();c.translate(717,160);c.rotate(-.30)
      c.globalAlpha=envelope*(.55+.22*Math.sin(age*2));c.strokeStyle='#f9f4d8';c.lineWidth=5
      c.beginPath();c.ellipse(0,0,158,30,0,0,TAU);c.stroke();c.restore()
      for(let i=0;i<9;i++){
        const x=680+i*12,y=451+i%3*7+age*3
        circle(c,x,y,1.5+i%3*.5,'#e7fff5',envelope*(.68-i*.035))
        if(i%3===0)glow(x,y,17,'#c6f4f0',.22)
      }
      glow(716,480,94,'#b8f3ef',.18)
    }
  }else if(kind==='snowfield'){
    if(action===0){
      const pts=[] as number[][]
      for(let i=0;i<=10;i++){
        const a=-Math.PI/2+i*Math.PI/5,r=i%2?12:25
        pts.push([372+Math.cos(a)*r,463+Math.sin(a)*r*.49])
      }
      lineReveal(pts,Math.min(1,age/3),'#fff1c2',3,.85)
      if(age>2.6)spark(372,452,3,'#fff8df')
    }else{
      const peaks=[[285,284],[480,310],[726,275],[917,316]]
      peaks.forEach(([x,y],i)=>{
        const gain=Math.max(0,Math.min(1,(age-i*.67)/1.7))
        if(gain>0){glow(x,y,48,'#ddf8ff',gain*.53)
          spark(x,y+5,2.3,'#f6ffff')
          stroke(c,[[x-24,y+39],[x,y],[x+25,y+37]],'#f8fbff',2,envelope*gain*.63)}
      })
      for(let i=0;i<20;i++){
        const x=454+(i*73)%446,y=335+(i*27)%89-(age*11)%78
        circle(c,x,y,1+i%3*.4,'#fffaff',envelope*.4)
      }
    }
  }else if(kind==='auroraforest'){
    if(action===0){
      for(let i=0;i<30;i++){
        const x=382+(i*67)%548+Math.sin(age*1.2+i)*13
        const y=440+(i*19)%36-Math.max(0,age-i*.08)*11
        glow(x,y,11,i%3?'#b6ffe2':'#ffe9bf',.18)
        circle(c,x,y,1.5+(i%3)*.33,i%3?'#c7ffe4':'#ffe4a9',envelope*(.39+(i%4)*.12))
      }
    }else{
      const bend=Math.sin(age*.8)*20
      ribbon(c,117+bend,51,age*.22,'#92ffdb',76,envelope*.28)
      ribbon(c,166-bend*.45,59,age*.17,'#d5b0ff',91,envelope*.23)
      ribbon(c,211+bend*.25,39,age*.23,'#9be9ff',42,envelope*.20)
      for(let i=0;i<9;i++){
        const x=392+i*62,y=369+Math.sin(i+age*.6)*15
        glow(x,y,22,'#b0ffe5',.2)
      }
    }
  }else if(kind==='canyon'){
    if(action===0){
      const pts=[[479,372],[536,355],[584,327],[628,350],[697,333],[746,362],[810,353]]
      lineReveal(pts,travel,'#ffe5ae',2.7,.78)
      pts.forEach(([x,y],i)=>{if(travel*6>=i-.15)spark(x,y,2.1,'#ffefc5')})
      for(let i=0;i<16;i++){
        const x=527+(i*39)%325,y=350+(i*17)%65-age*4
        circle(c,x,y,1.2,'#ffe3ba',envelope*.36)
      }
    }else{
      const finish=Math.min(1,age/2.2),x=762-finish*113,y=90+finish*250
      stroke(c,[[x+68,y-83],[x,y]],'#ffedbe',3,envelope*(1-finish*.2))
      glow(x,y,20,'#ffdd9a',.45);circle(c,x,y,3,'#fff0cb',envelope)
      if(age>=2){
        const r=12+Math.min(1,(age-2)/3.4)*88
        c.save();c.globalAlpha=envelope*.46;c.strokeStyle='#fce6ae';c.lineWidth=2.5;c.beginPath();c.ellipse(649,341,r,r*.22,0,0,TAU);c.stroke();c.restore()
      }
    }
  }else if(kind==='dunes'){
    if(action===0){
      const pts=[[250,410],[330,406],[404,412],[474,430],[542,446],[618,462],[700,470],[784,486]]
      lineReveal(pts,travel,'#fff0c8',2.4,.7)
      pts.forEach(([x,y],i)=>{if(travel*7>=i-.15){glow(x,y,24,'#fff0c8',.4);spark(x,y,2,'#fffbe8')}})
      for(let i=0;i<18;i++){const x=300+(i*31)%480,y=430+(i*13)%40-age*5;circle(c,x,y,1.1+i%3*.3,'#fff2d2',envelope*.4)}
    }else{
      for(const [x,y,big] of [[700,140,1],[808,104,0]]){
        glow(x,y,big?120:70,'#fff3d0',.5)
        for(let i=0;i<3;i++){const t=Math.max(0,Math.min(1,(age-i*.8)/3.6));if(t>0&&t<1){c.save();c.globalAlpha=envelope*(1-t)*.6;c.strokeStyle='#fff3d0';c.lineWidth=1.5;c.beginPath();c.arc(x,y,(big?60:30)+t*70,0,TAU);c.stroke();c.restore()}}
      }
      poly(c,[[670,160],[730,160],[860,440],[560,440]],'#fff3d0',envelope*.07)
      poly(c,[[798,118],[818,118],[880,440],[780,440]],'#fff3d0',envelope*.06)
      for(let i=0;i<14;i++){const x=560+(i*47)%300,y=420+(i*17)%80;sparkle(c,x,y,2.4+i%3,'#fffbe8',envelope*(.3+.4*Math.sin(time*2+i)**2))}
    }
  }else if(kind==='garden'){
    if(action===0){
      const spots=[[575,470],[630,452],[672,478],[770,456],[826,478],[884,458]]
      spots.forEach(([x,y],i)=>{
        const on=Math.max(0,Math.min(1,(age-i*.6)*1.3));if(on<=0)return
        glow(x,y-20,40,'#ffd2e8',on*.55)
        flower(c,x,y,38,'#ffd2e8','#fff0b8','#79c49a',6,Math.max(.001,on*envelope))
        for(let k=0;k<4;k++)circle(c,x+Math.sin(age*1.5+k+i)*14,y-24-((age*14+k*9)%26),1.2,'#fff6d8',envelope*.6)
      })
    }else{
      for(let i=0;i<30;i++){
        const k=(age*.12+i*.034)%1,x=330+k*520+Math.sin(i*2.1+age)*18,y=480-k*260+Math.sin(k*9+i)*22
        ellipse(c,x,y,4,1.9,i%2?'#ffd2e6':'#fff3d6',envelope*Math.sin(k*Math.PI)*.85,age*2+i)
      }
      glow(600,360,110,'#ffd6ec',.2)
    }
  }else if(kind==='ruins'){
    const cx=640,cy=306
    if(action===0){
      for(let i=0;i<4;i++){const t=Math.max(0,Math.min(1,(age-i*.7)/3.8));if(t>0&&t<1){c.save();c.globalAlpha=envelope*(1-t)*.7;c.strokeStyle='#ffe6a8';c.lineWidth=2;c.beginPath();c.arc(cx,cy,30+t*130,0,TAU);c.stroke();c.restore()}}
      const a1=age*3.2,a2=age*.55
      stroke(c,[[cx,cy],[cx+Math.sin(a1)*20,cy-Math.cos(a1)*20]],'#fff6dc',2,envelope)
      stroke(c,[[cx,cy],[cx+Math.sin(a2)*14,cy-Math.cos(a2)*14]],'#ffe2a0',2.6,envelope)
      glow(cx,cy,70,'#ffe2a0',.5)
      for(let i=0;i<16;i++){const ph=(age*.2+i*.0625)%1,a=i*1.7;circle(c,cx+Math.cos(a)*(30+ph*100),cy+Math.sin(a)*(30+ph*100)*.7,1.3,'#fff0c8',envelope*(1-ph)*.6)}
    }else{
      lineReveal(RUNES as number[][],travel,'#ffe6a8',1.4,.5)
      RUNES.forEach(([x,y],i)=>{const on=Math.max(0,Math.min(1,(age-i*.45)*1.6));if(on>0){glow(x,y,26,'#ffe2a0',on*.55);rune(c,x,y,6,'#fff0c0',envelope*on)}})
      glow(cx,440,70,'#ffe2a0',.25*travel)
    }
  }else if(kind==='volcano'){
    if(action===0){
      const pts:number[][]=[]
      for(let i=0;i<=10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?14:30;pts.push([560+Math.cos(a)*r,168+Math.sin(a)*r])}
      lineReveal(pts,Math.min(1,age/3),'#ffd9a0',2.6,.85)
      if(age>2.6){spark(560,168,3.4,'#fff2d0');glow(560,168,60,'#ff9a6a',.5)}
      for(let i=0;i<26;i++){const ph=(age*.18+i*.0385)%1,x=560+Math.sin(i*2.1)*(12+ph*70),y=256-ph*100;circle(c,x,y,1.4,'#ffd9a0',envelope*(1-ph)*.8)}
    }else{
      LAVA.forEach((pts,k)=>lineReveal(pts,Math.max(0,Math.min(1,(age-.2-k*.5)/3.2)),'#ffcf8a',3,.85))
      LAVA.forEach((pts,k)=>{const q=pts[pts.length-1],on=Math.max(0,Math.min(1,(age-k*.5-2)/1.5));if(on>0){glow(q[0],q[1],34,'#ff9a5a',on*.5);spark(q[0],q[1],2.4,'#fff0cc')}})
    }
  }else{
    if(action===0){
      for(let i=0;i<19;i++){
        const x=435+i*24,y=350+(i*11)%34
        const on=Math.min(1,Math.max(0,(age-i*.21)*2))
        if(on>0){glow(x,y,12,'#ffe7be',.18*on)
          c.save();c.globalAlpha=envelope*on*(.4+.4*Math.sin(time*1.9+i*.8)**2);c.fillStyle='#ffe5aa';c.fillRect(x,y,3,4);c.restore()}
      }
    }else{
      const pts=[[445,362],[502,325],[568,296],[628,244],[698,210],[763,168]]
      lineReveal(pts,travel,'#fbe2c8',1.7,.57)
      pts.forEach(([x,y],i)=>{if(travel*5>=i-.1)spark(x,y,i===5?3.3:1.8,'#fcead9')})
      for(let i=0;i<6;i++){
        const x=472+i*50,y=342-i*29
        glow(x,y,12,'#efd3f3',.12)
      }
    }
  }
}
function drawWeather(c:CanvasRenderingContext2D,weather:Weather,time:number,p:Palette){
  if(weather==='rain'){
    c.save();c.fillStyle='rgba(152,178,226,0.055)';c.fillRect(0,0,W,H);c.restore()
    for(const s of rain){const y=(s.y+time*s.v+s.shift)%620-40;const x=(s.x-time*17)%1030;stroke(c,[[x,y],[x-8,y+s.len]],'#dceafa',s.i%6===0?1.2:.85,.20+(s.i%5)*.11)}
    for(let i=0;i<5;i++){let x=540+i*82,y=476+i%2*9;const radius=11+Math.abs(Math.sin(time*.9+i))*13;c.save();c.globalAlpha=.33;c.strokeStyle='#d6e9f5';c.lineWidth=1;c.beginPath();c.ellipse(x,y,radius,2.5,0,0,TAU);c.stroke();c.restore()}
  }else if(weather==='snow'){
    for(const s of snow){const y=(s.y+time*s.v)%590-25;const x=(s.x+Math.sin(time*.5+s.phase)*15+W)%W;circle(c,x,y,s.r,'#fffaf1',.50+(s.i%4)*.10)}
  }else if(weather==='meteor'){
    for(let i=0;i<4;i++){const t=(time+i*3.7)%(11+i%2*3);if(t>1.3)continue;const x=860+i*35-t*158,y=32+i*30+t*85;stroke(c,[[x+72,y-44],[x,y]],'#fcf0dd',2.3,Math.sin(t/1.3*Math.PI)*.75);circle(c,x,y,2.4,'#fff7dc',.85)}
  }else if(weather==='aurora')paintAurora(c,p,time,true)
}
function drawDust(c:CanvasRenderingContext2D,time:number){for(const s of closeDust){const y=s.y+Math.sin(time*.33+s.phase)*3;circle(c,s.x,y,s.r,'#fff4df',.09+(Math.sin(time+s.phase)+1)*.07)}}

/** 모든 풍경의 색·형태·대기·움직임을 Canvas 2D 명령으로 그립니다. 정적 레이어는 캐시하고 움직임만 매 프레임 덧그립니다. */
export function paintWorld(c:CanvasRenderingContext2D,kind:Scenery,light:Light,weather:Weather,time:number,moment=0,mode:'cabin'|'vista'='vista',momentAction:MomentAction|null=null,momentAge=99){
  const p=palettes[kind][light]
  const L=layerCache.get(`${kind}:${light}`,()=>buildLayers(kind,light))
  c.clearRect(0,0,W,H)
  c.drawImage(L.bg,0,0)
  // 구름은 서로 다른 속도로 아주 천천히 흐른다
  const d=Math.sin(time*.03)*46
  c.save();c.globalAlpha=.95;c.drawImage(L.cloudA,-120+d,0,1200,H);c.globalAlpha=.85;c.drawImage(L.cloudB,-120-d*1.3,0,1200,H);c.restore()
  c.save();c.globalAlpha=p.starOpacity
  for(const s of L.twink){
    const a=s.a*(.55+.45*(.5+.5*Math.sin(time*(.9+(s.x%9)*.12)+s.phase)))
    circle(c,s.x,s.y,s.r,s.x%7<3?'#fff9ee':'#e5efff',a)
    if(s.cross)sparkle(c,s.x,s.y,5,'#fff2db',a*.8)
  }
  c.restore()
  if(kind==='auroraforest')rayAurora(c,time,true)
  comet(c,time)
  c.drawImage(L.ground,0,0)
  animate(c,kind,p,light,time)
  if(mode==='vista')drawLookout(c,p,kind)
  // Event lights sit above the terrain so snow drawings or ripples stay visible.
  if(mode==='vista'&&moment>0)drawMoment(c,kind,time,momentAction,momentAge)
  drawWeather(c,weather,time,p)
  drawDust(c,time)
}
