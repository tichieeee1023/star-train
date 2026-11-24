import {useCallback,useEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Cabin} from './Cabin'
import {StationView,stationInfo} from './Station'
import {ScenicViewer} from './ScenicViewer'
import {lights,weathers,type Light,type Weather} from './Vista'
import {routeInfo,type Scenery} from './Sky'
import {placeMoments,type MomentAction} from './PlaceMoment'
import {arrivalConversations,interactionConversations} from './Dialogue'
import {arrivalCameos,momentCameos,bondCameos,withCameo} from './CanaryCameos'
import {CabinDialogue} from './CabinDialogue'
import {CrystalArt} from './CrystalArt'
import {AutoDialogue} from './AutoDialogue'
import {TrainShop} from './TrainShop'
import {buyCrystalSeed,buyNutrient,crystalSeedPrice,nutrientPrices} from './CrystalShop'
import {SpecialCG} from './SpecialCG'
import {triggerSnack,triggerPet} from './Companions'
import {snacks,conductorReady,greetConductor,claimDaily,buySnack,eatSnack,snackStories,snackStory,trainBanter,conductorStoryFor,memoryNames,memorySnack,type SnackId,type MemoryId,type Story} from './TrainLife'
import {CabinCare} from './CabinCare'
import {petCat,talkGirl,talkCanary,grantBondRewards,levelOf,bondStories} from './CabinBond'
import {canaryConversation,canaryChapters,canaryArrivalStories} from './CanaryStories'
import {CrystalGarden} from './CrystalGarden'
import {SceneryGallery} from './SceneryGallery'
import {voyageStage,stageNames} from './VoyageSky'
import {planVoyageEvents,pendingEvents,voyageLog,eventKinds,isClaimed,isLive,claimVoyageEvent,voyageEventStory,type VoyageEvent} from './VoyageEvents'
import {InstallApp,registerAppWorker} from './InstallApp'
import {species,rarityNames,loadGame,saveGame,startJourney,settleJourney,advanceGrowth,completeLanding,experienceLanding,voyageLight,plantSeed,careCrystal,nourishCrystal,harvestCrystal,type TripHours,type CrystalId,type Fertilizer} from './Crystals'
import './style.css'

type JourneyPhase='moving'|'arriving'|'stopped'|'platform'
type Page='train'|'crystal'|'album'|'shop'
function readLastPage():Page{try{const page=localStorage.getItem('galaxy-train-last-page');return page==='crystal'||page==='album'||page==='shop'?page:'train'}catch{return 'train'}}
function readHours():TripHours{try{const h=Number(localStorage.getItem('galaxy-train-hours'));return h===1||h===3||h===8?h:3}catch{return 3}}

