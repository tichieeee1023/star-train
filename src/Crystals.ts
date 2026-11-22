/**
 * 수정 씨앗 재배: 《별빛 항해일지》의 항해 보상 → 씨앗 주머니 → 돌봄 → 변이 → 도감 구조를 계승.
 * 단, 색깔은 심을 때 확정하지 않고 재배 중 조명·돌봄·영양제 영향이 누적된 후 완성 시 결정합니다.
 * 도착 보상은 travel.id를 기준으로 한 번만 정산하고, 앱 재접속으로 다시 추첨하지 않습니다.
 */
import type {Scenery} from './routeData'
import type {Light} from './Palette'

export type Rarity='common'|'special'|'rare'|'mystic'
export const rarityNames:Record<Rarity,string>={common:'보통',special:'특별',rare:'희귀',mystic:'신비'}
export type CrystalId='stardrop'|'lilac'|'aqua'|'frost'|'amber'|'orbit'|'aurora'|'meteor'
export type Variant='normal'|'dawn'|'dusk'|'night'
export const variants:Variant[]=['normal','dawn','dusk','night']
export const variantNames:Record<Variant,string>={normal:'본래 빛깔',dawn:'새벽빛',dusk:'노을빛',night:'한밤빛'}
export const species:Record<CrystalId,{name:string;rarity:Rarity;color:string;description:string;shape:'spire'|'cluster'|'star'}>={
 stardrop:{name:'별방울 수정',rarity:'common',color:'#c6d1f9',description:'별이 떨어진 자리에 남는 작은 수정.',shape:'spire'},
 lilac:{name:'라일락 수정',rarity:'common',color:'#c1a1ed',description:'연보라빛 성운을 닮은 수정.',shape:'cluster'},
 aqua:{name:'청람 수정',rarity:'special',color:'#7ed7dd',description:'바다와 행성 고리의 빛을 품은 수정.',shape:'spire'},
 frost:{name:'서리별 수정',rarity:'special',color:'#b2e0f7',description:'표면에 눈꽃처럼 빛이 번지는 수정.',shape:'star'},
 amber:{name:'황혼 수정',rarity:'rare',color:'#eabd78',description:'유성의 온기가 남은 황금빛 결정.',shape:'cluster'},
 orbit:{name:'궤도 수정',rarity:'rare',color:'#b0b2f0',description:'빛이 미세한 고리로 감도는 수정.',shape:'star'},
 aurora:{name:'오로라 수정',rarity:'mystic',color:'#77eac2',description:'밤하늘의 빛 물결을 간직한 수정.',shape:'cluster'},
 meteor:{name:'유성 심장석',rarity:'mystic',color:'#f7b5be',description:'멀리서 온 빛이 천천히 숨 쉬는 결정.',shape:'star'}
}
export const speciesIds=Object.keys(species) as CrystalId[]
export const rareLocations:Readonly<Scenery[]> = ['auroraforest','canyon'] // 임시 희귀 방문지; 희귀 항로 제안으로만 정상 진입 가능
export const tripHours=[1,3,8] as const
export type TripHours=typeof tripHours[number]
export const CARE_WINDOW=4*60*60*1000
export const HOUR=60*60*1000
export const targetPoints:Record<Rarity,number>={common:3,special:5,rare:8,mystic:11}
export type Fertilizer='tiny'|'bright'|'galaxy'|'mystic'
export const fertilizers:Record<Fertilizer,{name:string;hours:number}>={
 tiny:{name:'작은 별빛 영양액',hours:3},bright:{name:'반짝이는 영양액',hours:8},galaxy:{name:'은하수 영양액',hours:18},mystic:{name:'신비한 영양액',hours:36}
}
export const fertilizerIds=Object.keys(fertilizers) as Fertilizer[]
export type Seed={key:string;id:CrystalId;origin:Scenery;obtainedAt:number}
export type CrystalGrowing={seed:Seed;plantedAt:number;points:number;accountedSlots:number;lastCareSlot:number;lastCareAt:number;playerVisits:number;catVisits:number;influence:Record<Variant,number>;colorRoll:number;nutritionCount:number}
export type CrystalRecord={count:number;variants:Variant[];firstAt:number;origin:Scenery}
export type Journey={id:string;destination:Scenery;start:number;end:number;hours:TripHours;settled:boolean}
export type Landing={journeyId:string;destination:Scenery;seed:Seed|null;at:number;hours:TripHours;rare:boolean;bonuses:Fertilizer[]}
export type CrystalGame={version:1;seeds:Seed[];current:CrystalGrowing|null;album:Partial<Record<CrystalId,CrystalRecord>>;stock:Record<Fertilizer,number>;journey:Journey|null;landing:Landing|null;settledJourneyIds:string[];rareOffer:Scenery|null;lastRare:Scenery|null}
export const freshGame=():CrystalGame=>({version:1,seeds:[],current:null,album:{},stock:{tiny:0,bright:0,galaxy:0,mystic:0},journey:null,landing:null,settledJourneyIds:[],rareOffer:null,lastRare:null})
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v))
const pools:Record<Scenery,readonly (readonly [CrystalId,number])[]>={
 nebula:[['stardrop',6],['lilac',5],['orbit',1]],
 ringsea:[['stardrop',5],['aqua',5],['orbit',2]],
 snowfield:[['stardrop',5],['frost',6],['orbit',1]],
 auroraforest:[['aqua',3],['aurora',5],['orbit',2]],
 canyon:[['lilac',3],['amber',5],['meteor',2]],
 city:[['stardrop',7],['aqua',3],['amber',1]]
}
/** 8시간 또는 희귀 지역은 확정. 나머지는 1시간 40%, 3시간 60%. */
export function rollSeed(destination:Scenery,hours:TripHours,journeyId:string,now:number,random:()=>number=Math.random):Seed|null{
 const chance=hours===8||rareLocations.includes(destination)?1:hours===3?.6:.4
 if(random()>=chance)return null
 const rareBoost=hours===8?2.2:hours===3?1.3:1
 const weighted=pools[destination].map(([id,weight])=>[id,weight*(species[id].rarity==='common'?1:rareBoost)] as const)
 let n=random()*weighted.reduce((sum,[,weight])=>sum+weight,0)
 for(const [id,weight] of weighted){if(n<weight)return {key:journeyId+':seed',id,origin:destination,obtainedAt:now};n-=weight}
 return {key:journeyId+':seed',id:weighted[weighted.length-1][0],origin:destination,obtainedAt:now}
}
export function startJourney(game:CrystalGame,destination:Scenery,hours:TripHours,now:number):CrystalGame{
 if(game.journey)return game
 if(rareLocations.includes(destination)&&game.rareOffer!==destination)return game
 const id=`${now}:${destination}:${hours}`
 return {...game,journey:{id,destination,hours,start:now,end:now+hours*HOUR,settled:false},landing:null,rareOffer:game.rareOffer===destination?null:game.rareOffer}
}
export function rewardFertilizers(hours:TripHours,rare:boolean):Fertilizer[]{
 if(hours===8)return ['tiny','bright','galaxy',...(rare?['mystic' as const]:[])]
 if(hours===3)return ['tiny','bright']
 return ['tiny']
}
/** 실제 도착 시 단 한 번 정산. 순수 함수로 작성해 새로고침 시 재추첨을 방지합니다. */
export function settleJourney(game:CrystalGame,now:number,random:()=>number=Math.random):CrystalGame{
 const journey=game.journey
 if(!journey||now<journey.end||journey.settled||game.settledJourneyIds.includes(journey.id))return game
 const rare=rareLocations.includes(journey.destination)
 const seed=rollSeed(journey.destination,journey.hours,journey.id,journey.end,random)
 const bonuses=rewardFertilizers(journey.hours,rare)
 const stock={...game.stock}
 for(const bonus of bonuses)stock[bonus]+=1
 let rareOffer=game.rareOffer,lastRare=game.lastRare
 if(!rareOffer&&random()<.2){
   const pool=rareLocations.filter(id=>id!==game.lastRare)
   rareOffer=pool[Math.floor(random()*pool.length)]??rareLocations[0]
   lastRare=rareOffer
 }
 return {...game,seeds:seed?[...game.seeds,seed]:game.seeds,stock,
   journey:{...journey,settled:true},settledJourneyIds:[...game.settledJourneyIds,journey.id].slice(-120),
   landing:{journeyId:journey.id,destination:journey.destination,seed,at:journey.end,hours:journey.hours,rare,bonuses},rareOffer,lastRare}
}
export function completeLanding(game:CrystalGame):CrystalGame{return {...game,journey:null,landing:null}}
function timeSlots(g:CrystalGrowing,now:number){return Math.max(0,Math.floor((now-g.plantedAt)/CARE_WINDOW))}
export function careReadyIn(g:CrystalGrowing,now:number):number{
 const bySlot=g.lastCareSlot>=timeSlots(g,now)?g.plantedAt+(timeSlots(g,now)+1)*CARE_WINDOW-now:0
 const byTime=g.lastCareAt+CARE_WINDOW-now
 return Math.max(0,bySlot,byTime)
}
export const growthPercent=(g:CrystalGrowing)=>clamp(g.points/targetPoints[species[g.seed.id].rarity]*100,0,100)
export const isReady=(g:CrystalGrowing)=>growthPercent(g)>=100
export const growthStage=(growth:number)=>growth>=100?3:growth>=65?2:growth>=28?1:0
export const growthLabels=['씨앗','결정 성장','결정 분화','완성'] as const
/** 부재 중 고양이가 4시간에 0.5씩 조용히 수정병을 살핍니다. 돌봄은 놓쳐도 실패하지 않습니다. */
export function advanceGrowth(game:CrystalGame,now:number):CrystalGame{
 const g=game.current
 if(!g||isReady(g))return game
 const slot=timeSlots(g,now)
 if(slot<=g.accountedSlots)return game
 const skip=g.lastCareSlot>=g.accountedSlots&&g.lastCareSlot<slot?1:0
 const catVisits=Math.max(0,slot-g.accountedSlots-skip)
 return {...game,current:{...g,points:Math.min(targetPoints[species[g.seed.id].rarity],g.points+catVisits*.5),accountedSlots:slot,catVisits:g.catVisits+catVisits}}
}
export function plantSeed(game:CrystalGame,key:string,now:number,light:Light,random:()=>number=Math.random):CrystalGame{
 const advanced=advanceGrowth(game,now)
 const seed=advanced.seeds.find(x=>x.key===key)
 if(!seed||advanced.current)return advanced
 const influence:Record<Variant,number>={normal:3,dawn:1,dusk:1,night:1}
 influence[light==='night'?'night':light]+=2
 // 출신지의 빛은 조금 남지만, 돌보는 방식이 완성색에 더 크게 작용합니다.
 if(seed.origin==='snowfield'||seed.origin==='ringsea')influence.dawn+=1
 if(seed.origin==='canyon'||seed.origin==='city')influence.dusk+=1
 if(seed.origin==='auroraforest'||seed.origin==='nebula')influence.night+=1
 return {...advanced,seeds:advanced.seeds.filter(x=>x.key!==key),current:{seed,plantedAt:now,points:0,accountedSlots:0,lastCareSlot:-1,lastCareAt:0,playerVisits:0,catVisits:0,influence,colorRoll:random(),nutritionCount:0}}
}
export function careCrystal(game:CrystalGame,kind:'light'|'polish',light:Light,now:number):CrystalGame{
 const advanced=advanceGrowth(game,now),g=advanced.current
 if(!g||isReady(g)||careReadyIn(g,now)>0)return advanced
 const influence={...g.influence}
 if(kind==='light')influence[light==='night'?'night':light]+=2
 else influence.normal+=1.5
 return {...advanced,current:{...g,influence,points:Math.min(targetPoints[species[g.seed.id].rarity],g.points+1),lastCareSlot:timeSlots(g,now),lastCareAt:now,playerVisits:g.playerVisits+1}}
}
export function nourishCrystal(game:CrystalGame,id:Fertilizer,light:Light,now:number):CrystalGame{
 const advanced=advanceGrowth(game,now),g=advanced.current
 if(!g||isReady(g)||advanced.stock[id]<=0)return advanced
 const influence={...g.influence}
 influence[light==='night'?'night':light]+=id==='mystic'?3:1
 const increase=fertilizers[id].hours*HOUR/CARE_WINDOW*.5
 return {...advanced,stock:{...advanced.stock,[id]:advanced.stock[id]-1},current:{...g,points:Math.min(targetPoints[species[g.seed.id].rarity],g.points+increase),nutritionCount:g.nutritionCount+1,influence}}
}
/** 동일 씨앗을 다시 길러도 돌봄에 따라 네 가지 색이 나올 수 있음. 완성 시에만 기록됨. */
export function crystalVariant(g:CrystalGrowing):Variant{
 const total=variants.reduce((sum,id)=>sum+g.influence[id],0)
 let roll=g.colorRoll*total
 for(const id of variants){roll-=g.influence[id];if(roll<0)return id}
 return 'normal'
}
export function harvestCrystal(game:CrystalGame,now:number):CrystalGame{
 const advanced=advanceGrowth(game,now),g=advanced.current
 if(!g||!isReady(g))return advanced
 const variant=crystalVariant(g),old=advanced.album[g.seed.id]
 const record:CrystalRecord={count:(old?.count??0)+1,variants:[...new Set([...(old?.variants??[]),variant])],firstAt:old?.firstAt??now,origin:old?.origin??g.seed.origin}
 return {...advanced,current:null,album:{...advanced.album,[g.seed.id]:record}}
}
export const STORAGE_KEY='star-train:crystals:v1'
export function loadGame():CrystalGame{
 if(typeof window==='undefined')return freshGame()
 try{
   const raw=window.localStorage.getItem(STORAGE_KEY)
   if(!raw)return freshGame()
   const data=JSON.parse(raw) as CrystalGame
   if(data?.version!==1||!Array.isArray(data.seeds)||!data.stock||!Array.isArray(data.settledJourneyIds))return freshGame()
   return {...freshGame(),...data,stock:{...freshGame().stock,...data.stock}}
 }catch{return freshGame()}
}
export function saveGame(game:CrystalGame){try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(game))}catch{/* storage blocked: play in memory */}}
