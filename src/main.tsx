import {useCallback,useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Cabin} from './Cabin'
import {StationView,stationInfo} from './Station'
import {ScenicViewer} from './ScenicViewer'
import {lights,weathers,type Light,type Weather} from './Vista'
import type {Scenery} from './Sky'
import './style.css'

type JourneyPhase='moving'|'arriving'|'stopped'|'platform'
const sceneryInfo={
 nebula:{name:'라일락 성운',title:'별 사이를 달리는 밤',text:'보랏빛 성운과 작은 고리행성이 조용히 흘러가요.'},
 city:{name:'유리도시 항로',title:'불빛이 흐르는 창밖',text:'수많은 창문과 달빛이 먼 도시에 내려앉아요.'}
} satisfies Record<Scenery,{name:string;title:string;text:string}>
const weatherChoices:Weather[]=['clear','rain','snow','mist','meteor','aurora']
const weatherGlyphs:Record<Weather,string>={clear:'✧',rain:'☂',snow:'❄',mist:'≋',meteor:'☄',aurora:'⋈'}

function App(){
 const [scenery,setScenery]=useState<Scenery>('nebula')
 const [phase,setPhase]=useState<JourneyPhase>('moving')
 const [light,setLight]=useState<Light>('dusk')
 const [weather,setWeather]=useState<Weather>('clear')
 const [viewer,setViewer]=useState(false)
 const hideViewer=useCallback(()=>setViewer(false),[])
 const current=sceneryInfo[scenery],station=stationInfo[scenery],atPlatform=phase==='platform'
 useEffect(()=>{if(phase!=='arriving')return;const t=window.setTimeout(()=>setPhase('stopped'),3300);return ()=>window.clearTimeout(t)},[phase])
 function depart(){setScenery(previous=>previous==='nebula'?'city':'nebula');setPhase('moving')}
 const title=atPlatform?station.name:phase==='stopped'?station.name:phase==='arriving'?'곧 역에 도착합니다':current.title
 return <main className="app">
  <header className="app-header"><div className="brand"><span className="brand-spark" aria-hidden="true">✧</span><span>은하 열차 일지</span></div><span className="top-label">{atPlatform?'풍경 감상': '전망 객실'}</span></header>
  <section className="hero" aria-label={atPlatform?'하차 후 풍경':'열차 객실'}>
   <div className={`scene-container${atPlatform?' scene-container-vista':''}`} key={`${scenery}-${atPlatform?'vista':'cabin'}`}>
    {atPlatform?<StationView scenery={scenery} light={light} weather={weather}/>:<Cabin scenery={scenery} state={phase}/>}
   </div>
   <span className="location">✦ &nbsp; {atPlatform||phase==='stopped'?station.name:current.name}</span>
   {!atPlatform&&<div className="caption"><span className="eyebrow">{phase==='stopped'?'ARRIVED AT STATION':'GALACTIC OBSERVATION CAR'}</span><h1>{title}</h1></div>}
   <button className="scenic-toggle" type="button" onClick={()=>setViewer(true)} aria-label="16대9 풍경 감상 화면 열기">⛶ 풍경 감상</button>
  </section>
  <section className="body">
   <div className="intro-rule"><span>✦</span><span>{atPlatform?'별 사이의 풍경':phase==='moving'?'다음 정거장으로':'열차가 잠시 멈추는 곳'}</span><span>✦</span></div>
   {phase==='moving'&&<>
    <div className="scene-picker" role="group" aria-label="시험 운행 항로 선택">
     <button className={`scene-option${scenery==='nebula'?' selected':''}`} aria-pressed={scenery==='nebula'} onClick={()=>setScenery('nebula')}>✦ 성운 항로</button>
     <button className={`scene-option${scenery==='city'?' selected':''}`} aria-pressed={scenery==='city'} onClick={()=>setScenery('city')}>▥ 도시 야경</button>
    </div>
    <p className="intro-copy">{current.text}<br/>다음 역에 내려서 하늘을 구경해 볼까요?</p>
    <div className="journey-actions"><button className="journey-button primary" onClick={()=>setPhase('arriving')}>✦ {station.name}에 도착하기</button></div>
   </>}
   {phase==='arriving'&&<><p className="intro-copy">열차가 서서히 속도를 줄여요.<br/>차창 너머로 작은 가로등이 나타납니다.</p><div className="journey-actions"><span className="journey-wait" role="status">✧ 정거장 접근 중…</span></div></>}
   {phase==='stopped'&&<><p className="intro-copy">{station.subtitle}<br/>열차는 언제까지나 기다리고 있어요.</p><div className="journey-actions"><button className="journey-button primary" onClick={()=>setPhase('platform')}>✧ 내려서 풍경 보기</button><button className="journey-button secondary" onClick={depart}>다음 항로 출발</button></div></>}
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
    <div className="journey-actions vista-actions"><button className="journey-button primary" onClick={()=>setViewer(true)}>⛶ 가로 풍경 감상</button><button className="journey-button secondary" onClick={()=>setPhase('stopped')}>← 객실로 돌아가기</button></div>
   </>}
   <p className="stage-footnote">아직 두 개의 풍경을 다듬는 중이에요. 씨수정 재배와 도감은 이후에 이어집니다.</p>
  </section>
  <nav className="bottom-nav" aria-label="주 메뉴"><span className="active-tab" aria-current="page"><span aria-hidden="true">✧</span> 열차</span><span className="future-tab"><span aria-hidden="true">◇</span> 씨수정 <small>준비 중</small></span><span className="future-tab"><span aria-hidden="true">▤</span> 기록 <small>준비 중</small></span></nav>
  {viewer&&<ScenicViewer scenery={scenery} phase={phase} light={light} weather={weather} onClose={hideViewer}/>}
 </main>
}
createRoot(document.getElementById('root')!).render(<App/>)
