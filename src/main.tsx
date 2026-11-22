import {useCallback,useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Cabin} from './Cabin'
import {StationView,stationInfo} from './Station'
import {ScenicViewer} from './ScenicViewer'
import {lights,weathers,type Light,type Weather} from './Vista'
import {routeInfo,type Scenery} from './Sky'
import {placeMoments,type MomentAction} from './PlaceMoment'
import {arrivalConversations,interactionConversations} from './Dialogue'
import {DialogueCard} from './DialogueCard'
import {CrystalGarden} from './CrystalGarden'
import {SceneryGallery} from './SceneryGallery'
import {species,rarityNames,loadGame,saveGame,startJourney,settleJourney,advanceGrowth,completeLanding,experienceLanding,voyageLight,plantSeed,careCrystal,nourishCrystal,harvestCrystal,type TripHours} from './Crystals'
import './style.css'

type JourneyPhase='moving'|'arriving'|'stopped'|'platform'

function App(){
 const [scenery,setScenery]=useState<Scenery>('nebula')
 const [phase,setPhase]=useState<JourneyPhase>('moving')
 const [light,setLight]=useState<Light>('dusk')
 const [viewer,setViewer]=useState(false)
 const [moment,setMoment]=useState(0)
 const [momentAction,setMomentAction]=useState<MomentAction|null>(null)
 const [crystal,setCrystal]=useState(loadGame)
 const [travelHours,setTravelHours]=useState<TripHours>(3)
 const [page,setPage]=useState<'train'|'crystal'|'album'>('train')
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
  if(journey&&phase==='moving'){
    setScenery(journey.destination)
    if(journey.settled)setPhase('stopped')
  }
 },[crystal.journey,phase])
 useEffect(()=>{
  if(!crystal.journey&&phase==='moving'&&!(crystal.routeOffers??[]).includes(scenery)&&crystal.rareOffer!==scenery){
   setScenery(crystal.routeOffers?.[0]??'nebula')
  }
 },[crystal.journey,crystal.routeOffers,crystal.rareOffer,phase,scenery])
 const hideViewer=useCallback(()=>setViewer(false),[])
 const current=routeInfo[scenery],station=stationInfo[scenery],atPlatform=phase==='platform'
 const landed=crystal.landing?.destination===scenery?crystal.landing:null
 const skyLight:Light=crystal.journey?voyageLight(crystal.journey.hours):'dusk'
 const skyWeather:Weather=crystal.journey?.settled?(landed?.weather??'clear'):'clear'
 useEffect(()=>{if(phase!=='arriving')return;const t=window.setTimeout(()=>{setPhase('stopped')},3300);return ()=>window.clearTimeout(t)},[phase])
 function depart(){
  setCrystal(previous=>completeLanding(previous))
  setScenery('nebula');setPhase('moving');setMoment(0);setMomentAction(null)
 }
 function sail(){
  if(crystal.journey)return
  setCrystal(previous=>startJourney(previous,scenery,travelHours,Date.now()))
  setNow(Date.now())
 }
 function harvest(){setCrystal(previous=>harvestCrystal(previous,Date.now()))}
 function fmtWait(ms:number){if(ms<=0)return '도착 준비 중';const h=Math.floor(ms/3600000),m=Math.ceil((ms%3600000)/60000);return `${h}시간 ${m}분`}

 function chooseRoute(route:Scenery){if(!crystal.routeOffers?.includes(route)&&crystal.rareOffer!==route)return;setScenery(route);setMoment(0);setMomentAction(null)}
 function experiencePlace(action:MomentAction){
   if(!landed||landed.experienced||action!==(landed.action??0))return
   setMomentAction(action);setMoment(n=>n+1)
   setCrystal(previous=>experienceLanding(previous))
 }
 const title=atPlatform?station.name:phase==='stopped'?station.name:phase==='arriving'?'곧 역에 도착합니다':current.title
 return <main className="app">
  <header className="app-header"><div className="brand"><span className="brand-spark" aria-hidden="true">✧</span><span>은하 열차 일지</span></div><span className="top-label">{page==='crystal'?'수정 재배실':page==='album'?'별 도감':atPlatform?'풍경 감상':'전망 객실'}</span></header>
  {page==='train'&&<>
  <section className="hero" aria-label={atPlatform?'하차 후 풍경':'열차 객실'}>
   <div className={`scene-container${atPlatform?' scene-container-vista':''}`} key={`${scenery}-${atPlatform?'vista':'cabin'}`}>
    {atPlatform?<StationView scenery={scenery} light={skyLight} weather={skyWeather} moment={moment} momentAction={momentAction}/>:<Cabin scenery={scenery} state={phase} light={skyLight} weather={skyWeather}/>}
   </div>
   <span className="location">✦ &nbsp; {atPlatform||phase==='stopped'?station.name:current.label}</span>
   {!atPlatform&&<div className="caption"><span className="eyebrow">{phase==='stopped'?'ARRIVED AT STATION':'GALACTIC OBSERVATION CAR'}</span><h1>{title}</h1></div>}
   <button className="scenic-toggle" type="button" onClick={()=>setViewer(true)} aria-label="16대9 풍경 감상 화면 열기">⛶ 풍경 감상</button>
  </section>
  <section className="body">
   <div className="intro-rule"><span>✦</span><span>{atPlatform?'별 사이의 풍경':phase==='moving'?'다음 정거장으로':'열차가 잠시 멈추는 곳'}</span><span>✦</span></div>
   {phase==='moving'&&!crystal.journey&&<>
    <p className="crystal-help centered">얼마나 오래 항해할까요?</p>
    <div className="travel-lengths" role="group" aria-label="항해 시간">
     {([1,3,8] as const).map(h=><button key={h} className={travelHours===h?'selected':''} onClick={()=>setTravelHours(h)} aria-pressed={travelHours===h}>{h}시간</button>)}
    </div>
    <p className="crystal-help centered">1시간은 노을 · 3시간은 새벽 · 8시간은 한밤의 풍경입니다.<br/>도착지의 기후는 항해할 때마다 새롭게 결정됩니다.</p>
    <div className="route-heading"><h3>이번에 발견한 두 갈래 길</h3><span>다음 항해를 시작하면 새로운 두 후보가 찾아와요.</span></div>
    <div className="scene-picker" role="group" aria-label="이번 항해에 제안된 두 행성">
     {(crystal.routeOffers??[]).map(key=><button key={key} type="button" className={`scene-option${scenery===key?' selected':''}`} aria-pressed={scenery===key} onClick={()=>chooseRoute(key)}>{routeInfo[key].icon} {routeInfo[key].label}</button>)}
    </div>
    {crystal.rareOffer&&<div className="rare-discovery"><strong>✦ 뜻밖의 희귀 항로를 발견했어요!</strong><button className={`scene-option${scenery===crystal.rareOffer?' selected':''}`} type="button" onClick={()=>chooseRoute(crystal.rareOffer!)}>{routeInfo[crystal.rareOffer].icon} {routeInfo[crystal.rareOffer].label} · 특별한 기회</button></div>}
    <p className="intro-copy">마음이 끌리는 행성을 골라 주세요. 같은 행성도 다시 찾아오면 새로운 하늘을 만날 수 있어요.</p>
    <div className="journey-actions"><button className="journey-button primary" disabled={!(crystal.routeOffers??[]).includes(scenery)&&crystal.rareOffer!==scenery} onClick={sail}>✦ {((crystal.routeOffers??[]).includes(scenery)||crystal.rareOffer===scenery)?station.name:'행성을 선택하면'} · {travelHours}시간 항해</button></div>
   </>}
   {phase==='moving'&&crystal.journey&&!crystal.journey.settled&&<div className="journey-in-progress">
      <p className="intro-copy">은하 열차가 {routeInfo[crystal.journey.destination].name}으로 달리고 있어요.<br/>도착까지 <strong>{fmtWait(crystal.journey.end-now)}</strong> 남았습니다.</p>
      <progress value={Math.min(100,Math.max(0,(now-crystal.journey.start)/(crystal.journey.end-crystal.journey.start)*100))} max={100} aria-label="항해 진행률"/>
      <p className="crystal-help centered">열차는 앱을 닫아도 달립니다. 수정 씨앗은 도착할 때 딱 한 번만 발견 여부를 결정해요.</p>
   </div>}

   {phase==='arriving'&&<><p className="intro-copy">열차가 서서히 속도를 줄여요.<br/>차창 너머로 작은 가로등이 나타납니다.</p><div className="journey-actions"><span className="journey-wait" role="status">✧ 정거장 접근 중…</span></div></>}
   {phase==='stopped'&&<>
    <p className="intro-copy">{station.subtitle}<br/>이번 여행에서 만난 하늘: <b>{lights[skyLight]} · {weathers[skyWeather]}</b>{landed?.newScenery&&<span> ✦ 처음 만난 풍경!</span>}</p>
    {crystal.landing?.destination===scenery&&<div className="landing-reward" role="status">
     <strong>✦ 항해 보상</strong>
     {crystal.landing.seed?<p>수정 씨앗 발견! <b>{crystal.landing.seed.id&&species[crystal.landing.seed.id].name}</b> · {rarityNames[species[crystal.landing.seed.id].rarity]}</p>:<p>이번에는 수정 씨앗을 발견하지 못했어요. 다음 별에서 다시 찾아봐요.</p>}
     <p>별빛 영양액 {crystal.landing.bonuses.length}개 획득 · {crystal.landing.hours}시간 항해 {crystal.landing.rare?'· 희귀 장소':''}</p>
     <button onClick={()=>setPage('crystal')}>◇ 수정 재배실 열기</button>
    </div>}

    <section className="arrival-conversation" aria-label="역에 도착한 소녀와 고양이의 대화">
      <div className="encounter-caption"><span aria-hidden="true">✧</span>창가에서 나눈 이야기</div>
      <DialogueCard conversation={arrivalConversations[scenery][landed?.dialogue??0]} label="소녀와 고양이의 도착 대화"/>
    </section>
    <div className="journey-actions"><button className="journey-button primary" onClick={()=>setPhase('platform')}>✧ 내려서 풍경 보기</button><button className="journey-button secondary" onClick={depart}>다음 항로 출발</button></div>
   </>}
   {atPlatform&&<>
    <div className="vista-intro"><h1>{title}</h1><p>{station.caption}</p></div>
    <p className="weather-memory">✧ 이번 행성의 하늘은 <b>{lights[skyLight]} · {weathers[skyWeather]}</b>입니다. 다음에 돌아오면 다른 모습일지도 몰라요.</p>
    <section className="place-encounter" aria-labelledby="place-encounter-title">
     <div className="encounter-caption"><span aria-hidden="true">✧</span><span id="place-encounter-title">이곳에서의 작은 발견</span></div>
     <p className="encounter-result">{placeMoments[scenery].before}</p>
     {landed&&!landed.experienced?<div className="place-encounter-choices"><button className="place-encounter-button" type="button" onClick={()=>experiencePlace(landed.action??0)}>
      <span aria-hidden="true">✦</span><span>{placeMoments[scenery].actions[landed.action??0].label}<small>이번 여행에서 마주친 단 하나의 순간</small></span>
     </button></div>:null}
     {landed?.experienced&&<>
      <p className="encounter-result" role="status">{placeMoments[scenery].actions[landed.action??0].lines[landed.dialogue??0]}</p>
      <DialogueCard conversation={interactionConversations[scenery][landed.action??0][landed.dialogue??0]} label="소녀와 고양이의 발견 대화"/>
      <p className="encounter-footnote">이 여행의 발견을 기억했어요. 다음번에는 다른 순간이 찾아올 수 있어요.</p>
     </>}
    </section>
    <div className="journey-actions vista-actions"><button className="journey-button primary" onClick={()=>setViewer(true)}>⛶ 가로 풍경 감상</button><button className="journey-button secondary" onClick={()=>setPhase('stopped')}>← 객실로 돌아가기</button></div>
   </>}
   <p className="stage-footnote">다음 목적지 두 곳과 도착 기후는 항해마다 달라집니다. 같은 행성에서도 새로운 풍경을 만날 수 있어요. 씨앗 보상과 발견 기록은 기기에 저장됩니다.</p>
  </section>
  </>}
  {page==='crystal'&&<div className="crystal-page"><CrystalGarden game={crystal} now={now} light={light} onLight={setLight}
   onPlant={key=>setCrystal(previous=>plantSeed(previous,key,Date.now(),light))}
   onCare={kind=>setCrystal(previous=>careCrystal(previous,kind,light,Date.now()))}
   onNourish={id=>setCrystal(previous=>nourishCrystal(previous,id,light,Date.now()))}
   onHarvest={harvest} onTravel={()=>setPage('train')}/></div>}
  {page==='album'&&<div className="scene-gallery-page"><SceneryGallery game={crystal} onSail={()=>setPage('train')}/></div>}
  <nav className="bottom-nav" aria-label="주 메뉴"><button className={page==='train'?'active-tab':''} aria-current={page==='train'?'page':undefined} onClick={()=>setPage('train')}><span aria-hidden="true">✧</span> 열차</button><button className={page==='crystal'?'active-tab':''} aria-current={page==='crystal'?'page':undefined} onClick={()=>setPage('crystal')}><span aria-hidden="true">◇</span> 수정 재배 <small>{crystal.seeds.length?`씨앗 ${crystal.seeds.length}`:''}</small></button><button className={page==='album'?'active-tab':''} aria-current={page==='album'?'page':undefined} onClick={()=>setPage('album')}><span aria-hidden="true">▤</span> 별 도감 <small>{crystal.sceneCards?.length??0}/6</small></button></nav>
  {viewer&&<ScenicViewer scenery={scenery} phase={phase} light={skyLight} weather={skyWeather} moment={moment} momentAction={momentAction} onClose={hideViewer}/>}
 </main>
}
createRoot(document.getElementById('root')!).render(<App/>)
