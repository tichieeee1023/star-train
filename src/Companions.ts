/**
 * 선실의 소녀와 고양이를 Canvas로 그립니다 (v2.7).
 * 자세를 코드로 보간하기 때문에 '간식 먹기', '고양이가 깨서 소녀를 바라보기' 같은 동작을
 * 장면별 그림 없이 만들 수 있습니다. 좌표계는 galaxy-cabin.svg 의 viewBox(960x600)와 같습니다.
 */
import {TAU,clamp,lerp,smooth,sparkle} from './PaintKit'
import type {SnackId} from './TrainLife'
type Ctx=CanvasRenderingContext2D
export type Script='snack'|'glance'|'twitch'|'pet'

/* ───────── 바깥(게임)에서 부르는 신호 ───────── */
let pending:{kind:Script;id?:SnackId;stamp:number}|null=null
/** 간식을 먹이면 호출: 객실 화면이 열려 있지 않아도 90초 안에 열리면 재생됩니다. */
export function triggerSnack(id:SnackId){pending={kind:'snack',id,stamp:Date.now()}}
export function triggerPet(){pending={kind:'pet',stamp:Date.now()}}
export function takePending(){
  if(!pending)return null
  const p=pending;pending=null
  return Date.now()-p.stamp<90000?p:null
}

/* ───────── 자세 ───────── */
export type Pose={
  kind:Script|'idle';e:number;snack:SnackId|null
  catEye:number;catLook:number;catDown:number;catChew:number;catHappy:number;catTail:number;catEar:number;catLick:number;catFood:number;catBite:number
}
const ramp=(e:number,a:number,b:number)=>smooth(a,b,e)
export const scriptLength:Record<Script,number>={snack:11.5,glance:7,twitch:1.3,pet:4.2}
export const idlePose=():Pose=>({kind:'idle',e:0,snack:null,catEye:0,catLook:0,catDown:0,catChew:0,catHappy:0,catTail:0,catEar:0,catLick:0,catFood:0,catBite:0})
export function poseOf(kind:Script,e:number,snack:SnackId|null=null):Pose{
  const p=idlePose();p.kind=kind;p.e=e;p.snack=snack
  if(kind==='snack'){
    p.catEye=ramp(e,.3,1.2)*(1-ramp(e,9.6,11))
    p.catLook=ramp(e,1.1,2)*(1-ramp(e,4.3,5.1))
    p.catFood=ramp(e,3.9,4.5)*(1-ramp(e,9.4,10))
    p.catDown=ramp(e,4.5,5.5)*(1-ramp(e,8.6,9.4))
    p.catChew=p.catDown>.85?.5+.5*Math.sin(e*13):0
    p.catBite=clamp((e-5.6)/2.8,0,3)
    p.catTail=ramp(e,4.4,5.2)*(1-ramp(e,9.2,10.4))
    p.catLick=ramp(e,8.7,9.1)*(1-ramp(e,9.5,10))
    p.catHappy=ramp(e,8.8,9.5)*(1-ramp(e,10.2,11.2))
    p.catEar=ramp(e,1,1.4)*(1-ramp(e,2.2,2.8))
  }else if(kind==='glance'){
    p.catEye=.9*ramp(e,.3,1.1)*(1-ramp(e,5.2,6.4))
    p.catLook=ramp(e,.9,1.7)*(1-ramp(e,4.3,5.3))
    p.catTail=.5*ramp(e,1.4,2)*(1-ramp(e,3.6,4.4))
  }else if(kind==='twitch'){
    p.catEar=Math.sin(e*TAU*2.6)*Math.exp(-e*1.7)
  }else{
    p.catHappy=ramp(e,0,.4)*(1-ramp(e,3.2,4.1))
    p.catTail=ramp(e,.2,.8)*(1-ramp(e,3,4))
    p.catLook=.6*ramp(e,.2,.8)*(1-ramp(e,2.8,3.6))
  }
  return p
}

/* ───────── 도형 ───────── */
const P=(d:string)=>new Path2D(d)
const HAIR=P('M194 386Q181 357 196 328Q207 299 237 296Q271 295 286 325Q296 347 282 382Q281 406 290 430Q281 437 272 431Q263 444 254 430Q242 444 231 435Q219 448 208 433Q198 442 190 426Q195 411 194 386Z')
const DRESS=P('M188 405Q169 413 161 442L166 475Q156 512 145 539Q173 556 218 557Q271 561 316 540Q303 499 296 469L300 444Q292 415 269 404Q222 399 188 405Z')
const CATBODY=P('M688 473Q691 448 725 443Q774 435 804 452Q824 457 820 481Q789 494 727 490Q698 487 688 473Z')
const CATHEAD=P('M792 456Q794 443 806 435L821 444L840 434Q849 447 846 463Q847 483 822 485Q798 483 792 466Z')
const STAR=P('M0-14L3.5-4.8L13.5-4.4L5.7 2L8.3 11.8L0 6.8L-8.3 11.8L-5.7 2L-13.5-4.4L-3.5-4.8Z')
const SKIN='#e7c4b5',SLEEVE='#263960'

