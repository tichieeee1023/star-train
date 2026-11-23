/**
 * 항해 창밖 전용 Canvas. 《별빛 항해일지》 Cabin.tsx 의 구간 순서와
 * '항해 중에는 우주, 도착 후에는 목적지' 전환 원칙을 계승합니다.
 * 목적지의 지형/기후는 이 컴포넌트에 절대 그리지 않습니다.
 */
import {useEffect,useRef} from 'react'
import {W,H} from './PaintKit'
import {paintVoyage} from './VoyageArt'
import type {TravelWindow} from './VoyageArt'
export {stageNames,voyageStages,voyageStage} from './VoyageArt'
export type {Stage,TravelWindow} from './VoyageArt'

export function VoyageSky({journey}: {journey:TravelWindow|null}){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas?.getContext('2d',{alpha:false});if(!ctx)return
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,last=0,elapsed=0
  const paint=()=>{ctx.setTransform(1,0,0,1,0,0);paintVoyage(ctx,elapsed,journey)}
  const tick=(time:number)=>{if(time-last>=1000/24){elapsed+=last?Math.min(.1,(time-last)/1000):0;last=time;paint()}frame=requestAnimationFrame(tick)}
  function refresh(){cancelAnimationFrame(frame);last=0;paint();if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick)}
  refresh();document.addEventListener('visibilitychange',refresh);reduced.addEventListener('change',refresh)
  // 동작 줄이기 설정에서도 새 이벤트가 시작되면 정지 화면을 갱신합니다.
  const staticTimer=window.setInterval(()=>{if(reduced.matches&&!document.hidden)paint()},15000)
  return ()=>{cancelAnimationFrame(frame);window.clearInterval(staticTimer);document.removeEventListener('visibilitychange',refresh);reduced.removeEventListener('change',refresh)}
 },[journey?.start,journey?.end,journey?.hours,journey?.destination])
 return <canvas className="sky-art voyage-sky" ref={ref} width={W} height={H} aria-hidden="true" />
}
