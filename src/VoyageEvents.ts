/**
 * 항해 중 창밖 이벤트. 항해 ID에서 결정적으로 계산하므로 저장 구조를 바꾸지 않습니다.
 * 만난(받은) 기록만 life.events 에 'voy:<id>' 로 남기고, 코인은 credits 키로 한 번만 지급합니다.
 * 이벤트 보상은 도착 후에도 다음 항해를 시작하기 전까지 받을 수 있습니다.
 */
import type {CrystalGame,TripHours} from './Crystals'
import {voyageStage,type Stage,type VoyageEventKind} from './VoyageArt'
import {addCoins,normalizeLife,type LifeState,type Story} from './TrainLife'
import type {Conversation} from './Dialogue'
import {canaryEventStories} from './CanaryStories'
import {eventCameos,withCameo} from './CanaryCameos'
export type {VoyageEventKind} from './VoyageArt'

export type VoyageEvent={id:string;kind:VoyageEventKind;at:number;until:number;stage:Stage}
type JourneyLike={id:string;start:number;end:number;hours:TripHours}

export const eventKinds:Record<VoyageEventKind,{name:string;action:string;teaser:string;coins:number;bond:number;symbol:string}>={
 meteor:{name:'별똥별 소나기',action:'소원 빌기',teaser:'하늘 가득 별똥별이 쏟아지고 있어요!',coins:2,bond:1,symbol:'☄'},
 comet:{name:'혜성의 인사',action:'손 흔들기',teaser:'커다란 혜성이 열차 옆을 천천히 스쳐 가요.',coins:1,bond:1,symbol:'✦'},
 signal:{name:'먼 역의 신호',action:'신호에 답하기',teaser:'아주 먼 곳에서 작은 불빛이 깜빡이고 있어요.',coins:2,bond:1,symbol:'✧'},
 whale:{name:'별고래의 노래',action:'노래 듣기',teaser:'별의 바다 위로 커다란 고래가 다가와요.',coins:3,bond:2,symbol:'🐋'},
 lantern:{name:'떠오르는 등불',action:'등불 따라가기',teaser:'섬 사이에서 작은 등불들이 떠오르고 있어요.',coins:2,bond:2,symbol:'♢'},
 aurora:{name:'오로라 커튼',action:'빛 바라보기',teaser:'하늘에 초록빛 커튼이 넓게 펼쳐지고 있어요.',coins:3,bond:2,symbol:'≈'}
}
const kindIds=Object.keys(eventKinds) as VoyageEventKind[]
/** 항해 구간마다 어울리는 이벤트가 더 자주 나온다. */
const weights:Record<Stage,Partial<Record<VoyageEventKind,number>>>={
 departure:{meteor:3,comet:2,signal:3},
 nebula:{meteor:3,comet:3,lantern:1,signal:1},
 sea:{whale:6,meteor:2,comet:2,signal:2,aurora:1},
 aurora:{aurora:6,meteor:2,comet:1},
 islands:{lantern:6,comet:1,meteor:2,signal:2},
 approach:{meteor:3,signal:3,comet:1}
}
const hash=(s:string)=>{let h=2166136261>>>0;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h}
const mulberry=(seed:number)=>()=>{seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}

const planCache=new Map<string,VoyageEvent[]>()
/** 1시간 1개 · 3시간 2개 · 8시간 4개. 출발 직후와 도착 직전은 피해서 고르게 배치한다. */
export function planVoyageEvents(j:JourneyLike):VoyageEvent[]{
 if(!Number.isFinite(j.start)||!Number.isFinite(j.end)||j.end<=j.start)return []
 const key=`${j.id}:${j.start}:${j.end}`,hit=planCache.get(key);if(hit)return hit
 const count=j.hours===1?1:j.hours===3?2:4
 const span=j.end-j.start,from=j.start+span*.1,to=j.end-span*.12,slot=(to-from)/count
 const live=Math.min(18*60000,Math.max(4*60000,span*.06))
 const r=mulberry(hash(j.id)),used:VoyageEventKind[]=[],out:VoyageEvent[]=[]
 for(let i=0;i<count;i++){
  const at=Math.round(from+slot*(i+.15+r()*.6)),stage=voyageStage((at-j.start)/span,j.hours)
  const pool=kindIds.map(k=>[k,(weights[stage][k]??0)*(used.includes(k)?.2:1)] as const).filter(([,w])=>w>0)
  let draw=r()*pool.reduce((s,[,w])=>s+w,0),kind=pool[pool.length-1][0]
  for(const [k,w] of pool){draw-=w;if(draw<0){kind=k;break}}
  used.push(kind);out.push({id:`${j.id}:v${i}`,kind,at,until:Math.min(at+live,j.end),stage})
 }
 if(planCache.size>12)planCache.clear()
 planCache.set(key,out);return out
}
const claimKey=(id:string)=>'voy:'+id
export const isClaimed=(life:LifeState|undefined,id:string)=>!!life?.events?.includes(claimKey(id))
export const isLive=(e:VoyageEvent,now:number)=>now>=e.at&&now<e.until
export function pendingEvents(game:CrystalGame,now:number):VoyageEvent[]{
 const j=game.journey;if(!j)return []
 return planVoyageEvents(j).filter(e=>now>=e.at&&!isClaimed(game.life,e.id))
}
export function voyageLog(game:CrystalGame,now:number){
 const j=game.journey;if(!j)return {total:0,claimed:0,pending:0,upcoming:0}
 const plan=planVoyageEvents(j),claimed=plan.filter(e=>isClaimed(game.life,e.id)).length
 const pending=plan.filter(e=>now>=e.at&&!isClaimed(game.life,e.id)).length
 return {total:plan.length,claimed,pending,upcoming:plan.length-claimed-pending}
}
/** 별똥별·혜성·신호는 5번 중 1번꼴로 작은 영양액 선물이 따라온다(이벤트 ID로 결정). */
export const hasGift=(e:VoyageEvent)=>(e.kind==='meteor'||e.kind==='comet'||e.kind==='signal')&&hash(e.id)%5===0
export type ClaimResult={game:CrystalGame;ok:boolean;message:string}
export function claimVoyageEvent(game:CrystalGame,ev:VoyageEvent,now:number):ClaimResult{
 const j=game.journey
 const actual=j&&planVoyageEvents(j).find(e=>e.id===ev.id)
 if(!actual||actual.kind!==ev.kind||actual.at!==ev.at)return {game,ok:false,message:'이번 항해의 장면이 아니에요.'}
 if(now<ev.at)return {game,ok:false,message:'아직 창밖에 나타나지 않았어요.'}
 if(isClaimed(game.life,ev.id))return {game,ok:false,message:'이미 함께 본 장면이에요.'}
 const info=eventKinds[ev.kind],gift=hasGift(ev)
 let life=normalizeLife(game.life);const bond=life.bond
 life=addCoins(life,claimKey(ev.id),info.coins)
 life={...life,events:[...life.events,claimKey(ev.id)].slice(-180),bond:{...bond,points:bond.points+info.bond}}
 const stock=gift?{...game.stock,tiny:(game.stock.tiny??0)+1}:game.stock
 return {game:{...game,life,stock},ok:true,message:`✦ ${info.name}을(를) 함께 봤어요! 코인 +${info.coins} · 마음 +${info.bond}${gift?' · 작은 별빛 영양액 1개':''}`}
}

