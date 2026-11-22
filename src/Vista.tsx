import {useId} from 'react'
import type {Scenery} from './Sky'

/**
 * 멈춰서 바라보는 하차 풍경: 객실/가로등/역명판과 완전히 독립된 16:9 그림.
 * 소녀와 고양이는 풍경 앞에서 고정된 뒷모습입니다. 고양이 꼬리만 움직입니다.
 * 시간대 색은 에셋을 복제하지 않고 팔레트로 제어합니다.
 */
export type Light = 'dawn' | 'dusk' | 'night'
export type Weather = 'clear' | 'rain' | 'snow' | 'mist' | 'meteor' | 'aurora'
export const lights: Record<Light, string> = {dawn:'새벽빛', dusk:'노을빛', night:'한밤빛'}
export const weathers: Record<Weather,string> = {
  clear:'맑은 하늘', rain:'별빛 소나기', snow:'하얀 별눈', mist:'꿈결 안개', meteor:'별똥별', aurora:'오로라'
}

type Palette = {
  sky: [string,string,string,string], cloudA:string,cloudB:string, horizon:string,
  deep:string, ridge:string, foreground:string, moon:string, moonOpacity:number, starOpacity:number,
  platformTop:string, platformSide:string
}
const palettes: Record<Scenery,Record<Light,Palette>> = {
  nebula: {
    dawn:{sky:['#233f71','#6a86bb','#bed3d8','#f0c7b4'],cloudA:'#9cdbdf',cloudB:'#cfb6eb',horizon:'#c6d2c7',deep:'#5c7897',ridge:'#546f89',foreground:'#465d73',moon:'#e9e5e5',moonOpacity:.52,starOpacity:.60,platformTop:'#bca9b5',platformSide:'#5b597c'},
    dusk:{sky:['#202852','#63578f','#b48db3','#f3bca6'],cloudA:'#7ec9c9',cloudB:'#d9a5db',horizon:'#ebc3c1',deep:'#6c769b',ridge:'#6a7396',foreground:'#4c627e',moon:'#ead9ed',moonOpacity:.75,starOpacity:.85,platformTop:'#cea6ad',platformSide:'#605775'},
    night:{sky:['#07152f','#172b56','#414476','#726997'],cloudA:'#4aa7b0',cloudB:'#9181cd',horizon:'#766f9e',deep:'#233b64',ridge:'#273d60',foreground:'#25374f',moon:'#bed1ec',moonOpacity:.68,starOpacity:1,platformTop:'#71748e',platformSide:'#303a5f'}
  },
  city: {
    dawn:{sky:['#284b7b','#729abe','#bdd5db','#f5cfbc'],cloudA:'#d1e2de',cloudB:'#e7beda',horizon:'#ead4c5',deep:'#526d91',ridge:'#657a94',foreground:'#384e66',moon:'#fbebcf',moonOpacity:.45,starOpacity:.43,platformTop:'#aeb5bb',platformSide:'#3f516c'},
    dusk:{sky:['#28345e','#695783','#b785a5','#f5c2aa'],cloudA:'#a0bdcf',cloudB:'#dfadda',horizon:'#eac0c2',deep:'#5d6791',ridge:'#6b6386',foreground:'#353e65',moon:'#ffeed0',moonOpacity:.93,starOpacity:.75,platformTop:'#b6a3b2',platformSide:'#4b496c'},
    night:{sky:['#08132b','#17274d','#323969','#54517d'],cloudA:'#6486b4',cloudB:'#7d70b1',horizon:'#69658c',deep:'#1c345e',ridge:'#24375c',foreground:'#1d2e4e',moon:'#f3e6d8',moonOpacity:.89,starOpacity:1,platformTop:'#6b708d',platformSide:'#243453'}
  }
}

