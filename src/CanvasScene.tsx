import type {MomentAction} from './PlaceMoment'
import {useEffect,useRef} from 'react'
import type {Light} from './Palette'
import type {Scenery} from './routeData'
import {paintWorld,type Weather} from './CanvasPaint'

interface CanvasSceneProps {
 scenery:Scenery
 light:Light
 weather?:Weather
 moment?:number
 momentAction?:MomentAction|null
 mode?:'cabin'|'vista'
 stopped?:boolean
}
/** A single animated Canvas painting, reused in the carriage and the 16:9 panorama.
 *  Follows the Little Prince Scene.tsx loop: 24 fps cap, visibility pause,
 *  reduced motion, deterministic stars, and a reusable layering renderer. */
export function CanvasScene({scenery,light,weather='clear',moment=0,momentAction=null,mode='vista',stopped=false}:CanvasSceneProps){
 const canvas=useRef<HTMLCanvasElement|null>(null)
 const clock=useRef({time:0,age:99})
 useEffect(()=>{clock.current.time=0},[scenery,mode])
 useEffect(()=>{clock.current.age=moment>0?0:99},[moment,momentAction,scenery])
 useEffect(()=>{
  const surface=canvas.current
  const ctx=surface?.getContext('2d',{alpha:false})
  if(!ctx)return
  let frame=0,last=0
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
  function paint(){
   if(!ctx)return
   ctx.setTransform(1,0,0,1,0,0)
   // Motion stops at the station, but twinkling remains subtle and optional.
   paintWorld(ctx,scenery,light,weather,clock.current.time,moment,mode,momentAction,clock.current.age)
  }
  function tick(now:number){
   if(now-last>=1000/24){
    const elapsed=last>0?Math.min((now-last)/1000,.10):0
    if(!stopped)clock.current.time+=elapsed
    clock.current.age+=elapsed
    last=now;paint()
   }
   frame=requestAnimationFrame(tick)
  }
  function refresh(){
   cancelAnimationFrame(frame)
   last=0
   // Reduced-motion mode shows a still frame of the discovery instead of hiding it.
   if(reduced.matches&&moment>0&&momentAction!==null)clock.current.age=2.8
   paint()
   if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick)
  }
  refresh()
  document.addEventListener('visibilitychange',refresh)
  reduced.addEventListener('change',refresh)
  return ()=>{
   cancelAnimationFrame(frame)
   document.removeEventListener('visibilitychange',refresh)
   reduced.removeEventListener('change',refresh)
  }
 },[scenery,light,weather,moment,momentAction,mode,stopped])
 return <canvas ref={canvas} className={mode==='cabin'?'sky-art':'vista-canvas'} width={960} height={540} aria-hidden="true"/>
}
