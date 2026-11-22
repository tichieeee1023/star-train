import type {MomentAction} from './PlaceMoment'
import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {Cabin} from './Cabin'
import {Vista,lights,weathers,type Light,type Weather} from './Vista'
import {routeInfo,type Scenery} from './Sky'

type Props={scenery:Scenery; phase:'moving'|'arriving'|'stopped'|'platform'; light:Light; weather:Weather; moment?:number; momentAction?:MomentAction|null; onClose:()=>void}

/** 실제 화면과 동일한 Vista를 재사용합니다. 작은 이미지로 다시 렌더링하지 않습니다. */
export function ScenicViewer({scenery,phase,light,weather,moment=0,momentAction=null,onClose}:Props){
 const [controls,setControls]=useState(true)
 const [full,setFull]=useState(false)
 const [message,setMessage]=useState('')
 const root=useRef<HTMLDivElement|null>(null)
 useEffect(()=>{
  const old=document.body.style.overflow
  document.body.style.overflow='hidden'
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose()}}
  const sync=()=>setFull(document.fullscreenElement===root.current)
  document.addEventListener('keydown',key)
  document.addEventListener('fullscreenchange',sync)
  return ()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);document.removeEventListener('fullscreenchange',sync)}
 },[onClose])
 async function goFull(){
  try{
   if(!root.current?.requestFullscreen)throw new Error('no fullscreen')
   await root.current.requestFullscreen()
   try{const o=screen.orientation as ScreenOrientation & {lock?:(a:'landscape')=>Promise<void>}; await o.lock?.('landscape')}
   catch{setMessage('가로 회전이 지원되지 않으면 휴대폰을 직접 돌려 주세요.')}
  }catch{setMessage('전체 화면을 지원하지 않는 브라우저입니다. 가로로 돌려서 감상해 주세요.')}
 }
 function close(){
  if(document.fullscreenElement===root.current){try{screen.orientation?.unlock?.()}catch{/* optional */}void document.exitFullscreen().catch(()=>{})}
  onClose()
 }
 const station=phase==='platform'
 return createPortal(<div className="scenic-overlay" ref={root} role="dialog" aria-modal="true" aria-label="은하 열차 풍경 감상" tabIndex={-1}>
   <div className="scenic-topbar" data-visible={controls}>
     <div className="scenic-heading"><span>✧ 풍경 감상</span><strong>{station?routeInfo[scenery].label:'전망 객실'}</strong><small>{lights[light]} · {weathers[weather]} · 16:9</small></div>
     <div className="scenic-toolbar">
       {!full&&<button type="button" onClick={()=>void goFull()}>⛶ <span>전체 화면</span></button>}
       <button type="button" onClick={close}>✕ <span>돌아가기</span></button>
     </div>
   </div>
   <button className="scenic-stage" type="button" onClick={()=>setControls(v=>!v)} aria-label={controls?'감상 메뉴 숨기기':'감상 메뉴 펼치기'}>
     {station?<Vista scenery={scenery} light={light} weather={weather} moment={moment} momentAction={momentAction}/>:<Cabin scenery={scenery} state={phase}/>}
   </button>
   <div className="scenic-bottom" data-visible={controls}><span>소녀와 고양이가 같은 풍경을 바라보고 있어요.</span><span>풍경을 터치하면 메뉴가 사라져요.</span><small>↻ 휴대폰을 가로로 돌려 주세요.</small>{message&&<span role="status">{message}</span>}</div>
   {!controls&&<button className="scenic-reveal" type="button" onClick={()=>setControls(true)} aria-label="감상 메뉴 보기">⋯</button>}
 </div>,document.body)
}
