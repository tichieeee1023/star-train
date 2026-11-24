import {useEffect,useRef,useState} from 'react'
import type {Conversation,Speaker} from './Dialogue'
import './auto-dialogue.css'

export const dialogueNames:Record<Speaker,string>={girl:'✦ 소녀',cat:'🐾 우주고양이',canary:'♪ 카나리아 아가씨',conductor:'✧ 차장'}
export function readingTime(text:string){return Math.min(20000,Math.max(7500,3500+Array.from(text).length*170))}
export function useDialogueClock(token:string,duration:number,running:boolean,onAdvance:()=>void){
 const next=useRef(onAdvance)
 next.current=onAdvance
 const [fading,setFading]=useState(false)
 const [visible,setVisible]=useState(()=>document.visibilityState!=='hidden')
 useEffect(()=>{
  const sync=()=>setVisible(document.visibilityState!=='hidden')
  document.addEventListener('visibilitychange',sync)
  return()=>document.removeEventListener('visibilitychange',sync)
 },[])
 useEffect(()=>{
  setFading(false)
  if(!running||!visible)return
  const fade=window.setTimeout(()=>setFading(true),Math.max(0,duration-850))
  const advance=window.setTimeout(()=>next.current(),duration)
  return()=>{window.clearTimeout(fade);window.clearTimeout(advance)}
 },[token,duration,running,visible])
 return fading&&running&&visible
}

type Props={lines:Conversation;active?:boolean;repeat?:boolean;compact?:boolean}
export function AutoDialogue({lines,active=true,repeat=true,compact=false}:Props){
 const latest=useRef(lines)
 latest.current=lines
 const [current,setCurrent]=useState(lines)
 const [index,setIndex]=useState(0)
 const [playing,setPlaying]=useState(true)
 const [cycle,setCycle]=useState(0)
 const line=current[index]
 const waiting=index<0
 function restart(){setCurrent(latest.current);setIndex(0);setCycle(n=>n+1)}
 function advance(){
  if(waiting){restart();return}
  if(index+1<current.length){setIndex(index+1);return}
  setIndex(-1)
 }
 const fading=useDialogueClock(cycle+':'+index,line?readingTime(line.text):3500,active&&playing&&(!!line||repeat),advance)
 const manual=(direction:number)=>{
  if(waiting){restart();return}
  setIndex(Math.max(0,Math.min(current.length-1,index+direction)))
  setCycle(n=>n+1)
 }
 return <section className={`auto-dialogue${compact?' auto-dialogue-compact':''}`} aria-label="자동 풍경 대화">
  <div className="auto-dialogue-content" aria-live="off">
   {line&&<div key={cycle+':'+index} className={`auto-dialogue-line${fading?' dialogue-fading':''}`}>
    <span className="auto-dialogue-speaker">{dialogueNames[line.speaker]}</span>
    <p>“{line.text}”</p>
   </div>}
  </div>
  <div className="auto-dialogue-controls">
   <span>{waiting?'✧ 별빛을 바라보는 시간':`${index+1} / ${current.length}`}</span>
   <div>
    <button type="button" disabled={waiting||index===0} onClick={()=>manual(-1)} aria-label="이전 대사">‹</button>
    <button type="button" onClick={()=>setPlaying(v=>!v)} aria-pressed={!playing}>{playing?'Ⅱ 일시정지':'▷ 자동 재생'}</button>
    <button type="button" onClick={()=>{if(waiting||index===current.length-1)restart();else manual(1)}} aria-label={waiting||index===current.length-1?'대화 다시 듣기':'다음 대사'}>{waiting||index===current.length-1?'↺':'›'}</button>
   </div>
  </div>
 </section>
}
