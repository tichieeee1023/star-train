/**
 * 항해 창밖 전용 Canvas. 선택한 목적지 풍경은 도착 전에는 표시하지 않습니다.
 * 항해 중에는 24fps, 열차 대기 중에는 12fps. 숨겨진 화면에서는 0fps.
 */
import {useEffect,useRef} from 'react'
import {W,H} from './PaintKit'
import {paintVoyage} from './VoyageArt'
import {startCanvasPlayback} from './CanvasPlayback'
import type {TravelWindow} from './VoyageArt'
export {stageNames,voyageStages,voyageStage} from './VoyageArt'
export type {Stage,TravelWindow} from './VoyageArt'

export function VoyageSky({journey}: {journey:TravelWindow|null}){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
   const canvas=ref.current,ctx=canvas?.getContext('2d',{alpha:false});if(!canvas||!ctx)return
   let elapsed=0
   const paint=(delta:number)=>{
     elapsed+=delta
     ctx.setTransform(1,0,0,1,0,0)
     paintVoyage(ctx,elapsed,journey)
   }
   const cleanup=startCanvasPlayback(canvas,paint,()=>journey?24:12)
   // 모션 줄이기에서는 루프를 멈춰 두고 항로의 실제 경과 시간만 간헐적으로 반영합니다.
   const refreshStatic=()=>{
     if(document.hidden||!window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
     // 화면 밖 여부는 IntersectionObserver가 제어하므로 여기서는 보이는지 확인합니다.
     const r=canvas.getBoundingClientRect()
     if(r.width===0||r.height===0||r.bottom<0||r.top>window.innerHeight||r.right<0||r.left>window.innerWidth)return
     paint(0)
   }
   const timer=window.setInterval(refreshStatic,15000)
   return ()=>{cleanup();window.clearInterval(timer)}
 },[journey?.start,journey?.end,journey?.hours,journey?.destination])
 return <canvas className="sky-art voyage-sky" ref={ref} width={W} height={H} aria-hidden="true" />
}
