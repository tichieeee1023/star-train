/**
 * 수정 씨앗 재배: 《별빛 항해일지》의 항해 보상 → 씨앗 주머니 → 돌봄 → 변이 → 도감 구조를 계승.
 * 단, 색깔은 심을 때 확정하지 않고 재배 중 조명·돌봄·영양제 영향이 누적된 후 완성 시 결정합니다.
 * 도착 보상은 travel.id를 기준으로 한 번만 정산하고, 앱 재접속으로 다시 추첨하지 않습니다.
 */
import {sceneryOrder,type Scenery} from './routeData'
import {newLife,normalizeLife,addCoins,planConductor,journeyCoinReward,type LifeState} from './TrainLife'
import type {Weather} from './CanvasPaint'
import type {Light} from './Palette'

export type Rarity='common'|'special'|'rare'|'mystic'
export const rarityNames:Record<Rarity,string>={common:'보통',special:'특별',rare:'희귀',mystic:'신비'}
export type CrystalId='stardrop'|'lilac'|'aqua'|'frost'|'amber'|'orbit'|'aurora'|'meteor'|'moonhalo'|'bloom'|'ember'|'songfeather'
export type Variant='normal'|'dawn'|'dusk'|'night'
export const variants:Variant[]=['normal','dawn','dusk','night']
export const variantNames:Record<Variant,string>={normal:'본래 빛깔',dawn:'새벽빛',dusk:'노을빛',night:'한밤빛'}
export const species:Record<CrystalId,{name:string;rarity:Rarity;color:string;description:string;shape:'spire'|'cluster'|'star'|'gem'|'flower'|'feather'}>={
 stardrop:{name:'별방울 수정',rarity:'common',color:'#c6d1f9',description:'별이 떨어진 자리에 남는 작은 수정.',shape:'spire'},
 lilac:{name:'라일락 수정',rarity:'common',color:'#c1a1ed',description:'연보라빛 성운을 닮은 수정.',shape:'cluster'},
 aqua:{name:'청람 수정',rarity:'special',color:'#7ed7dd',description:'바다와 행성 고리의 빛을 품은 수정.',shape:'spire'},
 frost:{name:'서리별 수정',rarity:'special',color:'#b2e0f7',description:'표면에 눈꽃처럼 빛이 번지는 수정.',shape:'star'},
 amber:{name:'황혼 수정',rarity:'rare',color:'#f2a93e',description:'유성의 온기가 남은 황금빛 결정.',shape:'cluster'},
 orbit:{name:'궤도 수정',rarity:'rare',color:'#b0b2f0',description:'빛이 미세한 고리로 감도는 수정.',shape:'star'},
 aurora:{name:'오로라 수정',rarity:'mystic',color:'#77eac2',description:'밤하늘의 빛 물결을 간직한 수정.',shape:'cluster'},
 meteor:{name:'유성 심장석',rarity:'mystic',color:'#f7b5be',description:'멀리서 온 빛이 천천히 숨 쉬는 결정.',shape:'star'},
 moonhalo:{name:'달무리 수정',rarity:'special',color:'#ece4f8',description:'달 둘레의 흐린 빛이 둥글게 굳은 수정.',shape:'gem'},
 bloom:{name:'꽃별 수정',rarity:'special',color:'#f5a8d0',description:'꽃잎이 한 장씩 별빛으로 피어난 수정.',shape:'flower'},
 ember:{name:'불씨 수정',rarity:'rare',color:'#ff9a6b',description:'식은 용암 속에 작은 불씨를 간직한 수정.',shape:'cluster'},
 songfeather:{name:'노래깃 수정',rarity:'mystic',color:'#ffd75e',description:'황금빛 깃털이 노래를 머금고 굳은 수정.',shape:'feather'}
}
export const speciesIds=Object.keys(species) as CrystalId[]
export const rareLocations:Readonly<Scenery[]> = ['auroraforest','canyon','lanternsea','cloudwhale','crystalcave','starcherry'] // 희귀 방문지; 희귀 항로 제안으로만 진입 가능
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
export type Seed={key:string;id:CrystalId;origin:Scenery;obtainedAt:number;source?:'shop'}
export type CrystalGrowing={seed:Seed;plantedAt:number;points:number;accountedSlots:number;lastCareSlot:number;lastCareAt:number;playerVisits:number;catVisits:number;influence:Record<Variant,number>;colorRoll:number;nutritionCount:number}
export type CrystalRecord={count:number;variants:Variant[];firstAt:number;origin:Scenery}
export type Journey={id:string;destination:Scenery;start:number;end:number;hours:TripHours;settled:boolean}
export type Landing={journeyId:string;destination:Scenery;seed:Seed|null;at:number;hours:TripHours;rare:boolean;bonuses:Fertilizer[];weather?:Weather;action?:0|1;dialogue?:number;experienced?:boolean;newScenery?:boolean}
export type CrystalGame={version:1;life?:LifeState;seeds:Seed[];current:CrystalGrowing|null;album:Partial<Record<CrystalId,CrystalRecord>>;stock:Record<Fertilizer,number>;journey:Journey|null;landing:Landing|null;settledJourneyIds:string[];rareOffer:Scenery|null;lastRare:Scenery|null;routeOffers?:Scenery[];lastVisited?:Scenery|null;sceneRecords?:string[];sceneCards?:Scenery[];sceneShots?:string[];atmosphereShots?:string[];sceneDiscoveries?:string[];sceneVisits?:Partial<Record<Scenery,number>>;seedMisses?:number}
export const freshGame=():CrystalGame=>({version:1,life:newLife(),seeds:[],current:null,album:{},stock:{tiny:0,bright:0,galaxy:0,mystic:0},journey:null,landing:null,settledJourneyIds:[],rareOffer:null,lastRare:null,routeOffers:pickRouteOffers(),lastVisited:null,sceneRecords:[],sceneCards:[],sceneShots:[],atmosphereShots:[],sceneDiscoveries:[],sceneVisits:{}})
/** 두 곳의 일반 항로만 제시합니다. 희귀 항로는 도착 보상으로만 열립니다. */
export function pickRouteOffers(last?:Scenery|null,random:()=>number=Math.random):Scenery[]{
 const pool=sceneryOrder.filter(p=>!rareLocations.includes(p)&&p!==last).map(p=>({p,weight:p==='city'?.35:1}))
 const picks:Scenery[]=[]
 for(let i=0;i<2;i++){
  let draw=random()*pool.reduce((sum,x)=>sum+x.weight,0)
  let index=pool.findIndex(x=>(draw-=x.weight)<0)
  if(index<0)index=pool.length-1
  picks.push(pool.splice(index,1)[0].p)
 }
 return picks
}
/** 어린왕자처럼 1시간=노을, 3시간=새벽, 8시간=한밤. */
export function voyageLight(hours:TripHours):Light{return hours===1?'dusk':hours===3?'dawn':'night'}
/** 기후는 도착 정산에서 한번 결정하며, 그 여정에 귀속됩니다. */
export function rollWeather(destination:Scenery,hours:TripHours,random:()=>number=Math.random):Weather{
 const climate:Record<Scenery,readonly (readonly [Weather,number])[]>={
  nebula:[['clear',35],['meteor',26],['aurora',18],['snow',10]],
  ringsea:[['clear',31],['rain',30],['meteor',18],['aurora',12]],
  snowfield:[['clear',23],['snow',48],['meteor',15],['aurora',9]],
  auroraforest:[['clear',27],['aurora',44],['rain',17],['meteor',12]],
  canyon:[['clear',35],['meteor',43],['rain',14],['aurora',8]],
  city:[['clear',38],['rain',29],['snow',17],['meteor',12]],
  dunes:[['clear',44],['meteor',34],['aurora',14],['rain',8]],
  garden:[['clear',36],['rain',30],['snow',14],['meteor',12],['aurora',8]],
  ruins:[['clear',36],['meteor',22],['aurora',22],['rain',20]],
  volcano:[['clear',42],['meteor',34],['aurora',14],['rain',10]],
  lanternsea:[['clear',38],['meteor',32],['aurora',16],['rain',14]],
  cloudwhale:[['clear',46],['meteor',24],['aurora',20],['rain',10]],
  crystalcave:[['clear',52],['aurora',20],['meteor',18],['rain',10]],
  starcherry:[['clear',40],['rain',20],['meteor',16],['snow',14],['aurora',10]]
 }
 const options=climate[destination].map(([kind,weight])=>[kind,weight*(hours===8&&kind!=='clear'?1.7:1)] as const)
 let draw=random()*options.reduce((sum,[,weight])=>sum+weight,0)
 for(const [kind,weight] of options){draw-=weight;if(draw<0)return kind}
 return options[options.length-1][0]
}
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v))
const pools:Record<Scenery,readonly (readonly [CrystalId,number])[]>={
 nebula:[['stardrop',6],['lilac',5],['bloom',2],['orbit',1]],
 ringsea:[['stardrop',5],['aqua',5],['moonhalo',2],['orbit',2]],
 snowfield:[['stardrop',5],['frost',6],['orbit',1]],
 auroraforest:[['aqua',3],['aurora',5],['orbit',2],['songfeather',2]],
 canyon:[['lilac',3],['amber',5],['ember',3],['meteor',2],['songfeather',1]],
 city:[['stardrop',7],['aqua',3],['moonhalo',2],['bloom',1],['amber',1],['songfeather',1]],
 dunes:[['stardrop',5],['amber',4],['moonhalo',3],['ember',1],['orbit',2]],
 garden:[['lilac',5],['stardrop',4],['bloom',5],['aqua',3]],
 ruins:[['stardrop',4],['orbit',4],['moonhalo',3],['lilac',2],['meteor',1]],
 volcano:[['amber',5],['ember',4],['stardrop',3],['meteor',2],['orbit',1],['songfeather',1]],
 lanternsea:[['ember',3],['moonhalo',4],['songfeather',3],['amber',3],['stardrop',2]],
 cloudwhale:[['aqua',4],['moonhalo',4],['aurora',3],['songfeather',3],['orbit',3]],
 crystalcave:[['orbit',4],['aurora',3],['meteor',3],['moonhalo',3],['lilac',2],['songfeather',2]],
 starcherry:[['bloom',6],['lilac',3],['moonhalo',2],['songfeather',3],['meteor',2]]
}
/** 8시간·희귀 지역·보장(guarantee)은 확정. 1시간 75%, 3시간 90%. */
export function rollSeed(destination:Scenery,hours:TripHours,journeyId:string,now:number,random:()=>number=Math.random,guarantee=false):Seed|null{
 const chance=guarantee||hours===8||rareLocations.includes(destination)?1:hours===3?.9:.75
 if(random()>=chance)return null
 const rareBoost=hours===8?2.2:hours===3?1.3:1
 const weighted=pools[destination].map(([id,weight])=>[id,weight*(species[id].rarity==='common'?1:rareBoost)] as const)
 let n=random()*weighted.reduce((sum,[,weight])=>sum+weight,0)
 for(const [id,weight] of weighted){if(n<weight)return {key:journeyId+':seed',id,origin:destination,obtainedAt:now};n-=weight}
 return {key:journeyId+':seed',id:weighted[weighted.length-1][0],origin:destination,obtainedAt:now}
}
export function startJourney(game:CrystalGame,destination:Scenery,hours:TripHours,now:number):CrystalGame{
 if(game.journey)return game
 if(rareLocations.includes(destination)?game.rareOffer!==destination:!(game.routeOffers??[]).includes(destination))return game
 const id=`${now}:${destination}:${hours}`
 return {...game,life:planConductor(normalizeLife(game.life),id,now,now+hours*HOUR,hours),journey:{id,destination,hours,start:now,end:now+hours*HOUR,settled:false},landing:null,lastVisited:destination,routeOffers:pickRouteOffers(destination),rareOffer:game.rareOffer===destination?null:game.rareOffer}
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
 // 첫 항해는 확정, 한 번 씨앗을 못 얻으면 다음 여행은 확정. 저장된 실패 기록을 이어 사용한다.
 const firstEver=game.settledJourneyIds.length===0&&game.seeds.length===0&&!game.current&&Object.keys(game.album).length===0
 const seed=rollSeed(journey.destination,journey.hours,journey.id,journey.end,random,firstEver||(game.seedMisses??0)>=1)
 const weather=rollWeather(journey.destination,journey.hours,random)
 const sceneKey=`${journey.destination}:${voyageLight(journey.hours)}:${weather}`
 const sceneRecords=game.sceneRecords??[]
 const shotKey=`${journey.destination}:${voyageLight(journey.hours)}`
 const sceneShots=game.sceneShots??[]
 const sceneCards=game.sceneCards??[]
 const atmosphereShots=game.atmosphereShots??[]
 const newScenery=!sceneRecords.includes(sceneKey)
 const firstPlace=!(game.sceneCards??[]).includes(journey.destination)
 const firstSky=!sceneRecords.includes(sceneKey)
 // Little Prince Gallery: destination card, one photo per light, and special-weather photos.
 // Only landscapes actually reached are recorded. Each key is unique and persistent.
 const nextCards=sceneCards.includes(journey.destination)?sceneCards:[...sceneCards,journey.destination]
 const nextShots=sceneShots.includes(shotKey)?sceneShots:[...sceneShots,shotKey]
 const nextAtmosphere=weather==='clear'||atmosphereShots.includes(sceneKey)?atmosphereShots:[...atmosphereShots,sceneKey]
 const sceneVisits={...game.sceneVisits,[journey.destination]:(game.sceneVisits?.[journey.destination]??0)+1}
 const bonuses=rewardFertilizers(journey.hours,rare)
 const stock={...game.stock}
 for(const bonus of bonuses)stock[bonus]+=1
 let rareOffer=game.rareOffer,lastRare=game.lastRare
 if(!rareOffer&&random()<.2){
   const unvisited=rareLocations.filter(id=>!nextCards.includes(id))
   const pool=unvisited.length?unvisited:rareLocations.filter(id=>id!==game.lastRare)
   rareOffer=pool[Math.floor(random()*pool.length)]??rareLocations[0]
   lastRare=rareOffer
 }
 const life=addCoins(normalizeLife(game.life),`journey:${journey.id}`,journeyCoinReward(journey.hours,rare,firstPlace,firstSky))
 return {...game,life,seedMisses:seed?0:(game.seedMisses??0)+1,seeds:seed?[...game.seeds,seed]:game.seeds,stock,sceneRecords:newScenery?[...sceneRecords,sceneKey]:sceneRecords,sceneCards:nextCards,sceneShots:nextShots,atmosphereShots:nextAtmosphere,sceneVisits,
   journey:{...journey,settled:true},settledJourneyIds:[...game.settledJourneyIds,journey.id].slice(-120),
   landing:{journeyId:journey.id,destination:journey.destination,seed,at:journey.end,hours:journey.hours,rare,bonuses,weather, newScenery,action:random()<.5?0:1,dialogue:Math.floor(random()*3),experienced:false},rareOffer,lastRare}
}
export function completeLanding(game:CrystalGame):CrystalGame{return game.journey&&!game.journey.settled?game:{...game,journey:null,landing:null}}
/** 같은 여행의 행동은 한 번만 발견 처리합니다. */
export function experienceLanding(game:CrystalGame):CrystalGame{
 const landing=game.landing;if(!landing||landing.experienced)return game
 const key=`${landing.destination}:${landing.action??0}`
 const discoveries=game.sceneDiscoveries??[]
 return {...game,life:addCoins(normalizeLife(game.life),`discovery:${landing.journeyId}`,3),landing:{...landing,experienced:true},sceneDiscoveries:discoveries.includes(key)?discoveries:[...discoveries,key]}
}
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
 if(seed.origin==='snowfield'||seed.origin==='ringsea'||seed.origin==='garden'||seed.origin==='cloudwhale')influence.dawn+=1
 if(seed.origin==='canyon'||seed.origin==='city'||seed.origin==='dunes'||seed.origin==='volcano'||seed.origin==='lanternsea'||seed.origin==='starcherry')influence.dusk+=1
 if(seed.origin==='auroraforest'||seed.origin==='nebula'||seed.origin==='ruins'||seed.origin==='crystalcave')influence.night+=1
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
 const earned=({common:4,special:5,rare:7,mystic:10} as Record<Rarity,number>)[species[g.seed.id].rarity]
 return {...advanced,life:addCoins(normalizeLife(advanced.life),`harvest:${g.seed.key}`,earned),current:null,album:{...advanced.album,[g.seed.id]:record}}
}
export const STORAGE_KEY='star-train:crystals:v1'
export function loadGame():CrystalGame{
 if(typeof window==='undefined')return freshGame()
 try{
   const raw=window.localStorage.getItem(STORAGE_KEY)
   if(!raw)return freshGame()
   const data=JSON.parse(raw) as CrystalGame
   if(data?.version!==1||!Array.isArray(data.seeds)||!data.stock||!Array.isArray(data.settledJourneyIds))return freshGame()
   // Pre-v2.2 sceneRecords already contains all actual visits. Migrate without inventing unseen photos.
   const historical=Array.isArray(data.sceneRecords)?data.sceneRecords:[]
   const valid=(p:string)=>sceneryOrder.includes(p as Scenery)
   const cards=(Array.isArray(data.sceneCards)?data.sceneCards:historical.map(k=>k.split(':')[0])).filter((p):p is Scenery=>typeof p==='string'&&valid(p))
   const validLights=['dawn','dusk','night'],validWeathers=['clear','rain','snow','meteor','aurora']
   const shotKeys=historical.filter(k=>{const [place,light,weather]=k.split(':');return valid(place)&&validLights.includes(light)&&validWeathers.includes(weather)}).map(k=>k.split(':').slice(0,2).join(':'))
   const specialKeys=historical.filter(k=>{const [place,light,weather]=k.split(':');return valid(place)&&validLights.includes(light)&&validWeathers.includes(weather)&&weather!=='clear'})
   const snapshots=Array.isArray(data.sceneShots)?data.sceneShots:shotKeys
   const special=Array.isArray(data.atmosphereShots)?data.atmosphereShots:specialKeys
   return {...freshGame(),...data,life:normalizeLife(data.life),sceneCards:[...new Set(cards)],sceneShots:[...new Set(snapshots)],atmosphereShots:[...new Set(special)],sceneDiscoveries:Array.isArray(data.sceneDiscoveries)?data.sceneDiscoveries:[],sceneVisits:data.sceneVisits??{},routeOffers:Array.isArray(data.routeOffers)&&data.routeOffers.length===2&&data.routeOffers.every(p=>sceneryOrder.includes(p)&&!rareLocations.includes(p))&&data.routeOffers[0]!==data.routeOffers[1]?data.routeOffers:pickRouteOffers(data.journey?.destination??data.lastVisited),stock:{...freshGame().stock,...data.stock}}
 }catch{return freshGame()}
}
export function saveGame(game:CrystalGame){try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(game))}catch{/* storage blocked: play in memory */}}
