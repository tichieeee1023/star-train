/**
 * 풍경·창밖 Canvas가 공유하는 붓 도구 모음 (v2.7).
 * 외부 이미지 없이 노이즈 구름, 입체 행성, 층층이 쌓이는 원근 지형을 만듭니다.
 * 무거운 정적 레이어는 오프스크린 캔버스에 한 번만 그리고 재사용합니다.
 */
export const W=960,H=540,TAU=Math.PI*2
export type Ctx=CanvasRenderingContext2D
export type RGB=[number,number,number]

export const clamp=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n))
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t
export const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)}
export const wrap=(n:number,width:number)=>((n%width)+width)%width

/** 결정적 난수: 같은 시드는 언제나 같은 풍경을 그립니다. */
export function rng(seed:number){let n=seed>>>0;return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296}}
export function seeded(i:number){let k=(i*1664525+1013904223)>>>0;k=(Math.imul(k^(k>>>16),2246822519))>>>0;return ((k^(k>>>13))>>>0)/4294967296}

export const toRGB=(c:string):RGB=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]
export const mixRGB=(a:RGB,b:RGB,t:number):RGB=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]
export const hexOf=(c:RGB)=>'#'+c.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('')
/** 두 #rrggbb 색을 섞어 #rrggbb 로 돌려줍니다. */
export const mix=(a:string,b:string,t:number)=>hexOf(mixRGB(toRGB(a),toRGB(b),t))
export const rgba=(c:string,a:number)=>{const [r,g,b]=toRGB(c);return `rgba(${r},${g},${b},${clamp(a)})`}

function h2(x:number,y:number,s:number){let n=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,2246822519))|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296}
export function vnoise(x:number,y:number,s=0){
  const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf)
  const a=h2(xi,yi,s),b=h2(xi+1,yi,s),c=h2(xi,yi+1,s),d=h2(xi+1,yi+1,s)
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v
}
export function fbm(x:number,y:number,oct=5,s=0){
  let amp=.5,f=1,t=0,n=0
  for(let i=0;i<oct;i++){t+=amp*vnoise(x*f,y*f,s+i*17);n+=amp;amp*=.5;f*=2.03}
  return t/n
}

export function surface(w:number,h:number):HTMLCanvasElement{const c=document.createElement('canvas');c.width=w;c.height=h;return c}
export function ctxOf(cv:HTMLCanvasElement):Ctx{return cv.getContext('2d')!}

/** 가장 오래 안 쓴 항목부터 버리는 작은 캐시. 도감에서 여러 장을 볼 때 메모리를 지킵니다. */
export class Lru<T>{
  private m=new Map<string,T>()
  constructor(private max:number){}
  get(key:string,build:()=>T):T{
    const hit=this.m.get(key)
    if(hit!==undefined){this.m.delete(key);this.m.set(key,hit);return hit}
    const v=build();this.m.set(key,v)
    if(this.m.size>this.max)this.m.delete(this.m.keys().next().value as string)
    return v
  }
}

/* ───────── 기본 붓 ───────── */
export function disc(c:Ctx,x:number,y:number,r:number,color:string,a=1){c.save();c.globalAlpha=a;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
export function glow(c:Ctx,x:number,y:number,r:number,color:string,a=.6){
  const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,a));g.addColorStop(.35,rgba(color,a*.4));g.addColorStop(1,rgba(color,0))
  c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)
}
export function softEllipse(c:Ctx,x:number,y:number,rx:number,ry:number,color:string,a:number,rot=0){
  c.save();c.translate(x,y);c.rotate(rot);c.scale(1,ry/rx)
  const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,rgba(color,a));g.addColorStop(.45,rgba(color,a*.55));g.addColorStop(1,rgba(color,0))
  c.fillStyle=g;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore()
}
export function line(c:Ctx,pts:number[][],color:string|CanvasGradient,width=1,a=1){
  c.save();c.globalAlpha=a;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath()
  pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore()
}
export function polygon(c:Ctx,pts:number[][],fill:string|CanvasGradient,a=1){
  c.save();c.globalAlpha=a;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.restore()
}
export function vgrad(c:Ctx,y0:number,y1:number,stops:[number,string][]){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach(([o,col])=>g.addColorStop(o,col));return g}
/** 십자 반짝임 (그라데이션을 만들지 않아 매 프레임 여러 번 호출해도 가볍다) */
export function sparkle(c:Ctx,x:number,y:number,size:number,color:string,a:number){
  c.save();c.globalAlpha=a*.55;c.fillStyle=color;c.beginPath();c.arc(x,y,size*.5,0,TAU);c.fill()
  c.globalAlpha=a;c.strokeStyle=color;c.lineWidth=.8;c.beginPath()
  c.moveTo(x-size,y);c.lineTo(x+size,y);c.moveTo(x,y-size*1.35);c.lineTo(x,y+size*1.35);c.stroke();c.restore()
}
/** 1200x540 구름 질감을 보이는 영역만 잘라서 그린다 (창틀·벽에 가려진 부분은 계산하지 않음). */
export function drawCloud(c:Ctx,tex:HTMLCanvasElement,ox:number,alpha:number){
  const x0=Math.max(0,40-ox),x1=Math.min(1200,920-ox),y0=20,y1=405
  if(x1<=x0)return
  const kx=tex.width/1200,ky=tex.height/H
  c.save();c.globalAlpha=alpha
  c.drawImage(tex,x0*kx,y0*ky,(x1-x0)*kx,(y1-y0)*ky,x0+ox,y0,x1-x0,y1-y0)
  c.restore()
}

