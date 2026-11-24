import type {Scenery} from './routeData'
import type {TripHours} from './Crystals'
import {W,H,TAU,clamp,lerp,wrap,seeded,rng,mix,rgba,disc,glow,softEllipse,line,polygon,vgrad,sparkle,drawCloud,cloudTexture,drawPlanet,Lru,type Ctx,type PlanetOpts} from './PaintKit'

export type Stage='departure'|'nebula'|'sea'|'aurora'|'islands'|'approach'
export const stageNames:Record<Stage,string>={
 departure:'출항의 빛',nebula:'성운 구간',sea:'별의 바다',aurora:'오로라 항로',islands:'떠다니는 섬',approach:'목적지 접근'
}
export const voyageStages=(hours:TripHours):Stage[]=>hours>=8
 ? ['departure','nebula','islands','sea','aurora','approach']
 : hours>=3?['departure','nebula','sea','aurora','approach']
 : ['departure','nebula','sea','approach']
export function voyageStage(progress:number,hours:TripHours):Stage{
 const stages=voyageStages(hours)
 return stages[Math.min(stages.length-1,Math.floor(Math.max(0,Math.min(0.999999,progress))*stages.length))]
}
export type VoyageEventKind='meteor'|'whale'|'comet'|'lantern'|'aurora'|'signal'
export type SkyEvent={kind:VoyageEventKind;at:number;until:number}
export type TravelWindow={start:number;end:number;hours:TripHours;destination:Scenery;events?:readonly SkyEvent[]}

