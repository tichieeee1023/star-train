/**
 * 카나리아 아가씨 — 소녀·고양이와 같은 단순한 Canvas 색면 작풍.
 * 노란 작은 새가 주인공이고, 날개 끝의 크리스탈은 아주 작은 장식입니다.
 * 장면별 크기와 위치는 Companions.ts에서 정합니다.
 */
import {TAU} from './PaintKit'

type Ctx=CanvasRenderingContext2D

export function isCanarySinging(t:number,calm=false){
  if(calm)return false
  const phase=(t+8)%26
  return phase>=17.3&&phase<21.4
}

export interface CanaryLook {
  light?:'#d8efff'|'#ffe3b6'|'#e6caff'|'#acf3dd'
  singing?:boolean
}

function oval(c:Ctx,x:number,y:number,rx:number,ry:number,fill:string,edge?:string){
  c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU)
  c.fillStyle=fill;c.fill()
  if(edge){c.strokeStyle=edge;c.lineWidth=1.2;c.stroke()}
}
function path(c:Ctx,coords:(ctx:Ctx)=>void,color:string,outline?:string){
  c.beginPath();coords(c);c.closePath();c.fillStyle=color;c.fill()
  if(outline){c.strokeStyle=outline;c.lineWidth=1.1;c.lineJoin='round';c.stroke()}
}

/**
 * 본체 원본은 폭 약 65×높이 73px.
 * 실제 출력은 선실 약 0.62배, 행성 약 0.44배로 기존 디자인의 절반 크기입니다.
 * 얼굴과 비슷한 크기의 새가 아니라 작고 동그란 황금빛 카나리아로 보이도록 디자인했습니다.
 */
export function drawCanary(c:Ctx,x:number,y:number,scale:number,t:number,calm=false,look:CanaryLook={}){
  const singing=look.singing??isCanarySinging(t,calm)
  const hover=calm?0:Math.sin(t*1.5)*1.4+Math.sin(t*.7+.7)*.7
  const flap=calm?.45:.5+.40*Math.sin(t*8)
  c.save()
  c.translate(x,y+hover)
  c.scale(scale,scale)
  c.rotate(calm?0:Math.sin(t*.8)*.023)

  // 꼬리깃 두 가닥. 투명한 수정은 끝부분의 작은 색면 하나로만 표현합니다.
  path(c,b=>{b.moveTo(8,14);b.quadraticCurveTo(17,22,20,31);b.quadraticCurveTo(12,29,4,19)},'#deac4b','#a8783b')
  path(c,b=>{b.moveTo(4,15);b.quadraticCurveTo(9,25,9,32);b.quadraticCurveTo(0,28,-1,18)},'#f5cb62')
  path(c,b=>{b.moveTo(16,25);b.lineTo(20,31);b.lineTo(13,28)},'rgba(192,235,244,.85)')

  // 멀리 보이는 반대쪽 날개. 깃털 선을 겹겹이 그리지 않습니다.
  c.save();c.translate(8,-12);c.rotate(.1+flap*.30)
  path(c,b=>{b.moveTo(0,6);b.quadraticCurveTo(7,-7,25,-20);b.quadraticCurveTo(23,-2,6,10)},'#edbd55','#b88b41')
  path(c,b=>{b.moveTo(20,-16);b.lineTo(25,-20);b.lineTo(23,-8)},'rgba(205,243,250,.90)')
  c.restore()

  // 몸통 · 밝은 가슴: 두 개의 평평한 색면만 사용합니다.
  oval(c,0,3,15,20,'#f3c24b','#b88a43')
  oval(c,-6,9,7,12,'#ffe38a')

  // 앞쪽 날개: 둥근 실루엣, 두 음영. 과한 수정깃 무늬는 제거.
  c.save();c.translate(-7,-7);c.rotate(-.12-flap*.24)
  path(c,b=>{b.moveTo(6,1);b.quadraticCurveTo(-9,-8,-27,-18);b.quadraticCurveTo(-29,-3,-17,8);b.quadraticCurveTo(-4,16,6,1)},'#f6d16b','#b88a43')
  path(c,b=>{b.moveTo(-21,-14);b.quadraticCurveTo(-25,-12,-23,-7);b.quadraticCurveTo(-14,1,-8,4);b.quadraticCurveTo(-15,-7,-21,-14)},'#ffe69a')
  path(c,b=>{b.moveTo(-27,-18);b.lineTo(-31,-11);b.lineTo(-23,-7)},'rgba(194,234,244,.9)')
  c.restore()

  // 짧고 동그란 머리: 작지만 카나리아임을 알 수 있는 노란 실루엣.
  oval(c,-3,-19,17,17,'#f9ce55','#b88a43')
  // 정수리의 작은 깃 한 가닥.
  path(c,b=>{b.moveTo(-9,-35);b.quadraticCurveTo(-10,-42,-3,-43);b.quadraticCurveTo(-2,-38,0,-35)},'#f8d673')
  // 작은 부리. 노래할 때만 살짝 벌어집니다.
  path(c,b=>{b.moveTo(-19,-21);b.lineTo(-30,-18);b.lineTo(-19,-15)},'#d99950','#ac763d')
  if(singing){path(c,b=>{b.moveTo(-20,-15);b.lineTo(-27,-12);b.lineTo(-18,-13)},'#ce8848')}
  // 아가씨답게 살짝 치켜뜬 눈과 짧은 눈썹: 작은 크기에서도 읽히는 점과 곡선.
  oval(c,-9,-23,2.2,2.4,'#493c46')
  oval(c,-9.6,-24,.75,.85,'#fff8e9')
  c.beginPath();c.moveTo(-13,-28);c.quadraticCurveTo(-9,-29.5,-5,-27)
  c.strokeStyle='#95703e';c.lineWidth=1.3;c.lineCap='round';c.stroke()

  // 발: 군더더기 없는 두 개의 짧은 곡선.
  c.beginPath();c.moveTo(-4,20);c.lineTo(-5,25);c.lineTo(-9,27)
  c.moveTo(4,20);c.lineTo(5,25);c.lineTo(2,27)
  c.lineWidth=1.8;c.strokeStyle='#b87f3f';c.stroke()

  // 노래할 때만 아주 적은 음표. 새의 크기와 함께 과하게 커지지 않도록 조절.
  if(singing){
    c.save()
    c.font=`${scale<.5?22:18}px Georgia, serif`
    c.fillStyle=look.light??'#ffe6a8'
    c.strokeStyle='#74617c';c.lineWidth=1.5
    for(const [n,nx,ny] of [['♪',-21,-48],['♬',9,-58]] as const){c.strokeText(n,nx,ny);c.fillText(n,nx,ny)}
    c.restore()
  }
  c.restore()
}


