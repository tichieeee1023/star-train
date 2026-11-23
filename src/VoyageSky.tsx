/**
 * 항해 창밖 전용 Canvas. 《별빛 항해일지》 Cabin.tsx 의 구간 순서와
 * '항해 중에는 우주, 도착 후에는 목적지' 전환 원칙을 계승합니다.
 * 목적지의 지형/기후는 이 컴포넌트에 절대 그리지 않습니다.
 */
import {useEffect,useRef} from 'react'
import type {Scenery} from './routeData'
import type {TripHours} from './Crystals'

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
export type TravelWindow={start:number;end:number;hours:TripHours;destination:Scenery}
const W=960,H=540,TAU=Math.PI*2
const clamp=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n))
const colorSets:Record<Stage|string,[string,string,string]>={
 idle:['#091329','#172d55','#384975'],
 departure:['#10152f','#25345d','#735b80'],
 nebula:['#10132f','#292353','#745389'],
 sea:['#06152d','#143a60','#386d8b'],
 aurora:['#061729','#12455b','#376d79'],
 islands:['#10152e','#354067','#686589'],
 approach:['#0b162b','#31456b','#85738f']
}
function hexColor(c:string):[number,number,number]{return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function blendHex(a:string,b:string,t:number){const aa=hexColor(a),bb=hexColor(b);return '#'+aa.map((v,i)=>Math.round(v+(bb[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function seeded(i:number){let k=(i*1664525+1013904223)>>>0;k=(Math.imul(k^(k>>>16),2246822519))>>>0;return ((k^(k>>>13))>>>0)/4294967296}
const stars=Array.from({length:275},(_,i)=>({x:seeded(i*17+3)*W,y:seeded(i*23+9)*H,r:.38+seeded(i*11+4)*1.35,alpha:.25+seeded(i*19+5)*.73,layer:i%4,phase:seeded(i*31+7)*TAU}))
function fill(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function wash(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,col:string,a:number){c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,col);g.addColorStop(.34,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,TAU);c.fill();c.restore()}
function wrap(n:number,width:number){return ((n%width)+width)%width}
function glint(c:CanvasRenderingContext2D,x:number,y:number,size:number,alpha:number,color='#ecf7ff'){
 c.save();c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=.8;c.beginPath();c.moveTo(x-size,y);c.lineTo(x+size,y);c.moveTo(x,y-size*1.4);c.lineTo(x,y+size*1.4);c.stroke();fill(c,x,y,1.2,color,.88*alpha);c.restore()
}
function ringedPlanet(c:CanvasRenderingContext2D,x:number,y:number,r:number,t:number,main='#91addb',ring='#dad2ec',opacity=1){
 c.save();c.translate(x,y);c.rotate(-.32);c.globalAlpha=opacity
 wash(c,0,0,r*2.5,r*2.25,main,.23)
 c.strokeStyle=ring;c.lineWidth=Math.max(1.3,r*.085);c.globalAlpha=opacity*.32
 c.beginPath();c.ellipse(0,0,r*1.8,r*.4,0,0,TAU);c.stroke()
 c.globalAlpha=opacity
 const sphere=c.createLinearGradient(-r,-r,r,r);sphere.addColorStop(0,'#e5e9fa');sphere.addColorStop(.42,main);sphere.addColorStop(1,'#20375c')
 c.fillStyle=sphere;c.beginPath();c.arc(0,0,r,0,TAU);c.fill()
 c.globalAlpha=opacity*.45;c.beginPath();c.ellipse(-r*.22,-r*.22,r*.42,r*.22,-.6,0,TAU);c.fillStyle='#edf0ff';c.fill()
 c.globalAlpha=opacity*.55;c.strokeStyle=ring;c.lineWidth=Math.max(1,r*.052);c.beginPath();c.ellipse(0,0,r*1.8,r*.4,0,0,Math.PI);c.stroke()
 c.restore()
}
function aurora(c:CanvasRenderingContext2D,t:number,alpha:number){
 for(let k=0;k<4;k++){
  const col=['#78e7ca','#9f9cf2','#75d8e9','#c5e9d5'][k]
  c.save();c.globalAlpha=alpha*(.19-k*.027);c.strokeStyle=col;c.lineWidth=44+k*13;c.lineCap='round';c.beginPath()
  for(let x=-100;x<W+140;x+=18){const y=125+k*26+Math.sin(x/138+t*.16+k)*34+Math.sin(x/67-t*.12+k)*15+(x/W)*75;if(x===-100)c.moveTo(x,y);else c.lineTo(x,y)}
  c.stroke();c.restore()
 }
}
function nebula(c:CanvasRenderingContext2D,t:number,alpha:number){
 const shift=Math.sin(t*.08)*38
 wash(c,255+shift,210,350,200,'#c29ce4',alpha*.26)
 wash(c,536-shift,310,440,245,'#906fd5',alpha*.28)
 wash(c,760+shift*.2,152,310,168,'#81badb',alpha*.23)
 wash(c,398,390,250,126,'#f7a9bd',alpha*.12)
}
function floatingIslands(c:CanvasRenderingContext2D,t:number,alpha:number){
 for(let i=0;i<3;i++){
  const speed=(i+1)*3.9,xx=wrap(120+i*390-t*speed,1420)-220,yy=218+(i%3)*73+Math.sin(t*.18+i)*7
  c.save();c.globalAlpha=alpha*(.23+(i%2)*.17);c.fillStyle='#122c48';c.beginPath()
  c.moveTo(xx-66,yy);c.quadraticCurveTo(xx,yy-28,xx+73,yy);c.lineTo(xx+25,yy+33);c.lineTo(xx,yy+53);c.lineTo(xx-44,yy+21);c.closePath();c.fill()
  c.strokeStyle='#a2d7ca';c.lineWidth=2;c.beginPath();c.moveTo(xx-53,yy);c.quadraticCurveTo(xx,yy-18,xx+64,yy);c.stroke()
  for(let k=0;k<5;k++){const tx=xx-40+k*19,ty=yy-9-(k%3)*6;c.fillStyle='#51827c';c.beginPath();c.moveTo(tx,ty-18);c.lineTo(tx-9,ty+6);c.lineTo(tx+9,ty+6);c.fill()}
  c.restore()
 }
}
function distantWhale(c:CanvasRenderingContext2D,t:number,alpha:number){
 const xx=wrap(1040-t*7.5,1700)-280,yy=282+Math.sin(t*.25)*21
 c.save();c.translate(xx,yy);c.globalAlpha=alpha*.2;c.scale(1.2,1.2);c.fillStyle='#a8d7e3'
 c.beginPath();c.moveTo(-55,0);c.bezierCurveTo(-42,-28,20,-32,50,-4);c.lineTo(73,-22);c.lineTo(69,-4);c.lineTo(79,9);c.lineTo(56,8);c.bezierCurveTo(28,27,-42,23,-55,0);c.fill()
 c.restore()
}
function comet(c:CanvasRenderingContext2D,t:number,alpha:number){
 const cycle=18,slot=Math.floor(t/cycle),offset=t%cycle
 if(offset>2.9)return
 const x=1120-offset*345,y=40+offset*99+seeded(slot+11)*80
 const g=c.createLinearGradient(x+115,y-40,x,y)
 g.addColorStop(0,'rgba(173,211,251,0)');g.addColorStop(1,`rgba(203,231,255,${.62*alpha})`)
 c.save();c.strokeStyle=g;c.lineWidth=2.6;c.beginPath();c.moveTo(x+115,y-40);c.lineTo(x,y);c.stroke();c.restore()
 wash(c,x,y,28,28,'#bbdffd',alpha*.33);fill(c,x,y,2.3,'#fbf2fb',alpha)
}
function scene(c:CanvasRenderingContext2D,t:number,trip:TravelWindow|null){
 const moving=!!trip
 const p=moving?clamp((Date.now()-trip.start)/(trip.end-trip.start)):0
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
 // 별의 강: 기울어진 흐릿한 광채. 우주를 달리는 내내 보이는 기본 풍경.
 c.save();c.translate(W*.5,H*.48);c.rotate(-.2);wash(c,Math.sin(t*.018)*24,0,580,185,'#7896de',.12);wash(c,0,37,390,115,'#d2a6e0',.11);c.restore()
 const opacity=(s:Stage)=>stage===s?1:next===s?fade*.85:0
 nebula(c,t,moving?opacity('nebula')*.98: .47)
 if(moving&&opacity('aurora')>0)aurora(c,t,opacity('aurora'))
 if(moving&&opacity('islands')>0)floatingIslands(c,t,opacity('islands'))
 if(moving&&opacity('sea')>0)distantWhale(c,t,opacity('sea'))
 if(moving&&opacity('departure')>0){ringedPlanet(c,180-t*1.4,366,75,t,'#b0b0da','#ead6de',opacity('departure')*.6)}
 if(!moving){ringedPlanet(c,720+Math.sin(t*.055)*33,312,56,t,'#90a4d0','#d4d0ea',.58)}
 if(moving&&opacity('approach')>0){
  const approach=clamp((p-(stages.length-1)/stages.length)*stages.length)
  const r=42+approach*150
  const colors:Record<Scenery,string>={nebula:'#b2a2dc',ringsea:'#9cd7d9',snowfield:'#bfd8ec',auroraforest:'#8bc8b7',canyon:'#efc4a0',city:'#d9cad4'}
  ringedPlanet(c,825-approach*95,270+approach*45,r,t,colors[trip.destination],'#d8d7fa',Math.max(.22,approach*.83))
 }
 // 원경별은 느리게, 가까운 별은 빨리 지나가는 시차 효과.
 for(const s of stars){
  const speed=moving?[4.5,10,22,43][s.layer]:[1.6,3.2,6.3,11][s.layer]
  const x=wrap(s.x-t*speed,W+36)-18,y=s.y+Math.sin(t*.035+s.phase)*1.6
  const twinkle=.76+.24*Math.sin(t*(.72+s.layer*.2)+s.phase)
  const a=s.alpha*twinkle*(s.layer===3?.83:1)
  if(s.layer>=2&&moving){c.save();c.strokeStyle='#d9eafd';c.globalAlpha=a*.20;c.lineWidth=.7+s.r*.24;c.beginPath();c.moveTo(x+Math.min(14,speed*.24),y);c.lineTo(x,y);c.stroke();c.restore()}
  fill(c,x,y,s.r,s.layer===0?'#bcd0f3':s.layer===1?'#f9e8fa':'#e2f9ff',a)
  if(s.r>1.48&&s.layer<2&&s.phase>3.5)glint(c,x,y,2.4+s.r,a*.5)
 }
 comet(c,t,moving?1:.6)
 // 창가 가까이 스치며 속도감을 만드는 작은 점광.
 for(let i=0;i<25;i++){
  const speed=moving?55+i%5*9:16+i%5*3
  const x=wrap(seeded(120+i)*W-t*speed,W+30)-15,y=150+seeded(510+i)*350
  fill(c,x,y,.45+(i%4)*.17,'#d9f0ff',.16+(i%5)*.065)
 }
}
export function VoyageSky({journey}: {journey:TravelWindow|null}){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas?.getContext('2d',{alpha:false});if(!ctx)return
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,last=0,elapsed=0
  const paint=()=>{ctx.setTransform(1,0,0,1,0,0);scene(ctx,elapsed,journey)}
  const tick=(time:number)=>{if(time-last>=1000/24){elapsed+=last?Math.min(.1,(time-last)/1000):0;last=time;paint()}frame=requestAnimationFrame(tick)}
  function refresh(){cancelAnimationFrame(frame);last=0;paint();if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick)}
  refresh();document.addEventListener('visibilitychange',refresh);reduced.addEventListener('change',refresh)
  return ()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',refresh);reduced.removeEventListener('change',refresh)}
 },[journey?.start,journey?.end,journey?.hours,journey?.destination])
 return <canvas className="sky-art voyage-sky" ref={ref} width={W} height={H} aria-hidden="true" />
}
