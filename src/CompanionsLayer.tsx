import {useEffect,useRef} from 'react'
import {Director,drawCompanions,drawVistaPeople} from './Companions'

/** 선실 SVG 위에 겹치는 소녀·고양이 캔버스. 960x600 좌표계이며 선실 그림과 같은 방식(cover)으로 맞춰집니다. */
function useLayer(w:number,h:number,draw:(c:CanvasRenderingContext2D,d:Director,t:number,calm:boolean)=>void){
  const ref=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const cv=ref.current;if(!cv)return
    const dpr=Math.min(2,window.devicePixelRatio||1)
    cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)
    const c=cv.getContext('2d');if(!c)return
    const calm=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false
    const director=new Director(calm)
    let raf=0,last=0
    const t0=performance.now()
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame)
      if(document.hidden||now-last<1000/30)return
      last=now
      c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h)
      draw(c,director,(now-t0)/1000,calm)
    }
    raf=requestAnimationFrame(frame)
    return ()=>cancelAnimationFrame(raf)
  },[])
  return ref
}
/** 풍경 보기 화면의 서 있는 소녀와 고양이 (960x540). */
export function VistaPeople(){
  const ref=useLayer(960,540,(c,d,t,calm)=>drawVistaPeople(c,d.pose(t),t,calm))
  return <canvas ref={ref} className="vista-people" aria-hidden="true"/>
}
/** 선실 SVG 위에 겹치는 소녀·고양이 캔버스 (960x600, 선실 그림과 같은 cover 맞춤). */
export function Companions(){
  const ref=useLayer(960,600,(c,d,t,calm)=>drawCompanions(c,d.pose(t),t,calm))
  return <canvas ref={ref} className="cabin-companions" aria-hidden="true"/>
}
