import {palettes,type Light,type Palette} from './Palette'
import type {Scenery} from './routeData'
import type {MomentAction} from './PlaceMoment'

export type Weather = 'clear'|'rain'|'snow'|'meteor'|'aurora'
const TAU=Math.PI*2
const W=960,H=540
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
function hills(c:CanvasRenderingContext2D,p:Palette,kind:Scenery,time:number){
  const move=time*.02
  if(kind==='nebula'){
    wave(c,349,13,115,move+.2,p.horizon,.61)
    wave(c,384,17,104,move+.4,p.ridge,.84)
    wave(c,407,10,100,move+.9,p.deep,.98)
    c.fillStyle=gradient(c,[p.deep,p.foreground],412,H);c.fillRect(0,415,W,H-410)
    for(let i=0;i<7;i++){let x=510+i*69,y=320+(i%3)*15,h=53+(i%4)*22;poly(c,[[x-h*.13,y+h],[x-h*.35,y+h*.19],[x,y],[x+h*.3,y+h]],i%2?'#d4d2f5':'#b5e4e3',.22+(i%3)*.08)}
  } else if(kind==='ringsea'){
    wave(c,362,11,122,move,p.horizon,.7)
    wave(c,390,10,135,move+.3,p.ridge,.72)
    wave(c,417,6,127,move,p.deep,.95)
    c.fillStyle=gradient(c,[p.deep,p.foreground],427,H);c.fillRect(0,431,W,110)
    for(let i=0;i<38;i++){let x=(i*73)%960,y=445+(i*31)%94;const b=Math.sin(time*.8+i*.9);stroke(c,[[x,y],[x+13+i%5*5,y-1]],i%3===0?'#fff0da':'#c9eeec',1.1,.13+(b+1)*.08)}
  }else if(kind==='snowfield'){
    poly(c,[[0,420],[110,356],[180,385],[285,284],[375,386],[480,310],[610,389],[727,274],[815,372],[916,316],[960,373],[960,H],[0,H]],p.ridge,.98)
    for(const [x,y,w,h] of [[284,285,86,86],[480,312,69,64],[727,275,101,110],[917,316,66,66]])poly(c,[[x-w,y+h],[x,y],[x+w,y+h],[x+26,y+40],[x+5,y+56],[x-10,y+25],[x-24,y+39]],'#edf6fd',.86)
    wave(c,426,9,130,move,p.deep,.84);wave(c,452,10,100,move+.6,p.horizon,.9);wave(c,488,8,115,move+.5,p.ridge,.7)
    c.fillStyle=gradient(c,[p.ridge,p.foreground],470,H);c.fillRect(0,491,W,49)
    for(let i=0;i<23;i++){const x=(i*89)%960,y=466+(i*25)%63;stroke(c,[[x,y],[x+19,y-1],[x+34,y+1]],'#e9f8ff',1,.16)}
  }else if(kind==='auroraforest'){
    wave(c,397,19,135,move,p.horizon,.75);wave(c,435,15,100,move,p.ridge,.92);wave(c,464,8,115,move,p.deep)
    c.fillStyle=p.foreground;c.fillRect(0,462,W,78)
    for(let i=0;i<41;i++){
      const x=(i*73+11)%1004-12,y=426+(i*19)%36,h=34+(i*17)%78
      poly(c,[[x,y-h],[x-h*.37,y+3],[x+h*.37,y+3]],i%4===0?'#2c5559':p.foreground,.83)
      poly(c,[[x,y-h*.69],[x-h*.29,y-2],[x+h*.29,y-2]],'#437775',.20)
    }
  } else if(kind==='canyon'){
    poly(c,[[0,418],[99,368],[154,367],[192,296],[304,298],[346,365],[471,391],[543,320],[692,321],[732,381],[840,349],[933,350],[960,380],[960,H],[0,H]],p.horizon)
    stroke(c,[[191,297],[301,297]],'#ffdfbf',4,.28);stroke(c,[[543,321],[691,321]],'#ffd7bd',3,.29)
    poly(c,[[0,438],[137,421],[168,392],[310,393],[354,429],[475,424],[550,387],[680,391],[738,429],[857,407],[960,420],[960,H],[0,H]],p.ridge)
    wave(c,464,12,100,move,p.deep,.97);c.fillStyle=p.foreground;c.globalAlpha=.5;c.fillRect(0,485,W,55);c.globalAlpha=1
    for(let i=0;i<17;i++){const x=(i*79)%960,y=356+(i*53)%94;stroke(c,[[x,y],[x+14+i%4*5,y]],'#f9d2b4',1.5,.16)}
  }else{
    // City skyline only in the far distance; open sky remains dominant.
    wave(c,360,18,137,move,p.horizon,.60)
    const rr=random(8923)
    for(let i=0,x=0;x<W;i++){
      const w=17+rr()*27,h=22+rr()*55,y=387-h
      c.fillStyle=i%2?'#576b8b':'#667796';c.globalAlpha=.51;c.fillRect(x,y,w,h);c.globalAlpha=1
      if(i%9===0)stroke(c,[[x+w*.5,y],[x+w*.5,y-12]],'#adc0d4',1.2,.37)
      for(let dx=5;dx<w-3;dx+=7)for(let dy=7;dy<h-4;dy+=9)if(rr()>.74)circle(c,x+dx,y+dy,1.1,rr()>.35?'#f9daae':'#b6c8dd',.52)
      x+=w+3+rr()*6
    }
    wave(c,410,10,105,move+.1,p.deep,.88);wave(c,438,10,130,move+.4,p.foreground,.9)
    for(let i=0;i<28;i++){let x=(i*67)%960,y=452+(i*33)%79;stroke(c,[[x,y],[x+9+i%3*7,y]],i%3===0?'#fce3bf':'#a6c5db',1,.23)}
  }
}
function ringPlanet(c:CanvasRenderingContext2D,x:number,y:number,r:number,p:Palette){
  c.save();c.translate(x,y);c.rotate(-.30)
  c.strokeStyle='#f1e3f7';c.globalAlpha=.35;c.lineWidth=7;c.beginPath();c.ellipse(0,0,r*2.12,r*.40,0,0,TAU);c.stroke();c.globalAlpha=1
  const sphere=c.createLinearGradient(-r,-r,r,r);sphere.addColorStop(0,'#fcdeeb');sphere.addColorStop(.48,p.moon);sphere.addColorStop(1,'#607ca8')
  c.fillStyle=sphere;c.globalAlpha=p.moonOpacity;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.globalAlpha=1
  c.save();c.beginPath();c.arc(0,0,r,0,TAU);c.clip();ribbon(c,-r*.23,4,0,'#dbf0f0',r*.19,.19);ribbon(c,r*.28,4,1,'#8cabe1',r*.12,.16);c.restore()
  c.strokeStyle='#fff0dd';c.globalAlpha=.63;c.lineWidth=4;c.setLineDash([r*1.7,r*10]);c.beginPath();c.ellipse(0,0,r*2.12,r*.40,0,0,TAU);c.stroke();c.setLineDash([]);c.restore()
}
function planet(c:CanvasRenderingContext2D,kind:Scenery,p:Palette,time:number){
  if(kind==='nebula'||kind==='ringsea')ringPlanet(c,kind==='ringsea'?717:782,kind==='ringsea'?160:140,kind==='ringsea'?74:50,p)
  else if(kind==='canyon'){
    halo(c,773,141,110,'#ffe7b2',.22)
    circle(c,773,142,49,p.moon,p.moonOpacity)
  }else if(kind==='snowfield'){
    halo(c,744,135,93,'#d3f6ff',.18)
    circle(c,744,135,53,p.moon,p.moonOpacity);circle(c,838,178,16,'#ddebf5',.52)
  }else{
    halo(c,752,125,85,'#fff0d7',.22)
    circle(c,751,124,45,p.moon,p.moonOpacity)
  }
  // A comet that may pass across the night sky; independent of scenery.
  const t=(time+37)%37
  if(t<3.7){let x=1044-t*260,y=57+t*37;c.save();c.globalAlpha=Math.min(1,t,.85,(3.7-t));const g=c.createLinearGradient(x+105,y-45,x,y);g.addColorStop(0,'transparent');g.addColorStop(1,'#fff3dd');stroke(c,[[x+105,y-45],[x,y]],g,2.6,.9);halo(c,x,y,13,'#fff7e0',.35);circle(c,x,y,3,'#fff8e2');c.restore()}
}
function drawStars(c:CanvasRenderingContext2D,p:Palette,time:number){
  c.save();c.globalAlpha=p.starOpacity
  for(const star of stars){
    let a=star.a*(star.twinkle? .55+.45*(.5+.5*Math.sin(time*(.9+(star.x%9)*.12)+star.phase)):1)
    circle(c,star.x,star.y,star.r,star.x%7<3?'#fff9ee':'#e5efff',a)
    if(star.cross){stroke(c,[[star.x-5,star.y],[star.x+5,star.y]],'#fff2db',.8,a*.8);stroke(c,[[star.x,star.y-5],[star.x,star.y+5]],'#fff2db',.8,a*.8)}
  }
  c.restore()
}
function paintAurora(c:CanvasRenderingContext2D,p:Palette,time:number,strong=false){
  const k=Math.sin(time*.15)*12
  ribbon(c,117+k,35,.6+time*.017,'#90eecb',strong?67:44,strong?.26:.13)
  ribbon(c,153+k,44,.9+time*.016,'#c5a0ed',strong?76:47,strong?.23:.13)
  ribbon(c,186+k,21,1.2+time*.015,'#9cdee0',strong?31:28,strong?.16:.10)
}
function paintNebula(c:CanvasRenderingContext2D,p:Palette,kind:Scenery,time:number){
  const mid=kind==='auroraforest'?100:200
  const drift=Math.sin(time*.12)*15
  ellipse(c,190+drift,mid,350,160,p.cloudA,.12,-.18)
  ellipse(c,715-drift,mid+40,380,185,p.cloudB,.14,-.14)
  const grad=c.createLinearGradient(0,50,0,360);grad.addColorStop(0,'#78d6dd00');grad.addColorStop(.4,p.cloudA);grad.addColorStop(.66,p.cloudB);grad.addColorStop(1,'#e8b5d000')
  ribbon(c,193,30,1.2+time*.01,grad,84,.22)
  ribbon(c,257,30,2+time*.008,p.cloudB,53,.15)
  if(kind==='nebula'){
    ribbon(c,158,19,1+time*.007,'#b5efd8',34,.15)
    ribbon(c,309,29,2.5+time*.01,'#f5bed5',48,.11)
  }
  if(kind==='auroraforest')paintAurora(c,p,time,true)
}
function drawLookout(c:CanvasRenderingContext2D,p:Palette){
  poly(c,[[-36,435],[403,424],[575,477],[452,541],[-25,541]],p.platformSide)
  poly(c,[[-29,430],[402,420],[566,473],[433,505],[-30,481]],p.platformTop)
  stroke(c,[[-29,430],[402,420],[566,473]],'#fff0dc',2,.4)
  stroke(c,[[-20,484],[434,507],[566,473]],'#24283b',2,.37)
  ellipse(c,317,461,133,16,'#2d334c',.09)
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
/** All landscape colors, forms, atmospheric layers and motion are painted with Canvas 2D commands. */
export function paintWorld(c:CanvasRenderingContext2D,kind:Scenery,light:Light,weather:Weather,time:number,moment=0,mode:'cabin'|'vista'='vista',momentAction:MomentAction|null=null,momentAge=99){
  const p=palettes[kind][light]
  c.clearRect(0,0,W,H)
  c.fillStyle=gradient(c,p.sky,0,H);c.fillRect(0,0,W,H)
  paintNebula(c,p,kind,time)
  if(kind==='canyon')halo(c,754,198,185,'#ffe4b9',.08)
  drawStars(c,p,time)
  planet(c,kind,p,time)
  hills(c,p,kind,time)
  if(mode==='vista')drawLookout(c,p)
  // Event lights sit above the terrain so snow drawings or ripples stay visible.
  if(mode==='vista'&&moment>0)drawMoment(c,kind,time,momentAction,momentAge)
  drawWeather(c,weather,time,p)
  drawDust(c,time)
}
