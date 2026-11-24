import {useState} from 'react'
import {fertilizers,fertilizerIds,species,speciesIds,rarityNames,type CrystalGame,type CrystalId,type Fertilizer} from './Crystals'
import {seedPrices,nutrientPrices,crystalSeedPrice,featuredSeed,shopSeedIds} from './CrystalShop'
import {snacks,snackIds,snackPrice,conductorReady,dailyKey,dailyDealId,snackStoryCount,type SnackId,type MemoryId,memoryNames,memorySnack} from './TrainLife'

export function TrainShop({game,now,onDaily,onBuy,onEat,onReplay,onConductor,onSeedBuy,onNutrientBuy,onGarden,initialSection}:{game:CrystalGame;now:number;onDaily:()=>void;onBuy:(id:SnackId,from:'shop'|'conductor')=>void;onEat:(id:SnackId)=>void;onReplay:(id:MemoryId)=>void;onConductor:()=>void;onSeedBuy:(id:CrystalId)=>void;onNutrientBuy:(id:Fertilizer)=>void;onGarden:()=>void;initialSection?:'seed'|'nutrient'|'snack'}){
 const [section,setSection]=useState<'seed'|'nutrient'|'snack'>(initialSection??'seed')
 const life=game.life!,journeyId=game.journey?.id
 const visitor=conductorReady(life,journeyId,now)?life.conductor:null
 return <section className="train-shop" aria-label="열차 별빛 상점">
  <div className="shop-heading"><div><small>GALACTIC TRAIN MARKET</small><h1>별빛 열차 상점</h1></div><strong>✧ {life.coins} 코인</strong></div>
  <p className="shop-help">항해로 모은 코인으로 수정을 돌보거나 세 친구와 간식을 나눠요. 무엇부터 둘러볼까요?</p>
  <div className="daily-card"><div><b>✦ 오늘의 승차 기념 코인</b><small>하루 한 번, 5코인</small></div><button type="button" disabled={life.daily===dailyKey(now)} onClick={onDaily}>{life.daily===dailyKey(now)?'오늘 받았어요':'5코인 받기'}</button></div>
  <div className="shop-category-tabs" role="group" aria-label="상점 분류">
   <button type="button" className={section==='seed'?'selected':''} aria-pressed={section==='seed'} onClick={()=>setSection('seed')}><span aria-hidden="true">◇</span> 수정 씨앗 <small>{game.seeds.length}개</small></button>
   <button type="button" className={section==='nutrient'?'selected':''} aria-pressed={section==='nutrient'} onClick={()=>setSection('nutrient')}><span aria-hidden="true">✧</span> 영양액 <small>{fertilizerIds.reduce((sum,id)=>sum+(game.stock[id]??0),0)}개</small></button>
   <button type="button" className={section==='snack'?'selected':''} aria-pressed={section==='snack'} onClick={()=>setSection('snack')}><span aria-hidden="true">☕</span> 간식 · 추억 <small>{Object.values(life.stock).reduce((a,b)=>a+(b??0),0)}개</small></button>
  </div>
  {section!=='snack'?<CrystalSupplies category={section} game={game} now={now} onSeedBuy={onSeedBuy} onNutrientBuy={onNutrientBuy} onGarden={onGarden}/> : <>
  <p className="shop-help">간식은 소녀와 고양이, 카나리아 아가씨가 함께 나눠요. 한정 간식에서는 특별한 추억이 열립니다.</p>
  {visitor&&<div className="conductor-cart"><div className="conductor-head"><span aria-hidden="true">🎩</span><div><b>차장님의 간식 카트</b><small>이번 항해의 손님 · 기본 20% 할인 · 추천 간식 40% 할인 · 품목당 3개</small></div></div><button type="button" className="conductor-talk" onClick={onConductor}>✧ 차장님과 이야기</button><div className="shop-grid">{visitor.offers.map(id=><SnackItem key={id} id={id} coins={life.coins} stock={life.stock[id]??0} used={life.used[id]??0} price={snackPrice(id,'conductor',visitor.special)} onBuy={()=>onBuy(id,'conductor')} onEat={()=>onEat(id)} disabled={(visitor.purchases[id]??0)>=3} label={visitor.special===id?"★ 차장 추천 · 40% 할인":"카트 20% 할인"}/>)}</div></div>}
  <details className="shop-fold" open><summary>상시 상점 <span>언제든 구매 가능 · 9종</span></summary><p className="shop-help">✧ 오늘의 추천: <b>{snacks[dailyDealId(now)].name}</b> · 25% 할인. 매일 추천 상품이 바뀝니다.</p><div className="shop-grid">{snackIds.filter(id=>!snacks[id].exclusive).sort((a,b)=>Number(b===dailyDealId(now))-Number(a===dailyDealId(now))).map(id=><SnackItem key={id} id={id} coins={life.coins} stock={life.stock[id]??0} used={life.used[id]??0} price={snackPrice(id,'shop',undefined,now)} onBuy={()=>onBuy(id,'shop')} onEat={()=>onEat(id)} label={id===dailyDealId(now)?'✦ 오늘만 25% 할인':undefined}/>)}</div></details>
  <details className="shop-fold"><summary>차장 카트의 한정 간식 <span>5종 · 방문마다 달라져요</span></summary><p className="shop-help">차장은 매 방문마다 한정 간식 2종(8시간 항해는 3종)을 가져와요. 다음 방문에 다른 간식을 만날 수도 있습니다.</p><div className="shop-grid">{snackIds.filter(id=>snacks[id].exclusive).map(id=><div key={id} className="shop-item locked"><span className="shop-icon">{snacks[id].symbol}</span><strong>{snacks[id].name}</strong><small>{snacks[id].description}</small><em>{`대화 ${Math.min(snackStoryCount(id),life.used[id]??0)}/${snackStoryCount(id)}편 발견`}</em><em>{(life.stock[id]??0)>0?`보유 ${life.stock[id]}개`:'카트에서 만날 수 있어요'}</em>{(life.stock[id]??0)>0&&<button onClick={()=>onEat(id)}>함께 먹기</button>}</div>)}</div></details>
  <div className="shop-memories"><h2>간식으로 남긴 추억 <small>{life.memories.length}/{Object.keys(memoryNames).length}</small></h2><div className="memory-list">{(Object.keys(memoryNames) as MemoryId[]).map(id=><button key={id} type="button" disabled={!life.memories.includes(id)} onClick={()=>onReplay(id)}><span>{life.memories.includes(id)?'✦':'◇'}</span>{life.memories.includes(id)?memoryNames[id]:'아직 만나지 못한 장면'}<small>{life.memories.includes(id)?'다시 보기':'잠김'}</small></button>)}</div></div>
  </>}
  <div className="earn-guide"><strong>코인은 어떻게 얻나요?</strong><p>항해 완료 5~29코인 · 첫 행성 7코인 · 새로운 하늘 3코인 · 희귀 항해 8코인 추가 · 작은 발견 3코인 · 수정 완성 4~10코인 · 차장 첫 인사 2코인 · 항해 특별 이벤트 1~3코인 · 매일 상점 방문 5코인</p></div>
 </section>
}
function SnackItem({id,coins,stock,used,price,onBuy,onEat,disabled=false,label}:{id:SnackId;coins:number;stock:number;used:number;price:number;onBuy:()=>void;onEat:()=>void;disabled?:boolean;label?:string}){
 const snack=snacks[id]
 return <article className="shop-item"><span className="shop-icon">{snack.symbol}</span><strong>{snack.name}</strong><small>{snack.description}</small>{snack.memory&&<span className="memory-flag">✦ 특별한 장면</span>}<span className="snack-story-count">대화 {Math.min(snackStoryCount(id),used)}/{snackStoryCount(id)}편 발견</span><div className="shop-item-foot"><span>✧ {price} {label&&<small>{label}</small>}</span><button type="button" disabled={coins<price||disabled} onClick={onBuy}>{disabled?'품절':'구매'}</button></div><div className="shop-owned"><small>보유 {stock}개</small><button type="button" disabled={stock<=0} onClick={onEat}>함께 먹기</button></div></article>
}

