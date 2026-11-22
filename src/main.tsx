import {useCallback,useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Cabin} from './Cabin'
import {StationView,stationInfo} from './Station'
import {ScenicViewer} from './ScenicViewer'
import {lights,weathers,type Light,type Weather} from './Vista'
import {routeInfo,sceneryOrder,type Scenery} from './Sky'
import {placeMoments,type MomentAction} from './PlaceMoment'
import {arrivalConversations,interactionConversations} from './Dialogue'
import {DialogueCard} from './DialogueCard'
import {CrystalGarden} from './CrystalGarden'
import {species,rarityNames,loadGame,saveGame,startJourney,settleJourney,advanceGrowth,completeLanding,plantSeed,careCrystal,nourishCrystal,harvestCrystal,rareLocations,type TripHours} from './Crystals'
import './style.css'

type JourneyPhase='moving'|'arriving'|'stopped'|'platform'
const weatherChoices:Weather[]=['clear','rain','snow','meteor','aurora']
const weatherGlyphs:Record<Weather,string>={clear:'✧',rain:'☂',snow:'❄',meteor:'☄',aurora:'⋈'}

function App(){
 const [scenery,setScenery]=useState<Scenery>('nebula')
 const [phase,setPhase]=useState<JourneyPhase>('moving')
 const [light,setLight]=useState<Light>('dusk')
 const [weather,setWeather]=useState<Weather>('clear')
 const [viewer,setViewer]=useState(false)
 const [moment,setMoment]=useState(0)
 const [momentAction,setMomentAction]=useState<MomentAction|null>(null)
 const [momentCounts,setMomentCounts]=useState<Record<string,number>>({})
 const [arrivalTalkIndex,setArrivalTalkIndex]=useState(0)
 const [crystal,setCrystal]=useState(loadGame)
 const [travelHours,setTravelHours]=useState<TripHours>(3)
 const [page,setPage]=useState<'train'|'crystal'>('train')
 const [now,setNow]=useState(()=>Date.now())
 // 실제 시간은 저장한 항해 종료 시각을 기준으로 진행합니다. 다시 열어도 처음부터 시작하지 않아요.
 useEffect(()=>{
   const timer=window.setInterval(()=>setNow(Date.now()),15000)
   const visible=()=>{if(document.visibilityState==='visible')setNow(Date.now())}
   document.addEventListener('visibilitychange',visible)
   return ()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',visible)}
 },[])
 useEffect(()=>{setCrystal(previous=>advanceGrowth(settleJourney(previous,now),now))},[now])
 useEffect(()=>{saveGame(crystal)},[crystal])
 useEffect(()=>{
  const journey=crystal.journey
  if(journey?.settled&&phase==='moving'){
    setScenery(journey.destination);setPhase('stopped');setArrivalTalkIndex(0)
  }
 },[crystal.journey,phase])
 const hideViewer=useCallback(()=>setViewer(false),[])
 const current=routeInfo[scenery],station=stationInfo[scenery],atPlatform=phase==='platform'
 useEffect(()=>{if(phase!=='arriving')return;const t=window.setTimeout(()=>{setPhase('stopped');setArrivalTalkIndex(0)},3300);return ()=>window.clearTimeout(t)},[phase])
 function depart(){
  setCrystal(previous=>completeLanding(previous))
  setScenery(previous=>sceneryOrder[(sceneryOrder.indexOf(previous)+1)%sceneryOrder.length]);setPhase('moving');setMoment(0);setMomentAction(null);setArrivalTalkIndex(0)
 }
 function sail(){
  if(crystal.journey)return
  setCrystal(previous=>startJourney(previous,scenery,travelHours,Date.now()))
  setNow(Date.now())
 }
 function glimpse(){if(!crystal.journey)setPhase('arriving')}
 function harvest(){setCrystal(previous=>harvestCrystal(previous,Date.now()))}
 function fmtWait(ms:number){if(ms<=0)return '도착 준비 중';const h=Math.floor(ms/3600000),m=Math.ceil((ms%3600000)/60000);return `${h}시간 ${m}분`}

 function chooseRoute(route:Scenery){setScenery(route);setMoment(0);setMomentAction(null);setArrivalTalkIndex(0)}
 function experiencePlace(action:MomentAction){
   setMomentAction(action)
   setMoment(n=>n+1)
   const key=`${scenery}-${action}`
   setMomentCounts(previous=>({...previous,[key]:(previous[key]??0)+1}))
 }
 const title=atPlatform?station.name:phase==='stopped'?station.name:phase==='arriving'?'곧 역에 도착합니다':current.title
 return <main className="app">
  <header className="app-header"><div className="brand"><span className="brand-spark" aria-hidden="true">✧</span><span>은하 열차 일지</span></div><span className="top-label">{page==='crystal'?'수정 재배실':atPlatform?'풍경 감상':'전망 객실'}</span></header>
  {page==='train'&&<>
  <section className="hero" aria-label={atPlatform?'하차 후 풍경':'열차 객실'}>
   <div className={`scene-container${atPlatform?' scene-container-vista':''}`} key={`${scenery}-${atPlatform?'vista':'cabin'}`}>
    {atPlatform?<StationView scenery={scenery} light={light} weather={weather} moment={moment} momentAction={momentAction}/>:<Cabin scenery={scenery} state={phase}/>}
   </div>
   <span className="location">✦ &nbsp; {atPlatform||phase==='stopped'?station.name:current.label}</span>
   {!atPlatform&&<div className="caption"><span className="eyebrow">{phase==='stopped'?'ARRIVED AT STATION':'GALACTIC OBSERVATION CAR'}</span><h1>{title}</h1></div>}
   <button className="scenic-toggle" type="button" onClick={()=>setViewer(true)} aria-label="16대9 풍경 감상 화면 열기">⛶ 풍경 감상</button>
  </section>
  <section className="body">
   <div className="intro-rule"><span>✦</span><span>{atPlatform?'별 사이의 풍경':phase==='moving'?'다음 정거장으로':'열차가 잠시 멈추는 곳'}</span><span>✦</span></div>
   {phase==='moving'&&!crystal.journey&&<>
    <div className="scene-picker" role="group" aria-label="시험 운행 항로 선택">
     {sceneryOrder.map(key=><button key={key} type="button" className={`scene-option${scenery===key?' selected':''}`} aria-pressed={scenery===key} onClick={()=>chooseRoute(key)}>{routeInfo[key].icon} {routeInfo[key].label}</button>)}
    </div>
    <p className="intro-copy">{current.description}<br/>다음 역에 내려서 하늘을 구경해 볼까요?</p>
    <div className="travel-lengths" role="group" aria-label="항해 시간">
     {([1,3,8] as const).map(h=><button key={h} className={travelHours===h?'selected':''} onClick={()=>setTravelHours(h)} aria-pressed={travelHours===h}>{h}시간</button>)}
    </div>
    <p className="crystal-help centered">일반 항로의 수정 씨앗 발견 확률: 1시간 40% · 3시간 60% · 8시간 확정.<br/>희귀 장소도 확정이며, 항해 중에 특별한 노선이 열릴 수 있어요.</p>
    <div className="journey-actions"><button className="journey-button primary" disabled={rareLocations.includes(scenery)&&crystal.rareOffer!==scenery} onClick={sail}>✦ {station.name}으로 {travelHours}시간 항해</button></div>
    {rareLocations.includes(scenery)&&crystal.rareOffer!==scenery&&<p className="crystal-help centered">이곳은 희귀 항로입니다. 다른 여행에서 노선을 발견해야 출발할 수 있어요.</p>}
    <div className="journey-actions"><button className="journey-button secondary" onClick={glimpse}>정거장 화면 미리보기 · 보상 없음</button></div>
    {crystal.rareOffer&&<p className="rare-offer">✦ 특별 노선이 열렸어요: {routeInfo[crystal.rareOffer].name}</p>}
   </>}
   {phase==='moving'&&crystal.journey&&!crystal.journey.settled&&<div className="journey-in-progress">
      <p className="intro-copy">은하 열차가 {routeInfo[crystal.journey.destination].name}으로 달리고 있어요.<br/>도착까지 <strong>{fmtWait(crystal.journey.end-now)}</strong> 남았습니다.</p>
      <progress value={Math.min(100,Math.max(0,(now-crystal.journey.start)/(crystal.journey.end-crystal.journey.start)*100))} max={100} aria-label="항해 진행률"/>
      <p className="crystal-help centered">열차는 앱을 닫아도 달립니다. 수정 씨앗은 도착할 때 딱 한 번만 발견 여부를 결정해요.</p>
   </div>}

   {phase==='arriving'&&<><p className="intro-copy">열차가 서서히 속도를 줄여요.<br/>차창 너머로 작은 가로등이 나타납니다.</p><div className="journey-actions"><span className="journey-wait" role="status">✧ 정거장 접근 중…</span></div></>}
   {phase==='stopped'&&<>
    <p className="intro-copy">{station.subtitle}<br/>열차는 언제까지나 기다리고 있어요.</p>
    {crystal.landing?.destination===scenery&&<div className="landing-reward" role="status">
     <strong>✦ 항해 보상</strong>
     {crystal.landing.seed?<p>수정 씨앗 발견! <b>{crystal.landing.seed.id&&species[crystal.landing.seed.id].name}</b> · {rarityNames[species[crystal.landing.seed.id].rarity]}</p>:<p>이번에는 수정 씨앗을 발견하지 못했어요. 다음 별에서 다시 찾아봐요.</p>}
     <p>별빛 영양액 {crystal.landing.bonuses.length}개 획득 · {crystal.landing.hours}시간 항해 {crystal.landing.rare?'· 희귀 장소':''}</p>
     <button onClick={()=>setPage('crystal')}>◇ 수정 재배실 열기</button>
    </div>}

    <section className="arrival-conversation" aria-label="역에 도착한 소녀와 고양이의 대화">
      <div className="encounter-caption"><span aria-hidden="true">✧</span>창가에서 나눈 이야기</div>
      <DialogueCard conversation={arrivalConversations[scenery][arrivalTalkIndex]} label="소녀와 고양이의 도착 대화"/>
      <button className="dialogue-next" type="button" onClick={()=>setArrivalTalkIndex(v=>(v+1)%arrivalConversations[scenery].length)}>🐾 더 이야기하기</button>
    </section>
    <div className="journey-actions"><button className="journey-button primary" onClick={()=>setPhase('platform')}>✧ 내려서 풍경 보기</button><button className="journey-button secondary" onClick={depart}>다음 항로 출발</button></div>
   </>}
   {atPlatform&&<>
    <div className="vista-intro"><h1>{title}</h1><p>{station.caption}</p></div>
    <section className="view-controls" aria-label="풍경 바꾸기">
     <span className="control-heading">같은 풍경, 다른 하늘</span>
     <div className="light-switch" role="group" aria-label="하늘 시간대">
      {(['dawn','dusk','night'] as const).map(m=><button key={m} className={light===m?'active':''} aria-pressed={light===m} onClick={()=>setLight(m)}>{m==='dawn'?'☀':m==='dusk'?'◐':'☾'} {lights[m]}</button>)}
     </div>
     <span className="control-heading control-heading-weather">특별한 하늘</span>
     <div className="weather-switch" role="group" aria-label="날씨와 천체 현상">
      {weatherChoices.map(w=><button key={w} className={weather===w?'active':''} aria-pressed={weather===w} onClick={()=>setWeather(w)}>{weatherGlyphs[w]} {weathers[w]}</button>)}
     </div>
    </section>
    <section className="place-encounter" aria-labelledby="place-encounter-title">
      <div className="encounter-caption"><span aria-hidden="true">✧</span><span id="place-encounter-title">이곳에서의 작은 발견</span></div>
      <div className="place-encounter-choices" role="group" aria-label="이 지역에서 할 일">
       {placeMoments[scenery].actions.map((action,index)=><button key={index} type="button"
         className={`place-encounter-button${momentAction===index?' selected':''}`}
         aria-pressed={momentAction===index}
         onClick={()=>experiencePlace(index as MomentAction)}>
          <span aria-hidden="true">✦</span><span>{action.label}<small>{action.hint}</small></span>
       </button>)}
      </div>
      <p className="encounter-result" role="status">{momentAction===null
        ? placeMoments[scenery].before
        : placeMoments[scenery].actions[momentAction].lines[((momentCounts[`${scenery}-${momentAction}`]??1)-1)%3]}</p>
      {momentAction!==null&&<DialogueCard
        conversation={interactionConversations[scenery][momentAction][((momentCounts[`${scenery}-${momentAction}`]??1)-1)%3]}
        label="풍경을 보며 나누는 소녀와 고양이의 대화"/>}
      <p className="encounter-footnote">한 번 더 누르면 다른 대화를 나눠요. 풍경의 빛은 잠시 머물다 사라집니다.</p>
    </section>
    <div className="journey-actions vista-actions"><button className="journey-button primary" onClick={()=>setViewer(true)}>⛶ 가로 풍경 감상</button><button className="journey-button secondary" onClick={()=>setPhase('stopped')}>← 객실로 돌아가기</button></div>
   </>}
   <p className="stage-footnote">우주 자연 풍경 다섯 곳과 먼 도시 한 곳을 여행하는 항로예요. 수정 씨앗은 항해 종료 시 한 번만 추첨되며, 성장과 기록은 기기에 저장됩니다.</p>
  </section>
  </>}
  {page==='crystal'&&<div className="crystal-page"><CrystalGarden game={crystal} now={now} light={light} onLight={setLight}
   onPlant={key=>setCrystal(previous=>plantSeed(previous,key,Date.now(),light))}
   onCare={kind=>setCrystal(previous=>careCrystal(previous,kind,light,Date.now()))}
   onNourish={id=>setCrystal(previous=>nourishCrystal(previous,id,light,Date.now()))}
   onHarvest={harvest} onTravel={()=>setPage('train')}/></div>}
  <nav className="bottom-nav" aria-label="주 메뉴"><button className={page==='train'?'active-tab':''} aria-current={page==='train'?'page':undefined} onClick={()=>setPage('train')}><span aria-hidden="true">✧</span> 열차</button><button className={page==='crystal'?'active-tab':''} aria-current={page==='crystal'?'page':undefined} onClick={()=>setPage('crystal')}><span aria-hidden="true">◇</span> 수정 재배 <small>{crystal.seeds.length?`씨앗 ${crystal.seeds.length}`:''}</small></button><span className="future-tab"><span aria-hidden="true">▤</span> 기록 <small>준비 중</small></span></nav>
  {viewer&&<ScenicViewer scenery={scenery} phase={phase} light={light} weather={weather} moment={moment} momentAction={momentAction} onClose={hideViewer}/>}
 </main>
}
createRoot(document.getElementById('root')!).render(<App/>)
