import type {MomentAction} from './PlaceMoment'
import {useEffect,useRef} from 'react'
import type {Light} from './Palette'
import type {Scenery} from './routeData'
import {paintWorld,type Weather} from './CanvasPaint'
import {startCanvasPlayback} from './CanvasPlayback'

interface CanvasSceneProps {
 scenery:Scenery
 light:Light
 weather?:Weather
 moment?:number
 momentAction?:MomentAction|null
 mode?:'cabin'|'vista'
 stopped?:boolean
}
/** 정지 풍경은 12fps, 감상 풍경은 18fps. 정적인 지형 레이어는 CanvasPaint에서 캐시합니다. */
export function CanvasScene({scenery,light,weather='clear',moment=0,momentAction=null,mode='vista',stopped=false}:CanvasSceneProps){
 const canvas=useRef<HTMLCanvasElement|null>(null)
 const clock=useRef({time:0,age:99})
 useEffect(()=>{clock.current.time=0},[scenery,mode])
 useEffect(()=>{clock.current.age=moment>0?0:99},[moment,momentAction,scenery])
 useEffect(()=>{
   const surface=canvas.current
   const ctx=surface?.getContext('2d',{alpha:false})
   if(!surface||!ctx)return
   return startCanvasPlayback(surface,(delta,reduced)=>{
     if(!stopped&&!reduced)clock.current.time+=delta
     if(!reduced)clock.current.age+=delta
     if(reduced&&moment>0&&momentAction!==null)clock.current.age=2.8
     ctx.setTransform(1,0,0,1,0,0)
     paintWorld(ctx,scenery,light,weather,clock.current.time,moment,mode,momentAction,clock.current.age)
   },()=>stopped?12:18)
 },[scenery,light,weather,moment,momentAction,mode,stopped])
 return <canvas ref={canvas} className={mode==='cabin'?'sky-art':'vista-canvas'} width={960} height={540} aria-hidden="true"/>
}
