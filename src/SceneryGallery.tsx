import {useEffect,useRef,useState} from 'react'
import {TravelCGGallery} from './TravelCG'
import {createPortal} from 'react-dom'
import {paintWorld} from './CanvasPaint'
import {ScenicViewer} from './ScenicViewer'
import {AutoDialogue} from './AutoDialogue'
import {arrivalConversations} from './Dialogue'
import {arrivalCameos,withCameo} from './CanaryCameos'
import {Vista,lights,weathers,type Weather,type Light} from './Vista'
import {sceneryOrder,routeInfo,type Scenery} from './routeData'
import {placeMoments} from './PlaceMoment'
import {species,speciesIds,rarityNames,variants,variantNames,type CrystalGame,type CrystalId,type Variant} from './Crystals'
import {CrystalArt} from './CrystalArt'

const moods:Light[]=['dusk','dawn','night']
const atmosphereTypes:Weather[]=['rain','snow','meteor','aurora']
/** Original Gallery's collapsible night-sky map, adapted to the ten railway stations. */
function StarMap({found}:{found:Set<Scenery>}){
 const points:Record<Scenery,[number,number]>={galaxyend:[235,55],nebula:[60, 68],ringsea:[190, 39],snowfield:[312, 88],auroraforest:[440, 53],canyon:[156, 145],city:[377, 155],dunes:[270, 176],garden:[474, 112],ruins:[38, 142],volcano:[250, 118],lanternsea:[110, 108],cloudwhale:[360, 28],crystalcave:[330, 128],starcherry:[455, 175]}
 const lines:[Scenery,Scenery][]=[['galaxyend','ringsea'],['galaxyend','cloudwhale'],['nebula','ringsea'],['ringsea','snowfield'],['snowfield','auroraforest'],['ringsea','canyon'],['canyon','city'],['city','auroraforest'],['city','dunes'],['auroraforest','garden'],['canyon','ruins'],['canyon','volcano'],['volcano','snowfield'],['nebula','lanternsea'],['lanternsea','ruins'],['lanternsea','canyon'],['cloudwhale','auroraforest'],['cloudwhale','snowfield'],['crystalcave','city'],['crystalcave','volcano'],['starcherry','city'],['starcherry','garden']]
 return <svg className="album-sky-map" viewBox="0 0 500 200" role="img" aria-label={`이어진 별자리 ${found.size} / ${sceneryOrder.length}`}>
  {lines.map(([a,b],index)=>{
   const on=found.has(a)&&found.has(b);return <line key={index} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} stroke={on?'#f6dcb5':'#8c93a9'} strokeOpacity={on?.83:.15} strokeWidth={on?1.5:.8}/>
  })}
  {sceneryOrder.map(p=>{const [x,y]=points[p],on=found.has(p);return <g key={p}><circle cx={x} cy={y} r={on?4.8:2.7} fill={on?'#ffefce':'#7984a2'} opacity={on?1:.55}/>{on&&<><circle cx={x} cy={y} r={11} fill="none" stroke="#ecd6b0" strokeOpacity=".25"/><text x={x} y={y+20} textAnchor="middle" fill="#e9d5cc" fontSize="10">{routeInfo[p].label}</text></>}</g>})}
 </svg>
}
function shotKey(place:Scenery,light:Light){return `${place}:${light}`}
function specialKey(place:Scenery,light:Light,weather:Weather){return `${place}:${light}:${weather}`}