function random(seed:number){let s=seed>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296}}
const rand=random(44073)
const stars=Array.from({length:168},(_,i)=>({x:rand()*955+2,y:rand()*382+3,r:i%13===0?2:i%7===0?1.35:.35+rand()*.75,a:.28+rand()*.65,twinkle:i%6===0,cross:i%21===0}))
const flecks=Array.from({length:64},(_,i)=>({x:rand()*940+10,y:rand()*490,r:i%7===0?2:1+rand()*1.2,delay:-rand()*8,duration:4+rand()*7}))
const rainy=Array.from({length:63},(_,i)=>({x:(i*113)%1012-40,y:(i*73)%620-40,len:12+i%5*3,delay:-(i%17)*.17,duration:1.1+(i%7)*.11}))
const snowy=Array.from({length:57},(_,i)=>({x:(i*119)%975,y:(i*73)%600-35,r:i%7===0?2.8:1.2+i%3*.35,delay:-(i%17)*.71,duration:7+i%8*1.2}))

type Building={x:number,w:number,h:number,windows:{x:number,y:number,lit:boolean}[],antenna:boolean}
function createBuildings(seed:number,layer:'back'|'front'){
  const r=random(seed),arr:Building[]=[];let x=-15
  while(x<980){const w=layer==='back'?24+r()*33:32+r()*43
    const h=layer==='back'?57+r()*73:78+r()*128
    const windows:Building['windows']=[]
    for(let wx=8;wx<w-5;wx+=11)for(let wy=15;wy<h-8;wy+=14){if(r()>.37)windows.push({x:wx,y:wy,lit:r()>.35})}
    arr.push({x,w,h,windows,antenna:r()>.83});x+=w+(layer==='back'?5:8)
  }
  return arr
}
const cityBack=createBuildings(1133,'back'),cityFront=createBuildings(8901,'front')