function lin(c:Ctx,x0:number,y0:number,x1:number,y1:number,stops:[number,string][]){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,col])=>g.addColorStop(o,col));return g}
function stroke(c:Ctx,d:Path2D|string,color:string,w:number,a=1,cap:CanvasLineCap='round'){c.save();c.globalAlpha=a;c.strokeStyle=color;c.lineWidth=w;c.lineCap=cap;c.stroke(typeof d==='string'?P(d):d);c.restore()}
function fill(c:Ctx,d:Path2D|string,color:string|CanvasGradient,a=1){c.save();c.globalAlpha=a;c.fillStyle=color;c.fill(typeof d==='string'?P(d):d);c.restore()}

/** 어깨-팔꿈치-손목을 둥근 관절로 이은 소매. 테두리 → 본색 순서로 칠해 이음매가 보이지 않는다. */
function limb(c:Ctx,pts:[number,number][],radii:number[]){
  for(const pass of [0,1]){
    c.save();c.fillStyle=pass?SLEEVE:'rgba(98,123,173,.5)'
    const grow=pass?0:1.5
    for(let i=0;i<pts.length-1;i++){
      const [x0,y0]=pts[i],[x1,y1]=pts[i+1],r0=radii[i]+grow,r1=radii[i+1]+grow,a=Math.atan2(y1-y0,x1-x0)+Math.PI/2
      c.beginPath();c.moveTo(x0+Math.cos(a)*r0,y0+Math.sin(a)*r0);c.lineTo(x1+Math.cos(a)*r1,y1+Math.sin(a)*r1)
      c.lineTo(x1-Math.cos(a)*r1,y1-Math.sin(a)*r1);c.lineTo(x0-Math.cos(a)*r0,y0-Math.sin(a)*r0);c.closePath();c.fill()
      c.beginPath();c.arc(x1,y1,r1,0,TAU);c.fill()
    }
    c.beginPath();c.arc(pts[0][0],pts[0][1],radii[0]+grow,0,TAU);c.fill();c.restore()
  }
}

