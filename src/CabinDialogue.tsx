import {useState} from 'react'
import type {Story} from './TrainLife'
import {dialogueNames,readingTime,useDialogueClock} from './AutoDialogue'

export function CabinDialogue({story,index,onIndex,onClose,guest,auto=false,active=true}:{story:Story;index:number;onIndex:(index:number)=>void;onClose:()=>void;guest?:boolean;auto?:boolean;active?:boolean}){
 const [playing,setPlaying]=useState(auto)
 const [revision,setRevision]=useState(0)
 const line=story.lines[index],last=index>=story.lines.length-1
 const advance=()=>last?onClose():onIndex(index+1)
 const fading=useDialogueClock(story.title+':'+index+':'+revision+':'+(line?.text??''),readingTime(line?.text??''),!!line&&auto&&playing&&active,advance)
 if(!line)return null
 function manual(n:number){setRevision(v=>v+1);onIndex(n)}
 return <section className="cabin-story" role="region" aria-label={story.title}>
   <div className="cabin-story-top"><span>{guest?'✧ 차장의 방문':story.title}</span><button type="button" onClick={onClose} aria-label="대화 닫기">×</button></div>
   <div key={index+':'+revision} className={`cabin-story-line-wrap auto-dialogue-line${fading?' dialogue-fading':''}`} aria-live={auto&&playing?'off':'polite'}>
    <div className="cabin-story-speaker">{dialogueNames[line.speaker]}</div>
    <p className="cabin-story-line" aria-atomic="true">“{line.text}”</p>
   </div>
   <div className="cabin-story-controls"><span>{index+1} / {story.lines.length}</span><div><button type="button" disabled={index===0} onClick={()=>manual(index-1)}>이전</button>{auto&&<button type="button" aria-pressed={!playing} onClick={()=>setPlaying(v=>!v)}>{playing?'Ⅱ 일시정지':'▷ 자동 재생'}</button>}<button type="button" className="cabin-story-next" onClick={()=>last?onClose():manual(index+1)}>{last?'마치기':'다음 ›'}</button></div></div>
 </section>
}
