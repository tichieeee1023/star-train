/** 선실 생활과 별빛 코인. 기존 항해·수정 저장 구조에 병합하며, 기록은 한 번만 적립합니다. */
import type {Conversation} from './Dialogue'
import type {Stage} from './VoyageSky'
import type {TripHours} from './Crystals'
import {extraBanters,extraStageBanters} from './CabinExtras'
import {snackExtras} from './SnackExtras'
import {canaryBanters,canaryStageBanters,canarySnackStories} from './CanaryStories'

export type SnackId='stardust'|'cocoa'|'moonmilk'|'cometcorn'|'nebula'|'icecream'|'moontart'|'galaxybox'|'cloudbread'|'starchai'|'planetpie'|'nightfish'|'cherrymoon'|'nebularice'
export type MemoryId='cocoa-night'|'moon-picnic'|'star-banquet'|'fish-starlight'|'cherry-moon'|'nebula-supper'
export type Snack={name:string;symbol:string;price:number;description:string;exclusive?:boolean;memory?:MemoryId}
export const snacks:Record<SnackId,Snack>={
 stardust:{name:'별가루 쿠키',symbol:'✧',price:4,description:'입에서 별빛처럼 사르르 부서지는 쿠키'},
 cocoa:{name:'밤하늘 코코아',symbol:'☕',price:7,description:'구름처럼 폭신한 우유 거품',memory:'cocoa-night'},
 moonmilk:{name:'초승달 우유',symbol:'☾',price:5,description:'잠들기 전에 마시는 따뜻한 우유'},
 cometcorn:{name:'혜성 팝콘',symbol:'✦',price:6,description:'별똥별처럼 톡톡 튀는 팝콘'},
 nebula:{name:'성운 젤리',symbol:'◈',price:8,description:'흔들면 은은히 빛나는 세 가지 젤리'},
 icecream:{name:'은하수 아이스크림',symbol:'❄',price:10,description:'파란 별빛 시럽을 곁들인 디저트'},
 moontart:{name:'달빛 생선 타르트',symbol:'☽',price:16,description:'차장의 간식 카트에서만 만나는 한정 타르트',exclusive:true,memory:'moon-picnic'},
 galaxybox:{name:'은하 도시락',symbol:'✺',price:23,description:'별 모양 반찬이 담긴 특별한 두 사람분 도시락',exclusive:true,memory:'star-banquet'},
 cloudbread:{name:'별구름 빵',symbol:'☁',price:6,description:'누르면 다시 부푸는 부드러운 구름빵'},
 starchai:{name:'자스민 별차',symbol:'❀',price:8,description:'꽃향기가 은은한 따뜻한 우주 차'},
 planetpie:{name:'고리행성 파이',symbol:'◎',price:11,description:'층층이 쌓인 과일과 설탕 고리'},
 nightfish:{name:'밤바다 생선 과자',symbol:'♧',price:15,description:'차장이 특별히 챙겨 온 바삭한 생선 모양 과자',exclusive:true,memory:'fish-starlight'},
 cherrymoon:{name:'체리달 마카롱',symbol:'◐',price:19,description:'달처럼 둥글고 분홍빛 체리향이 나는 마카롱',exclusive:true,memory:'cherry-moon'},
 nebularice:{name:'성운 주먹밥',symbol:'◉',price:22,description:'별빛 김이 감싼 따뜻한 주먹밥',exclusive:true,memory:'nebula-supper'}
}
export const snackIds=Object.keys(snacks) as SnackId[]
export type ConductorVisit={journeyId:string;appearAt:number;greeted:boolean;offers:SnackId[];purchases:Partial<Record<SnackId,number>>;special?:SnackId}
/** 세 동료와 함께 쌓는 '마음'. 쓰다듬기·말 걸기·간식 나누기로 쌓이고, 단계마다 보상과 새 대화가 열린다. */
export type BondState={points:number;rewarded:number;unheard:number[];lastPet:number;lastTalk:number;lastCanaryTalk:number;pets:number;talks:number;canaryTalks:number}
export const newBond=():BondState=>({points:0,rewarded:0,unheard:[],lastPet:0,lastTalk:0,lastCanaryTalk:0,pets:0,talks:0,canaryTalks:0})
export function normalizeBond(value?:Partial<BondState>):BondState{
 if(!value||typeof value!=='object')return newBond()
 const n=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.floor(x)):0
 return {points:n(value.points),rewarded:n(value.rewarded),unheard:Array.isArray(value.unheard)?value.unheard.filter(x=>Number.isInteger(x)&&x>0):[],lastPet:n(value.lastPet),lastTalk:n(value.lastTalk),lastCanaryTalk:n(value.lastCanaryTalk),pets:n(value.pets),talks:n(value.talks),canaryTalks:n(value.canaryTalks)}
}
export type LifeState={bond:BondState;coins:number;credits:string[];stock:Partial<Record<SnackId,number>>;used:Partial<Record<SnackId,number>>;memories:MemoryId[];daily:string;conductor:ConductorVisit|null;events:string[]}
export const newLife=():LifeState=>({bond:newBond(),coins:0,credits:[],stock:{},used:{},memories:[],daily:'',conductor:null,events:[]})
export function normalizeLife(value?:Partial<LifeState>):LifeState{
 const fresh=newLife()
 if(!value||typeof value!=='object')return fresh
 return {...fresh,...value,bond:normalizeBond(value.bond),coins:Number.isFinite(value.coins)?Math.max(0,Math.floor(value.coins!)):0,credits:Array.isArray(value.credits)?value.credits:[],stock:value.stock??{},used:value.used??{},memories:Array.isArray(value.memories)?value.memories:[],events:Array.isArray(value.events)?value.events:[],conductor:value.conductor??null}
}
export function addCoins(life:LifeState,key:string,amount:number):LifeState{
 if(life.credits.includes(key)||amount<=0)return life
 return {...life,coins:life.coins+amount,credits:[...life.credits,key].slice(-450)}
}
export function dailyKey(now:number):string{const date=new Date(now);return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`}
export function claimDaily(life:LifeState,now:number):LifeState{
 const day=dailyKey(now)
 if(life.daily===day)return life
 return {...addCoins(life,`daily:${day}`,5),daily:day}
}
export function journeyCoinReward(hours:TripHours,rare:boolean,firstPlace:boolean,firstSky:boolean):number{
 return ({1:5,3:12,8:29} as Record<TripHours,number>)[hours]+(rare?8:0)+(firstPlace?7:0)+(firstSky?3:0)
}
export function planConductor(life:LifeState,journeyId:string,start:number,end:number,hours:TripHours,random:()=>number=Math.random):LifeState{
 const chance=hours===8?1:hours===3?.8:.55
 if(random()>=chance)return {...life,conductor:null}
 const regular:SnackId[]=snackIds.filter(id=>!snacks[id].exclusive)
 const order=[...regular].sort((a,b)=>a.localeCompare(b))
 for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
 const limited=snackIds.filter(id=>snacks[id].exclusive)
 for(let i=limited.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[limited[i],limited[j]]=[limited[j],limited[i]]}
 const offers:SnackId[]=[...order.slice(0,4),...limited.slice(0,hours===8?3:2)]
 const special=offers[Math.floor(random()*offers.length)] // 오늘의 추천: 40% 할인
 return {...life,conductor:{journeyId,appearAt:start+(end-start)*(.16+random()*.48),greeted:false,offers,purchases:{},special}}
}
export function conductorReady(life:LifeState,journeyId:string|undefined,now:number):boolean{
 return !!(journeyId&&life.conductor&&life.conductor.journeyId===journeyId&&now>=life.conductor.appearAt)
}
export function greetConductor(life:LifeState,journeyId:string|undefined,now:number):LifeState{
 const visit=life.conductor
 if(!visit||!conductorReady(life,journeyId,now)||visit.greeted)return life
 return {...addCoins(life,`conductor:${journeyId}`,2),conductor:{...visit,greeted:true},events:[...life.events,`conductor:${journeyId}`].slice(-180)}
}
/** 날짜별 상시 상점 추천 간식. 무료 새로고침 재추첨을 피하기 위해 날짜에서 결정합니다. */
export function dailyDealId(now:number):SnackId{
 const regular=snackIds.filter(id=>!snacks[id].exclusive)
 const day=dailyKey(now),number=[...day].reduce((h,ch)=>Math.imul(h,31)+ch.charCodeAt(0)|0,0)
 return regular[(number>>>0)%regular.length]
}
export function snackPrice(id:SnackId,from:'shop'|'conductor',special?:SnackId,now:number=Date.now()){
 if(from==='conductor')return Math.max(1,Math.floor(snacks[id].price*(special===id?.6:.8)))
 return Math.max(1,Math.floor(snacks[id].price*(id===dailyDealId(now)?.75:1)))
}
export function buySnack(life:LifeState,id:SnackId,from:'shop'|'conductor',journeyId:string|undefined,now:number):LifeState{
 const snack=snacks[id],price=snackPrice(id,from,life.conductor?.special,now)
 if(life.coins<price)return life
 if(from==='shop'&&snack.exclusive)return life
 if(from==='conductor'){
  if(!conductorReady(life,journeyId,now)||!life.conductor!.offers.includes(id))return life
  if((life.conductor!.purchases[id]??0)>=3)return life
 }
 return {...life,coins:life.coins-price,stock:{...life.stock,[id]:(life.stock[id]??0)+1},
  conductor:from==='conductor'&&life.conductor?{...life.conductor,purchases:{...life.conductor.purchases,[id]:(life.conductor.purchases[id]??0)+1}}:life.conductor}
}
export const snackBondGain=(id:SnackId)=>snacks[id].exclusive?5:snacks[id].price>=8?3:2
export function eatSnack(life:LifeState,id:SnackId):LifeState{
 if((life.stock[id]??0)<=0)return life
 const memory=snacks[id].memory,bond=normalizeBond(life.bond)
 return {...life,bond:{...bond,points:bond.points+snackBondGain(id)},stock:{...life.stock,[id]:(life.stock[id]??0)-1},used:{...life.used,[id]:(life.used[id]??0)+1},
  memories:memory&&!life.memories.includes(memory)?[...life.memories,memory]:life.memories}
}
export type Story={title:string;lines:Conversation;memory?:MemoryId}
const talk=(...entries:[string,string][]):Conversation=>entries.map(([speaker,text])=>({speaker:speaker==='girl'?'girl':'cat',text}))
export const snackStories:Partial<Record<SnackId,readonly Story[]>>={
 stardust:[{title:'별가루 쿠키',lines:talk(['girl','과자가 정말 별 모양이네. 몇 개쯤 있을까?'],['cat','냐아. 난 하나, 둘…… 셋부터는 입으로 세고 싶어.'],['girl','그건 세는 게 아니라 먹는 거잖아!'],['cat','아는 만큼 먹어야 한다는 말도 있잖아.'])}],
 cocoa:[{title:'따뜻한 밤의 코코아',memory:'cocoa-night',lines:talk(['girl','우주가 이렇게 넓은데 우리 선실은 조그맣네.'],['cat','그래서 코코아 냄새가 금방 퍼지지.'],['girl','별빛이 거품 위에 내려앉았어. 정말 예쁘다.'],['cat','냐아아. 거품은 네가 봐. 나는 코코아를 마실게.'])}],
 moonmilk:[{title:'초승달 우유',lines:talk(['girl','잠이 안 와. 저 별은 얼마나 멀리 있을까?'],['cat','우유를 마시면 덜 궁금해질 거야.'],['girl','그런 과학적 근거는 없거든?'],['cat','냐아. 그럼 적어도 배는 따뜻해지겠지.'])}],
 cometcorn:[{title:'혜성 팝콘',lines:talk(['girl','저기 혜성 지나갔어! 봤어?'],['cat','봤지. 지금은 팝콘이 날아간 것도 봤어.'],['girl','어디?'],['cat','내 입으로. 아주 정확하게 착륙했어.'])}],
 nebula:[{title:'성운 젤리',lines:talk(['girl','젤리 안에도 작은 은하가 있는 것 같아.'],['cat','냐아. 내가 먼저 탐사할게.'],['girl','거기서 뭘 발견했는데?'],['cat','포도 맛. 과학의 승리야.'])}],
 icecream:[{title:'은하수 아이스크림',lines:talk(['girl','저 푸른빛을 이렇게 숟가락으로 떠먹는 기분이야.'],['cat','살살 먹어. 차가워.'],['girl','네가 그런 걱정도 해?'],['cat','네가 머리가 아프면 남은 건 내가 먹어야 하잖아.'])}],
 moontart:[{title:'달빛 아래의 소풍',memory:'moon-picnic',lines:talk(['girl','어쩐지 오늘은 달빛이 바로 우리 테이블까지 들어오는 것 같아.'],['cat','냐아. 이 타르트는 나눠 먹는 거래.'],['girl','너 원래 나눠 먹는 거 싫어하지 않았어?'],['cat','좋아하는 사람이랑은 괜찮아. 대신 큰 조각은 내 거.'])}],
 galaxybox:[{title:'별빛 도시락을 여는 밤',memory:'star-banquet',lines:talk(['girl','우와, 안에 별 모양 반찬도 있어! 하나씩 이름 붙여 볼래.'],['cat','냐아아. 다 식기 전에 하는 게 좋겠는데.'],['girl','그럼 저건 혜성, 저건 은하수, 그리고 이건……'],['cat','내 거. 별명도 내 거야.'],['girl','……어쩔 수 없네. 반 나눠 먹자.'],['cat','음. 이렇게 같이 먹는 건 꽤 괜찮네.'])}]
}
export const memoryNames:Record<MemoryId,string>={'cocoa-night':'따뜻한 밤의 코코아','moon-picnic':'달빛 아래의 소풍','star-banquet':'별빛 도시락을 여는 밤','fish-starlight':'고양이를 위한 별빛 접시','cherry-moon':'체리빛 달 아래서','nebula-supper':'성운을 한입에 담아'}
export const memorySnack:Record<MemoryId,SnackId>={'cocoa-night':'cocoa','moon-picnic':'moontart','star-banquet':'galaxybox','fish-starlight':'nightfish','cherry-moon':'cherrymoon','nebula-supper':'nebularice'}
const generalBanters:Conversation[]=[
 talk(['girl','이렇게 많은 별들 중에 이름이 있는 건 몇 개나 될까?'],['cat','냐아아. 배고픈 고양이 별은 있겠지.'],['girl','네가 이름 붙인 거 아니고?'],['cat','좋은 이름은 누가 먼저 붙여도 좋은 이름이지.']),
 talk(['girl','저 별빛은 우리보다 훨씬 오래 여행했겠지?'],['cat','그럼 저 별빛도 중간에 쉬어 갈 곳이 있었을까?'],['girl','빛은 쉬지 않아.'],['cat','안됐네. 나는 다음 역에서 꼭 쉬어야지.']),
 talk(['girl','차창에 비친 모습이 꼭 우리가 우주에 떠 있는 것 같아.'],['cat','실제로 떠 있지. 열차째로.'],['girl','그런 뜻이 아니라 분위기 말이야!'],['cat','냐아. 분위기도 꽤 맛있네.']),
 talk(['girl','어쩐지 오래 달릴수록 생각이 많아져.'],['cat','난 생각이 적어져서 좋아.'],['girl','무슨 생각 하는데?'],['cat','다음 끼니. 그다음엔 낮잠.']),
 talk(['girl','넌 내가 계속 풍경 보자고 해도 귀찮지 않아?'],['cat','냐아…… 귀찮을 때도 있어.'],['girl','진짜?'],['cat','그래도 네가 예쁘다고 하면 한 번은 더 보게 돼.'])
]
const stageBanters:Record<Stage,Conversation[]>={
 departure:[talk(['girl','출발한다! 이번에는 어떤 별을 지나갈까?'],['cat','냐아아. 일단 흔들리지 않는 자리를 찾자.'],['girl','설레지 않아?'],['cat','설레. 간식 카트가 어디서 오는지 궁금하거든.'])],
 nebula:[talk(['girl','저 보라색 성운 봐! 물감을 하늘에 풀어 놓은 것 같지 않아?'],['cat','솜사탕 같아.'],['girl','역시 먹는 것밖에 생각 안 하지.'],['cat','구름을 먹으려는 건 아니야. 아직은.'])],
 sea:[talk(['girl','별의 바다가 정말 끝도 없어. 저기까지 가면 뭐가 있을까?'],['cat','별 다음에는 또 별이 있겠지.'],['girl','그렇게 당연하게 말하면 재미없잖아!'],['cat','그럼 별빛 생선이 헤엄치고 있다고 하자.'])],
 aurora:[talk(['girl','저 오로라는 왜 저렇게 천천히 흔들리는 걸까?'],['cat','내 꼬리랑 비슷한데.'],['girl','네 꼬리는 지금 꿈쩍도 안 하거든?'],['cat','냐아. 저 오로라가 대신 흔들어 주니까.'])],
 islands:[talk(['girl','저 떠다니는 섬에도 누군가 살고 있을까?'],['cat','식당이 있으면 좋겠네.'],['girl','어떻게 거기서도 식당부터 생각해?'],['cat','섬이 떠다니니까 배달이 어려울 것 같아서.'])],
 approach:[talk(['girl','저기 봐! 목적지가 조금씩 커지고 있어.'],['cat','냐아아. 이제 거의 다 왔구나.'],['girl','가장 먼저 뭐 하고 싶어?'],['cat','내리고, 기지개 켜고, 뭐라도 먹어야지.'])]
}
export function trainBanter(stage:Stage|undefined,elapsedMs:number,seed:number):Story{
 const slot=Math.floor(Math.max(0,elapsedMs)/42000)
 const stageTalk=stage?[...stageBanters[stage],...extraStageBanters[stage],...canaryStageBanters[stage].map(s=>s.lines)]:[]
 const stageSelected=slot%3===0&&stageTalk.length>0
 const choose=stageSelected?stageTalk:[...generalBanters,...extraBanters,...canaryBanters.map(s=>s.lines)]
 // 3회마다 지역 대사, 나머지는 일상 대사. 기존 곱셈 인덱스의 특정 대사 고정 현상 제거.
 const offset=Math.floor(Math.abs(seed)/1000)%choose.length
 const step=stageSelected?Math.floor(slot/3):slot-Math.floor(slot/3)
 const index=(offset+step)%choose.length
 return {title:stage?'선실에서 · '+({departure:'출항',nebula:'성운',sea:'별의 바다',aurora:'오로라',islands:'떠다니는 섬',approach:'도착 전'} as Record<Stage,string>)[stage]:'선실에서 나눈 대화',lines:choose[index]}
}
export const conductorStory:Story={title:'차장님의 방문',lines:[
 {speaker:'conductor',text:'좋은 항해입니다, 승객 여러분. 이번 열차의 간식 카트도 도착했습니다.'},
 {speaker:'girl',text:'차장님! 지금 창밖에서 지나가는 빛은 성운인가요? 정말 예뻐요.'},
 {speaker:'cat',text:'냐아아…… 그보다 간식 카트에 생선은 있습니까?'},
 {speaker:'conductor',text:'달빛 생선 타르트가 준비되어 있습니다. 오늘은 조금 할인해 드리죠.'},
 {speaker:'girl',text:'잠깐, 우주 풍경에 대한 설명은요?'},
 {speaker:'conductor',text:'그것도 드릴 수 있지만, 고양이 승객분의 눈이 반짝여서요.'},
 {speaker:'cat',text:'정확한 판단이십니다. 냐아.'}
]}

/** 같은 간식을 여러 번 먹을 때도 같은 대사만 반복하지 않도록 별도의 후속 대화 제공. */
export const snackFollowups:Partial<Record<SnackId,Story>>={
 stardust:{title:'쿠키의 마지막 별',lines:talk(['cat','냐아. 별이 하나밖에 안 남았어.'],['girl','그러게 적당히 먹으랬잖아.'],['cat','아니, 네 거야.'],['girl','……응? 네가 양보도 해?'],['cat','아주 가끔. 오늘은 별이 예쁘니까.'])},
 cocoa:{title:'코코아가 식기 전에',memory:'cocoa-night',lines:talk(['girl','코코아 향이 나니까 여기가 정말 집 같아.'],['cat','우주를 달리는 집이라니, 꽤 좋네.'],['girl','네가 집이라고 부를 정도야?'],['cat','따뜻하고, 먹을 게 있고, 네가 있잖아. 냐아.'])},
 moonmilk:{title:'우유 수염',lines:talk(['girl','잠깐! 입에 하얀 우유 수염 났어.'],['cat','냐아아. 우주고양이의 위엄이야.'],['girl','지금 너무 귀여운걸.'],['cat','그런 말은 간식 하나 더 주면 듣겠어.'])},
 cometcorn:{title:'팝콘 별자리',lines:talk(['girl','팝콘 세 개를 놓으니까 별자리처럼 보여.'],['cat','그럼 내가 새로운 별자리를 만들게.'],['girl','어떤 별자리?'],['cat','사라진 팝콘자리. 냠.'])},
 nebula:{title:'젤리 속 작은 우주',lines:talk(['girl','네 입에서 성운 젤리가 반짝여.'],['cat','냐? 어쩐지 오늘 별이 가까워 보이더라.'],['girl','그걸 먹고 별까지 삼킨 건 아니겠지?'],['cat','글쎄. 조금 더 먹어 봐야 알겠어.'])},
 icecream:{title:'녹아가는 은하수',lines:talk(['girl','아이스크림이 흘러내려! 저 파란 물결 좀 봐.'],['cat','냐아, 더 늦기 전에 구해야지.'],['girl','우주의 평화를 지켜 줘!'],['cat','내가 먹는 게 가장 안전해.'])},
 moontart:{title:'달빛 타르트의 마지막 한 입',memory:'moon-picnic',lines:talk(['girl','여기 마지막 한 입은 네 거야.'],['cat','냐아. 정말?'],['girl','응. 오늘은 네가 먼저 발견했잖아.'],['cat','……그럼 반 줄게. 네가 아까 달이 예쁘다고 했으니까.'])},
 galaxybox:{title:'여행 도시락의 비밀',memory:'star-banquet',lines:talk(['girl','이번 도시락에는 행성 모양 주먹밥도 있어.'],['cat','내가 가장 큰 행성을 맡을게.'],['girl','너는 왜 항상 제일 큰 것만 골라?'],['cat','냐아. 내가 큰 걸 먹으면 넌 가볍게 여행할 수 있잖아.'],['girl','대단한 배려다, 정말.'])}
}
/** 이미 보유한 간식 사용 기록만으로 순환: 저장 형식 변경 없이 새 대사를 만납니다. */
export function snackStory(id:SnackId,used:number):Story{
 const pool=[...(snackStories[id]??[]),...(snackFollowups[id]?[snackFollowups[id]!]:[]),...(snackExtras[id]??[]),canarySnackStories[id]]
 if(!pool.length)throw new Error(`Missing snack story: ${id}`)
 const pick=pool[Math.max(0,Math.floor(used))%pool.length]
 return used===0&&snacks[id].memory?{...pick,memory:snacks[id].memory}:pick
}
export function snackStoryCount(id:SnackId):number{return (snackStories[id]?.length??0)+(snackFollowups[id]?1:0)+(snackExtras[id]?.length??0)+1}
export const conductorStories:readonly Story[]=[
 conductorStory,
 {title:'차장님의 오늘의 안내',lines:[
  {speaker:'conductor',text:'승객 여러분, 창밖의 성운 구간에서는 열차 조명이 잠시 낮아질 수 있습니다.'},
  {speaker:'girl',text:'와, 그럼 별빛이 더 잘 보이겠네요? 창밖에서 눈을 못 떼겠어요!'},
  {speaker:'cat',text:'냐아…… 저는 조명이 낮아져도 간식은 잘 찾습니다.'},
  {speaker:'conductor',text:'그 점은 이미 충분히 알고 있습니다. 이번에는 별가루 쿠키를 가져왔지요.'}
 ]},
 {title:'차장의 작은 비밀',lines:[
  {speaker:'conductor',text:'가끔은 저도 이 열차의 마지막 칸에서 밤하늘을 봅니다.'},
  {speaker:'girl',text:'차장님도 별 구경을 좋아하세요? 제일 좋아하는 별은 어디예요?'},
  {speaker:'conductor',text:'돌아오는 길에 보이는 작은 별입니다. 그곳에는 따뜻한 식사가 있거든요.'},
  {speaker:'cat',text:'냐아아! 차장님, 저랑 취향이 아주 비슷하시네요.'},
  {speaker:'girl',text:'둘 다 먹는 얘기로 끝나는 건가요? ㅋㅋㅋ'}
 ]}
]
const cs=(...l:[string,string][]):Conversation=>l.map(([speaker,text])=>({speaker:speaker==='conductor'?'conductor':speaker==='girl'?'girl':'cat',text}))
/** 지금 지나는 구간에 맞춘 차장의 이야기. */
export const conductorStageStories:Record<Stage,Story>={
 departure:{title:'차장님의 출항 인사',lines:cs(['conductor','출항 직후라 아직 조금 흔들릴 수 있습니다. 따뜻한 간식 어떠십니까?'],['girl','차장님은 출항할 때마다 이렇게 돌아다니세요?'],['conductor','첫 별을 지나고 나면 승객분들 표정이 풀리거든요. 그걸 보는 게 낙입니다.'],['cat','냐아. 표정보다 카트를 먼저 봐 주시면 좋겠습니다.'])},
 nebula:{title:'차장님의 성운 안내',lines:cs(['conductor','성운 구간에서는 창밖이 보랏빛으로 번집니다. 사진은 마음에 담아 두십시오.'],['girl','저 카메라 없는데요!'],['cat','기억에는 간식 맛도 같이 담깁니다.'],['conductor','탁월한 보관 방식이군요. 카트 쪽으로 오시지요.'])},
 sea:{title:'차장님의 별의 바다 이야기',lines:cs(['conductor','별의 바다에서는 가끔 고래가 지나갑니다. 노랫소리가 들리면 창가로 가 보십시오.'],['girl','정말요? 어떤 노래예요?'],['conductor','제가 들은 건 졸음이 쏟아지는 노래였습니다.'],['cat','냐아…… 벌써 졸린데요.'])},
 aurora:{title:'차장님의 오로라 항로 안내',lines:cs(['conductor','오로라 항로에서는 열차 램프를 낮춥니다. 빛이 서로 놀라지 않도록요.'],['girl','빛도 놀라요?'],['conductor','아주 수줍어하지요. 마치 어느 고양이 승객처럼.'],['cat','저는 수줍은 게 아니라 신중한 겁니다.'])},
 islands:{title:'차장님의 떠다니는 섬 이야기',lines:cs(['conductor','저 섬들은 승객분들이 던져 준 소원 조각으로 생겼다는 이야기가 있습니다.'],['girl','그럼 우리 소원도 어딘가에서 섬이 될까요?'],['conductor','소원을 아주 오래 간직하면 가능하다고들 하더군요.'],['cat','제 소원은 이미 오래 간직 중입니다. 간식입니다.'])},
 approach:{title:'차장님의 도착 안내',lines:cs(['conductor','곧 목적지입니다. 내리실 때는 짐과 마음을 모두 챙기시기 바랍니다.'],['girl','마음은 어떻게 챙겨요?'],['conductor','이번 여행에서 가장 기억에 남은 장면을 한 번 떠올려 보시면 됩니다.'],['cat','저는 이미 마지막 간식을 떠올렸습니다.'])}
}
/** 구간이 정해져 있으면 3번 중 2번은 그 구간에 어울리는 이야기를 들려준다. */
export function conductorStoryFor(journeyId:string,stage?:Stage):Story{
 const hash=[...journeyId].reduce((acc,c)=>acc+c.charCodeAt(0),0)
 if(stage&&hash%3!==0)return conductorStageStories[stage]
 return conductorStories[hash%conductorStories.length]
}