/* ───────── 노이즈 구름 ───────── */
export type CloudOpts={
  seed:number;a:string;b:string;/** 구름 색 두 가지 */
  dust?:string;/** 어두운 먼지띠 색 */
  scale?:number;/** 노이즈 한 칸의 픽셀 크기 */
  cover?:number;/** 0~1 구름이 덮는 비율 */
  soft?:number;
  band?:{cy:number;slope:number;width:number;floor?:number}|null;/** 구름이 모이는 사선 띠 */
  alpha?:number;core?:string
}
/** 1200x540 영역을 1/4 해상도로 계산해 부드러운 구름 질감을 만듭니다. 가로로 흘려 보낼 수 있도록 넉넉한 폭입니다. */
export function cloudTexture(o:CloudOpts):HTMLCanvasElement{
  const sx=4,w=300,h=135,cv=surface(w,h),c=ctxOf(cv),img=c.createImageData(w,h),d=img.data
  const A=toRGB(o.a),B=toRGB(o.b),D=toRGB(o.dust??'#10122c'),K=toRGB(o.core??'#fff4ea')
  const sc=o.scale??180,cover=o.cover??.55,soft=o.soft??.2,band=o.band===undefined?{cy:230,slope:-.18,width:170,floor:.3}:o.band
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const X=x*sx,Y=y*sx,wx=X/sc,wy=Y/sc
    const qx=fbm(wx+1.7,wy+9.2,3,o.seed),qy=fbm(wx+8.3,wy+2.8,3,o.seed+5)
    const dens=fbm(wx+2.3*qx,wy+2.3*qy,5,o.seed+9)
    let fall=1
    if(band){const yc=band.cy+band.slope*(X-600),dy=(Y-yc)/band.width;fall=band.floor!==undefined?band.floor+(1-band.floor)*Math.exp(-dy*dy):Math.exp(-dy*dy)}
    const field=dens*(.35+.95*fall)
    const ca=smooth(1-cover,1-cover+soft,field)*(o.alpha??1)
    const mixT=smooth(.3,.72,fbm(wx*1.3+11,wy*1.3,3,o.seed+3))
    let col=mixRGB(A,B,mixT)
    col=mixRGB(col,K,smooth(.55,.92,field)*.5)
    // 어두운 먼지 줄기: 구름 앞을 가로지르며 깊이를 만든다.
    const dust=smooth(.56,.78,fbm(wx*1.15+4,wy*1.15+7,4,o.seed+21))*(.25+.75*fall)*.42
    const aOut=ca+dust*(1-ca)
    const i=(y*w+x)*4
    if(aOut>0){
      const wc=ca/aOut,wd=1-wc
      d[i]=col[0]*wc+D[0]*wd;d[i+1]=col[1]*wc+D[1]*wd;d[i+2]=col[2]*wc+D[2]*wd
    }
    d[i+3]=aOut*255
  }
  c.putImageData(img,0,0)
  return cv
}

/** 은은한 필름 입자: 그라데이션 띠 현상을 가리고 그림 같은 질감을 줍니다. */
export function grainPattern(c:Ctx):CanvasPattern{
  const cv=surface(96,96),g=ctxOf(cv),img=g.createImageData(96,96),r=rng(7)
  for(let i=0;i<img.data.length;i+=4){const v=r()>.5?255:0;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=r()*14}
  g.putImageData(img,0,0);return c.createPattern(cv,'repeat')!
}

