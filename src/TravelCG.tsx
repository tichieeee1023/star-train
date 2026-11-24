import {useEffect,useRef,useState} from 'react'
import {sceneryOrder,routeInfo,type Scenery} from './routeData'
import type {CrystalGame} from './Crystals'
export type TravelCGId=Scenery|'cabin'
export const cgTitle=(id:TravelCGId)=>id==='cabin'?'은하열차 선실':routeInfo[id].label
export const cgSrc=(id:TravelCGId)=>`/art/travel-cg/${id}.webp`
export const cgUnlocked=(game:CrystalGame,id:TravelCGId)=>id==='cabin'||(game.sceneCards??[]).includes(id)||(game.sceneVisits?.[id]??0)>0||(game.sceneShots??[]).some(s=>s.startsWith(id+':'))
export function TravelCGImage({id}:{id:TravelCGId}){return <img className="travel-cg-image" src={cgSrc(id)} alt={`${cgTitle(id)} 여행의 기억`} draggable={false}/>}
export function TravelCGViewer({id,first=false,onClose}:{id:TravelCGId;first?:boolean;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);const viewport=useRef<HTMLDivElement>(null);const [hide,setHide]=useState(false);const [message,setMessage]=useState('')
 useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();return ()=>{if(document.fullscreenElement===viewport.current)void document.exitFullscreen().catch(()=>{});if(d?.open)d.close()}},[])
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(viewport.current?.requestFullscreen)await viewport.current.requestFullscreen();else setMessage('기기를 가로로 돌려 감상해 주세요.')}catch{setMessage('기기를 가로로 돌려 감상해 주세요.')}}
 return <dialog ref={ref} className="travel-cg-viewer" onCancel={e=>{e.preventDefault();onClose()}} aria-label={`${cgTitle(id)} CG 감상`}>
 <div ref={viewport} className="travel-cg-viewport">
 <button className="travel-cg-stage" onClick={()=>setHide(v=>!v)} aria-label={hide?'메뉴 표시':'메뉴 숨기기'}><TravelCGImage id={id}/></button>
 {!hide&&<div className="travel-cg-controls"><div><small>{first?'✦ 새로운 여행의 기억':'✧ 여행의 기억'}</small><strong>{cgTitle(id)}</strong>{first&&<span>이곳에서 함께 바라본 풍경을 기억하기로 했다.</span>}</div><div className="travel-cg-buttons"><button onClick={()=>void fullscreen()}>⛶ 전체 화면</button><a href={cgSrc(id)} download={`${id}.webp`}>이미지 저장</a><button onClick={onClose}>{first?'추억에 담기':'닫기'}</button></div>{message&&<small role="status">{message}</small>}</div>}
 {hide&&<button className="travel-cg-reveal" onClick={()=>setHide(false)} aria-label="메뉴 표시">⋯</button>}
 </div>
 </dialog>
}
export function TravelCGGallery({game}:{game:CrystalGame}){const [selected,setSelected]=useState<TravelCGId|null>(null);const count=sceneryOrder.filter(id=>cgUnlocked(game,id)).length;const ids:TravelCGId[]=[...sceneryOrder,'cabin'];return <><div className="album-count">여행의 기억 {count} / {sceneryOrder.length} · 선실 보너스 1장</div><div className="album-grid">{ids.map(id=>cgUnlocked(game,id)?<button className="album-photo" key={id} onClick={()=>setSelected(id)}><img className="travel-cg-thumb" loading="lazy" src={cgSrc(id)} alt=""/><strong>{cgTitle(id)}</strong><small>✦ 여행의 기억</small></button>:<div className="album-photo locked" key={id}><div className="locked-art">✧</div><strong>아직 만나지 못한 행성</strong><small>첫 방문 후 해금</small></div>)}</div>{selected&&<TravelCGViewer id={selected} onClose={()=>setSelected(null)}/>}</>}