/* ───────── 간식 ───────── */
type SnackShape='cookie'|'cup'|'milk'|'corn'|'jelly'|'cone'|'box'|'fish'
const shapeOf:Record<SnackId,SnackShape>={stardust:'cookie',cocoa:'cup',moonmilk:'milk',cometcorn:'corn',nebula:'jelly',icecream:'cone',moontart:'fish',galaxybox:'box'}
function snackItem(c:Ctx,shape:SnackShape,x:number,y:number,s:number,t:number){
  if(s<=.04)return
  c.save();c.translate(x,y);c.scale(s,s)
  if(shape==='cookie'){
    c.fillStyle='#e8bd86';c.strokeStyle='#b78558';c.lineWidth=1.4;c.beginPath();c.arc(0,0,9,0,TAU);c.fill();c.stroke()
    fill(c,STAR,'#fff5d6',.9);c.fillStyle='#8f6644';for(const [dx,dy] of [[-4,-3],[4,3],[-3,4],[5,-4]]){c.beginPath();c.arc(dx,dy,.9,0,TAU);c.fill()}
  }else if(shape==='cup'||shape==='milk'){
    c.fillStyle=shape==='cup'?'#ecd7c6':'#f1f2f8';c.strokeStyle='#fff5e7';c.lineWidth=1
    c.beginPath();c.moveTo(-8,-5);c.lineTo(8,-5);c.lineTo(6,8);c.lineTo(-6,8);c.closePath();c.fill();c.stroke()
    c.strokeStyle=c.fillStyle;c.lineWidth=2.4;c.beginPath();c.arc(9,1,4,-1.2,1.4);c.stroke()
    c.fillStyle=shape==='cup'?'#7a4a3a':'#fff8ee';c.beginPath();c.ellipse(0,-5,8,2.2,0,0,TAU);c.fill()
    for(let i=0;i<2;i++){c.globalAlpha=.4;c.strokeStyle='#fff';c.lineWidth=1.4;c.beginPath();c.moveTo(-3+i*6,-8);c.quadraticCurveTo(-6+i*6+Math.sin(t*2+i)*2,-14,-3+i*6,-19);c.stroke()}
  }else if(shape==='corn'){
    c.fillStyle='#e8e2f0';c.beginPath();c.moveTo(-8,-2);c.lineTo(8,-2);c.lineTo(6,10);c.lineTo(-6,10);c.closePath();c.fill()
    c.fillStyle='#d97a8a';for(const x of [-5,0,5]){c.fillRect(x-1,-2,2,12)}
    c.fillStyle='#fff3d0';for(const [dx,dy,r] of [[-5,-4,4],[0,-7,4.4],[5,-4,4],[-1,-3,3.6]]){c.beginPath();c.arc(dx,dy,r,0,TAU);c.fill()}
  }else if(shape==='jelly'){
    for(const [dx,dy,col] of [[-6,2,'#ff9fc8'],[6,2,'#9fd0ff'],[0,-6,'#c9a6ff']] as [number,number,string][]){
      const g=c.createRadialGradient(dx,dy,0,dx,dy,12);g.addColorStop(0,col);g.addColorStop(1,'rgba(255,255,255,0)');c.globalAlpha=.55+.3*Math.sin(t*3+dx);c.fillStyle=g;c.fillRect(dx-12,dy-12,24,24)
      c.globalAlpha=.95;c.fillStyle=col;c.beginPath();c.arc(dx,dy,4.4,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(dx-1.2,dy-1.4,1.2,0,TAU);c.fill()
    }
  }else if(shape==='cone'){
    c.fillStyle='#e2b27a';c.beginPath();c.moveTo(-6,0);c.lineTo(6,0);c.lineTo(0,16);c.closePath();c.fill()
    c.fillStyle='#9fc7ff';c.beginPath();c.arc(0,-2,7,0,TAU);c.fill();c.fillStyle='#e0ecff';c.beginPath();c.arc(0,-9,5.4,0,TAU);c.fill()
    c.fillStyle='#fff';c.beginPath();c.arc(-2,-10,1.4,0,TAU);c.fill()
  }else if(shape==='box'){
    c.fillStyle='#f0d0dc';c.strokeStyle='#fff0f4';c.lineWidth=1;c.beginPath();c.roundRect(-10,-6,20,13,3);c.fill();c.stroke()
    fill(c,STAR,'#ffd98a',1);c.fillStyle='rgba(120,70,90,.25)';c.fillRect(-10,-6,20,3)
  }else{ // fish: 생선 모양 과자
    c.fillStyle='#e9c185';c.strokeStyle='#b78558';c.lineWidth=1.2
    c.beginPath();c.moveTo(-10,0);c.quadraticCurveTo(-2,-8,7,0);c.quadraticCurveTo(-2,8,-10,0);c.moveTo(6,0);c.lineTo(12,-5);c.lineTo(12,5);c.closePath();c.fill();c.stroke()
    c.fillStyle='#6a4a3a';c.beginPath();c.arc(-6,-1,1,0,TAU);c.fill()
  }
  c.restore()
}

/* ───────── 소녀 ───────── */
function drawGirl(c:Ctx,p:Pose,t:number,calm:boolean){
  const breath=calm?0:Math.sin(t*1.25)*.0035,sway=calm?0:Math.sin(t*.7)*.003
  fillShadow(c)
  // 다리와 옷단
  fill(c,'M176 508Q182 529 181 564L221 574L243 565L256 574L299 559Q294 532 286 513Z','#26365b')
  stroke(c,'M172 553Q215 571 258 568Q287 566 306 557','#cdc5d0',3,.28)
  c.save();c.translate(232,560);c.scale(1,1+breath);c.translate(-232,-560)
  // 원피스
  fill(c,DRESS,lin(c,0,404,0,561,[[0,'#182443'],[.28,'#233960'],[.66,'#3d5487'],[1,'#778bc1']]))
  stroke(c,DRESS,'#a2b4d8',2,.4)
  stroke(c,'M195 473Q190 513 174 543M226 474Q222 519 220 551M264 473Q276 519 290 541','#d5ddf7',3,.2)
  stroke(c,'M152 539Q220 561 309 540','#c1cdeb',3,.28)
  c.save();c.clip(DRESS)
  fill(c,'M140 400H330V565H140Z',lin(c,140,400,330,500,[[0,'rgba(191,233,244,.2)'],[.5,'rgba(191,233,244,0)'],[1,'rgba(255,217,168,.16)']]))
  stroke(c,'M205 478Q198 515 182 548M240 476Q238 520 236 556M272 474Q286 516 304 546','#0b1230',5,.17)
  stroke(c,'M196 478Q190 515 175 548M232 476Q229 520 227 556','#cfd9f6',2.4,.16)
  fill(c,'M150 538Q220 561 314 538L316 560H140Z','#0b1230',.25)
  stroke(c,'M161 442L166 475Q156 512 145 539','#a9e8f3',2.4,.5);stroke(c,'M300 444L296 469Q303 499 316 540','#ffd7a4',2.4,.5)
  c.restore()
  c.save();c.fillStyle='#d9e4ff';c.globalAlpha=.78
  for(const [x,y,r] of [[218,470,1.7],[251,485,1.1],[194,510,1.3],[277,522,1.5],[219,534,1.4],[238,515,1]]){c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
  c.restore();stroke(c,'M248 525v8m-4-4h8M182 493v5m-2.5-2.5h5','#d9def7',1.3,.68)
  stroke(c,'M174 470Q232 482 290 470','#b8c6ea',4,.55)
  c.save();c.translate(232,474)
  fill(c,'M0 0Q-18-12-26-4Q-22 8-4 5Z','#7f95cf');stroke(c,'M0 0Q-18-12-26-4Q-22 8-4 5Z','#c9d6f4',1,.6)
  fill(c,'M0 0Q18-12 26-4Q22 8 4 5Z','#7a8fca');stroke(c,'M0 0Q18-12 26-4Q22 8 4 5Z','#c9d6f4',1,.6)
  stroke(c,'M-3 4Q-10 18-14 30M3 4Q10 16 15 28','#8ea3d8',3)
  c.fillStyle='#a9bbe8';c.beginPath();c.arc(0,0,3.6,0,TAU);c.fill();c.restore()
  // 왼팔(고정) · 오른팔(간식을 들어올림)
  limb(c,[[182,430],[160,473],[151,512]],[11,9,7.5])
  limb(c,[[283,430],[303,473],[315,512]],[11,9,7.5])
  for(const [hx,hy] of [[151,514],[315,514]]){c.fillStyle=SKIN;c.strokeStyle='#e3baae';c.lineWidth=1;c.beginPath();c.arc(hx,hy,7,0,TAU);c.fill();c.stroke()}
  stroke(c,'M186 409Q168 419 159 445','#f6dbcf',2,.38)
  c.restore()
  // 머리: 항상 뒷모습으로 둔다
  c.save()
  const lift=-breath*170
  c.translate(237,425+lift);c.rotate(sway);c.translate(-237,-425)
  fill(c,'M213 395L212 424L246 430L261 405Z','#d3aca8')
  fill(c,HAIR,lin(c,200,296,296,448,[[0,'#242438'],[.5,'#39314a'],[1,'#534458']]))
  stroke(c,HAIR,'#2d2b42',2)
  stroke(c,'M237 302Q221 341 226 370Q224 396 234 427','#78677d',4,.45);stroke(c,'M255 305Q269 343 266 387Q267 404 261 429','#160f30',4,.46);stroke(c,'M201 333Q195 381 203 405','#b0a0a5',3,.13)
  c.save();c.clip(HAIR)
  const sh=c.createLinearGradient(192,0,288,0);sh.addColorStop(0,'rgba(216,205,242,0)');sh.addColorStop(.45,'rgba(216,205,242,.5)');sh.addColorStop(1,'rgba(216,205,242,0)')
  stroke(c,'M192 335Q238 304 288 334',sh as unknown as string,9,.75);stroke(c,'M196 348Q240 322 286 346',sh as unknown as string,4,.5)
  fill(c,'M186 296H296V446H186Z',lin(c,0,296,0,446,[[.55,'rgba(13,10,28,0)'],[1,'rgba(13,10,28,.42)']]))
  stroke(c,'M214 316Q205 360 212 420M226 308Q219 360 224 428M248 306Q250 360 246 428M262 312Q272 362 266 424M276 330Q284 372 280 414','#f1e8ff',1.2,.16)
  stroke(c,'M194 386Q181 357 196 328Q207 299 237 296','#a6e6f2',3.2,.5);stroke(c,'M262 297Q295 336 283 383','#ffd7a4',3,.5)
  c.restore()
  fill(c,'M208 429a30 6 0 1 0 60 0a30 6 0 1 0 -60 0','#0d1230',.28)
  c.save();c.translate(268,335);c.rotate(.157)
  c.fillStyle=lin(c,-13,-14,12,12,[[0,'#fff6c5'],[.45,'#f6d37a'],[1,'#d99846']]);c.fill(STAR);c.lineJoin='round';c.strokeStyle='#9f744a';c.lineWidth=1.8;c.stroke(STAR)
  stroke(c,'M-2-6L0-10L2-5','#fff8db',1.1,.8);c.restore()
  c.restore()
}
function fillShadow(c:Ctx){fill(c,'M121 562a107 17 0 1 0 214 0a107 17 0 1 0 -214 0','#131b35',.31)}

/* ───────── 고양이 ───────── */
function drawCat(c:Ctx,p:Pose,t:number,calm:boolean){
  const breath=calm?0:(1+Math.sin(t*1.31)*.0145),wag=p.catTail
  // 꼬리: 평소엔 느리게 흔들고, 기분이 좋으면 크게 흔든다
  const base=calm?0:Math.sin(t*.8)*.06+Math.sin(t*2.1)*.02
  c.save();c.translate(701,472);c.rotate(base+wag*Math.sin(t*5.5)*.22-wag*.12);c.translate(-701,-472)
  stroke(c,'M701 472Q677 458 658 461Q646 464 648 450Q652 431 670 440','#e3e6ec',13);stroke(c,'M648 451Q650 435 667 439','#fffefd',3)
  c.restore()
  c.save();c.translate(752,492);c.scale(1+(breath-1)*.4,breath);c.translate(-752,-492)
  fill(c,'M677 474a75 26 0 1 0 150 0a75 26 0 1 0 -150 0','#aa9dab',.3)
  fill(c,CATBODY,lin(c,688,443,780,491,[[0,'#fffdf9'],[.52,'#f3f1f3'],[1,'#c9cfdd']]));stroke(c,CATBODY,'#fff6ec',2,.55)
  c.save();c.clip(CATBODY)
  fill(c,'M684 440H824V496H684Z',lin(c,0,440,0,496,[[.45,'rgba(142,134,168,0)'],[1,'rgba(142,134,168,.42)']]))
  stroke(c,'M692 462Q698 447 725 443Q774 435 804 452','#bfeaf6',3,.7)
  stroke(c,'M706 456l-4 3M720 450l-3 4M742 449l-2 4M764 450l-2 4M786 454l-1 4M700 472l-4 1M712 482l-4 1','#cfd3e2',1.1,.6)
  c.restore()
  fill(c,'M758 485a15 6 0 1 0 30 0a15 6 0 1 0 -30 0','#fefcf9')
  stroke(c,'M729 445Q755 454 757 476','#ffffff',3,.45)
  c.restore()
  // 머리: 소녀 쪽(왼쪽)으로 돌아보고, 간식 쪽(왼쪽 아래)으로 숙인다
  const down=p.catDown,look=p.catLook,chew=p.catChew
  const hx=-look*3-down*17+Math.sin(t*14)*chew*.9,hy=down*14+chew*Math.abs(Math.sin(t*13))*1.4+(calm?0:Math.sin(t*1.31)*.5)
  c.save();c.translate(806+hx,470+hy);c.rotate(-look*.09-down*.22+(p.catHappy>.2?.05:0));c.translate(-806,-470)
  fill(c,CATHEAD,lin(c,792,434,846,485,[[0,'#fffdf9'],[.52,'#f3f1f3'],[1,'#c9cfdd']]));stroke(c,CATHEAD,'#ddcbd0',1.5)
  // 귀 (오른쪽 귀는 쫑긋)
  const e=p.catEar
  fill(c,'M800 445L805 431L816 439',"#f9f7f6");stroke(c,'M800 445L805 431L816 439','#d5d9e2',1.4)
  c.save();c.translate(836,440);c.rotate(e*.28);c.translate(-836,-440)
  fill(c,'M828 441L842 431L847 449','#f9f7f6');stroke(c,'M828 441L842 431L847 449','#d5d9e2',1.4);fill(c,'M836 442L842 437L842 447','#e5bfc7',.8);c.restore()
  fill(c,'M804 444L806 437L811 441','#e5bfc7',.8)
  stroke(c,'M793 450Q797 441 805 435','#c9eef7',1.4,.5)
  // 눈: 자는 눈 · 기분 좋은 눈 · 뜬 눈(소녀 쪽을 향한 눈동자)
  const open=p.catEye,happy=p.catHappy
  if(happy>.3){stroke(c,'M808 466q5 -5 10 0m10 0q5 -5 10 0','#70606b',1.7)}
  else if(open<.14){stroke(c,'M808 464q5 4 10 0m10 0q5 4 10 0','#70606b',1.6)}
  else for(const ex of [813,833]){
    c.save();c.beginPath();c.ellipse(ex,464,5.2,5.4*open,0,0,TAU);c.clip()
    c.fillStyle='#8fc0ea';c.fillRect(ex-6,456,12,16)
    c.fillStyle='#2c2438';c.beginPath();c.ellipse(ex-look*1.9,464,1.7+(1-open)*1.5,4.6,0,0,TAU);c.fill()
    c.fillStyle='#fff';c.beginPath();c.arc(ex-look*1.9-1.1,462,1,0,TAU);c.fill();c.restore()
    stroke(c,`M${ex-5.4} 463.5a5.4 ${5.6*open} 0 0 1 10.8 0`,'#70606b',1.1,.7)
  }
  fill(c,'M819 469q3 2 6 0q-3 5-6 0','#aa858c')
  if(p.catChew>0||down>.5){const m=chew*2.4;if(m>.2)fill(c,`M819 ${472} q3 ${m+2} 6 0q-3 ${m+2}-6 0`,'#7e5662',.9)}
  if(p.catLick>.05){fill(c,`M820 ${474+p.catLick*2}a3 ${2+p.catLick*3} 0 1 0 5 0a3 ${2+p.catLick*3} 0 1 0 -5 0`,'#f08fa6',p.catLick)}
  stroke(c,'M811 474L798 472M830 475L844 471','#c4c8d0',.9)
  stroke(c,'M790 468l4 5 4-4 4 5 4-5','#f2eef0',1.6)
  fill(c,'M802.5 473a5.5 3 0 1 0 11 0a5.5 3 0 1 0 -11 0','#f2b9c4',.4+happy*.25);fill(c,'M830.5 474a5.5 3 0 1 0 11 0a5.5 3 0 1 0 -11 0','#f2b9c4',.38+happy*.25)
  c.restore()
}

/* ───────── 노트·찻잔 김 · 접시 ───────── */
function drawProps(c:Ctx,p:Pose,t:number,calm:boolean){
  c.save();c.translate(694,491)
  fill(c,'M0 0l26-6 26 2-24 7Z','#f7e1c9');stroke(c,'M0 0l26-6 26 2-24 7Z','#aa8f91',1);stroke(c,'M25 -5v7','#c9b0a7',1);stroke(c,'M9 -1l14-3M31 -3l11 1','#bba4aa',.8,.7)
  c.restore()
  // 찻잔의 김 (움직이는 가느다란 곡선)
  c.save();c.translate(869,477)
  for(let i=0;i<2;i++){const w=calm?0:Math.sin(t*1.4+i*2)*2.2;stroke(c,`M${-6+i*9} -8Q${-10+i*9+w} -17 ${-5+i*9-w*.5} -24`,'#f2e4e5',2,.32)}
  c.restore()
  // 고양이 접시
  if(p.catFood>.02&&p.snack){
    c.save();c.globalAlpha=p.catFood
    c.fillStyle='#d8c6c8';c.strokeStyle='#fff3e8';c.lineWidth=1;c.beginPath();c.ellipse(792,498,19,4.6,0,0,TAU);c.fill();c.stroke()
    const sh=shapeOf[p.snack],milk=sh==='cup'||sh==='milk'
    if(milk){c.fillStyle='#fffaf0';c.beginPath();c.ellipse(792,497,14,3,0,0,TAU);c.fill()}
    else snackItem(c,'fish',792,494.5,.9*(1-p.catBite*.3),t)
    c.restore()
  }
}

/* ───────── 반짝이는 부스러기 ───────── */
function drawSparkles(c:Ctx,p:Pose){
  if(p.catDown>.6&&p.catChew>0){
    for(let i=0;i<4;i++){const ph=((p.e*1.3+i*.25)%1);sparkle(c,790-ph*14+i*3,490-ph*16,1.6,'#fff0c8',(1-ph)*.6)}
  }
}

/** 한 프레임을 그린다. calm=true 이면 숨쉬기·흔들림 없이 정지 상태로 그린다(모션 줄이기). */
export function drawCompanions(c:Ctx,p:Pose,t:number,calm=false){
  drawGirl(c,p,t,calm)
  drawCat(c,p,t,calm)
  drawProps(c,p,t,calm)
  drawSparkles(c,p)
}


/* ───────── 풍경 보기(Vista): 서 있는 소녀와 앉아 있는 고양이 (960x540 좌표계) ───────── */
const VHAIR=P('M-26-126Q-26-152-5-158Q17-162 29-145Q35-133 32-117L37-93Q39-81 30-82Q22-80 19-90Q0-80-14-88Q-20-81-29-85Q-35-91-30-108Z')
const VDRESS=P('M-18-89Q-33-87-36-71L-25-55Q-28-42-39-23Q-47-11-43-9Q-4-2 40-10Q44-14 38-24Q26-45 27-56L37-72Q31-88 17-90Z')
const VCATBODY=P('M280 453Q279 443 284 437Q289 430 298 431Q309 430 313 440Q318 449 313 458Q299 464 284 458Z')
const VCATHEAD=P('M283 432L280 417Q280 414 285 417L291 423Q299 421 305 423L315 415Q319 413 318 419L317 433Q317 445 303 447Q285 449 283 435Z')
function vistaGirl(c:Ctx,p:Pose,t:number,calm:boolean){
  const breath=calm?0:Math.sin(t*1.25)*.004,wind=calm?0:Math.sin(t*.6)*.007+Math.sin(t*1.7)*.003
  c.save();c.globalAlpha=.18;c.fillStyle='#22273f';c.beginPath();c.ellipse(229,462,48,7,0,0,TAU);c.fill();c.restore()
  c.save();c.translate(220,452)
  fill(c,'M-14-20L-14 3Q-23 5-25 9Q-25 13-17 13H-1Q2 11-1 6L-3-17Z','#2b2c47');fill(c,'M8-19L10 3Q15 5 21 9Q25 13 18 13H3Q0 11 3 5L1-18Z','#252b46')
  stroke(c,'M-21 9Q-12 8-2 9M6 9Q13 8 21 10','#7d7693',1.3,.34)
  // 바람에 몸이 아주 살짝 흔들린다 (발 쪽은 고정)
  c.translate(0,-9);c.transform(1,0,wind,1,0,0);c.scale(1,1+breath);c.translate(0,9)
  const dg=lin(c,-47,-90,-34,-2,[[0,'#182443'],[.28,'#233960'],[.66,'#3d5487'],[1,'#778bc1']])
  fill(c,VDRESS,dg);stroke(c,VDRESS,'#9baad5',1.6,.38)
  fill(c,'M-24-85Q-36-83-39-70Q-41-55-43-37L-43-26Q-39-21-34-27L-32-44L-27-68Z','#253a67');stroke(c,'M-24-85Q-36-83-39-70Q-41-55-43-37L-43-26Q-39-21-34-27L-32-44L-27-68Z','#92a7d2',1.2,.28)
  fill(c,'M24-85Q36-82 39-70Q41-55 43-36L43-25Q39-20 34-26L32-44L27-68Z','#263961');stroke(c,'M24-85Q36-82 39-70Q41-55 43-36L43-25Q39-20 34-26L32-44L27-68Z','#92a7d2',1.2,.28)
  fill(c,'M-43-27Q-44-18-40-17Q-36-17-35-26M35-26Q36-17 40-17Q44-19 43-26','#e3b9af');stroke(c,'M-43-27Q-44-18-40-17Q-36-17-35-26M35-26Q36-17 40-17Q44-19 43-26','#dfb2ae',.8)
  c.save();c.clip(VDRESS)
  fill(c,'M-50-92H50V0H-50Z',lin(c,-50,-92,50,-30,[[0,'rgba(191,233,244,.22)'],[.5,'rgba(191,233,244,0)'],[1,'rgba(255,217,168,.18)']]))
  stroke(c,'M-12-50Q-14-30-22-12M10-50Q12-28 20-10','#0b1230',5,.28)
  fill(c,'M-44-12Q0-2 42-12L44 4H-48Z','#0b1230',.25)
  stroke(c,'M-36-71L-25-55Q-28-42-39-23','#a9e8f3',1.6,.5);stroke(c,'M37-72L27-56Q26-45 38-24','#ffd7a4',1.6,.5)
  c.restore()
  stroke(c,'M-21-60Q0-55 24-61','#aec2e7',1.3,.32);stroke(c,'M-17-57Q-19-32-29-14M-2-57Q-2-28-7-9M14-56Q19-33 27-13','#c0cceb',1.8,.2)
  stroke(c,'M-39-11Q0-4 39-11','#c5c8ec',2,.47)
  c.save();c.fillStyle='#dbe2f7';c.globalAlpha=.75
  for(const [x,y,r] of [[-22,-14,1.4],[-1,-11,1],[15,-26,1.3],[-9,-36,1.2],[8,-49,.8]]){c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
  c.restore();stroke(c,'M21-18v5M18.5-15.5h5M-24-44v5M-26.5-41.5h5','#d9d5f1',.9,.68)
  stroke(c,'M-25-44Q0-37 27-44','#b8c6ea',2.4,.55)
  c.save();c.translate(1,-41)
  fill(c,'M0 0Q-11-7-16-2Q-13 5-2 3Z','#7f95cf');fill(c,'M0 0Q11-7 16-2Q13 5 2 3Z','#7a8fca');stroke(c,'M-2 2Q-6 11-8 18M2 2Q6 10 9 17','#8ea3d8',2);fill(c,'M-2.2 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0','#a9bbe8');c.restore()
  fill(c,'M-9-86L-7-104L13-104L15-86Z','#d7aaa7')
  // 머리: 바람에 머리카락이 한 박자 늦게 흔들리고, 고양이가 깨어 있으면 슬쩍 그쪽으로 기울인다
  c.save();c.translate(3,-96);c.rotate(wind*1.6-(calm?0:Math.sin(t*.6-.8)*.004)+p.catLook*.045);c.translate(-3,96)
  fill(c,VHAIR,lin(c,-26,-158,40,-82,[[0,'#242338'],[.55,'#34314b'],[1,'#48405d']]));stroke(c,VHAIR,'#4f4966',1.3,.55)
  stroke(c,'M-9-153Q-15-124-12-99M6-155Q9-124 10-93M20-148Q26-124 25-99','#9a8ead',2.5,.3)
  c.save();c.clip(VHAIR)
  const sh=c.createLinearGradient(-24,0,30,0);sh.addColorStop(0,'rgba(216,205,242,0)');sh.addColorStop(.5,'rgba(216,205,242,.55)');sh.addColorStop(1,'rgba(216,205,242,0)')
  stroke(c,'M-24-130Q2-150 30-132',sh as unknown as string,6,.8)
  fill(c,'M-40-160H44V-84H-40Z',lin(c,0,-160,0,-84,[[.5,'rgba(13,10,28,0)'],[1,'rgba(13,10,28,.4)']]))
  stroke(c,'M-26-126Q-26-152-5-158','#a6e6f2',2.2,.55);stroke(c,'M17-161Q35-140 32-117','#ffd7a4',2,.5)
  c.restore()
  c.save();c.translate(24,-136);c.rotate(.157)
  c.fillStyle=lin(c,-13,-14,12,12,[[0,'#fff6c5'],[.45,'#f6d37a'],[1,'#d99846']]);c.fill(STAR);c.lineJoin='round';c.strokeStyle='#9f744a';c.lineWidth=1.8;c.stroke(STAR);c.restore()
  c.restore()
  c.restore()
}
function vistaCat(c:Ctx,p:Pose,t:number,calm:boolean){
  const wag=p.catTail,sway=calm?0:Math.sin(t*.8)*.05+Math.sin(t*2.1)*.015
  c.save();c.globalAlpha=.19;c.fillStyle='#20283f';c.beginPath();c.ellipse(296,461,27,5.5,0,0,TAU);c.fill();c.restore()
  // 접시: 간식을 줄 때만 오른쪽 바닥에 놓인다
  if(p.catFood>.02){
    c.save();c.globalAlpha=p.catFood;c.fillStyle='#d8c6c8';c.strokeStyle='#fff3e8';c.lineWidth=1;c.beginPath();c.ellipse(337,462,13,3.6,0,0,TAU);c.fill();c.stroke()
    if(p.snack==='cocoa'||p.snack==='moonmilk'){c.fillStyle='#fffaf0';c.beginPath();c.ellipse(337,461.5,9.5,2.2,0,0,TAU);c.fill()}
    else snackItem(c,'fish',337,459,.75*(1-p.catBite*.3),t)
    c.restore()
  }
  c.save();c.translate(284,453);c.rotate(sway+wag*Math.sin(t*5.5)*.2-wag*.1);c.translate(-284,-453)
  stroke(c,'M281 453Q267 452 268 440Q269 427 256 431Q249 434 254 440','#c8cedb',10);stroke(c,'M281 451Q268 449 271 440Q272 432 262 433','#fcfafa',5)
  c.restore()
  const br=calm?0:Math.sin(t*1.31)*.012
  c.save();c.translate(298,460);c.scale(1+br*.4,1+br);c.translate(-298,-460)
  fill(c,VCATBODY,lin(c,280,430,318,464,[[0,'#fffdf9'],[.48,'#f3f1f3'],[1,'#c9cfdd']]));stroke(c,VCATBODY,'#ffffff',1.4,.5)
  fill(c,'M282 456a7 4.5 0 1 0 14 0a7 4.5 0 1 0 -14 0','#e6e7ed');fill(c,'M300.5 456a7.5 4.5 0 1 0 15 0a7.5 4.5 0 1 0 -15 0','#dce1e9')
  c.save();c.clip(VCATBODY)
  fill(c,'M276 428H322V466H276Z',lin(c,0,428,0,466,[[.4,'rgba(142,134,168,0)'],[1,'rgba(142,134,168,.42)']]))
  stroke(c,'M282 441Q285 431 298 431Q309 430 313 440','#bfeaf6',1.6,.7)
  c.restore()
  c.restore()
  // 머리: 소녀가 보이는 쪽(왼쪽)을 돌아보고, 간식 때는 오른쪽 접시로 숙인다
  const look=p.catLook,down=p.catDown,chew=p.catChew
  const rot=-look*.09+down*.16+p.catEar*.05,hx=down*7,hy=down*5+chew*Math.abs(Math.sin(t*13))*1.2+(calm?0:Math.sin(t*1.31)*.35)
  c.save();c.translate(300+hx,444+hy);c.rotate(rot);c.translate(-300,-444)
  fill(c,VCATHEAD,'#f8f6f5');stroke(c,VCATHEAD,'#e0e4ed',1.4,.65)
  fill(c,'M284 419L286 428L292 425Z','#d2aebd',.55);fill(c,'M315 419L309 426L315 429Z','#d2aebd',.55)
  stroke(c,'M297 426Q295 436 299 443','#ffffff',2,.54)
  if(down>.3){ // 접시 쪽으로 숙일 때 드러나는 볼과 코끝
    c.save();c.globalAlpha=smooth(.3,.8,down)
    fill(c,'M316 434Q324 435 323 442Q320 447 314 445Z','#fdf9f8');fill(c,'M321 438a2 1.6 0 1 0 3 0a2 1.6 0 1 0 -3 0','#e5a9b3')
    if(chew>.2)fill(c,`M318 444q3 ${chew*3+1} 6 0q-3 ${chew*3+1} -6 0`,'#7e5662',.7)
    c.restore()
  }
  stroke(c,'M283 424Q284 417 288 420M312 424Q313 417 316 419','#c9eef7',1.2,.6)
  c.restore()
  if(down>.6&&chew>0)for(let i=0;i<3;i++){const ph=((p.e*1.3+i*.33)%1);sparkle(c,330+i*5-ph*3,455-ph*14,1.5,'#fff0c8',(1-ph)*.6)}
}
export function drawVistaPeople(c:Ctx,p:Pose,t:number,calm=false){vistaGirl(c,p,t,calm);vistaCat(c,p,t,calm)}

/* ───────── 시간에 따라 자세를 이끄는 진행기 ───────── */
export class Director{
  private active:{kind:Script;at:number;snack:SnackId|null}|null=null
  private nextIdle=0
  constructor(private calm=false){}
  start(kind:Script,t:number,snack:SnackId|null=null){this.active={kind,at:t,snack}}
  pose(t:number):Pose{
    const pend=takePending()
    if(pend&&(!this.active||this.active.kind==='twitch'||this.active.kind==='glance'||pend.kind==='snack'))this.start(pend.kind,t,pend.id??null)
    if(!this.active){
      if(this.nextIdle===0)this.nextIdle=t+14+Math.random()*20
      if(!this.calm&&t>=this.nextIdle){this.start(Math.random()<.55?'twitch':'glance',t);this.nextIdle=t+22+Math.random()*50}
    }
    if(!this.active)return idlePose()
    const e=t-this.active.at
    if(e>scriptLength[this.active.kind]){this.active=null;return idlePose()}
    return poseOf(this.active.kind,e,this.active.snack)
  }
}
