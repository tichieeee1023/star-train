import {useEffect,useRef} from 'react'
import {Director,drawCompanions,drawVistaPeople,companionWakeEvent} from './Companions'
import {startCanvasPlayback} from './CanvasPlayback'
import type {Scenery} from './routeData'
import type {Light} from './Palette'
import type {Weather} from './CanvasPaint'

/**
 * 소녀·고양이·카나리아는 별도의 투명 Canvas. 정지 시 8fps, 몸짓·간식 연출 중에는 24fps.
 * 실제 표시 크기를 기준으로 캔버스 해상도를 맞춰 작은 모바일 화면에서 메모리를 절약합니다.
 */
function useLayer(w:number,h:number,draw:(c:CanvasRenderingContext2D,d:Director,t:number,calm:boolean)=>boolean,sceneKey:string){
  const ref=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const cv=ref.current;if(!cv)return
    const c=cv.getContext('2d');if(!c)return
    let scale=1
    let sceneTime=0
    let animating=false
    let wasReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let director=new Director(wasReduced)

    const paint=(delta:number,reduced:boolean)=>{
      if(wasReduced!==reduced){wasReduced=reduced;director=new Director(reduced)}
      if(!reduced)sceneTime+=delta
      c.setTransform(scale,0,0,scale,0,0)
      c.clearRect(0,0,w,h)
      animating=draw(c,director,sceneTime,reduced)
    }
    const resize=()=>{
      const width=cv.getBoundingClientRect().width||w
      // 원본 960px 좌표계를 보존하며 실제 화면을 넘는 해상도 할당을 피합니다.
      const nextScale=Math.min(1.6,Math.max(.7,(width*(window.devicePixelRatio||1))/w))
      const pw=Math.max(1,Math.round(w*nextScale)),ph=Math.max(1,Math.round(h*nextScale))
      if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph;scale=nextScale;paint(0,wasReduced)}
    }
    resize()
    const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null
    ro?.observe(cv)
    window.addEventListener('resize',resize)
    const cleanup=startCanvasPlayback(cv,paint,()=>animating?24:8,sceneKey==='cabin'?companionWakeEvent:undefined)
    return ()=>{cleanup();ro?.disconnect();window.removeEventListener('resize',resize)}
  },[w,h,sceneKey])
  return ref
}
/** 서 있는 소녀·고양이와 공중의 카나리아 (960×540). */
export function VistaPeople({scenery,light,weather}: {scenery:Scenery;light:Light;weather:Weather}){
  const ref=useLayer(960,540,(c,d,t,calm)=>{const p=d.pose(t);drawVistaPeople(c,p,t,calm,scenery,light,weather);return p.kind!=='idle'},`${scenery}:${light}:${weather}`)
  return <canvas ref={ref} className="vista-people" aria-hidden="true"/>
}
/** 객실에 앉아 있는 소녀·고양이와 공중의 카나리아 (960×600). */
export function Companions(){
  const ref=useLayer(960,600,(c,d,t,calm)=>{const p=d.pose(t);drawCompanions(c,p,t,calm);return p.kind!=='idle'},'cabin')
  return <canvas ref={ref} className="cabin-companions" aria-hidden="true"/>
}