function App(){
 const [crystal,setCrystal]=useState(loadGame)
 const [scenery,setScenery]=useState<Scenery>(()=>crystal.journey?.destination??crystal.routeOffers?.[0]??'nebula')
 const [phase,setPhase]=useState<JourneyPhase>(()=>crystal.journey?.settled?'stopped':'moving')
 const [light,setLight]=useState<Light>('dusk')
 const [viewer,setViewer]=useState(false)
 const [moment,setMoment]=useState(0)
 const [momentAction,setMomentAction]=useState<MomentAction|null>(null)
 const [travelHours,setTravelHours]=useState<TripHours>(readHours)
 const [page,setPage]=useState<Page>(readLastPage)
 const [shopStart,setShopStart]=useState<'seed'|'nutrient'|'snack'>('seed')
 const [routeDialogOpen,setRouteDialogOpen]=useState(false)
 const routeDialog=useRef<HTMLDialogElement>(null)
 const heroRef=useRef<HTMLElement>(null)
 const careRef=useRef<HTMLDivElement>(null)
 const [now,setNow]=useState(()=>Date.now())
 const [story,setStory]=useState<Story|null>(null)
 const [storyIndex,setStoryIndex]=useState(0)
 const [feedback,setFeedback]=useState('')
 const [careNote,setCareNote]=useState('')
 const [eventNotice,setEventNotice]=useState('')
 const [heart,setHeart]=useState(0)
 useEffect(()=>{if(!careNote)return;const t=window.setTimeout(()=>setCareNote(''),6000);return ()=>window.clearTimeout(t)},[careNote])
 useEffect(()=>{if(!feedback)return;const t=window.setTimeout(()=>setFeedback(''),3200);return ()=>window.clearTimeout(t)},[feedback])
 const lastArrivalStory=useRef<string|null>(null)
 useEffect(()=>{if(routeDialogOpen)routeDialog.current?.showModal();else routeDialog.current?.close()},[routeDialogOpen])
 useEffect(()=>{try{localStorage.setItem('galaxy-train-hours',String(travelHours))}catch{}},[travelHours])
 function changePage(target:Page,shopCategory:'seed'|'nutrient'|'snack'='seed'){if(target==='shop')setShopStart(shopCategory);setPage(target);setStory(null);setRouteDialogOpen(false);try{localStorage.setItem('galaxy-train-last-page',target)}catch{}window.scrollTo({top:0,behavior:'auto'})}
 // 실제 시간은 저장한 항해 종료 시각을 기준으로 진행합니다. 다시 열어도 처음부터 시작하지 않아요.
 useEffect(()=>{
   const timer=window.setInterval(()=>setNow(Date.now()),15000)
   const visible=()=>{if(document.visibilityState==='visible')setNow(Date.now())}
   document.addEventListener('visibilitychange',visible)
   return ()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',visible)}
 },[])
 useEffect(()=>{setCrystal(previous=>advanceGrowth(settleJourney(previous,now),now))},[now])
 useEffect(()=>{saveGame(crystal)},[crystal])
 // 마음 단계가 오르면 보상을 한 번만 지급한다(함수형 갱신이라 다른 정산과 겹쳐도 덮어쓰지 않는다).
 useEffect(()=>{
  const bond=crystal.life?.bond
  if(!bond||levelOf(bond.points)<=bond.rewarded)return
  const level=levelOf(bond.points)
  setCrystal(previous=>grantBondRewards(previous,Date.now()).game)
  setCareNote(`✦ 마음이 Lv.${level}이 되었어요! 보상이 도착했고, 새 마음 대화가 열렸어요.`)
 },[crystal.life?.bond?.points])
 useEffect(()=>{
  const journey=crystal.journey
  if(journey&&phase==='moving'){
    setScenery(journey.destination)
    if(journey.settled)setPhase('arriving')
  }
 },[crystal.journey,phase])
 useEffect(()=>{
  if(!crystal.journey&&phase==='moving'&&!(crystal.routeOffers??[]).includes(scenery)&&crystal.rareOffer!==scenery){
   setScenery(crystal.routeOffers?.[0]??'nebula')
  }
 },[crystal.journey,crystal.routeOffers,crystal.rareOffer,phase,scenery])
 const hideViewer=useCallback(()=>setViewer(false),[])
 function openStory(next:Story,scroll=true){setPage('train');setStory(next);setStoryIndex(0);if(scroll){window.scrollTo({top:0,behavior:'auto'});window.requestAnimationFrame(()=>heroRef.current?.scrollIntoView({block:'start',behavior:'auto'}))}}
 function closeStory(){setStory(null)}
 function handleSeedBuy(id:CrystalId){
  const price=crystalSeedPrice(id,Date.now())
  if(price===null||crystal.life!.coins<price){setFeedback('코인이 부족하거나 항해에서만 얻을 수 있는 씨앗이에요.');return}
  setCrystal(previous=>buyCrystalSeed(previous,id,Date.now()))
  setFeedback(`${species[id].name} 씨앗을 주머니에 담았어요. 재배실에서 심어 보세요!`)
 }
 function handleNutrientBuy(id:Fertilizer){
  if(crystal.life!.coins<nutrientPrices[id]){setFeedback('코인이 부족해요.');return}
  setCrystal(previous=>buyNutrient(previous,id))
  setFeedback('별빛 영양액을 구매했어요. 수정 재배실에서 사용할 수 있어요.')
 }
 function handleBuy(id:SnackId,source:'shop'|'conductor'){
  const life=crystal.life!;const next=buySnack(life,id,source,crystal.journey?.id,Date.now())
  if(next===life){setFeedback('코인이 부족하거나 현재 구매할 수 없는 간식입니다.');return}
  setCrystal(prev=>({...prev,life:buySnack(prev.life!,id,source,prev.journey?.id,Date.now())}));setFeedback(`${snacks[id].name}을(를) 구매했어요.`)
 }
 function handleEat(id:SnackId){
  if((crystal.life?.stock[id]??0)<=0)return
  const turns=crystal.life?.used[id]??0
  setCrystal(prev=>({...prev,life:eatSnack(prev.life!,id)}))
  triggerSnack(id)
  setFeedback(`${snacks[id].name}을(를) 함께 먹었어요.`)
  openStory(snackStory(id,turns))
 }
 function replayMemory(id:MemoryId){const s=snackStory(memorySnack[id],0);openStory({...s,title:memoryNames[id],memory:id})}
function handlePet(){
  const result=petCat(crystal,Date.now());setCareNote(result.message)
  if(result.ok){setCrystal(previous=>petCat(previous,Date.now()).game);setHeart(n=>n+1);triggerPet()}
 }
 function handleTalk(){
  const result=talkGirl(crystal,Date.now())
  if(!result.ok){setCareNote(result.message);return}
  setCrystal(previous=>talkGirl(previous,Date.now()).game);setCareNote('')
  openStory(trainBanter(travelStage??undefined,((result.talkIndex??0)+1)*42000,crystal.journey?.start??17372591))
 }
 function handleCanaryTalk(){
  const result=talkCanary(crystal,Date.now())
  if(!result.ok){setCareNote(result.message);return}
  setCrystal(previous=>talkCanary(previous,Date.now()).game);setCareNote('')
  openStory(canaryConversation(result.talkIndex??0,travelStage??undefined))
 }
 function listenCanaryChapter(index:number){
  if((crystal.life?.bond?.canaryTalks??0)<=([0,2,5,9,14][index]??Infinity))return
  const chapter=canaryChapters[index];if(chapter)openStory(chapter)
 }
 function listenBond(level:number){
  const story=bondStories[level-1];if(!story)return
  setCrystal(previous=>({...previous,life:{...previous.life!,bond:{...previous.life!.bond,unheard:previous.life!.bond.unheard.filter(x=>x!==level)}}}))
  openStory({...story,lines:withCameo(story.lines,bondCameos[level-1])})
 }
 function visitConductor(scroll=true){
  if(!conductorReady(crystal.life!,crystal.journey?.id,Date.now()))return
  const j=crystal.journey
  const stage=j?voyageStage(Math.min(.99999,Math.max(0,(Date.now()-j.start)/(j.end-j.start))),j.hours):undefined
  setCrystal(prev=>({...prev,life:greetConductor(prev.life!,prev.journey?.id,Date.now())}))
  openStory(conductorStoryFor(j?.id??'',stage),scroll)
 }
 function viewVoyageEvent(event:VoyageEvent){
  const at=Date.now(),result=claimVoyageEvent(crystal,event,at)
  if(!result.ok){setCareNote(result.message);return}
  setCrystal(prev=>claimVoyageEvent(prev,event,at).game)
  setCareNote(result.message)
  setEventNotice(result.message)
  setNow(at)
  openStory(voyageEventStory(event))
 }
 const station=stationInfo[scenery],atPlatform=phase==='platform'
 const progress=crystal.journey?Math.min(1,Math.max(0,(now-crystal.journey.start)/(crystal.journey.end-crystal.journey.start))):0
 const travelStage=crystal.journey&&!crystal.journey.settled?voyageStage(progress,crystal.journey.hours):null
 const landed=crystal.landing?.destination===scenery?crystal.landing:null
 const ambient=trainBanter(travelStage??undefined,crystal.journey?now-crystal.journey.start:now,crystal.journey?.start??17372591)
 const visiting=conductorReady(crystal.life!,crystal.journey?.id,now)
 const journeyPlan=crystal.journey?planVoyageEvents(crystal.journey):[]
 const journeyPending=pendingEvents(crystal,now)
 const journeyStats=voyageLog(crystal,now)
 const liveEvent=journeyPending.find(e=>isLive(e,now))
 const skyJourney=crystal.journey&&!crystal.journey.settled?{...crystal.journey,events:journeyPlan}:null

 const skyLight:Light=crystal.journey?voyageLight(crystal.journey.hours):'dusk'
 const skyWeather:Weather=crystal.journey?.settled?(landed?.weather??'clear'):'clear'
 useEffect(()=>{if(phase!=='arriving')return;const t=window.setTimeout(()=>{setPhase('stopped')},3300);return ()=>window.clearTimeout(t)},[phase])
 useEffect(()=>{
  const journeyId=crystal.journey?.id
  if(page==='train'&&phase==='stopped'&&journeyId&&lastArrivalStory.current!==journeyId&&!story&&!viewer&&!routeDialogOpen){
   lastArrivalStory.current=journeyId;openStory({title:'창가에서 나눈 이야기',lines:withCameo(arrivalConversations[scenery][landed?.dialogue??0],arrivalCameos[scenery][landed?.dialogue??0])},false)
  }
 },[phase,page,crystal.journey?.id,story,viewer,routeDialogOpen])
 useEffect(()=>{
  if(page==='train'&&phase==='moving'&&visiting&&!crystal.life!.conductor?.greeted&&!story&&journeyPending.length===0&&!viewer&&!routeDialogOpen)visitConductor(false)
 },[page,phase,visiting,crystal.life?.conductor?.greeted,journeyPending.length,story,viewer,routeDialogOpen])
 function depart(){
  setEventNotice('')
  setCrystal(previous=>completeLanding(previous));setStory(null)
  setScenery(crystal.routeOffers?.[0]??'nebula');setPhase('moving');setMoment(0);setMomentAction(null)
 }
 function sail(){
  if(crystal.journey)return
  setEventNotice('')
  setRouteDialogOpen(false);setStory(null)
  setCrystal(previous=>startJourney(previous,scenery,travelHours,Date.now()))
  setNow(Date.now())
 }
 function openRoute(route:Scenery){chooseRoute(route);setRouteDialogOpen(true)}
 function harvest(){setCrystal(previous=>harvestCrystal(previous,Date.now()))}
 function fmtWait(ms:number){if(ms<=0)return '도착 준비 중';const h=Math.floor(ms/3600000),m=Math.ceil((ms%3600000)/60000);return `${h}시간 ${m}분`}

 function chooseRoute(route:Scenery){if(!crystal.routeOffers?.includes(route)&&crystal.rareOffer!==route)return;setScenery(route);setMoment(0);setMomentAction(null)}
 function experiencePlace(action:MomentAction){
   if(!landed||landed.experienced||action!==(landed.action??0))return
   setMomentAction(action);setMoment(n=>n+1)
   setCrystal(previous=>experienceLanding(previous))
   openStory({title:'이곳에서의 작은 발견',lines:withCameo(interactionConversations[scenery][action][landed.dialogue??0],momentCameos[scenery][action][landed.dialogue??0])})
 }
 const sceneTalk=atPlatform||phase==='stopped'?{title:'창가에서 나눈 이야기',lines:withCameo(arrivalConversations[scenery][landed?.dialogue??0],arrivalCameos[scenery][landed?.dialogue??0])}:ambient
 const title=atPlatform||phase==='stopped'?station.name:phase==='arriving'?'곧 역에 도착합니다':crystal.journey?'별 사이를 건너는 중':'별빛이 머무는 선실'
 return <main className="app">
  <header className="app-header"><div className="brand"><span className="brand-spark" aria-hidden="true">✧</span><span>은하 열차 일지</span></div><div className="header-tools"><span className="top-label">{page==='crystal'?'재배실':page==='album'?'별 도감':page==='shop'?'상점':atPlatform?'하차':'선실'}</span></div></header>
  {page==='train'&&<>
  <section ref={heroRef} tabIndex={-1} className={`hero train-hero${story?' train-hero-speaking':''}`} aria-label={atPlatform?'하차 후 풍경':'열차 객실'}>
   <div className={`scene-container${atPlatform?' scene-container-vista':''}`} key={atPlatform?'vista':phase==='moving'?'space':'station'}>
    {story?.memory?<SpecialCG scene={story.memory}/>:atPlatform?<StationView scenery={scenery} light={skyLight} weather={skyWeather} moment={moment} momentAction={momentAction}/>:<Cabin scenery={scenery} state={phase} light={skyLight} weather={skyWeather} journey={skyJourney}/>}
   </div>
   <span className="location">✦ &nbsp; {atPlatform||phase==='stopped'?station.name:phase==='arriving'?'역에 접근 중':travelStage?stageNames[travelStage]:'별의 바다'}</span>
   {heart>0&&<span key={heart} className="heart-pop" aria-hidden="true" style={{right:'22%',bottom:'27%'}}>♥</span>}
   {phase==='moving'&&liveEvent&&page==='train'&&<button className="voyage-sky-alert" type="button" onClick={()=>viewVoyageEvent(liveEvent)}><span aria-hidden="true">{eventKinds[liveEvent.kind].symbol}</span> 창밖에 {eventKinds[liveEvent.kind].name}!</button>}
   {!story?.memory&&<button className="scenic-toggle" type="button" onClick={()=>setViewer(true)} aria-label="16대9 풍경 감상 화면 열기">⛶ 풍경 감상</button>}
   {story?<div className="train-stage-dialogue"><CabinDialogue story={story} index={storyIndex} onIndex={setStoryIndex} onClose={closeStory} guest={story.title.startsWith('차장')} auto active={!viewer&&!routeDialogOpen}/></div>:
    <div className="train-scene-caption" aria-hidden="true"><small>{atPlatform?'세 친구의 작은 발견':phase==='moving'?'별빛이 흐르는 창가':'잠시 머무르는 정거장'}</small><strong>{title}</strong></div>}
  </section>
  {phase==='stopped'&&<div className="arrival-cta" aria-label="도착 후 하차">
   <div className="arrival-cta-copy"><strong>✦ {station.name}</strong><small>도착했어요 · 이제 풍경 속으로</small></div>
   <button type="button" className="arrival-cta-button" onClick={()=>{setStory(null);setPhase('platform');window.scrollTo({top:0,behavior:'auto'})}}>✧ 내려서 풍경 보기 <span aria-hidden="true">›</span></button>
  </div>}
  {!story&&phase!=='stopped'&&<AutoDialogue key={phase+":"+scenery+":"+(crystal.journey?.id??"idle")} lines={sceneTalk.lines} active={!viewer&&!routeDialogOpen} repeat={phase==='moving'}/>}
  <div className="train-quick-panel">
   {phase==='moving'&&crystal.journey&&!crystal.journey.settled&&<div className="train-journey-snapshot" aria-label="항해 진행 상황"><div><small>✦ 이번 항해</small><strong>{routeInfo[crystal.journey.destination].label}으로 가는 길</strong><span>{fmtWait(crystal.journey.end-now)} 남았어요</span></div><progress value={progress*100} max={100} aria-label="항해 진행률"/></div>}
   <div className="train-quick-actions"><button type="button" onClick={()=>openStory(sceneTalk)}>✧ 대화하기</button><button type="button" onClick={()=>{if(phase==='moving')careRef.current?.scrollIntoView({block:'start',behavior:'smooth'});else setViewer(true)}}>{phase==='moving'?'♡ 친구 돌보기':'⛶ 풍경 감상'}</button><button type="button" onClick={()=>changePage('shop')}>◇ 상점</button></div>
  </div>
  <section className="body">
   <div className="intro-rule"><span>✦</span><span>{atPlatform?'별 사이의 풍경':phase==='moving'?'다음 정거장으로':'열차가 잠시 멈추는 곳'}</span><span>✦</span></div>
   {phase==='moving'&&!crystal.journey&&<>
    <div className="route-heading route-heading-compact"><h3>이번 여행의 두 갈래 길</h3><span>행성을 누르면 출발 준비를 할 수 있어요.</span></div>
    <div className="route-cards" role="group" aria-label="추천 행성 두 곳">
     {(crystal.routeOffers??[]).map(key=><button key={key} type="button" className="route-card" onClick={()=>openRoute(key)} aria-label={`${routeInfo[key].label} 항해 준비`}>
      <span className="route-symbol" aria-hidden="true">{routeInfo[key].icon}</span><span className="route-card-copy"><strong>{routeInfo[key].label}</strong><small>{routeInfo[key].title}</small></span><span aria-hidden="true" className="route-arrow">›</span>
     </button>)}
    </div>
    {crystal.rareOffer&&<div className="rare-discovery"><strong>✦ 뜻밖의 희귀 항로!</strong><button className="route-card" type="button" onClick={()=>openRoute(crystal.rareOffer!)}><span className="route-symbol">✧</span><span className="route-card-copy"><strong>{routeInfo[crystal.rareOffer].label}</strong><small>특별한 별로 떠나는 기회</small></span><span className="route-arrow">›</span></button></div>}
    <p className="route-hint">마음에 드는 행성을 눌러 항해 길이 1 · 3 · 8시간을 선택하세요. 다시 방문하면 다른 하늘을 만날 수 있어요.</p>
   </>}
   {visiting&&<div className="conductor-visit"><div><b>🎩 차장님의 간식 카트가 도착했어요!</b><p>차장에게 말을 걸거나 한정 간식을 구경해 보세요.</p></div><div><button onClick={()=>visitConductor()}>차장과 이야기</button><button onClick={()=>changePage('shop','snack')}>간식 카트</button></div></div>}
   {crystal.journey&&(phase==='moving'||phase==='stopped')&&<section className="voyage-events" aria-label="항해 중 특별 이벤트">
     <div className="voyage-events-heading"><div><span aria-hidden="true">✧</span><strong>창밖의 특별한 순간</strong></div><small>{journeyStats.claimed} / {journeyStats.total} 함께 보기 완료</small></div>
     {eventNotice&&<p className="voyage-event-feedback" role="status">{eventNotice}</p>}
     {journeyPending.length>0?<>
       <p className="voyage-events-hint">{phase==='stopped'?'도착했지만 아직 함께 보지 못한 풍경이 있어요.':'열차가 달리는 동안 특별한 풍경을 만났어요.'} 놓친 장면도 다음 출발 전까지 볼 수 있어요.</p>
       <div className="voyage-event-list">{journeyPending.map(e=><button type="button" className="voyage-event-button" key={e.id} onClick={()=>viewVoyageEvent(e)}>
         <span className="voyage-event-symbol" aria-hidden="true">{eventKinds[e.kind].symbol}</span><span className="voyage-event-copy"><strong>{eventKinds[e.kind].name}</strong><small>{eventKinds[e.kind].teaser}</small><em>{isLive(e,now)?'✦ 지금 창밖에 보여요':'✦ 지나간 별빛을 떠올리기'}</em></span><span className="voyage-event-cta">{eventKinds[e.kind].action} ›</span>
       </button>)}</div>
     </>:<p className="voyage-events-hint">{phase==='stopped'?'이번 여행의 특별한 장면을 모두 보았어요.':journeyStats.upcoming>0?'다음 특별한 풍경을 기다리는 중이에요.':'이번 항해의 특별한 장면을 모두 보았어요.'}</p>}
     {journeyPlan.length>0&&<div className="voyage-event-dots" aria-label="특별 이벤트 진행 기록">{journeyPlan.map(e=><span key={e.id} className={isClaimed(crystal.life,e.id)?'done':now>=e.at?'ready':'future'} title={`${eventKinds[e.kind].name} · ${isClaimed(crystal.life,e.id)?'감상 완료':now>=e.at?'이벤트 도착':'예정'}`}>{isClaimed(crystal.life,e.id)?'✦':now>=e.at?'◈':'·'}</span>)}</div>}
   </section>}
   {phase==='arriving'&&<><p className="intro-copy">열차가 서서히 속도를 줄여요.<br/>차창 너머로 작은 가로등이 나타납니다.</p><div className="journey-actions"><span className="journey-wait" role="status">✧ 정거장 접근 중…</span></div></>}
   {phase==='stopped'&&<>
    <p className="intro-copy">{station.subtitle}<br/>이번 여행에서 만난 하늘: <b>{lights[skyLight]} · {weathers[skyWeather]}</b>{landed?.newScenery&&<span> ✦ 처음 만난 풍경!</span>}</p>
    {crystal.landing?.destination===scenery&&<div className="landing-reward" role="status">
     <strong>✦ 항해 보상</strong>
     {crystal.landing.seed?<div className="landing-seed"><CrystalArt id={crystal.landing.seed.id} growing={{seed:crystal.landing.seed,plantedAt:crystal.landing.seed.obtainedAt,points:0,accountedSlots:0,lastCareSlot:-1,lastCareAt:0,playerVisits:0,catVisits:0,influence:{normal:1,dawn:0,dusk:0,night:0},colorRoll:0,nutritionCount:0}}/><div className="landing-seed-text"><p>수정 씨앗 발견!</p><p><b>{species[crystal.landing.seed.id].name}</b></p><span className={'crystal-rarity '+species[crystal.landing.seed.id].rarity}>{rarityNames[species[crystal.landing.seed.id].rarity]}</span></div></div>:<p>이번에는 수정 씨앗을 발견하지 못했어요. 다음 별에서 다시 찾아봐요.</p>}
     <p>별빛 영양액 {crystal.landing.bonuses.length}개 획득 · {crystal.landing.hours}시간 항해 {crystal.landing.rare?'· 희귀 장소':''}</p>
     <button onClick={()=>changePage('crystal')}>◇ 수정 재배실 열기</button>
    </div>}

    <div className="journey-actions"><button type="button" className="journey-button secondary" onClick={()=>openStory({title:'창가에서 나눈 이야기',lines:withCameo(arrivalConversations[scenery][landed?.dialogue??0],arrivalCameos[scenery][landed?.dialogue??0])})}>✦ 세 친구의 창가 대화 듣기</button><button type="button" className="journey-button secondary" onClick={()=>openStory(canaryArrivalStories[scenery][(landed?.dialogue??0)%canaryArrivalStories[scenery].length])}>♪ 아가씨와 풍경 감상</button></div>
    <div className="journey-actions"><button type="button" className="journey-button secondary" onClick={depart}>다음 항로 출발 ›</button></div>
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
      <button type="button" className="journey-button secondary" onClick={()=>openStory({title:'이곳에서의 작은 발견',lines:withCameo(interactionConversations[scenery][landed.action??0][landed.dialogue??0],momentCameos[scenery][landed.action??0][landed.dialogue??0])})}>✦ 세 친구의 대화 다시 듣기</button>
      <p className="encounter-footnote">이 여행의 발견을 기억했어요. 다음번에는 다른 순간이 찾아올 수 있어요.</p>
     </>}
    </section>
    <div className="journey-actions"><button type="button" className="journey-button secondary" onClick={()=>openStory(canaryArrivalStories[scenery][(landed?.dialogue??0)%canaryArrivalStories[scenery].length])}>♪ 아가씨와 풍경 감상</button></div>
    <div className="journey-actions vista-actions"><button className="journey-button primary" onClick={()=>setViewer(true)}>⛶ 가로 풍경 감상</button><button className="journey-button secondary" onClick={()=>setPhase('stopped')}>← 객실로 돌아가기</button></div>
   </>}
   {phase==='moving'&&<div ref={careRef} className="train-care-anchor"><CabinCare game={crystal} note={careNote} onPet={handlePet} onTalk={handleTalk} onCanary={handleCanaryTalk} onCanaryChapter={listenCanaryChapter} onListen={listenBond} onShop={()=>changePage('shop','snack')}/></div>}
   <p className="stage-footnote">다음 목적지 두 곳과 도착 기후는 항해마다 달라집니다. 같은 행성에서도 새로운 풍경을 만날 수 있어요. 씨앗 보상과 발견 기록은 기기에 저장됩니다.</p>
  </section>
  </>}
  {page==='shop'&&<div className="shop-page"><TrainShop key={shopStart} initialSection={shopStart} game={crystal} now={now} onDaily={()=>{setCrystal(prev=>({...prev,life:claimDaily(prev.life!,Date.now())}));setFeedback('오늘의 승차 기념 5코인을 받았어요.')}} onBuy={handleBuy} onEat={handleEat} onReplay={replayMemory} onConductor={visitConductor} onSeedBuy={handleSeedBuy} onNutrientBuy={handleNutrientBuy} onGarden={()=>changePage('crystal')}/>{feedback&&<p className="shop-feedback" role="status">{feedback}</p>}</div>}
  {page==='crystal'&&<div className="crystal-page"><CrystalGarden game={crystal} now={now} light={light} onLight={setLight}
   onPlant={key=>setCrystal(previous=>plantSeed(previous,key,Date.now(),light))}
   onCare={kind=>setCrystal(previous=>careCrystal(previous,kind,light,Date.now()))}
   onNourish={id=>setCrystal(previous=>nourishCrystal(previous,id,light,Date.now()))}
   onHarvest={harvest} onTravel={()=>changePage('train')} onShop={section=>changePage('shop',section)}/></div>}
  {page==='album'&&<div className="scene-gallery-page"><SceneryGallery game={crystal} onSail={()=>changePage('train')}/></div>}
  <dialog ref={routeDialog} className="route-dialog" onClose={()=>setRouteDialogOpen(false)} aria-labelledby="route-dialog-title">
   <div className="route-dialog-top"><span>✧ &nbsp;다음 항해</span><button type="button" onClick={()=>routeDialog.current?.close()} aria-label="닫기">×</button></div>
   <div className="route-dialog-preview"><span className="route-orb">{routeInfo[scenery].icon}</span><div><h2 id="route-dialog-title">{routeInfo[scenery].name}</h2><p>{routeInfo[scenery].description}</p></div></div>
   <p className="route-dialog-question">얼마나 오래 달릴까요?</p>
   <div className="travel-lengths" role="group" aria-label="항해 시간">
    {([1,3,8] as const).map(h=><button key={h} type="button" className={travelHours===h?'selected':''} onClick={()=>setTravelHours(h)} aria-pressed={travelHours===h}><b>{h===1?'짧게':h===3?'보통':'길게'}</b><small>{h}시간 · {h===1?'노을':h===3?'새벽':'한밤'}</small></button>)}
   </div>
   <p className="route-dialog-note">도착지의 기후는 매번 달라지고, 만난 풍경은 별 도감에 자동 기록돼요.</p>
   <button className="route-depart" type="button" onClick={sail}>✦ &nbsp; 이 행성으로 출발하기</button>
  </dialog>
  <details className="train-app-options"><summary>앱 및 설치 안내</summary><InstallApp/></details>
  <nav className="bottom-nav" aria-label="주 메뉴"><button className={page==='train'?'active-tab':''} aria-current={page==='train'?'page':undefined} onClick={()=>changePage('train')}><span aria-hidden="true">✧</span> 열차</button><button className={page==='crystal'?'active-tab':''} aria-current={page==='crystal'?'page':undefined} onClick={()=>changePage('crystal')}><span aria-hidden="true">◇</span> 수정 재배 <small>{crystal.seeds.length?`씨앗 ${crystal.seeds.length}`:''}</small></button><button className={page==='album'?'active-tab':''} aria-current={page==='album'?'page':undefined} onClick={()=>changePage('album')}><span aria-hidden="true">▤</span> 별 도감 <small>{crystal.sceneCards?.length??0}/10</small></button><button className={page==='shop'?'active-tab':''} aria-current={page==='shop'?'page':undefined} onClick={()=>changePage('shop')}><span aria-hidden="true">▣</span> 별빛 상점 <small>✧ {crystal.life?.coins??0}</small></button></nav>
  {viewer&&<ScenicViewer scenery={scenery} phase={phase} light={skyLight} weather={skyWeather} moment={moment} momentAction={momentAction} journey={skyJourney} conversation={story?.lines??(atPlatform||phase==='stopped'?withCameo(arrivalConversations[scenery][landed?.dialogue??0],arrivalCameos[scenery][landed?.dialogue??0]):ambient.lines)} onClose={hideViewer}/>}
 </main>
}
createRoot(document.getElementById('root')!).render(<App/>)
registerAppWorker()