const colorSets:Record<Stage|string,[string,string,string]>={
 idle:['#091329','#172d55','#384975'],
 departure:['#10152f','#25345d','#735b80'],
 nebula:['#10132f','#292353','#745389'],
 sea:['#06152d','#143a60','#386d8b'],
 aurora:['#061729','#12455b','#376d79'],
 islands:['#10152e','#354067','#686589'],
 approach:['#0b162b','#31456b','#85738f']
}
/** 구간마다 어떤 성운 색이 얼마나 짙어지는지: [보라, 청록, 분홍] */
const tint:Record<Stage,[number,number,number]>={
 departure:[.5,0,.75],nebula:[1,.15,.5],islands:[.45,.2,.9],sea:[.1,1,0],aurora:[.15,.5,.05],approach:[.6,.3,.55]
}
const clouds=new Lru<HTMLCanvasElement>(8)
const cloudSet=()=>[
 clouds.get('violet',()=>cloudTexture({seed:11,a:'#a98be0',b:'#e79ac9',dust:'#0d0f2e',cover:.36,soft:.34,alpha:.66})),
 clouds.get('teal',()=>cloudTexture({seed:29,a:'#45cdc6',b:'#6f90ea',dust:'#051629',cover:.34,soft:.34,alpha:.56,band:{cy:250,slope:.1,width:150,floor:.25}})),
 clouds.get('rose',()=>cloudTexture({seed:47,a:'#f3a9b6',b:'#9f88e8',dust:'#1b1030',cover:.33,soft:.34,alpha:.55,band:{cy:200,slope:-.12,width:190,floor:.3}}))
]
const milky=()=>clouds.get('milky',()=>cloudTexture({seed:73,a:'#aebcf3',b:'#ecc8f1',dust:'#080b24',scale:120,cover:.5,soft:.45,alpha:.42,band:{cy:255,slope:-.22,width:105,floor:.05},core:'#ffffff'}))
function hexColor(c:string):[number,number,number]{return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function blendHex(a:string,b:string,t:number){const aa=hexColor(a),bb=hexColor(b);return '#'+aa.map((v,i)=>Math.round(v+(bb[i]-v)*t).toString(16).padStart(2,'0')).join('')}

/* 별: 은하수 띠 근처에 더 촘촘하게 모이도록 거부 샘플링 */
type Star={x:number;y:number;r:number;alpha:number;layer:number;phase:number;hue:number}
const stars:Star[]=(()=>{
 const out:Star[]=[],r=rng(5521)
 const bandD=(x:number,y:number)=>{const yc=255-.22*(x-480),d=(y-yc)/150;return Math.exp(-d*d)}
 let i=0
 while(out.length<340&&i<5000){
  i++;const x=r()*W,y=r()*H
  if(r()>.24+.76*bandD(x,y))continue
  const big=r()<.07
  out.push({x,y,r:big?1.1+r()*1.1:.35+r()*.75,alpha:big?.7+r()*.3:.22+r()*.55,layer:out.length%4,phase:r()*TAU,hue:r()})
 }
 return out
})()
const starColor=(h:number)=>h<.14?'#ffd9b8':h<.6?'#e6f0ff':h<.85?'#fdeefa':'#bfe3ff'

const destPlanet:Record<Scenery,PlanetOpts>={
 nebula:{base:'#a995dd',lit:'#f2dcff',shade:'#2d2a62',atmos:'#d9b8ff',ring:{color:'#efdcf7',tilt:-.32,inner:1.55,outer:2.1,alpha:.5},bands:[{c:'#ffffff',a:.16},{c:'#6f6bc4',a:.22},{c:'#ffd6f0',a:.12}]},
 ringsea:{base:'#62b6c9',lit:'#c9f5ee',shade:'#133a62',atmos:'#9fe9e3',ring:{color:'#e6fbf5',tilt:-.32,inner:1.5,outer:2.05,alpha:.5},bands:[{c:'#ffffff',a:.18},{c:'#2b7ea8',a:.25}]},
 snowfield:{base:'#a9cbe6',lit:'#f3fbff',shade:'#33507c',atmos:'#d3f2ff',craters:true,bands:[{c:'#ffffff',a:.14}]},
 auroraforest:{base:'#4fa88f',lit:'#c3f4d3',shade:'#103e4a',atmos:'#8ef0c6',bands:[{c:'#d8ffe6',a:.12},{c:'#1f6b66',a:.22}]},
 canyon:{base:'#d79a7c',lit:'#ffe2b8',shade:'#5a2f4f',atmos:'#ffc78e',craters:true,bands:[{c:'#ffe9c4',a:.12},{c:'#a5586b',a:.2}]},
 city:{base:'#a89cc8',lit:'#fff0dc',shade:'#2c3258',atmos:'#ffe3b0',bands:[{c:'#fff7ea',a:.1}]},
 dunes:{base:'#d9b49a',lit:'#fff0d4',shade:'#5a3a5a',atmos:'#ffd9b0',craters:true,bands:[{c:'#fff3dc',a:.14},{c:'#a87b82',a:.2}]},
 garden:{base:'#8ccaa0',lit:'#f6ffe6',shade:'#1c4c58',atmos:'#f8c8e0',bands:[{c:'#ffd6ec',a:.16},{c:'#3a8a7c',a:.22}]},
 ruins:{base:'#98a6c8',lit:'#f4ecd8',shade:'#242c58',atmos:'#e8d8a8',ring:{color:'#e8d8a8',tilt:.4,inner:1.4,outer:1.75,alpha:.4},bands:[{c:'#ffffff',a:.1},{c:'#5a6aa8',a:.2}]},
 lanternsea:{base:'#e8a070',lit:'#ffe8b8',shade:'#3a2058',atmos:'#ffc08a',bands:[{c:'#ffd8a0',a:.16},{c:'#8a4a7a',a:.22}]},
 cloudwhale:{base:'#b8c8f0',lit:'#fff4f8',shade:'#4a4a98',atmos:'#e8d8ff',bands:[{c:'#ffffff',a:.2},{c:'#8a98d8',a:.2}]},
 crystalcave:{base:'#78b8d8',lit:'#d8f4ff',shade:'#18285a',atmos:'#a8e8f4',craters:true,bands:[{c:'#c8f0ff',a:.14},{c:'#5868c0',a:.22}]},
 starcherry:{base:'#e8a0c0',lit:'#fff0f4',shade:'#5a2a6a',atmos:'#ffc8e0',bands:[{c:'#ffd8e8',a:.18},{c:'#a860a8',a:.2}]},
 volcano:{base:'#c0586a',lit:'#ffd8a8',shade:'#3a1038',atmos:'#ff9a8a',craters:true,bands:[{c:'#ffb88a',a:.16},{c:'#6a2050',a:.24}]}
}

function aurora(c:Ctx,t:number,alpha:number){
 const cols:[string,string][]=[['#78f0c6','#4ac6a8'],['#a79cf5','#7b73d8'],['#7fe0ee','#4db9d2']]
 for(let k=0;k<3;k++){
  const [top,base]=cols[k],ph=k*1.9
  c.save();c.globalAlpha=alpha*(.5-k*.08)
  const g=c.createLinearGradient(0,-190,0,6);g.addColorStop(0,rgba(top,0));g.addColorStop(.55,rgba(top,.34));g.addColorStop(.9,rgba(base,.9));g.addColorStop(1,rgba(base,0))
  c.fillStyle=g
  for(let x=-20;x<W+24;x+=8){
   const by=190+k*34+Math.sin(x/150+t*.17+ph)*38+Math.sin(x/61-t*.13+ph)*13+(x/W)*70
   const ray=.62+.38*Math.sin(x*.093+t*.5+k*2.1)*Math.sin(x*.037-t*.21+ph)
   const h=40+Math.max(0,ray)*150+Math.sin(x/90+t*.3+ph)*18
   c.save();c.translate(x,by);c.scale(1,h/190);c.globalAlpha=alpha*(.2-k*.04)*(.55+.45*Math.max(0,ray));c.fillRect(0,-190,12,196);c.restore()
  }
  c.restore()
 }
 softEllipse(c,W*.5,215,520,80,'#8ff0d0',alpha*.1,-.05)
}
function island(c:Ctx,x:number,y:number,w:number,depth:number,t:number,seed:number,alpha:number){
 // depth 0(가깝다) ~ 1(멀다): 멀수록 푸른 안개빛에 가까워진다
 const h=w*.52,haze=depth
 const rock0=mix('#46506f','#6c7da8',haze),rock1=mix('#1b2342','#34436a',haze*.8)
 const grass=mix('#5fbf9a','#7ea9c4',haze),grassHi=mix('#b6f0c4','#b5d4e8',haze)
 c.save();c.translate(x,y);c.globalAlpha=alpha
 glow(c,0,h*.3,w*1.15,'#9fd6ff',.07*(1-haze*.5))
 const pts=[[w,0],[w*.78,h*.5],[w*.46,h*.74],[w*.24,h*1.55],[w*.08,h*1.0],[-w*.16,h*1.45],[-w*.42,h*.7],[-w*.8,h*.52],[-w,0]]
 const rg=c.createLinearGradient(-w,0,w*.8,h*1.4);rg.addColorStop(0,rock0);rg.addColorStop(1,rock1)
 polygon(c,pts,rg)
 // 바위 결과 빛 받는 면
 polygon(c,[[-w,0],[-w*.8,h*.52],[-w*.42,h*.7],[-w*.4,h*.2]],'#e9f4ff',.1)
 // 윗면 풀밭
 c.beginPath();c.moveTo(-w,0);c.quadraticCurveTo(-w*.55,-h*.52,0,-h*.46);c.quadraticCurveTo(w*.6,-h*.5,w,0);c.quadraticCurveTo(0,h*.16,-w,0)
 const gg=c.createLinearGradient(0,-h*.5,0,h*.15);gg.addColorStop(0,grassHi);gg.addColorStop(.5,grass);gg.addColorStop(1,mix(grass,'#203a50',.5));c.fillStyle=gg;c.fill()
 // 작은 나무와 오두막
 const rr=rng(seed)
 for(let k=0;k<3;k++){
  const tx=(-.5+k*.45+rr()*.12)*w,th=w*(.16+rr()*.1),ty=-h*.36+Math.abs(tx/w)*h*.18
  c.fillStyle=mix('#3a5a63','#6f8fa8',haze);c.fillRect(tx-1.2,ty-th*.2,2.4,th*.35)
  disc(c,tx,ty-th*.5,th*.42,mix('#3f9c86','#7eb0c6',haze),1);disc(c,tx-th*.12,ty-th*.62,th*.2,mix('#9ae6b4','#bcdcee',haze),.65)
 }
 if(depth<.6){
  const hx=w*.28,hy=-h*.34
  c.fillStyle='#e9d2b8';c.fillRect(hx-w*.055,hy-w*.06,w*.11,w*.07)
  polygon(c,[[hx-w*.07,hy-w*.06],[hx,hy-w*.13],[hx+w*.07,hy-w*.06]],'#b4707c')
  c.fillStyle='#ffe6a8';c.fillRect(hx-w*.012,hy-w*.045,w*.025,w*.03);glow(c,hx,hy-w*.03,w*.18,'#ffe2a0',.35)
 }
 // 별가루 폭포
 for(let k=0;k<7;k++){
  const ph=(t*.28+k*.143+seed*.1)%1,px=w*.2+Math.sin(k*2+t*.4)*w*.05,py=h*1.45+ph*h*1.6
  disc(c,px+Math.sin(ph*9+k)*3,py,1+(1-ph)*1.3,'#d9f1ff',(1-ph)*.7)
 }
 c.restore()
}
function starSea(c:Ctx,t:number,alpha:number){
 const hy=312
 c.save();c.globalAlpha=alpha
 softEllipse(c,W*.5,hy,560,64,'#a4efec',.4)
 c.fillStyle=vgrad(c,hy,H,[[0,rgba('#68c0cf',.72)],[.22,rgba('#2a6f9a',.8)],[1,rgba('#07203e',.95)]]);c.fillRect(0,hy,W,H-hy)
 // 수평선 빛줄기
 c.fillStyle=vgrad(c,hy-3,hy+7,[[0,'rgba(220,255,250,0)'],[.5,'rgba(220,255,250,.55)'],[1,'rgba(220,255,250,0)']]);c.fillRect(0,hy-3,W,10)
 // 물결과 반짝임: 아래로 갈수록 크고 느리게
 for(let row=0;row<15;row++){
  const k=row/14,y=hy+6+Math.pow(k,1.55)*140,len=10+k*54,sp=3+k*14,n=15+row
  for(let i=0;i<n;i++){
   const x=wrap(seeded(row*97+i*13)*W*1.1-t*sp,W+120)-60,tw=.5+.5*Math.sin(t*(.9+k)+i*1.7+row)
   line(c,[[x,y+Math.sin(x/40+t*.5)*1.5],[x+len,y+Math.sin((x+len)/40+t*.5)*1.5]],i%4?'#bff4f0':'#fff4dc',.8+k*1.2,.1+tw*.32*(1-k*.3))
  }
 }
 // 하늘 별의 반사: 중앙 쪽으로 모이는 길
 for(let i=0;i<46;i++){
  const x=W*.5+(seeded(i*5)-.5)*420,y=hy+10+seeded(i*7)*110,tw=.5+.5*Math.sin(t*1.3+i)
  sparkle(c,x,y,1.2+seeded(i)*2.4,'#effffb',.16+tw*.42)
 }
 c.restore()
}
function whale(c:Ctx,t:number,alpha:number){
 const x=wrap(1060-t*8.5,1760)-330,y=205+Math.sin(t*.28)*20,tilt=Math.sin(t*.28-.6)*.07,flap=Math.sin(t*.9)
 c.save();c.translate(x,y);c.rotate(tilt);c.scale(-1.15,1.15);c.globalAlpha=alpha
 glow(c,0,6,150,'#8fd9ee',.16)
 const body=new Path2D('M98 2C98 -22 54 -46 -6 -42C-48 -39 -86 -24 -112 -12C-124 -10 -134 -22 -144 -38C-142 -22 -139 -10 -133 -2C-141 8 -148 18 -150 34C-138 24 -128 14 -114 8C-88 16 -44 33 4 34C54 36 96 24 98 2Z')
 c.save();c.translate(-112,-4);c.rotate(flap*.1);c.translate(112,4);c.fillStyle='#000';c.restore()
 const g=c.createLinearGradient(0,-46,0,36);g.addColorStop(0,'#2f5a8c');g.addColorStop(.55,'#6ea4cf');g.addColorStop(1,'#d8ecf5')
 c.fillStyle=g;c.fill(body)
 c.save();c.clip(body)
 c.strokeStyle='rgba(235,250,255,.35)';c.lineWidth=1.2
 for(let i=0;i<6;i++){c.beginPath();c.moveTo(60-i*5,12+i*3);c.quadraticCurveTo(10-i*6,22+i*2,-40-i*8,12+i*3);c.stroke()}
 c.restore()
 // 가슴지느러미
 c.save();c.translate(20,22);c.rotate(.32+flap*.12)
 c.fillStyle='#4d82b0';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-18,18,-52,34);c.quadraticCurveTo(-30,12,-22,-4);c.closePath();c.fill();c.restore()
 // 눈, 몸에 빛나는 점
 disc(c,62,-1,2.1,'#10223d');disc(c,62.8,-1.8,.7,'#fff')
 for(let i=0;i<9;i++){const a=.55+.45*Math.sin(t*1.4+i*.8);const px=48-i*15,py=-18+Math.sin(i)*3+i*.9;disc(c,px,py,1.6,'#d8fbff',a*.9);glow(c,px,py,9,'#9fe8ff',a*.35)}
 c.restore()
 // 지나간 자리에 남는 별가루
 for(let i=0;i<16;i++){
  const ph=(t*.35+i*.0625)%1,px=x+Math.cos(tilt)*(120+ph*210)+Math.sin(i*5)*8,py=y+16+ph*34+Math.sin(i*3+t)*5
  disc(c,px,py,.8+(1-ph)*1.3,'#d9f6ff',alpha*(1-ph)*.7)
 }
}
function comet(c:Ctx,t:number,alpha:number){
 const cycle=18,slot=Math.floor(t/cycle),offset=t%cycle
 if(offset>2.9)return
 const x=1120-offset*345,y=40+offset*99+seeded(slot+11)*80
 const g=c.createLinearGradient(x+135,y-47,x,y)
 g.addColorStop(0,'rgba(173,211,251,0)');g.addColorStop(.7,`rgba(190,222,255,${.35*alpha})`);g.addColorStop(1,`rgba(235,246,255,${.85*alpha})`)
 c.save();c.strokeStyle=g;c.lineWidth=2.8;c.lineCap='round';c.beginPath();c.moveTo(x+135,y-47);c.lineTo(x,y);c.stroke();c.restore()
 glow(c,x,y,34,'#bbdffd',.5*alpha);disc(c,x,y,2.4,'#ffffff',alpha)
}
function station(c:Ctx,t:number,alpha:number){
 // 출항: 뒤로 멀어지는 역의 따뜻한 빛과 떠오르는 등불
 softEllipse(c,130,365,430,210,'#ffc89a',.34*alpha,-.2)
 softEllipse(c,60,390,240,120,'#fff0c8',.3*alpha)
 for(let i=0;i<16;i++){
  const ph=(t*.05+seeded(i*3)*1)%1,x=70+seeded(i*7)*330+ph*40,y=395-ph*300,fl=.6+.4*Math.sin(t*2+i)
  glow(c,x,y,9+seeded(i)*7,'#ffd9a0',alpha*.28*fl*(1-ph));disc(c,x,y,1+seeded(i+4)*1.2,'#fff0cc',alpha*.85*(1-ph*.8)*fl)
 }
}
function core(c:Ctx,t:number,alpha:number){
 // 성운 속 갓 태어난 별무리
 const knots:[number,number,number,string][]=[[300,250,60,'#ffd9f1'],[610,200,76,'#cfe2ff'],[760,290,50,'#ffe8c8']]
 knots.forEach(([x,y,r,col],i)=>{const dx=Math.sin(t*.05+i)*14;glow(c,x+dx,y,r*2.3,col,alpha*.16);glow(c,x+dx,y,r,col,alpha*.22)
  for(let k=0;k<11;k++){const a=seeded(i*50+k)*TAU,d=seeded(i*50+k+9)*r*.9;sparkle(c,x+dx+Math.cos(a)*d,y+Math.sin(a)*d*.7,1.4+seeded(k+i)*2.4,col,alpha*(.35+.4*Math.sin(t*1.4+k+i)**2))}})
}
function destination(c:Ctx,t:number,trip:TravelWindow,approach:number,alpha:number){
 const r=42+approach*150,o=destPlanet[trip.destination],x=825-approach*95,y=270+approach*45
 // 가까워질수록 행성 쪽에서 빛살이 번진다
 softEllipse(c,x,y,r*3,r*2.2,o.atmos??'#fff',.12*alpha*(.4+approach))
 drawPlanet(c,x,y,r,{...o,alpha:Math.max(.25,approach*.85+.18)*alpha,light:-2.55,seed:7})
 // 작은 위성
 const a=t*.05+2.1;drawPlanet(c,x+Math.cos(a)*r*1.75,y-r*.35+Math.sin(a)*r*.28,Math.max(5,r*.12),{base:'#cfd2e6',lit:'#ffffff',shade:'#4a547c',craters:true,alpha:alpha*.9,light:-2.5,seed:3})
}
/* ───────── 항해 중 창밖 이벤트 연출 (age = 이벤트가 시작된 뒤 지난 초) ───────── */
function streak(c:Ctx,x:number,y:number,len:number,a:number,w:number){
 const g=c.createLinearGradient(x+len,y-len*.45,x,y);g.addColorStop(0,'rgba(255,243,221,0)');g.addColorStop(1,`rgba(255,247,230,${.9*a})`)
 c.save();c.strokeStyle=g;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x+len,y-len*.45);c.lineTo(x,y);c.stroke();c.restore()
 glow(c,x,y,w*9,'#fff4d8',.4*a);disc(c,x,y,w*.9,'#ffffff',a)
}
function eventSky(c:Ctx,t:number,ev:SkyEvent,now:number){
 const age=(now-ev.at)/1000,len=(ev.until-ev.at)/1000,env=clamp(Math.min(age/5,(len-age)/5))
 if(env<=0)return
 if(ev.kind==='meteor'){
  for(let i=0;i<9;i++){const ph=(age/(3.2+i%3*.9)+i*.37)%1,x=1040-ph*900+seeded(i+40)*200-100,y=-30+ph*360+seeded(i+60)*130;streak(c,x,y,90+seeded(i)*70,env*Math.sin(ph*Math.PI),2.2)}
 }else if(ev.kind==='comet'){
  const ph=(age/22)%1,x=1060-ph*1200,y=40+ph*290+Math.sin(ph*3)*18,a=env*Math.sin(Math.min(1,ph*1.15)*Math.PI*.98)
  streak(c,x,y,300,a,4.2);glow(c,x,y,60,'#cfe6ff',.35*a)
  for(let k=0;k<14;k++){const d=k*22;sparkle(c,x+d*1.0+seeded(k)*8,y-d*.45+seeded(k+7)*8,1.6+seeded(k+3)*2,'#e8f3ff',a*(.6-k*.04))}
 }else if(ev.kind==='whale'){
  const ph=(age/46)%1,x=-230+ph*1430,y=340+Math.sin(age*.45)*16,s=1.5,sw=Math.sin(age*1.4)*14,a=env*.58
  glow(c,x,y,170,'#9fd0ff',.2*env)
  c.save();c.translate(x,y);c.scale(s,s)
  c.fillStyle='#7ea6e0';c.globalAlpha=a;c.beginPath();c.ellipse(0,0,90,26,0,0,TAU);c.fill()
  polygon(c,[[-80,-2],[-128,-18+sw],[-146,-34+sw],[-120,-4+sw],[-146,22+sw],[-122,14+sw],[-80,6]],'#7ea6e0',1)
  c.globalAlpha=a*.55;c.fillStyle='#d4e8ff';c.beginPath();c.ellipse(8,10,66,10,0,0,TAU);c.fill()
  c.restore();disc(c,x+58*s,y-6*s,2.6,'#eaf6ff',env*.9)
  for(let i=0;i<3;i++){const k=(age*.25+i/3)%1;c.save();c.globalAlpha=env*(1-k)*.4;c.strokeStyle='#cfe6ff';c.lineWidth=1.5;c.beginPath();c.ellipse(x+85*s,y-10,20+k*150,8+k*52,0,0,TAU);c.stroke();c.restore()}
 }else if(ev.kind==='lantern'){
  for(let i=0;i<16;i++){const ph=(age/(26+i%4*4)+i*.0625)%1,x=110+seeded(300+i)*720+Math.sin(age*.5+i)*18+ph*90,y=530-ph*470,a=env*Math.sin(ph*Math.PI)
   glow(c,x,y,17,'#ffc27a',.5*a);disc(c,x,y,2.6,'#fff0cc',a);disc(c,x,y+3.5,1.6,'#ffb36a',a*.8)}
 }else if(ev.kind==='aurora'){
  aurora(c,t,env*.95)
 }else{
  const x=830,y=205,step=.9,on=[1,0,1,1,0,0][Math.floor(age/step)%6]===1,k=(age%step)/step
  line(c,[[x,y],[x,y+52]],'#c8d6f0',2,env*.7);line(c,[[x-9,y+52],[x+9,y+52]],'#c8d6f0',2,env*.7)
  disc(c,x,y,3.2,on?'#fff3c8':'#7f8fb4',env*(on?1:.6))
  if(on){glow(c,x,y,46,'#ffe9a8',.55*env);c.save();c.globalAlpha=env*(1-k)*.5;c.strokeStyle='#ffe9a8';c.lineWidth=1.4;c.beginPath();c.arc(x,y,6+k*66,0,TAU);c.stroke();c.restore()}
 }
}
export function paintVoyage(c:CanvasRenderingContext2D,t:number,trip:TravelWindow|null,now:number=Date.now()){
 const moving=!!trip
 const p=moving?clamp((now-trip.start)/(trip.end-trip.start)):0
 const stages=moving?voyageStages(trip.hours):['sea' as Stage]
 const stageIndex=moving?Math.min(stages.length-1,Math.floor(p*stages.length)):0
 const stage=stages[stageIndex]
 const pos=moving?p*stages.length-stageIndex:0
 const next=stages[Math.min(stageIndex+1,stages.length-1)]
 const fade=moving?clamp((pos-.78)/.22):0
 const base=moving?colorSets[stage]:colorSets.idle,other=moving?colorSets[next]:base
 const sky=c.createLinearGradient(0,0,120,H)
 for(let i=0;i<3;i++)sky.addColorStop(i/2,blendHex(base[i],other[i],fade))
 c.fillStyle=sky;c.fillRect(0,0,W,H)
 const opacity=(s:Stage)=>stage===s?1:next===s?fade*.85:0
 const wts=moving?(()=>{const a=tint[stage],b=tint[next];return [0,1,2].map(i=>lerp(a[i],b[i],fade))})():[.7,.3,.2]
 // 은하수 띠와 성운: 서로 다른 속도로 아주 천천히 흐른다
 const dx=(k:number)=>-120+Math.sin(t*.022+k*2)*58
 drawCloud(c,milky(),dx(5)*.6-60,.95)
 cloudSet().forEach((tex,k)=>{if(wts[k]>.03)drawCloud(c,tex,dx(k)*(k?1.2:1),Math.min(1,wts[k])*(moving?.98:.6))})
 if(moving&&opacity('nebula')>0)core(c,t,opacity('nebula'))
 if(moving&&opacity('departure')>0)station(c,t,opacity('departure'))
 if(moving&&opacity('aurora')>0)aurora(c,t,opacity('aurora'))
 if(moving&&opacity('departure')>0)drawPlanet(c,360-t*1.4,285,78,{base:'#b0b0da',lit:'#f6e6ee',shade:'#2e3562',atmos:'#ead6de',ring:{color:'#ead6de',tilt:-.32,inner:1.5,outer:2.0,alpha:.46},bands:[{c:'#ffffff',a:.14},{c:'#6a68b8',a:.2}],alpha:opacity('departure')*.8,seed:4})
 if(!moving)drawPlanet(c,720+Math.sin(t*.055)*33,300,60,{base:'#90a4d0',lit:'#e8eafc',shade:'#22305c',atmos:'#d4d0ea',ring:{color:'#d4d0ea',tilt:-.32,inner:1.55,outer:2.05,alpha:.46},bands:[{c:'#ffffff',a:.15},{c:'#5e74b8',a:.2}],alpha:.8,seed:9})
 // 별: 원경은 느리게, 가까운 별은 빨리 지나가는 시차 효과 (save/restore 없이 한 번에)
 c.save()
 c.lineCap='butt';c.strokeStyle='#d9eafd'
 for(const s of stars){
  const speed=moving?[4.5,10,22,43][s.layer]:[1.6,3.2,6.3,11][s.layer]
  const x=wrap(s.x-t*speed,W+36)-18,y=s.y+Math.sin(t*.035+s.phase)*1.6
  const twinkle=.76+.24*Math.sin(t*(.72+s.layer*.2)+s.phase)
  const a=s.alpha*twinkle*(s.layer===3?.83:1)
  if(s.layer>=2&&moving){c.globalAlpha=a*.20;c.lineWidth=.7+s.r*.24;c.beginPath();c.moveTo(x+Math.min(14,speed*.24),y);c.lineTo(x,y);c.stroke()}
  c.globalAlpha=a;c.fillStyle=starColor(s.hue);c.beginPath();c.arc(x,y,s.r,0,TAU);c.fill()
  if(s.r>1.45&&s.layer<2&&s.phase>3.2)sparkle(c,x,y,2.6+s.r*1.6,'#ecf7ff',a*.55)
 }
 c.restore()
 if(moving&&opacity('islands')>0){
  const a=opacity('islands')
  for(let i=0;i<4;i++){
   const depth=[.75,.1,.45,.0][i],w=[58,96,74,120][i],sp=3+(1-depth)*9,xx=wrap([300,560,820,1000][i]-t*sp,1250)-190
   island(c,xx,[150,235,120,255][i]+Math.sin(t*.2+i*1.7)*7,w,depth*.8,t,i+3,a*(.6+.4*(1-depth)))
  }
 }
 if(moving&&opacity('sea')>0){starSea(c,t,opacity('sea'));whale(c,t,opacity('sea'))}
 if(moving&&opacity('approach')>0)destination(c,t,trip,clamp((p-(stages.length-1)/stages.length)*stages.length),opacity('approach'))
 comet(c,t,moving?1:.6)
 if(moving&&trip.events)for(const e of trip.events)if(now>=e.at&&now<e.until)eventSky(c,t,e,now)
 // 창가 가까이 스치며 속도감을 만드는 작은 점광
 for(let i=0;i<25;i++){
  const speed=moving?55+i%5*9:16+i%5*3
  const x=wrap(seeded(120+i)*W-t*speed,W+30)-15,y=150+seeded(510+i)*350
  disc(c,x,y,.45+(i%4)*.17,'#d9f0ff',.16+(i%5)*.065)
 }
}