function CrystalSupplies({game,now,onSeedBuy,onNutrientBuy,onGarden,category}:{game:CrystalGame;now:number;onSeedBuy:(id:CrystalId)=>void;onNutrientBuy:(id:Fertilizer)=>void;onGarden:()=>void;category:'seed'|'nutrient'}){
 const coins=game.life?.coins??0,discount=featuredSeed(now)
 return <section className="supplies-section" aria-label="수정 씨앗과 영양액 상점">
  <div className="supplies-intro"><div><small>✧ CRYSTAL GARDEN</small><h2>{category==='seed'?'수정을 키우는 작은 준비':'수정에 별빛을 더하는 방법'}</h2><p>{category==='seed'?'여행에서 발견한 씨앗도 특별하지만, 기본 씨앗은 이곳에서 언제든 구할 수 있어요.':'재배병에 영양액을 더하면 수정이 조금 빨리 성장합니다.'}</p></div><button type="button" onClick={onGarden}>재배실 가기 ›</button></div>
  {category==='seed'&&<details className="shop-fold supplies-fold" open><summary>◇ 수정 씨앗 <span>기본 6종 · 오늘의 할인 1종</span></summary>
   <p className="shop-help">오늘의 추천 씨앗은 <b>{species[discount].name}</b>이에요. 20% 할인 중! 신비 등급 2종은 항해에서만 찾을 수 있습니다.</p>
   <div className="shop-grid supplies-grid">{shopSeedIds.map(id=>{
    const price=crystalSeedPrice(id,now)!,owned=game.seeds.filter(s=>s.id===id).length
    return <article key={id} className="shop-item supply-card"><span className="supply-gem" style={{color:species[id].color}} aria-hidden="true">◇</span>
     <strong>{species[id].name}</strong><small>{species[id].description}</small><span className="supply-rarity">{rarityNames[species[id].rarity]}{id===discount?' · 오늘의 20% 할인':''}</span>
     <div className="shop-owned"><small>주머니에 {owned}개</small><strong>✧ {price}</strong></div>
     <button type="button" className="supply-buy" disabled={coins<price} onClick={()=>onSeedBuy(id)}>{coins<price?'코인 부족':'씨앗 구매'}</button>
    </article>
   })}</div>
   <p className="shop-help supplies-rare-note">✦ {speciesIds.filter(id=>seedPrices[id]===undefined).map(id=>species[id].name).join(' · ')}은 여행에서만 만날 수 있어요.</p>
  </details>}
  {category==='nutrient'&&<details className="shop-fold supplies-fold" open><summary>✧ 별빛 영양액 <span>성장 보조 · 4종</span></summary>
   <p className="shop-help">재배 중인 수정에 사용하면 성장 시간이 줄어들어요. 항해 보상으로 얻은 영양액도 그대로 사용할 수 있습니다.</p>
   <div className="shop-grid supplies-grid">{fertilizerIds.map((id,i)=>{
    const price=nutrientPrices[id]
    return <article key={id} className="shop-item supply-card"><span className="supply-gem supply-elixir" aria-hidden="true">{['✧','✦','✺','❖'][i]}</span>
     <strong>{fertilizers[id].name}</strong><small>성장 도움 · {fertilizers[id].hours}시간 분량</small><span className="supply-rarity">재배실에서 사용</span>
     <div className="shop-owned"><small>보유 {game.stock[id]??0}개</small><strong>✧ {price}</strong></div>
     <button type="button" className="supply-buy" disabled={coins<price} onClick={()=>onNutrientBuy(id)}>{coins<price?'코인 부족':'영양액 구매'}</button>
    </article>
   })}</div>
  </details>}
  <div className="supplies-tip">♪ <b>카나리아 아가씨</b> “아름다운 수정은 정성으로 자라는 법이지. 가끔은 좋은 영양액도 도움이 된단다.”</div>
 </section>
}