/** 뒷모습 전용 소녀와 고양이: 하차 장면에서만 사용 */
function Travelers(){
 // 독립된 뒷모습 캐릭터. 원피스는 남색 → 청남색 → 옅은 보랏빛 남색의 세로 그라데이션.
 // 캐릭터는 고정이고 고양이 꼬리만 천천히 흔들립니다.
 const travelerId='travelers'+useId().replace(/:/g,'')
 return <g className="vista-travelers">
  <defs>
   <linearGradient id={`${travelerId}-dress`} x1="0" y1="0" x2=".14" y2="1">
    <stop offset="0" stopColor="#182443"/>
    <stop offset=".28" stopColor="#233960"/>
    <stop offset=".66" stopColor="#3d5487"/>
    <stop offset="1" stopColor="#778bc1"/>
   </linearGradient>
   <linearGradient id={`${travelerId}-dress-side`} x1="0" y1="0" x2="1" y2="1">
    <stop stopColor="#26365b"/><stop offset="1" stopColor="#6176ad"/>
   </linearGradient>
   <linearGradient id={`${travelerId}-hair`} x1="0" y1="0" x2=".6" y2="1">
    <stop stopColor="#242338"/><stop offset=".55" stopColor="#34314b"/><stop offset="1" stopColor="#48405d"/>
   </linearGradient>
   <linearGradient id={`${travelerId}-fur`} x1="0" y1="0" x2="1" y2="1">
    <stop stopColor="#fffdf9"/><stop offset=".48" stopColor="#f3f1f3"/><stop offset="1" stopColor="#c9cfdd"/>
   </linearGradient>
  </defs>
  <ellipse cx="229" cy="462" rx="48" ry="7" fill="#22273f" opacity=".18"/>
  <g transform="translate(220 452)">
   {/* 작고 가지런한 신발. 치맛자락 아래로 발만 조금 보입니다. */}
   <path d="M-14-20L-14 3Q-23 5-25 9Q-25 13-17 13H-1Q2 11-1 6L-3-17Z" fill="#2b2c47"/>
   <path d="M8-19L10 3Q15 5 21 9Q25 13 18 13H3Q0 11 3 5L1-18Z" fill="#252b46"/>
   <path d="M-21 9Q-12 8-2 9M6 9Q13 8 21 10" stroke="#7d7693" strokeOpacity=".34" strokeWidth="1.3" fill="none"/>
   {/* 원피스는 몸통이 가늘고 치맛자락이 A라인으로 넓어지는 실루엣. */}
   <path d="M-18-89Q-33-87-36-71L-25-55Q-28-42-39-23Q-47-11-43-9Q-4-2 40-10Q44-14 38-24Q26-45 27-56L37-72Q31-88 17-90Z"
     fill={`url(#${travelerId}-dress)`} stroke="#9baad5" strokeOpacity=".38" strokeWidth="1.6"/>
   {/* 팔은 몸 양옆으로 곧게 내려요. 손은 치맛자락 옆에만 보입니다. */}
   <path d="M-24-85Q-36-83-39-70Q-41-55-43-37L-43-26Q-39-21-34-27L-32-44L-27-68Z" fill="#253a67" stroke="#92a7d2" strokeOpacity=".28" strokeWidth="1.2"/>
   <path d="M24-85Q36-82 39-70Q41-55 43-36L43-25Q39-20 34-26L32-44L27-68Z" fill="#263961" stroke="#92a7d2" strokeOpacity=".28" strokeWidth="1.2"/>
   <path d="M-43-27Q-44-18-40-17Q-36-17-35-26M35-26Q36-17 40-17Q44-19 43-26" fill="#e3b9af" stroke="#dfb2ae" strokeWidth=".8"/>
   {/* 허리선·치맛자락의 주름을 부드럽게 넣어 '외투'처럼 보이지 않도록 함. */}
   <path d="M-21-60Q0-55 24-61" fill="none" stroke="#aec2e7" strokeOpacity=".32" strokeWidth="1.3"/>
   <path d="M-17-57Q-19-32-29-14M-2-57Q-2-28-7-9M14-56Q19-33 27-13" fill="none" stroke="#c0cceb" strokeOpacity=".20" strokeWidth="1.8"/>
   <path d="M-39-11Q0-4 39-11" fill="none" stroke="#c5c8ec" strokeOpacity=".47" strokeWidth="2"/>
   {/* 작은 은하수 별자수: 치맛자락을 읽을 수 있도록 점 몇 개만 추가합니다. */}
   <g fill="#dbe2f7" opacity=".75"><circle cx="-22" cy="-14" r="1.4"/><circle cx="-1" cy="-11" r="1"/><circle cx="15" cy="-26" r="1.3"/><circle cx="-9" cy="-36" r="1.2"/><circle cx="8" cy="-49" r=".8"/></g>
   <path d="M21-18v5M18.5-15.5h5M-24-44v5M-26.5-41.5h5" stroke="#d9d5f1" strokeOpacity=".68" strokeWidth=".9"/>
   {/* 목과 단정한 검은 머리: 얼굴은 드러나지 않음. */}
   <path d="M-9-86L-7-104L13-104L15-86Z" fill="#d7aaa7"/>
   <path d="M-26-126Q-26-152-5-158Q17-162 29-145Q35-133 32-117L37-93Q39-81 30-82Q22-80 19-90Q0-80-14-88Q-20-81-29-85Q-35-91-30-108Z"
      fill={`url(#${travelerId}-hair)`} stroke="#4f4966" strokeOpacity=".55" strokeWidth="1.3"/>
   <path d="M-9-153Q-15-124-12-99M6-155Q9-124 10-93M20-148Q26-124 25-99" fill="none" stroke="#9a8ead" strokeOpacity=".3" strokeWidth="2.5" strokeLinecap="round"/>
   {/* 객실 소녀와 동일한 금빛 별 헤어핀: 오른쪽 위, 머리카락 위에 고정. */}
   <g transform="translate(24 -136) rotate(9)">
    <path d="M0-14L3.5-4.8L13.5-4.4L5.7 2L8.3 11.8L0 6.8L-8.3 11.8L-5.7 2L-13.5-4.4L-3.5-4.8Z" fill="#f2cc72" stroke="#9f744a" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M-2-6L0-10L2-5" fill="none" stroke="#fff8db" strokeWidth="1.1" opacity=".8"/>
   </g>
  </g>
  {/* 자연스러운 실루엣의 '하얀 앉아 있는 고양이' — 부드러운 등·둥근 얼굴·작은 귀. */}
  <ellipse cx="296" cy="461" rx="27" ry="5.5" fill="#20283f" opacity=".19"/>
  <g className="vista-cat-tail">
   <path d="M281 453Q267 452 268 440Q269 427 256 431Q249 434 254 440" fill="none" stroke="#c8cedb" strokeWidth="10" strokeLinecap="round"/>
   <path d="M281 451Q268 449 271 440Q272 432 262 433" fill="none" stroke="#fcfafa" strokeWidth="5" strokeLinecap="round"/>
  </g>
  <g>
   {/* 둥글게 앉은 몸과 등, 뒷발 */}
   <path d="M280 453Q279 443 284 437Q289 430 298 431Q309 430 313 440Q318 449 313 458Q299 464 284 458Z"
    fill={`url(#${travelerId}-fur)`} stroke="#ffffff" strokeOpacity=".5" strokeWidth="1.4"/>
   <ellipse cx="289" cy="456" rx="7" ry="4.5" fill="#e6e7ed"/>
   <ellipse cx="308" cy="456" rx="7.5" ry="4.5" fill="#dce1e9"/>
   {/* 둥근 뒷머리와 귀: 얼굴이나 눈을 그리지 않습니다. */}
   <path d="M283 432L280 417Q280 414 285 417L291 423Q299 421 305 423L315 415Q319 413 318 419L317 433Q317 445 303 447Q285 449 283 435Z"
    fill="#f8f6f5" stroke="#e0e4ed" strokeOpacity=".65" strokeWidth="1.4" strokeLinejoin="round"/>
   <path d="M284 419L286 428L292 425Z" fill="#d2aebd" opacity=".55"/>
   <path d="M315 419L309 426L315 429Z" fill="#d2aebd" opacity=".55"/>
   {/* 부드러운 털의 결, 척추를 따라 보이는 옅은 줄무늬 */}
   <path d="M297 426Q295 436 299 443" fill="none" stroke="#ffffff" strokeOpacity=".54" strokeWidth="2" strokeLinecap="round"/>
   <path d="M290 442Q290 448 290 451M306 444Q310 450 307 453" fill="none" stroke="#b8c0d1" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round"/>
  </g>
 </g>
}

