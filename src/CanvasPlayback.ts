/**
 * v2.9.4 — 풍경과 인물 Canvas가 함께 쓰는 가벼운 프레임 스케줄러.
 * - 화면 밖 / 백그라운드 / 시스템 동작 줄이기 설정에서는 반복 렌더링을 멈춥니다.
 * - 화면에 돌아올 때 즉시 한 장을 그리고, 숨겨진 시간을 한꺼번에 재생하지 않습니다.
 * - 고정된 setInterval 대신 다음 프레임만 예약하여 불필요한 호출을 줄입니다.
 * - fps 콜백은 동작 중 24fps, 대기 중 8fps 등 실시간으로 바꿀 수 있습니다.
 */
export type FramePainter = (deltaSeconds:number,reduced:boolean)=>void

export function startCanvasPlayback(
  canvas: HTMLCanvasElement,
  paint: FramePainter,
  fps: ()=>number,
  wakeEvent?: string
): ()=>void {
  const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)')
  let inView=true
  let disposed=false
  let timeout=0
  let raf=0
  let lastTime=0

  const drawable=()=>!disposed&&!document.hidden&&inView
  const stop=()=>{
    if(timeout){clearTimeout(timeout);timeout=0}
    if(raf){cancelAnimationFrame(raf);raf=0}
  }
  const schedule=()=>{
    if(!drawable()||reducedQuery.matches)return
    const interval=1000/Math.max(1,Math.min(30,fps()))
    // rAF 자체는 다음 디스플레이 프레임에 맞춰 그리되, 그전에는 쉬도록 합니다.
    const delay=Math.max(0,interval-16)
    timeout=window.setTimeout(()=>{
      timeout=0
      raf=requestAnimationFrame((now)=>{
        raf=0
        if(!drawable()||reducedQuery.matches)return
        const delta=lastTime?Math.min(.15,Math.max(0,(now-lastTime)/1000)):0
        lastTime=now
        paint(delta,false)
        schedule()
      })
    },delay)
  }
  const refresh=()=>{
    stop()
    lastTime=0
    if(!drawable())return
    paint(0,reducedQuery.matches)
    schedule()
  }
  // React 속성 변경이나 외부 인터랙션 시 다음 정규 프레임을 기다리지 않고 그림 갱신.
  const wake=()=>refresh()
  const observer=typeof IntersectionObserver!=='undefined'
    ? new IntersectionObserver(entries=>{
        const visible=entries[0]?.isIntersecting??true
        if(inView!==visible){inView=visible;refresh()}
      },{rootMargin:'80px',threshold:0})
    : null
  observer?.observe(canvas)
  document.addEventListener('visibilitychange',refresh)
  reducedQuery.addEventListener('change',refresh)
  if(wakeEvent)window.addEventListener(wakeEvent,wake)
  refresh()
  return ()=>{
    disposed=true
    stop()
    observer?.disconnect()
    document.removeEventListener('visibilitychange',refresh)
    reducedQuery.removeEventListener('change',refresh)
    if(wakeEvent)window.removeEventListener(wakeEvent,wake)
  }
}
