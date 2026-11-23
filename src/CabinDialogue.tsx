import {useEffect,useRef} from 'react'
import type {Story} from './TrainLife'

/** 어린왕자 SceneDialogue 패턴: 장면 안에서 대사를 한 줄씩 읽으며 넘기기. */
export function CabinDialogue({story,index,onIndex,onClose,guest}:{story:Story;index:number;onIndex:(index:number)=>void;onClose:()=>void;guest?:boolean}){
 const closeRef=useRef<HTMLButtonElement>(null)
 useEffect(()=>{closeRef.current?.focus({preventScroll:true})},[story.title])
 const line=story.lines[index],last=index>=story.lines.length-1
 return <section className="cabin-story" role="region" aria-label={story.title} aria-live="polite">
   <div className="cabin-story-top"><span>{guest?'✧ 차장의 방문':story.title}</span><button ref={closeRef} type="button" onClick={onClose} aria-label="대화 닫기">×</button></div>
   <div className="cabin-story-speaker">{line.speaker==='girl'?'✦ 소녀':line.speaker==='cat'?'🐾 우주고양이':'✧ 차장'}</div>
   <p className="cabin-story-line" aria-atomic="true">“{line.text}”</p>
   <div className="cabin-story-controls"><span>{index+1} / {story.lines.length}</span><div><button type="button" disabled={index===0} onClick={()=>onIndex(index-1)}>이전</button><button type="button" className="cabin-story-next" onClick={()=>last?onClose():onIndex(index+1)}>{last?'마치기':'다음 ›'}</button></div></div>
 </section>
}