function CityBuildings({p}:{p:Palette}){return <>
 <g opacity=".4">{cityBack.map((b,i)=><g key={i} transform={`translate(${b.x},${392-b.h})`}><rect width={b.w} height={b.h} fill={i%2===0?'#7888a7':'#69789e'}/>{b.windows.filter((_,j)=>j%3===0).map((w,j)=><rect key={j} x={w.x} y={w.y} width="2.8" height="4.5" fill="#fff0d9" opacity={w.lit?.68:.14}/>)}</g>)}</g>
 <path d="M0 401Q480 393 960 400V540H0" fill={p.deep} opacity=".82"/>
 <g>{cityFront.map((b,i)=><g key={i} transform={`translate(${b.x},${424-b.h})`}>
   <rect width={b.w} height={b.h} fill={i%3===0?'#364761':i%3===1?'#415472':'#354967'} opacity=".96"/>
   <path d={`M0 1H${b.w}`} stroke="#a9b7ca" strokeOpacity=".22" strokeWidth="1.3"/>
   {b.antenna&&<path d={`M${b.w/2} 0V-14`} stroke="#b5b1cc" strokeWidth="1.5" opacity=".8"/>}
   {b.windows.map((w,j)=><rect key={j} x={w.x} y={w.y} width="3.1" height="5.2" rx=".5" fill={w.lit?'#f7d5ad':'#b2c3d5'} opacity={w.lit?.74:.12}/>)}</g>)}</g>
  {/* 불빛이 물에 길게 비치는 도시 아래쪽 */}
  <path d="M0 422Q180 430 310 421Q520 412 710 423T960 415V540H0Z" fill="#324963" opacity=".57"/>
  {Array.from({length:42},(_,i)=>{const x=(i*61+37)%950, y=437+(i*47)%90;return <path key={i} d={`M${x} ${y}h${8+i%4*7}`} stroke={i%3===0?'#f6d8b0':'#a7b9d0'} strokeOpacity={i%3===0?.4:.24} strokeWidth="1.3"/>})}
 </>}

