import type {CrystalGame} from './Crystals'
import {snacks,snackIds,snackPrice,conductorReady,dailyKey,type SnackId,type MemoryId,memoryNames} from './TrainLife'

export function TrainShop({game,now,onDaily,onBuy,onEat,onReplay,onConductor}:{game:CrystalGame;now:number;onDaily:()=>void;onBuy:(id:SnackId,from:'shop'|'conductor')=>void;onEat:(id:SnackId)=>void;onReplay:(id:MemoryId)=>void;onConductor:()=>void}){
 const life=game.life!,journeyId=game.journey?.id
 const visitor=conductorReady(life,journeyId,now)?life.conductor:null
 return <section className="train-shop" aria-label="열차 별빛 상점">
  <div className="shop-heading"><div><small>GALACTIC SNACK CAR</small><h1>별빛 간식 상점</h1></div><strong>✧ {life.coins} 코인</strong></div>
  <p className="shop-help">모은 코인으로 간식을 사고, 소녀와 우주고양이에게 나눠 주세요. 특별한 간식은 둘만의 추억을 남깁니다.</p>
  <div className="daily-card"><div><b>✦ 오늘의 승차 기념 코인</b><small>하루 한 번, 5코인</small></div><button type="button" disabled={life.daily===dailyKey(now)} onClick={onDaily}>{life.daily===dailyKey(now)?'오늘 받았어요':'5코인 받기'}</button></div>
  {visitor&&<div className="conductor-cart"><div className="conductor-head"><span aria-hidden="true">🎩</span><div><b>차장님의 간식 카트</b><small>이번 항해의 손님 · 기본 20% 할인 · 추천 간식 40% 할인 · 품목당 3개</small></div></div><button type="button" className="conductor-talk" onClick={onConductor}>✧ 차장님과 이야기</button><div className="shop-grid">{visitor.offers.map(id=><SnackItem key={id} id={id} coins={life.coins} stock={life.stock[id]??0} price={snackPrice(id,'conductor',visitor.special)} onBuy={()=>onBuy(id,'conductor')} onEat={()=>onEat(id)} disabled={(visitor.purchases[id]??0)>=3} label={visitor.special===id?"★ 차장 추천 · 40% 할인":"카트 20% 할인"}/>)}</div></div>}
  <details className="shop-fold" open><summary>상시 상점 <span>언제든 구매 가능 · 6종</span></summary><div className="shop-grid">{snackIds.filter(id=>!snacks[id].exclusive).map(id=><SnackItem key={id} id={id} coins={life.coins} stock={life.stock[id]??0} price={snackPrice(id,'shop')} onBuy={()=>onBuy(id,'shop')} onEat={()=>onEat(id)}/>)}</div></details>
  <details className="shop-fold"><summary>차장 카트의 한정 간식 <span>2종</span></summary><p className="shop-help">달빛 생선 타르트와 은하 도시락은 차장 방문 때만 구할 수 있어요. 1·3·8시간 항해를 하면 방문 기회가 생깁니다.</p><div className="shop-grid">{snackIds.filter(id=>snacks[id].exclusive).map(id=><div key={id} className="shop-item locked"><span className="shop-icon">{snacks[id].symbol}</span><strong>{snacks[id].name}</strong><small>{snacks[id].description}</small><em>{(life.stock[id]??0)>0?`보유 ${life.stock[id]}개`:'카트에서 만날 수 있어요'}</em>{(life.stock[id]??0)>0&&<button onClick={()=>onEat(id)}>함께 먹기</button>}</div>)}</div></details>
  <div className="shop-memories"><h2>간식으로 남긴 추억 <small>{life.memories.length}/3</small></h2><div className="memory-list">{(['cocoa-night','moon-picnic','star-banquet'] as MemoryId[]).map(id=><button key={id} type="button" disabled={!life.memories.includes(id)} onClick={()=>onReplay(id)}><span>{life.memories.includes(id)?'✦':'◇'}</span>{life.memories.includes(id)?memoryNames[id]:'아직 만나지 못한 장면'}<small>{life.memories.includes(id)?'다시 보기':'잠김'}</small></button>)}</div></div>
  <div className="earn-guide"><strong>코인은 어떻게 얻나요?</strong><p>항해 완료 5~29코인 · 첫 행성 7코인 · 새로운 하늘 3코인 · 희귀 항해 8코인 추가 · 작은 발견 3코인 · 수정 완성 4~10코인 · 차장 첫 인사 2코인 · 항해 특별 이벤트 1~3코인 · 매일 상점 방문 5코인</p></div>
 </section>
}
function SnackItem({id,coins,stock,price,onBuy,onEat,disabled=false,label}:{id:SnackId;coins:number;stock:number;price:number;onBuy:()=>void;onEat:()=>void;disabled?:boolean;label?:string}){
 const snack=snacks[id]
 return <article className="shop-item"><span className="shop-icon">{snack.symbol}</span><strong>{snack.name}</strong><small>{snack.description}</small>{snack.memory&&<span className="memory-flag">✦ 특별한 장면</span>}<div className="shop-item-foot"><span>✧ {price} {label&&<small>{label}</small>}</span><button type="button" disabled={coins<price||disabled} onClick={onBuy}>{disabled?'품절':'구매'}</button></div><div className="shop-owned"><small>보유 {stock}개</small><button type="button" disabled={stock<=0} onClick={onEat}>함께 먹기</button></div></article>
}
