import {useEffect,useState} from 'react'
import type {CrystalGame} from './Crystals'
import {normalizeBond} from './TrainLife'
import {canaryChapters,canaryChapterTurns,canaryChapterUnlocked} from './CanaryStories'
import {CANARY_TALK_COOLDOWN,PET_COOLDOWN,TALK_COOLDOWN,bondStories,bondThresholds,fmtWait,levelOf,maxBondLevel,rewardText,waitLeft} from './CabinBond'

type Props={game:CrystalGame;note:string;onPet:()=>void;onTalk:()=>void;onCanary:()=>void;onCanaryChapter:(index:number)=>void;onListen:(level:number)=>void;onShop:()=>void;onMoonStory:()=>void;onMoonStock:()=>void}

/** 항해를 기다리는 동안 할 수 있는 일: 고양이 쓰다듬기, 소녀와 이야기, 간식 나눠 먹기. */
export function CabinCare({game,note,onPet,onTalk,onCanary,onCanaryChapter,onListen,onShop,onMoonStory,onMoonStock}:Props){
 const [tick,setTick]=useState(()=>Date.now())
 useEffect(()=>{const id=window.setInterval(()=>setTick(Date.now()),1000);return ()=>window.clearInterval(id)},[])
 const bond=normalizeBond(game.life?.bond),level=levelOf(bond.points),maxed=level>=maxBondLevel
 // 행동 직후에는 바로 시각을 갱신해, 쿨타임이 버튼에 즉시 반영되도록 한다.
 useEffect(()=>{setTick(Date.now())},[bond.lastPet,bond.lastTalk,bond.lastCanaryTalk])
 const low=level>0?bondThresholds[level-1]:0,high=maxed?low:bondThresholds[level]
 const pct=maxed?100:Math.round((bond.points-low)/(high-low)*100)
 const petWait=waitLeft(bond.lastPet,PET_COOLDOWN,tick),talkWait=waitLeft(bond.lastTalk,TALK_COOLDOWN,tick),canaryWait=waitLeft(bond.lastCanaryTalk,CANARY_TALK_COOLDOWN,tick)
 return <section className="cabin-care" aria-labelledby="cabin-care-title">
  <div className="care-head"><h3 id="cabin-care-title">선실 돌보기</h3><span className="care-level">마음 Lv.{level}{maxed?' · MAX':''}</span></div>
  <div className="care-meter" role="progressbar" aria-label="마음 게이지" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{width:pct+'%'}}/></div>
  <p className="care-next">{maxed?'세 친구와 마음이 가장 가까워졌어요.':`다음 단계까지 ${high-bond.points}점 · Lv.${level+1} 보상: ${rewardText(level+1)}`}</p>
  <div className="care-actions">
   <button type="button" onClick={onPet} disabled={petWait>0}><span aria-hidden="true">🐾</span><b>고양이 쓰다듬기</b><small>{petWait>0?`${fmtWait(petWait)} 뒤`:'마음 +1'}</small></button>
   <button type="button" onClick={onTalk} disabled={talkWait>0}><span aria-hidden="true">✦</span><b>소녀와 이야기</b><small>{talkWait>0?`${fmtWait(talkWait)} 뒤`:'마음 +2'}</small></button>
   <button type="button" onClick={onCanary} disabled={canaryWait>0}><span aria-hidden="true">♪</span><b>아가씨와 이야기</b><small>{canaryWait>0?`${fmtWait(canaryWait)} 뒤`:'마음 +2'}</small></button>
   <button type="button" onClick={onShop}><span aria-hidden="true">☕</span><b>간식 나눠 먹기</b><small>마음 +2~5</small></button>
  </div>
  {note&&<p className="care-note" role="status">{note}</p>}
  {bond.unheard.length>0&&<div className="care-unheard"><b>✦ 새 마음 대화가 열렸어요</b>{bond.unheard.map(l=><button key={l} type="button" onClick={()=>onListen(l)}>Lv.{l} 듣기</button>)}</div>}
  <details className="care-log canary-log"><summary>♪ 아가씨의 작은 이야기 {canaryChapterUnlocked(bond.canaryTalks)} / {canaryChapters.length}</summary>
   <div>{canaryChapters.map((story,i)=>bond.canaryTalks>canaryChapterTurns[i]?
    <button key={i} type="button" onClick={()=>onCanaryChapter(i)}>{i+1}. {story.title}</button>:
    <span key={i}>🔒 {i+1}. {i===0?'아가씨에게 첫 인사하기':`아가씨와 ${canaryChapterTurns[i]+1}번 대화`}</span>)}</div>
  </details>
  <details className="care-log"><summary>● 고양이의 보름달 이야기</summary><div>{(game.life?.used.moonbread??0)>0?<button type="button" onClick={onMoonStory}>고양이의 첫 번째 보름달 · 다시 듣기</button>:<span>🔒 보름달 빵을 처음 함께 먹으면 열려요.</span>}<button type="button" onClick={onMoonStock}>보름달 보관함 · {game.life?.stock.moonbread??0}개</button></div></details>
  <details className="care-log"><summary>마음 대화 기록 {Math.min(level,maxBondLevel)} / {maxBondLevel}</summary>
   <div>{bondStories.map((s,i)=>i<level?<button key={i} type="button" onClick={()=>onListen(i+1)}>Lv.{i+1} · {s.title.replace('마음 대화 · ','')}</button>:<span key={i}>🔒 Lv.{i+1} · 마음 {bondThresholds[i]}점</span>)}</div>
  </details>
 </section>
}
