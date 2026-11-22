import {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Cabin} from './Cabin'
import './style.css'

function App(){
  const [scenic,setScenic]=useState(false)
  return <main className={scenic?'app scenic-mode':'app'}>
    {!scenic&&<header className="app-header">
      <div className="brand"><span className="brand-spark" aria-hidden="true">✧</span><span>은하 열차 일지</span></div>
      <span className="top-label">전망 객실</span>
    </header>}
    <section className="hero" aria-label="은하 열차 메인 객실">
      <Cabin/>
      {!scenic&&<>
        <span className="location">✦ &nbsp; 유리창 너머의 은하</span>
        <div className="caption"><span className="eyebrow">GALACTIC OBSERVATION CAR</span><h1>별 사이를 달리는 밤</h1></div>
      </>}
      <button className="scenic-toggle" type="button" aria-pressed={scenic} onClick={()=>setScenic(old=>!old)}>
        {scenic?'← 돌아가기':'✧ 풍경 감상'}
      </button>
    </section>
    {!scenic&&<>
      <section className="body">
        <div className="intro-rule"><span aria-hidden="true">✦</span><span>첫 번째 풍경</span><span aria-hidden="true">✦</span></div>
        <p className="intro-copy">창가에는 조용한 소녀가 앉아 있고,<br/>고양이의 꼬리가 느리게 흔들립니다.<br/>오늘 밤도 하늘은 끝없이 넓어요.</p>
        <div className="prototype-note">지금은 <strong>객실 첫 화면</strong>만 구현한 버전이에요. 풍경의 이동, 도시 야경, 역, 씨수정은 다음 단계에서 하나씩 추가합니다.</div>
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