/**
 * 전망대 전용 뒷모습 — 소녀·고양이와 나란히 풍경을 바라보는 카나리아.
 * 앞모습과 동일한 작은 황금빛 색면 작풍, 안쪽 눈/부리/가슴 무늬는 보이지 않습니다.
 * 선실의 drawCanary()는 변경하지 않습니다.
 */
export function drawCanaryBack(c:Ctx,x:number,y:number,scale:number,t:number,calm=false,look:CanaryLook={}){
  const singing=look.singing??isCanarySinging(t,calm)
  const hover=calm?0:Math.sin(t*1.5)*1.4+Math.sin(t*.7+.7)*.7
  const flap=calm?.45:.5+.40*Math.sin(t*8)
  c.save()
  c.translate(x,y+hover)
  c.scale(scale,scale)
  c.rotate(calm?0:Math.sin(t*.8)*.023)

  // 멀리 보이는 두 갈래 꼬리깃. 끝부분에만 가볍게 유리빛을 얹습니다.
  path(c,b=>{b.moveTo(-8,14);b.quadraticCurveTo(-11,25,-17,35);b.quadraticCurveTo(-5,32,0,21)},'#f2bd4e','#b88a43')
  path(c,b=>{b.moveTo(6,15);b.quadraticCurveTo(11,26,16,35);b.quadraticCurveTo(3,30,-1,21)},'#dfaa42','#b88a43')
  path(c,b=>{b.moveTo(-17,35);b.lineTo(-10,31);b.lineTo(-13,35)},'rgba(194,234,244,.9)')
  path(c,b=>{b.moveTo(16,35);b.lineTo(9,31);b.lineTo(12,35)},'rgba(194,234,244,.9)')

  // 양쪽으로 펼친 날개를 뒤에서 관찰하는 모습: 큰 곡선 한 개와 수정빛 깃 끝.
  const wing=(left:boolean)=>{
    c.save()
    if(!left)c.scale(-1,1)
    c.translate(-9,-9)
    c.rotate(-.08-flap*.30)
    path(c,b=>{b.moveTo(8,6);b.quadraticCurveTo(-8,-2,-28,-18);b.quadraticCurveTo(-29,-3,-14,11);b.quadraticCurveTo(-2,15,8,6)},left?'#f4c45b':'#e7b247','#b98a3a')
    path(c,b=>{b.moveTo(-28,-18);b.lineTo(-32,-10);b.lineTo(-23,-7)},'rgba(197,237,249,.85)')
    c.restore()
  }
  wing(true);wing(false)

  // 날개 사이로 보이는 작은 등과 동그란 뒤통수.
  oval(c,0,4,14,19,'#eebb4c','#b88941')
  path(c,b=>{b.moveTo(-6,-2);b.quadraticCurveTo(0,3,6,-2);b.lineTo(4,13);b.quadraticCurveTo(0,18,-4,13)},'#f5cc63')
  oval(c,0,-20,16,17,'#f9d15e','#b88941')
  // 정수리의 작은 깃: 좌우로 튀어나온 부리나 눈 대신 뒷모습임을 분명히 합니다.
  path(c,b=>{b.moveTo(-4,-36);b.quadraticCurveTo(-5,-43,2,-44);b.quadraticCurveTo(3,-39,5,-36)},'#ffe082')
  // 비행 중 모으고 있는 작은 발 두 개.
  c.beginPath();c.moveTo(-5,20);c.lineTo(-7,25);c.moveTo(5,20);c.lineTo(7,25)
  c.lineWidth=1.6;c.lineCap='round';c.strokeStyle='#b67c38';c.stroke()

  // 아가씨가 풍경을 보며 노래하면 음표가 뒤통수 위로 떠오릅니다.
  if(singing){
    c.save();c.font='19px Georgia, serif'
    c.fillStyle=look.light??'#ffe6a8';c.strokeStyle='#74617c';c.lineWidth=1.4
    for(const [n,nx,ny] of [['♪',-22,-53],['♬',10,-62]] as const){c.strokeText(n,nx,ny);c.fillText(n,nx,ny)}
    c.restore()
  }
  c.restore()
}