function NebulaLandscape({id,p}:{id:string,p:Palette}){return <>
  <g className="vista-nebula-flow">
    <path d="M-40 150Q96 102 235 129T490 98T742 83T1010 59L1030 184Q844 150 724 183T459 220T191 215T-40 228Z" fill={`url(#${id}-aurora)`} opacity=".45"/>
    <path d="M-35 180Q108 147 258 177T513 155T762 126T1010 111" stroke={p.cloudA} strokeWidth="35" strokeOpacity=".08" fill="none"/>
    <path d="M-34 259Q137 176 318 227T604 199T1005 138" stroke={p.cloudB} strokeWidth="82" strokeLinecap="round" strokeOpacity=".16" fill="none"/>
  </g>
  <g className="vista-nebula-flow-alt">
    <path d="M-10 297Q113 237 235 262T458 273T728 233T973 202" stroke={p.cloudA} strokeWidth="56" strokeOpacity=".12" fill="none"/>
    <path d="M0 311Q142 269 257 284T507 295T786 256T960 260" stroke="#f4d8dc" strokeWidth="18" strokeOpacity=".13" fill="none"/>
  </g>
  {/* 떨어져 있는 수정 기둥의 실루엣과 물결: 라일락 성운역만의 개성 */}
  <path d="M0 348Q114 325 228 347T470 339T729 324T960 347V540H0Z" fill={p.horizon} opacity=".56"/>
  <path d="M0 381Q153 341 254 371T473 364T691 350T960 374V540H0Z" fill={p.ridge} opacity=".8"/>
  <path d="M0 404Q139 389 269 406T545 390T783 390T960 389V540H0Z" fill={p.deep}/>
  <path d="M0 417Q280 410 470 424Q740 416 960 418V540H0Z" fill={`url(#${id}-water)`}/>
  {[[563,318,22,73],[655,289,18,97],[745,310,20,66],[844,327,16,64],[926,303,18,79]].map(([x,y,w,h],i)=><g key={i} opacity={.25+i%2*.15}>
   <path d={`M${x} ${y+h}l${w*.18-w/2} ${-h*.74}l${w*.32} ${-h*.26}l${w*.48} ${h*.95}Z`} fill={i%2===0?'#b9e7e3':'#d1cfed'}/>
   <path d={`M${x} ${y+h}l${w*.18-w/2} ${-h*.74}l${w*.32} ${-h*.26}Z`} fill="#eff2ff" opacity=".26"/>
  </g>)}
  {Array.from({length:36},(_,i)=>{const x=(i*59)%980,y=421+(i*37)%89;return <path key={i} d={`M${x} ${y}h${7+(i%4)*7}`} stroke="#d2d8e9" strokeOpacity={.18+(i%4)*.065} strokeWidth={i%8===0?2:1}/>})}
 </>}

function Lookout({scenery,p}:{scenery:Scenery,p:Palette}){const city=scenery==='city';return <g>
  {/* 열차역의 플랫폼이 아닌, 역에서 조금 걸어 나온 작은 전망 장소 */}
  <path d="M-36 435L403 424L575 477L452 541H-25Z" fill={p.platformSide}/>
  <path d="M-29 430L402 420L566 473L433 505L-30 481Z" fill={p.platformTop}/>
  <path d="M-29 430L402 420L566 473" fill="none" stroke="#fff0dc" strokeOpacity=".39" strokeWidth="2.2"/>
  <path d="M-20 485L434 507L566 472" stroke="#222840" strokeOpacity=".38" strokeWidth="2" fill="none"/>
  <path d="M0 497Q169 490 408 517L453 541H0Z" fill="#232d51" opacity=".18"/>
  {city&&<g opacity=".45"><path d="M44 441V419M113 439V418M185 436V416M257 434V416M328 430V416" stroke="#d0c8cc" strokeWidth="3"/><path d="M44 419L328 416" stroke="#c5d1dc" strokeWidth="2.4" fill="none"/></g>}
  <ellipse cx="317" cy="461" rx="130" ry="15" fill="#3a3c62" opacity=".09"/>
  <Travelers/>
 </g>}