/* ───────── 입체 행성 ───────── */
export type PlanetOpts={
  base:string;lit:string;shade:string;atmos?:string
  ring?:{color:string;tilt:number;inner:number;outer:number;alpha:number}|null
  bands?:{c:string;a:number}[];light?:number;alpha?:number;seed?:number;craters?:boolean;haze?:number
}
function ringPath(c:Ctx,rx:number,ry:number,from:number,to:number){c.beginPath();c.ellipse(0,0,rx,ry,0,from,to)}
export function drawPlanet(c:Ctx,x:number,y:number,r:number,o:PlanetOpts){
  const L=o.light??-2.35,al=o.alpha??1,lx=Math.cos(L),ly=Math.sin(L)
  c.save();c.globalAlpha=al
  if(o.atmos)glow(c,x,y,r*(2.1+(o.haze??0)),o.atmos,.34)
  const ring=o.ring
  const drawRing=(front:boolean)=>{
    if(!ring)return
    c.save();c.translate(x,y);c.rotate(ring.tilt)
    const ry=(k:number)=>r*k*.21
    const bandsN=5
    for(let i=0;i<bandsN;i++){
      const k=lerp(ring.inner,ring.outer,i/(bandsN-1)),rx=r*k
      c.strokeStyle=rgba(ring.color,ring.alpha*(i%2?.55:.95)*(i===bandsN-1?.45:1))
      c.lineWidth=r*(.07+((i*7)%3)*.025)
      ringPath(c,rx,ry(k),front?0:Math.PI,front?Math.PI:TAU);c.stroke()
    }
    c.restore()
  }
  drawRing(false)
  // 구체: 빛이 오는 쪽으로 쏠린 방사 그라데이션
  const sg=c.createRadialGradient(x+lx*r*.45,y+ly*r*.45,r*.05,x,y,r*1.02)
  sg.addColorStop(0,o.lit);sg.addColorStop(.5,o.base);sg.addColorStop(1,o.shade)
  c.fillStyle=sg;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()
  c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip()
  const rr=rng(o.seed??1)
  if(o.bands)o.bands.forEach((b,i)=>{
    c.strokeStyle=rgba(b.c,b.a);c.lineWidth=r*(.1+rr()*.12);c.lineCap='round';c.beginPath()
    const yy=y+(-.62+i*(1.2/Math.max(1,o.bands!.length-1)))*r,ph=rr()*6
    for(let k=-1;k<=1.001;k+=.1){const px=x+k*r*1.05,py=yy+Math.sin(k*3.2+ph)*r*.06+k*r*.06;k<-.99?c.moveTo(px,py):c.lineTo(px,py)}
    c.stroke()
  })
  if(o.craters)for(let i=0;i<9;i++){
    const a=rr()*TAU,d=Math.sqrt(rr())*r*.8,cr=r*(.05+rr()*.1),cx=x+Math.cos(a)*d,cy=y+Math.sin(a)*d
    disc(c,cx,cy,cr,o.shade,.22);disc(c,cx-lx*cr*.3,cy-ly*cr*.3,cr*.8,o.lit,.16)
  }
  // 명암 경계선(터미네이터)
  const tg=c.createLinearGradient(x+lx*r,y+ly*r,x-lx*r,y-ly*r)
  tg.addColorStop(0,'rgba(0,0,0,0)');tg.addColorStop(.46,'rgba(0,0,0,0)');tg.addColorStop(.82,rgba(o.shade,.5));tg.addColorStop(1,rgba('#050818',.72))
  c.fillStyle=tg;c.fillRect(x-r,y-r,r*2,r*2)
  c.restore()
  // 빛이 닿는 가장자리의 대기 광채
  if(o.atmos){
    c.lineCap='round'
    c.strokeStyle=rgba(o.atmos,.55);c.lineWidth=Math.max(1.4,r*.035)
    c.beginPath();c.arc(x,y,r*.985,L-1.15,L+1.15);c.stroke()
    c.strokeStyle=rgba(o.atmos,.16);c.lineWidth=Math.max(3,r*.1)
    c.beginPath();c.arc(x,y,r*1.01,L-.9,L+.9);c.stroke()
  }
  drawRing(true)
  c.restore()
}

/* ───────── 층층이 쌓이는 지형 ───────── */
/** 능선 높이 함수를 따라 그림: 위쪽은 하늘색에 섞이고 아래는 짙어지는 한 겹의 언덕. */
export function ridgeLayer(c:Ctx,y:(x:number)=>number,top:string,bottom:string,opts:{rim?:string;rimA?:number;haze?:string;hazeA?:number;from?:number;step?:number;a?:number}={}){
  const step=opts.step??6,yb=Math.min(...Array.from({length:W/20+1},(_,i)=>y(i*20)))
  c.save();c.globalAlpha=opts.a??1
  c.beginPath();c.moveTo(-6,H+6)
  for(let x=-6;x<=W+6;x+=step)c.lineTo(x,y(x))
  c.lineTo(W+6,H+6);c.closePath()
  c.fillStyle=vgrad(c,yb,opts.from??H,[[0,top],[1,bottom]]);c.fill()
  if(opts.haze){ // 능선 위로 번지는 안개
    c.clip();const g=vgrad(c,yb,yb+110,[[0,rgba(opts.haze,opts.hazeA??.35)],[1,rgba(opts.haze,0)]]);c.fillStyle=g;c.fillRect(0,yb,W,H-yb)
  }
  c.restore()
  if(opts.rim){c.save();c.globalAlpha=opts.rimA??.35;c.strokeStyle=opts.rim;c.lineWidth=1.3;c.beginPath()
    for(let x=-6;x<=W+6;x+=step){const yy=y(x)+.6;x===-6?c.moveTo(x,yy):c.lineTo(x,yy)}c.stroke();c.restore()}
}
