import type {MomentAction} from './PlaceMoment'
import type {Conversation} from './Dialogue'
import {AutoDialogue} from './AutoDialogue'
import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {Cabin} from './Cabin'
import {Vista,lights,weathers,type Light,type Weather} from './Vista'
import {routeInfo,type Scenery} from './Sky'
import type {TravelWindow} from './VoyageSky'

type Props={scenery:Scenery; phase:'moving'|'arriving'|'stopped'|'platform'; light:Light; weather:Weather; moment?:number; momentAction?:MomentAction|null; onClose:()=>void;journey?:TravelWindow|null;conversation?:Conversation}

/** 실제 화면과 동일한 Vista를 재사용합니다. 작은 이미지로 다시 렌더링하지 않습니다. */
export function ScenicViewer({scenery,phase,light,weather,moment=0,momentAction=null,onClose,journey=null,conversation}:Props){
 const [controls,setControls]=useState(true)
 const [full,setFull]=useState(false)
 const [message,setMessage]=useState('')
 const [dialogueOpen,setDialogueOpen]=useState(true)
 const [quietLine,setQuietLine]=useState(0)
 useEffect(()=>{const timer=window.setInterval(()=>setQuietLine(n=>(n+1)%3),24000);return ()=>window.clearInterval(timer)},[])
 const root=useRef<HTMLDialogElement>(null)
 const viewport=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  const modal=root.current
  if(!modal)return
  modal.showModal() // <dialog>를 최상위 레이어에 올려 도감의 다른 모달에 가리지 않는다.
  const old=document.body.style.overflow
  document.body.style.overflow='hidden'
  const fullTarget=viewport.current
  const sync=()=>setFull(document.fullscreenElement===fullTarget)
  document.addEventListener('fullscreenchange',sync)
  return ()=>{
   document.body.style.overflow=old
   document.removeEventListener('fullscreenchange',sync)
   if(document.fullscreenElement===fullTarget){try{screen.orientation?.unlock?.()}catch{/* optional */}void document.exitFullscreen().catch(()=>{})}
   if(modal.open)modal.close()
  }
 },[])
 async function goFull(){
  try{
   if(!viewport.current?.requestFullscreen)throw new Error('no fullscreen')
   await viewport.current.requestFullscreen()
   try{const o=screen.orientation as ScreenOrientation & {lock?:(a:'landscape')=>Promise<void>}; await o.lock?.('landscape')}
   catch{setMessage('가로 회전이 지원되지 않으면 휴대폰을 직접 돌려 주세요.')}
  }catch{setMessage('전체 화면을 지원하지 않는 브라우저입니다. 가로로 돌려서 감상해 주세요.')}
 }
 function close(){
  if(document.fullscreenElement===viewport.current){try{screen.orientation?.unlock?.()}catch{/* optional */}void document.exitFullscreen().catch(()=>{})}
  onClose()
 }
 const station=phase==='platform'
 return createPortal(<dialog className="scenic-overlay" ref={root} aria-label="은하 열차 풍경 감상" onCancel={e=>{e.preventDefault();close()}}>
  <div className="scenic-viewport" ref={viewport}>
   <div className="scenic-topbar" data-visible={controls}>
     <div className="scenic-heading"><span>✧ 풍경 감상</span><strong>{station?routeInfo[scenery].label:'전망 객실'}</strong><small>{phase==='moving'?'우주 항해 중 · 16:9':`${lights[light]} · ${weathers[weather]} · 16:9`}</small></div>
     <div className="scenic-toolbar">
       {!full&&<button type="button" onClick={()=>void goFull()}>⛶ <span>전체 화면</span></button>}
       {conversation&&<button type="button" onClick={()=>{setDialogueOpen(v=>!v);setControls(true)}} aria-pressed={dialogueOpen}>✧ <span>{dialogueOpen?'대화 숨기기':'대화 듣기'}</span></button>}
       <button type="button" onClick={close}>✕ <span>돌아가기</span></button>
     </div>
   </div>
   <button className="scenic-stage" type="button" onClick={()=>setControls(v=>!v)} aria-label={controls?'감상 메뉴 숨기기':'감상 메뉴 펼치기'}>
     {station?<Vista scenery={scenery} light={light} weather={weather} moment={moment} momentAction={momentAction}/>:<Cabin scenery={scenery} state={phase} light={light} weather={weather} journey={journey}/>}
   </button>
   {conversation&&dialogueOpen&&controls&&<div className="scenic-dialogue-dock"><AutoDialogue key={scenery+':'+phase} lines={conversation} repeat={phase==='moving'} compact/></div>}
   <div className="scenic-bottom" data-visible={controls&&!dialogueOpen}>
    <span>{['세 친구가 같은 풍경을 조용히 바라보고 있어요.','고양이가 꼬리를 느릿느릿 흔들고 있어요.','카나리아 아가씨가 작은 노래를 흥얼거려요. ♪'][quietLine]}</span>
    <span>풍경을 터치하면 메뉴가 사라져요.</span>
    <small>↻ 휴대폰을 가로로 돌려 주세요.</small>
    {message&&<span role="status">{message}</span>}
   </div>
   {message&&dialogueOpen&&<span className="scenic-notice" role="status">{message}</span>}
   {!controls&&<button className="scenic-reveal" type="button" onClick={()=>setControls(true)} aria-label="감상 메뉴 보기">⋯</button>}
  </div>
 </dialog>,document.body)
}
