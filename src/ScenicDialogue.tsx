import type {Conversation,Speaker} from './Dialogue'

const names:Record<Speaker,string>={girl:'✦ 소녀',cat:'🐾 우주고양이',canary:'♪ 카나리아 아가씨',conductor:'✧ 차장'}

/** 어린왕자 SceneDialogue처럼 풍경 곁에서 한 사람의 말만 차례로 읽는다. */
export function ScenicDialogue({lines,index,onIndex,compact=false}:{lines:Conversation;index:number;onIndex:(n:number)=>void;compact?:boolean}){
 const line=lines[index]
 if(!line)return null
 return <section className={`scenic-conversation${compact?' compact':''}`} aria-label="세 친구의 풍경 대화">
  <div className="scenic-conversation-heading"><span>{names[line.speaker]}</span><small>{index+1} / {lines.length}</small></div>
  <p aria-live="polite" aria-atomic="true">“{line.text}”</p>
  <div className="scenic-conversation-actions">
   <button type="button" disabled={index===0} onClick={()=>onIndex(index-1)}>이전</button>
   <button type="button" className="next" onClick={()=>onIndex(index===lines.length-1?0:index+1)}>{index===lines.length-1?'다시 듣기 ↺':'다음 ›'}</button>
  </div>
 </section>
}
