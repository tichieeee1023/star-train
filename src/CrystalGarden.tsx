import {useState} from 'react'
import type {Light} from './Palette'
import {CrystalArt} from './CrystalArt'
import {species,speciesIds,rarityNames,variants,variantNames,fertilizers,fertilizerIds,CARE_WINDOW,growthLabels,growthStage,growthPercent,careReadyIn,isReady,crystalVariant,type CrystalGame,type Fertilizer} from './Crystals'
import type {Scenery} from './routeData'
import {routeInfo} from './routeData'

type Props={game:CrystalGame;now:number;light:Light;onLight:(light:Light)=>void;onPlant:(key:string)=>void;onCare:(kind:'light'|'polish')=>void;onNourish:(id:Fertilizer)=>void;onHarvest:()=>void;onTravel:()=>void}
function countdown(ms:number){if(ms<=0)return '지금 가능';const hrs=Math.floor(ms/3600000),mins=Math.ceil(ms%3600000/60000);return hrs?`${hrs}시간 ${mins}분`:`${mins}분`}
const rarityOrder=['common','special','rare','mystic'] as const

export function CrystalGarden({game,now,light,onLight,onPlant,onCare,onNourish,onHarvest,onTravel}:Props){
 const [selected,setSelected]=useState<{id:typeof speciesIds[number];variant:typeof variants[number]}|null>(null)
 const growing=game.current
 const pct=growing?growthPercent(growing):0
 const ready=growing?isReady(growing):false
 const uniqueFound=speciesIds.filter(id=>!!game.album[id])
 const captured=uniqueFound.reduce((sum,id)=>sum+(game.album[id]?.variants.length??0),0)
 const owned=game.seeds.length
 const maxVariants=speciesIds.length*variants.length
 return <section className="crystal-panel" aria-labelledby="crystal-title">
  <div className="crystal-section-heading"><div><small>별빛을 품고 자라는 작은 결정</small><h2 id="crystal-title">수정 재배실</h2></div><span>◇ {owned}개</span></div>
  <div className="crystal-light-switch" role="group" aria-label="수정 재배병 조명 선택">
   <span>재배병에 비출 빛</span>
   {(['dawn','dusk','night'] as const).map(mode=><button type="button" key={mode} aria-pressed={light===mode} className={light===mode?'selected':''} onClick={()=>onLight(mode)}>{mode==='dawn'?'☀ 새벽빛':mode==='dusk'?'◐ 노을빛':'☾ 한밤빛'}</button>)}
  </div>
  {growing?<div className="crystal-growing">
   <CrystalArt id={growing.seed.id} growing={growing}/>
   <div className="crystal-growing-info">
    <span className={`crystal-rarity ${species[growing.seed.id].rarity}`}>{rarityNames[species[growing.seed.id].rarity]}</span>
    <h3>{species[growing.seed.id].name}</h3>
    <p>성장 단계 · {growthLabels[growthStage(pct)]} {Math.floor(pct)}%</p>
    <progress className="crystal-progress" value={pct} max={100} aria-label="수정 성장률"/>
    <p className="crystal-help">{ready?'수정이 완성됐어요! 색깔을 확인하고 도감에 등록해요.':`하얀 고양이가 4시간마다 조금씩 수정병을 살펴봐요. 내 돌봄 ${growing.playerVisits}회 · 고양이 돌봄 ${growing.catVisits}회`}</p>
    {!ready&&<p className="crystal-help">다음 직접 돌봄: {countdown(careReadyIn(growing,now))}</p>}
    {ready&&<p className="crystal-success">✦ 이번 수정의 빛깔: {variantNames[crystalVariant(growing)]}</p>}
    {ready?<button type="button" className="crystal-primary" onClick={onHarvest}>✦ 완성한 수정 도감에 넣기</button>:<div className="crystal-actions"><button type="button" disabled={careReadyIn(growing,now)>0} onClick={()=>onCare('light')}>✧ 별빛 쬐기</button><button type="button" disabled={careReadyIn(growing,now)>0} onClick={()=>onCare('polish')}>◇ 표면 닦기</button></div>}
   </div>
  </div>:<div className="crystal-empty"><span aria-hidden="true">◇</span><p>수정 씨앗을 하나 심으면 조금씩 자라요.<br/>재배 중에 어떤 빛을 보여주느냐에 따라 완성된 색도 달라집니다.</p>{!owned&&<button className="crystal-primary" onClick={onTravel}>별 사이를 여행해 씨앗 찾기</button>}</div>}
  <details className="crystal-detail" open={!!owned}>
   <summary>✦ 수정 씨앗 주머니 <span>{owned}개</span></summary>
   {owned?<div className="seed-grid">{game.seeds.map(seed=><div className="seed-item" key={seed.key}>
     <CrystalArt id={seed.id} size="small" growing={{seed,plantedAt:seed.obtainedAt,points:0,accountedSlots:0,lastCareSlot:-1,lastCareAt:0,playerVisits:0,catVisits:0,influence:{normal:3,dawn:1,dusk:1,night:1},colorRoll:0,nutritionCount:0}}/>
     <div><strong>{species[seed.id].name}</strong><small>{rarityNames[species[seed.id].rarity]} · {routeInfo[seed.origin as Scenery].label}</small></div>
     <button disabled={!!growing} onClick={()=>onPlant(seed.key)} type="button">재배</button>
   </div>)}</div>:<p className="crystal-help">아직 수정 씨앗이 없어요. 일반 방문에서는 확률로, 8시간 항해나 희귀 장소에서는 반드시 발견해요.</p>}
  </details>
  <details className="crystal-detail">
   <summary>✧ 별빛 영양액 <span>{fertilizerIds.reduce((sum,id)=>sum+game.stock[id],0)}개</span></summary>
   <p className="crystal-help">영양액은 항해 보상이에요. 돌봄을 앞당기고, 사용한 시간대의 빛깔에도 영향을 줘요.</p>
   <div className="nutrient-grid">{fertilizerIds.map(id=><div className="nutrient-item" key={id}><div><strong>{fertilizers[id].name}</strong><small>돌봄 {fertilizers[id].hours}시간 분량</small></div><span>×{game.stock[id]}</span><button type="button" disabled={!growing||ready||game.stock[id]===0} onClick={()=>onNourish(id)}>사용</button></div>)}</div>
  </details>
  <details className="crystal-detail" open={uniqueFound.length>0}>
   <summary>✦ 수정 도감 <span>{uniqueFound.length}/{speciesIds.length}종 · 빛깔 {captured}/{maxVariants}</span></summary>
   <p className="crystal-help">같은 수정을 다시 길러도 서로 다른 빛깔을 수집할 수 있어요.</p>
   {uniqueFound.length?<div className="crystal-album">{uniqueFound.sort((a,b)=>rarityOrder.indexOf(species[a].rarity)-rarityOrder.indexOf(species[b].rarity)).map(id=><div className="crystal-album-item" key={id}>
    <CrystalArt id={id} variant={game.album[id]!.variants[0]}/><strong>{species[id].name}</strong><small>{rarityNames[species[id].rarity]} · {game.album[id]!.count}회 완성</small>
    <div className="crystal-variants">{variants.map(v=><button type="button" key={v} disabled={!game.album[id]!.variants.includes(v)} onClick={()=>setSelected({id,variant:v})} title={game.album[id]!.variants.includes(v)?variantNames[v]:'미발견'}>{game.album[id]!.variants.includes(v)?variantNames[v]:'?'}</button>)}</div>
   </div>)}</div>:<p className="crystal-help">처음 완성한 수정이 이곳에 기록됩니다.</p>}
  </details>
  {selected&&<div className="crystal-modal" role="presentation" onClick={()=>setSelected(null)}><section className="crystal-modal-content" role="dialog" aria-modal="true" aria-label="수정 감상" onClick={(e:{stopPropagation:()=>void})=>e.stopPropagation()}>
    <CrystalArt id={selected.id} variant={selected.variant}/><h2>{species[selected.id].name}</h2><p>{variantNames[selected.variant]} · {species[selected.id].description}</p><button className="crystal-primary" onClick={()=>setSelected(null)}>닫기</button>
  </section></div>}
 </section>
}
