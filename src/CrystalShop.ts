/** 열차 상점의 재배 용품. 현재 코인과 수정 저장 객체를 그대로 사용합니다. */
import {species, speciesIds, fertilizerIds, type CrystalGame, type CrystalId, type Fertilizer} from './Crystals'
import {dailyKey, normalizeLife} from './TrainLife'
import type {Scenery} from './routeData'

export const seedPrices: Partial<Record<CrystalId,number>> = {
 stardrop:12, lilac:14, aqua:22, frost:24, amber:36, orbit:39, moonhalo:26, bloom:26
}
export const nutrientPrices:Record<Fertilizer,number>={tiny:5,bright:11,galaxy:21,mystic:37}
export const seedOrigins:Record<CrystalId,Scenery>={
 stardrop:'nebula',lilac:'garden',aqua:'ringsea',frost:'snowfield',amber:'canyon',orbit:'ruins',aurora:'auroraforest',meteor:'volcano',moonhalo:'lanternsea',bloom:'starcherry',ember:'volcano',songfeather:'cloudwhale'
}
export const shopSeedIds=speciesIds.filter((id):id is CrystalId=>seedPrices[id]!==undefined)
/** 날짜가 같은 동안은 세일 품목을 유지하고, 재시작으로 재추첨하지 않습니다. */
export function featuredSeed(now:number):CrystalId{
 const day=dailyKey(now)
 let hash=17
 for(const ch of day)hash=(Math.imul(hash,31)+ch.charCodeAt(0))|0
 return shopSeedIds[(hash>>>0)%shopSeedIds.length]
}
export function crystalSeedPrice(id:CrystalId,now:number):number|null{
 const base=seedPrices[id]
 return base===undefined?null:id===featuredSeed(now)?Math.floor(base*.8):base
}
export function buyCrystalSeed(game:CrystalGame,id:CrystalId,now:number):CrystalGame{
 if(!Object.prototype.hasOwnProperty.call(species,id))return game
 const price=crystalSeedPrice(id,now),life=normalizeLife(game.life)
 if(price===null||life.coins<price)return game
 let suffix=0
 let key=`shop:${now}:${id}:${suffix}`
 while(game.seeds.some(seed=>seed.key===key)||game.current?.seed.key===key){suffix++;key=`shop:${now}:${id}:${suffix}`}
 return {...game,life:{...life,coins:life.coins-price},seeds:[...game.seeds,{key,id,origin:seedOrigins[id],obtainedAt:now,source:'shop'}]}
}
export function buyNutrient(game:CrystalGame,id:Fertilizer):CrystalGame{
 if(!fertilizerIds.includes(id))return game
 const price=nutrientPrices[id],life=normalizeLife(game.life)
 if(life.coins<price)return game
 return {...game,life:{...life,coins:life.coins-price},stock:{...game.stock,[id]:(game.stock[id]??0)+1}}
}