const talk=(...l:[string,string][]):Conversation=>l.map(([speaker,text])=>({speaker:speaker==='girl'?'girl':'cat',text}))
const stories:Record<VoyageEventKind,readonly Conversation[]>={
 meteor:[
  talk(['girl','별똥별이 이렇게 많아! 소원을 빌 시간이 모자라겠어.'],['cat','냐아. 하나만 빌어도 충분해.'],['girl','뭐라고 빌 건데?'],['cat','다음 간식은 두 배로. 이미 빌었다.']),
  talk(['girl','저기, 저기! 연달아 세 개나 떨어졌어!'],['cat','우주도 박수를 치는 모양이야.'],['girl','그럼 우리도 같이 소원 빌자.'],['cat','좋아. 대신 서로 소원은 비밀이야. 냐.'])],
 comet:[
  talk(['girl','혜성이 우리를 지나쳐 가. 꼬리가 은빛 강물 같아.'],['cat','손 흔들면 인사도 받아 줄까?'],['girl','해 볼게! 안녕——!'],['cat','……꼬리가 살짝 흔들린 것 같아.']),
  talk(['cat','저 꼬리, 잡을 수 있으면 좋겠다.'],['girl','잡으려고? 너무 빨라서 안 돼.'],['cat','냐아. 그래도 눈으로는 이미 잡았어.'],['girl','그럼 그걸로 충분해.'])],
 signal:[
  talk(['girl','저 멀리 깜빡이는 불빛 좀 봐. 일정한 간격으로 반짝여.'],['cat','누가 보내는 신호일까?'],['girl','우리도 손전등 흔들어 볼까?'],['cat','냐. 오늘은 눈짓으로 답하자. 한 번, 두 번.']),
  talk(['cat','등대 같아. 근데 바다가 없는데.'],['girl','우주에도 길 잃은 별이 있을지도 몰라.'],['cat','그럼 우리가 지나가는 것도 저쪽에선 신호겠다.'],['girl','그러네. 서로 신호구나.'])],
 whale:[
  talk(['girl','고래다! 별빛 속에서 헤엄치고 있어.'],['cat','냐아아. 크다. 한입에 먹히겠어.'],['girl','먹지 않아! 노래 소리가 들려.'],['cat','……졸린 노래다. 조금 조용히 들어 보자.']),
  talk(['girl','고래가 꼬리를 한 번 흔들었어. 인사한 거지?'],['cat','아마도. 그럼 우리도 인사해야지.'],['girl','뭐라고?'],['cat','“좋은 항해 되세요.” 이 정도면 되겠지.'])],
 lantern:[
  talk(['girl','등불이 하나둘 떠올라. 어디로 가는 걸까?'],['cat','저기 밝은 쪽. 우리랑 같은 방향이야.'],['girl','같이 가는 거네!'],['cat','냐. 길동무가 생겼군.']),
  talk(['cat','등불 속에 뭔가 들어 있을 것 같아.'],['girl','소원이 들어 있을지도 몰라.'],['cat','그럼 간식 소원이 몇 개나 있는지 세어 보겠어.'],['girl','세지 말고, 그냥 예쁘게 보자.'])],
 aurora:[
  talk(['girl','하늘에 커튼이 걸렸어. 초록, 보라, 또 초록……'],['cat','바람이 불면 같이 흔들리겠지.'],['girl','우주에도 바람이 있어?'],['cat','마음속에 있으면 있는 거야.']),
  talk(['cat','오로라가 내 눈에 들어와서 눈이 반짝인대.'],['girl','그건 원래 반짝여.'],['cat','냐아. 오늘은 특히 더.'],['girl','인정. 오늘은 특히 더.'])]
}
export function voyageEventStory(e:VoyageEvent):Story{
 const list=stories[e.kind]
 return {title:'창밖 · '+eventKinds[e.kind].name,lines:hash(e.id)%3===0?canaryEventStories[e.kind].lines:withCameo(list[hash(e.id)%list.length],eventCameos[e.kind])}
}