function Effects({weather,id}:{weather:Weather,id:string}){
 if(weather==='clear')return null
 if(weather==='rain')return <g className="vista-weather" aria-hidden="true">
   <rect width="960" height="540" fill="#a7c4e5" opacity=".055"/>
   {rainy.map((p,i)=><g className="vista-rain" key={i} style={{animationDelay:`${p.delay}s`,animationDuration:`${p.duration}s`}}><path d={`M${p.x} ${p.y}l-7 ${p.len}`} stroke="#dbeaf9" opacity={.24+(i%6)*.085} strokeWidth={i%5===0?1.35:.8}/></g>)}
   {Array.from({length:5},(_,i)=><ellipse className="vista-ripple" key={i} cx={530+i*82} cy={472+i%2*11} rx="11" ry="2" stroke="#e3f0f9" strokeOpacity=".36" fill="none" style={{animationDelay:`-${i*.48}s`}}/>)}
 </g>
 if(weather==='snow')return <g className="vista-weather" aria-hidden="true">{snowy.map((p,i)=><circle className="vista-snow" key={i} cx={p.x} cy={p.y} r={p.r} fill="#fffdfa" opacity={.49+(i%4)*.12} style={{animationDelay:`${p.delay}s`,animationDuration:`${p.duration}s`}}/>)}</g>
 if(weather==='mist')return <g className="vista-weather vista-mist" aria-hidden="true"><ellipse cx="230" cy="345" rx="360" ry="100" fill={`url(#${id}-mist)`}/><ellipse cx="781" cy="400" rx="340" ry="103" fill={`url(#${id}-mist)`}/><rect y="336" width="960" height="118" fill="#e6e4ec" opacity=".055"/></g>
 if(weather==='meteor')return <g className="vista-weather" aria-hidden="true">{[0,1,2,3].map((i)=><g className="vista-meteor" key={i} style={{animationDelay:`-${i*4.1}s`,animationDuration:`${11+(i%2)*3}s`}}>
   <path d={`M${710+i*60} ${60+i*35}l-95 48`} fill="none" stroke={`url(#${id}-meteor)`} strokeWidth="2.2" strokeLinecap="round"/>
   <circle cx={615+i*60} cy={108+i*35} r="2.6" fill="#fff8e5"/><circle cx={615+i*60} cy={108+i*35} r="10" fill={`url(#${id}-starhalo)`}/>
 </g>)}</g>
 return <g className="vista-weather vista-aurora" aria-hidden="true"><path d="M-20 82Q170 12 357 83T730 70T990 34L990 208Q735 129 535 173T192 186T-20 181Z" fill={`url(#${id}-aurora)`} opacity=".65"/>
  <path d="M-15 119Q190 58 389 112T772 102T983 73" stroke="#b5e8e6" strokeOpacity=".25" strokeWidth="22" fill="none"/>
 </g>
}

