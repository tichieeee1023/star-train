import type {Conversation} from './Dialogue'

/** 풍경을 덮지 않고, 하단 패널에서 두 친구의 말을 번갈아 읽습니다. */
export function DialogueCard({conversation,label}: {conversation:Conversation;label:string}) {
  return <div className="dialogue-card" aria-label={label} aria-live="polite">
    {conversation.map((line,index)=><div key={`${index}-${line.speaker}`} className={`dialogue-line ${line.speaker}`}>
      <span className="dialogue-speaker">{line.speaker==='girl'?'✦ 소녀':'🐾 고양이'}</span>
      <p>{line.text}</p>
    </div>)}
  </div>
}
