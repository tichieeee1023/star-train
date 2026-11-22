import {useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Cabin} from './Cabin'
import {StationView, stationInfo} from './Station'
import type {Scenery} from './Sky'
import './style.css'

type JourneyPhase = 'moving'|'arriving'|'stopped'|'platform'

const sceneryInfo = {
  nebula: {name: '라일락 성운', title: '별 사이를 달리는 밤', text: '하늘을 물들이는 성운과 별빛이 느리게 흐릅니다.'},
  city: {name: '유리도시 항로', title: '불빛이 흐르는 창밖', text: '별 아래 유리도시의 창문들이 조용히 스쳐 갑니다.'}
} satisfies Record<Scenery, {name:string; title:string; text:string}>

function App(){
  const [scenic,setScenic]=useState(false)
  const [scenery,setScenery]=useState<Scenery>('nebula')
  const [phase,setPhase]=useState<JourneyPhase>('moving')
  const current = sceneryInfo[scenery]
  const station = stationInfo[scenery]
  // 현재는 수동 정차 체험입니다. 나중에 시간 연동·자동 정차를 추가할 예정입니다.
  useEffect(()=>{
    if(phase!=='arriving')return
    const timer=window.setTimeout(()=>setPhase('stopped'),3300)
    return ()=>window.clearTimeout(timer)
  },[phase])
  function depart(){
    setScenery(previous=>previous==='nebula'?'city':'nebula')
    setPhase('moving')
  }
  const atPlatform=phase==='platform'
  const title=atPlatform?station.name:phase==='stopped'?station.name:phase==='arriving'?'곧 역에 도착합니다':current.title
  return <main className={scenic?'app scenic-mode':'app'}>
    {!scenic&&<header className="app-header">
      <div className="brand"><span className="brand-spark" aria-hidden="true">✧</span><span>은하 열차 일지</span></div>
      <span className="top-label">{atPlatform?'역 플랫폼':'전망 객실'}</span>
    </header>}
    <section className="hero" aria-label={atPlatform?'역 풍경':'은하 열차 메인 객실'}>
      <div className={`scene-container${atPlatform?' platform-open':''}`} key={`${scenery}-${atPlatform?'platform':'cabin'}`}>
        {atPlatform?<StationView scenery={scenery}/>:<Cabin scenery={scenery} state={phase==='platform'?'stopped':phase}/>}
      </div>
      {!scenic&&<>
        <span className="location">✦ &nbsp; {atPlatform||phase==='stopped'?station.name:current.name}</span>
        <div className="caption"><span className="eyebrow">{atPlatform?'A LITTLE STATION BETWEEN STARS':phase==='stopped'?'ARRIVED AT STATION':'GALACTIC OBSERVATION CAR'}</span><h1>{title}</h1></div>
      </>}
      <button className="scenic-toggle" type="button" aria-pressed={scenic} onClick={()=>setScenic(old=>!old)}>
        {scenic?'← 돌아가기':'✧ 풍경 감상'}
      </button>
    </section>
    {!scenic&&<>
      <section className="body">
        <div className="intro-rule"><span aria-hidden="true">✦</span><span>{atPlatform?'별 사이의 작은 정거장':'창밖 풍경과 정거장'}</span><span aria-hidden="true">✦</span></div>
        {phase==='moving'&&<>
          <div className="scene-picker" role="group" aria-label="테스트 항로 선택">
            <button className={scenery==='nebula'?'scene-option selected':'scene-option'} type="button" aria-pressed={scenery==='nebula'} onClick={()=>setScenery('nebula')}>✦ 성운 항로</button>
            <button className={scenery==='city'?'scene-option selected':'scene-option'} type="button" aria-pressed={scenery==='city'} onClick={()=>setScenery('city')}>▥ 도시 야경</button>
          </div>
          <p className="intro-copy">{current.text}<br/>다음 정거장에서는 잠시 내려 풍경을 볼 수 있어요.</p>
          <div className="journey-actions"><button className="journey-button primary" type="button" onClick={()=>setPhase('arriving')}>✦ {station.name}에 도착해 보기</button></div>
        </>}
        {phase==='arriving'&&<>
          <p className="intro-copy">열차가 천천히 속도를 줄입니다.<br/>창밖에 작은 플랫폼과 가로등이 보이기 시작해요.</p>
          <div className="journey-actions"><span className="journey-wait" role="status">✧ &nbsp; 정거장 접근 중…</span></div>
        </>}
        {phase==='stopped'&&<>
          <p className="intro-copy">{station.subtitle}<br/>열차는 기다리고 있어요. 서둘러 내릴 필요는 없어요.</p>
          <div className="journey-actions"><button className="journey-button primary" type="button" onClick={()=>setPhase('platform')}>✧ 내려서 풍경 보기</button><button className="journey-button secondary" type="button" onClick={depart}>다음 항로로 출발</button></div>
        </>}
        {atPlatform&&<>
          <p className="intro-copy">{station.caption}<br/>별빛을 좀 더 바라보다가 돌아가도 괜찮아요.</p>
          <div className="journey-actions"><button className="journey-button primary" type="button" onClick={()=>setPhase('stopped')}>← 열차 객실로 돌아가기</button></div>
        </>}
        <div className="prototype-note">이번 버전은 <strong>역 정차·하차 장면 체험</strong>입니다. 소녀는 움직이지 않으며 하차는 화면 전환으로 표현해요. 자동 시간 연동, 씨수정 수집과 저장은 이후 단계에서 추가합니다.</div>
      </section>
      <nav className="bottom-nav" aria-label="주 메뉴">
        <span className="active-tab" aria-current="page"><span aria-hidden="true">✧</span> 열차</span>
        <span className="future-tab" aria-label="씨수정 메뉴는 이후 추가 예정"><span aria-hidden="true">◇</span> 씨수정 <small>준비 중</small></span>
        <span className="future-tab" aria-label="여행 기록 메뉴는 이후 추가 예정"><span aria-hidden="true">▤</span> 기록 <small>준비 중</small></span>
      </nav>
    </>}
  </main>
}

createRoot(document.getElementById('root')!).render(<App/>)