export function Vista({scenery,light='dusk',weather='clear'}:{scenery:Scenery;light?:Light;weather?:Weather}){
 const id='vista'+useId().replace(/:/g,'')
 const p=palettes[scenery][light]
 const nebula=scenery==='nebula'
 return <div className="vista" role="img" aria-label={`${scenery==='nebula'?'라일락 성운':'유리도시'}의 ${lights[light]} 풍경. 서 있는 소녀와 고양이가 함께 바라보고 있습니다. ${weathers[weather]}.`}>
  <svg className="vista-svg" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
   <defs>
    <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={p.sky[0]}/><stop offset=".31" stopColor={p.sky[1]}/><stop offset=".69" stopColor={p.sky[2]}/><stop offset="1" stopColor={p.sky[3]}/></linearGradient>
    <radialGradient id={`${id}-halo`}><stop stopColor="#fff8e5" stopOpacity=".78"/><stop offset=".27" stopColor="#fff0e2" stopOpacity=".22"/><stop offset="1" stopColor="#fff0e2" stopOpacity="0"/></radialGradient>
    <radialGradient id={`${id}-cloudA`}><stop stopColor={p.cloudA} stopOpacity=".36"/><stop offset=".58" stopColor={p.cloudA} stopOpacity=".17"/><stop offset="1" stopColor={p.cloudA} stopOpacity="0"/></radialGradient>
    <radialGradient id={`${id}-cloudB`}><stop stopColor={p.cloudB} stopOpacity=".42"/><stop offset=".6" stopColor={p.cloudB} stopOpacity=".14"/><stop offset="1" stopColor={p.cloudB} stopOpacity="0"/></radialGradient>
    <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={p.deep} stopOpacity=".9"/><stop offset="1" stopColor={p.foreground}/></linearGradient>
    <linearGradient id={`${id}-aurora`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7de2d5" stopOpacity="0"/><stop offset=".25" stopColor="#8ce4d2" stopOpacity=".28"/><stop offset=".59" stopColor="#aa95db" stopOpacity=".34"/><stop offset="1" stopColor="#c19ae8" stopOpacity="0"/></linearGradient>
    <radialGradient id={`${id}-mist`}><stop stopColor="#e4eff8" stopOpacity=".31"/><stop offset="1" stopColor="#e4eff8" stopOpacity="0"/></radialGradient>
    <linearGradient id={`${id}-meteor`} x1="1" y1="0" x2="0" y2="1"><stop stopColor="#e7f1ff" stopOpacity="0"/><stop offset="1" stopColor="#fff9e7" stopOpacity=".9"/></linearGradient>
    <radialGradient id={`${id}-starhalo`}><stop stopColor="#fff9e7" stopOpacity=".68"/><stop offset="1" stopColor="#fff9e7" stopOpacity="0"/></radialGradient>
    <clipPath id={`${id}-clip`}><rect width="960" height="540"/></clipPath>
   </defs>
   <g clipPath={`url(#${id}-clip)`}>
    <rect width="960" height="540" fill={`url(#${id}-sky)`}/>
    <ellipse cx="180" cy="295" rx="330" ry="195" fill={`url(#${id}-cloudA)`}/>
    <ellipse cx="707" cy="238" rx="390" ry="184" fill={`url(#${id}-cloudB)`}/>
    <g opacity={p.starOpacity}>{stars.map((s,i)=><g key={i} className={s.twinkle?'vista-twinkle':undefined} style={s.twinkle?{animationDelay:`-${i%8*.67}s`,animationDuration:`${3.8+i%5*.8}s`}:undefined}>
      <circle cx={s.x} cy={s.y} r={s.r} fill={i%3===0?'#fff9eb':i%3===1?'#eaf5ff':'#f7dcf7'} opacity={s.a}/>
      {s.cross&&<path d={`M${s.x-5} ${s.y}h10M${s.x} ${s.y-5}v10`} stroke="#fff6ef" strokeWidth=".85" opacity=".64"/>}
     </g>)}</g>
    {/* 성운역의 고리행성과 도시역의 크고 가까운 달. */}
    {nebula?<g transform="translate(786 122)"><ellipse rx="101" ry="20" transform="rotate(-24)" fill="none" stroke="#e7e2ee" strokeOpacity=".36" strokeWidth="8"/><circle r="48" fill={p.moon} opacity={p.moonOpacity}/><path d="M-38 -21Q0 -4 38 -19M-40 13Q0 23 40 9" stroke="#a4b7d7" strokeOpacity=".3" strokeWidth="8" fill="none"/><ellipse rx="102" ry="20" transform="rotate(-24)" fill="none" stroke="#ffedf3" strokeOpacity=".52" strokeDasharray="120 500" strokeWidth="5"/></g>:<g><circle cx="750" cy="124" r="76" fill={`url(#${id}-halo)`} opacity=".65"/><circle cx="750" cy="124" r="45" fill={p.moon} opacity={p.moonOpacity}/><circle cx="736" cy="115" r="7" fill="#a5a6ba" opacity=".09"/><circle cx="770" cy="136" r="11" fill="#a5a6ba" opacity=".09"/></g>}
    {nebula?<NebulaLandscape id={id} p={p}/>:<CityBuildings p={p}/>}
    {/* 날씨는 지형과 독립된 레이어, 동일 에셋 재사용 */}
    <Effects weather={weather} id={id}/>
    <Lookout scenery={scenery} p={p}/>
    {/* 아주 적은 근거리 별가루: 서 있던 이들이 바라보는 공간에 깊이를 더합니다. */}
    <g className="vista-close-sparkles">{flecks.map((f,i)=><circle className={i%3===0?'vista-twinkle':undefined} key={i} cx={f.x} cy={f.y} r={f.r} opacity={i%4===0?.26:.14} fill={i%2===0?'#fff1d7':'#d1f5f4'} style={i%3===0?{animationDelay:`${f.delay}s`,animationDuration:`${f.duration}s`}:undefined}/>)}</g>
   </g>
  </svg>
 </div>
}