/** Light-weight still Canvas photo. Same paintWorld as the living outdoor panorama. */
function Photograph({place,light,weather}:{place:Scenery;light:Light;weather:Weather}){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const c=ref.current?.getContext('2d')
  if(c){c.setTransform(.36,0,0,.36,0,0);paintWorld(c,place,light,weather,4.5,0,'vista',null,99)}
 },[place,light,weather])
 return <canvas className="gallery-photograph" ref={ref} width={346} height={195} aria-hidden="true"/>
}
export function SceneryGallery({game,onSail}:{game:CrystalGame;onSail:()=>void}){
 const [part,setPart]=useState<'scenes'|'crystals'|'discoveries'|'travelcg'>('scenes')
 const [selected,setSelected]=useState<Scenery|null>(null)
 const [light,setLight]=useState<Light>('dusk')
 const [weather,setWeather]=useState<Weather>('clear')
 const [full,setFull]=useState(false)
 const [selectedCrystal,setSelectedCrystal]=useState<{id:CrystalId;variant:Variant}|null>(null)
 const dialog=useRef<HTMLDialogElement>(null)
 const shots=new Set(game.sceneShots??[])
 const weatherShots=new Set(game.atmosphereShots??[])
 const cards=new Set(game.sceneCards??[])
 const owned= (p:Scenery)=>moods.filter(m=>shots.has(shotKey(p,m)))
 const weatherAt=(p:Scenery,m:Light)=>atmosphereTypes.filter(w=>weatherShots.has(specialKey(p,m,w)))
 const found=sceneryOrder.filter(p=>cards.has(p)&&owned(p).length>0)
 const total=sceneryOrder.reduce((sum,p)=>sum+owned(p).length,0)
 const specialCount=[...weatherShots].length
 const discovered=game.sceneDiscoveries??[]
 useEffect(()=>{if(selected&&dialog.current&&!dialog.current.open)dialog.current.showModal()},[selected])
 function open(p:Scenery){const first=owned(p)[0];if(!first)return;setWeather('clear');setLight(first);setSelected(p)}
 function chooseLight(next:Light){if(!selected||!shots.has(shotKey(selected,next)))return;setLight(next);setWeather('clear')}
 function chooseWeather(next:Weather){if(!selected)return;if(next!=='clear'&&!weatherShots.has(specialKey(selected,light,next)))return;setWeather(next)}
 function close(){setSelected(null);setFull(false)}
 const visitVariant=selected?Math.max(0,(game.sceneVisits?.[selected]??1)-1)%3:0
 const conversation=selected?withCameo(arrivalConversations[selected][visitVariant],arrivalCameos[selected][visitVariant]):null
 return <section className="galaxy-album" aria-label="여행 도감">
  <div className="album-overline">우리의 여행 기록 ✧</div>
  <div className="album-header"><h1>별 도감</h1><span>{found.length} / {sceneryOrder.length}개의 행성</span></div>
  <p className="album-help">항해를 마치면 그때 만난 풍경이 저절로 사진처럼 찍혀요. 같은 행성의 노을·새벽·한밤과 특별한 기후를 각각 모을 수 있습니다.</p>
  <nav className="album-sections" aria-label="도감 분류"><button type="button" aria-pressed={part==='scenes'} onClick={()=>setPart('scenes')}>풍경</button><button type="button" aria-pressed={part==='travelcg'} onClick={()=>setPart('travelcg')}>여행의 기억</button><button type="button" aria-pressed={part==='crystals'} onClick={()=>setPart('crystals')}>수정</button><button type="button" aria-pressed={part==='discoveries'} onClick={()=>setPart('discoveries')}>작은 발견</button></nav>
  {part==='travelcg'&&<TravelCGGallery game={game}/>}
  {part==='scenes'&&<>
   {found.length>0&&<details className="album-star-map"><summary>우리의 별자리 <span>{found.length} / {sceneryOrder.length}</span></summary><StarMap found={new Set(found)}/><p>만나 본 행성이 하나씩 빛나고, 서로 이어져요.</p></details>}
   <div className="album-count">{total}개의 시간대 · {specialCount}개의 특별한 하늘</div>
   {found.length?<div className="album-grid">{found.map(p=>{
    const first=owned(p)[0]
    const extras=moods.reduce((sum,m)=>sum+weatherAt(p,m).length,0)
    return <button type="button" className="album-photo" key={p} onClick={()=>open(p)} aria-label={`${routeInfo[p].label} 풍경 앨범 열기`}>
      <Photograph place={p} light={first} weather={weatherAt(p,first)[0]??'clear'}/>
      <strong>{routeInfo[p].label}</strong><small>{extras?`✦ 특별한 하늘 ${extras}종`:`${game.sceneVisits?.[p]??1}번 방문`}</small>
      <span className="album-dots" aria-label={`${owned(p).length}/3 시간대 수집`}>{moods.map(m=><i key={m} className={shots.has(shotKey(p,m))?'lit':''} title={lights[m]}/>)}</span>
    </button>
   })}</div>:<div className="album-empty"><span>✧</span><p>첫 항해의 풍경을 담을 자리예요.<br/>행성에 도착하면 도감에 자동으로 기록됩니다.</p><button type="button" onClick={onSail}>열차로 돌아가기</button></div>}
   {found.length<sceneryOrder.length&&<details className="album-locked"><summary>아직 만나지 못한 행성 <span>{sceneryOrder.length-found.length}곳</span></summary><div className="album-grid">{sceneryOrder.filter(p=>!found.includes(p)).map(p=><div className="album-photo locked" key={p}><div className="locked-art">✧</div><strong>아직 만나지 못한 행성</strong><small>먼 항해에서 만날 수 있어요.</small></div>)}</div></details>}
  </>}
  {part==='crystals'&&<>
   <div className="album-count">수정 {speciesIds.filter(id=>game.album[id]).length}/{speciesIds.length}종 · 색 변이 {speciesIds.reduce((sum,id)=>sum+(game.album[id]?.variants.length??0),0)}/{speciesIds.length*variants.length}</div>
   <div className="album-grid crystal-gallery-grid">{speciesIds.map(id=>{const record=game.album[id];return <div className={'album-crystal-card'+(!record?' locked':'')} key={id}>
    {record?<><CrystalArt id={id} variant={record.variants[0]}/><strong>{species[id].name}</strong><small>{rarityNames[species[id].rarity]} · {record.count}회 완성</small><div className="album-crystal-variants">{variants.map(v=><button key={v} type="button" disabled={!record.variants.includes(v)} onClick={()=>setSelectedCrystal({id,variant:v})}>{record.variants.includes(v)?variantNames[v]:'?'}</button>)}</div></>:<><div className="locked-art">◇</div><strong>미발견 수정</strong><small>{rarityNames[species[id].rarity]} · 재배 후 기록</small></>}
   </div>})}</div>
  </>}
  {part==='discoveries'&&<>
   <div className="album-count">지역에서 발견한 순간 · {discovered.length} / {sceneryOrder.length*2}</div>
   {discovered.length?<div className="album-discovery-list">{discovered.map(key=>{const [place,index]=key.split(':'),p=place as Scenery;const a=Number(index) as 0|1;if(!sceneryOrder.includes(p)||!placeMoments[p].actions[a])return null;return <article key={key}><strong>{routeInfo[p].label}</strong><h3>{placeMoments[p].actions[a].label}</h3><p>{placeMoments[p].actions[a].lines[0]}</p></article>})}</div>:<div className="album-empty"><span>✧</span><p>행성에 내려 작은 행동을 발견하면<br/>이곳에 기억이 남습니다.</p></div>}
  </>}
  <dialog className="album-dialog" ref={dialog} onClose={close} aria-label="수집한 풍경 다시 보기">
   {selected&&<>
    <div className="album-dialog-top"><div className="album-dialog-heading"><small>✧ 우리의 여행 기록</small><strong>{routeInfo[selected].label}</strong></div><button className="album-dialog-close" type="button" onClick={()=>dialog.current?.close()} aria-label="도감 사진 닫기"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <button type="button" className="album-landscape" onClick={()=>setFull(true)} aria-label="전체 화면으로 풍경 감상하기"><Vista scenery={selected} light={light} weather={weather}/><span className="album-landscape-fullscreen" aria-hidden="true">⛶</span></button>
    <div className="album-scenic-controls">
     <div className="album-choice-group album-light-controls">
      <div className="album-choices-heading"><span>빛의 시간</span><small>수집한 시간대</small></div>
      <div className="album-selector" role="group" aria-label="발견한 시간대">{moods.map(m=><button type="button" key={m} aria-pressed={m===light} disabled={!shots.has(shotKey(selected,m))} onClick={()=>chooseLight(m)}>{lights[m]}</button>)}</div>
     </div>
     <div className="album-choice-group album-weather-controls">
      <div className="album-choices-heading"><span>그날의 하늘</span></div>
      <div className="album-selector" role="group" aria-label="발견한 특별한 하늘"><button type="button" aria-pressed={weather==='clear'} onClick={()=>chooseWeather('clear')}>평온한 하늘</button>{weatherAt(selected,light).map(w=><button type="button" key={w} aria-pressed={weather===w} onClick={()=>chooseWeather(w)}>✦ {weathers[w]}</button>)}</div>
     </div>
     {conversation&&<div className="album-reminiscence"><div className="album-reminiscence-label">✦ 그 별에서 나눈 이야기</div><AutoDialogue key={`${selected}:${light}:${weather}`} lines={conversation} compact/></div>}
    </div>
   </>}
  </dialog>
  {selected&&full&&<ScenicViewer scenery={selected} phase="platform" light={light} weather={weather} conversation={conversation??undefined} onClose={()=>setFull(false)}/>}
  {selectedCrystal&&createPortal(<div className="crystal-modal" role="presentation" onClick={()=>setSelectedCrystal(null)}><section className="crystal-modal-content" role="dialog" aria-modal="true" aria-label="수정 감상" onClick={e=>e.stopPropagation()}><CrystalArt id={selectedCrystal.id} variant={selectedCrystal.variant}/><h2>{species[selectedCrystal.id].name}</h2><p>{variantNames[selectedCrystal.variant]} · {species[selectedCrystal.id].description}</p><button className="crystal-primary" onClick={()=>setSelectedCrystal(null)}>닫기</button></section></div>,document.body)}
 </section>
}
