import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {paintWorld} from './CanvasPaint'
import {ScenicViewer} from './ScenicViewer'
import {Vista,lights,weathers,type Weather,type Light} from './Vista'
import {sceneryOrder,routeInfo,type Scenery} from './routeData'
import {placeMoments} from './PlaceMoment'
import {species,speciesIds,rarityNames,variants,variantNames,type CrystalGame,type CrystalId,type Variant} from './Crystals'
import {CrystalArt} from './CrystalArt'

const moods:Light[]=['dusk','dawn','night']
const atmosphereTypes:Weather[]=['rain','snow','meteor','aurora']
/** Original Gallery's collapsible night-sky map, adapted to the six railway stations. */
function StarMap({found}:{found:Set<Scenery>}){
 const points:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[[60,68],[190,39],[312,88],[440,53],[156,145],[377,155]]
 const lines:[[number,number],[number,number]][]=[[0,1],[1,2],[2,3],[1,4],[4,5],[5,3]]
 return <svg className="album-sky-map" viewBox="0 0 500 200" role="img" aria-label={`이어진 별자리 ${found.size} / ${sceneryOrder.length}`}>
  {lines.map(([a,b],index)=>{
   const on=found.has(sceneryOrder[a])&&found.has(sceneryOrder[b]);return <line key={index} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} stroke={on?'#f6dcb5':'#8c93a9'} strokeOpacity={on?.83:.15} strokeWidth={on?1.5:.8}/>
  })}
  {sceneryOrder.map((p,i)=>{const [x,y]=points[i],on=found.has(p);return <g key={p}><circle cx={x} cy={y} r={on?4.8:2.7} fill={on?'#ffefce':'#7984a2'} opacity={on?1:.55}/>{on&&<><circle cx={x} cy={y} r={11} fill="none" stroke="#ecd6b0" strokeOpacity=".25"/><text x={x} y={y+20} textAnchor="middle" fill="#e9d5cc" fontSize="10">{routeInfo[p].label}</text></>}</g>})}
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
 const [part,setPart]=useState<'scenes'|'crystals'|'discoveries'>('scenes')
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
 return <section className="galaxy-album" aria-label="여행 도감">
  <div className="album-overline">우리의 여행 기록 ✧</div>
  <div className="album-header"><h1>별 도감</h1><span>{found.length} / {sceneryOrder.length}개의 행성</span></div>
  <p className="album-help">항해를 마치면 그때 만난 풍경이 저절로 사진처럼 찍혀요. 같은 행성의 노을·새벽·한밤과 특별한 기후를 각각 모을 수 있습니다.</p>
  <nav className="album-sections" aria-label="도감 분류"><button type="button" aria-pressed={part==='scenes'} onClick={()=>setPart('scenes')}>풍경</button><button type="button" aria-pressed={part==='crystals'} onClick={()=>setPart('crystals')}>수정</button><button type="button" aria-pressed={part==='discoveries'} onClick={()=>setPart('discoveries')}>작은 발견</button></nav>
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
   {selected&&<><div className="album-dialog-top"><strong>{routeInfo[selected].label}</strong><div><button type="button" onClick={()=>setFull(true)}>⛶ 가로 감상</button><button type="button" onClick={()=>dialog.current?.close()}>닫기</button></div></div>
    <div className="album-landscape"><Vista scenery={selected} light={light} weather={weather}/></div>
    <div className="album-selector" role="group" aria-label="발견한 시간대">{moods.map(m=><button type="button" key={m} aria-pressed={m===light} disabled={!shots.has(shotKey(selected,m))} onClick={()=>chooseLight(m)}>{lights[m]}</button>)}</div>
    <div className="album-selector" role="group" aria-label="발견한 특별한 하늘"><button type="button" aria-pressed={weather==='clear'} onClick={()=>chooseWeather('clear')}>평온한 하늘</button>{weatherAt(selected,light).map(w=><button type="button" key={w} aria-pressed={weather===w} onClick={()=>chooseWeather(w)}>✦ {weathers[w]}</button>)}</div>
    <p className="album-help">{weather==='clear'?'다시 감상할 수 있는 평온한 풍경입니다.':`항해 중 만났던 ${weathers[weather]}이(가) 도감에 남아 있어요.`}</p>
   </>}
  </dialog>
  {selected&&full&&<ScenicViewer scenery={selected} phase="platform" light={light} weather={weather} onClose={()=>setFull(false)}/>}
  {selectedCrystal&&createPortal(<div className="crystal-modal" role="presentation" onClick={()=>setSelectedCrystal(null)}><section className="crystal-modal-content" role="dialog" aria-modal="true" aria-label="수정 감상" onClick={e=>e.stopPropagation()}><CrystalArt id={selectedCrystal.id} variant={selectedCrystal.variant}/><h2>{species[selectedCrystal.id].name}</h2><p>{variantNames[selectedCrystal.variant]} · {species[selectedCrystal.id].description}</p><button className="crystal-primary" onClick={()=>setSelectedCrystal(null)}>닫기</button></section></div>,document.body)}
 </section>
}
