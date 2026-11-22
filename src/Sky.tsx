/**
 * 객실의 유리창 뒤에 놓이는 하늘. 1단계에서는 모든 천체를 정지시킵니다.
 * 다음 단계에서만 별 반짝임·성운 이동·혜성·도시 패럴랙스를 추가합니다.
 */
type Star = {x:number,y:number,r:number,opacity:number,cross:boolean}

function createStars(): Star[] {
  // 고정 시드: 렌더링 때마다 별이 다른 위치로 튀지 않게 합니다.
  let seed=12893
  const random=()=>{
    seed=(1664525*seed+1013904223)>>>0
    return seed/4294967296
  }
  return Array.from({length:165},(_,i)=>({
    x:27+random()*904,
    y:19+random()*403,
    r:i%11===0?1.65:i%4===0?1.05:.45+random()*.42,
    opacity:.27+random()*.65,
    cross:i%17===0
  }))
}
const stars=createStars()

export function Sky(){
  return <svg className="sky-art" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="night-sky" x1="0" y1="0" x2="1" y2=".95" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#0b2041"/>
        <stop offset=".25" stopColor="#25416c"/>
        <stop offset=".5" stopColor="#5a568e"/>
        <stop offset=".75" stopColor="#a17da9"/>
        <stop offset="1" stopColor="#e2b8b4"/>
      </linearGradient>
      <radialGradient id="cloud-amethyst"><stop stopColor="#d1acde" stopOpacity=".73"/><stop offset=".45" stopColor="#b38add" stopOpacity=".36"/><stop offset="1" stopColor="#9855bd" stopOpacity="0"/></radialGradient>
      <radialGradient id="cloud-aqua"><stop stopColor="#a6e6e0" stopOpacity=".64"/><stop offset=".52" stopColor="#76bcbf" stopOpacity=".25"/><stop offset="1" stopColor="#63a5be" stopOpacity="0"/></radialGradient>
      <radialGradient id="cloud-peach"><stop stopColor="#ffe0c3" stopOpacity=".63"/><stop offset=".48" stopColor="#f3aaac" stopOpacity=".23"/><stop offset="1" stopColor="#ee9ab9" stopOpacity="0"/></radialGradient>
      <radialGradient id="star-halo"><stop stopColor="#fff5d5" stopOpacity=".9"/><stop offset=".2" stopColor="#f8d9ec" stopOpacity=".4"/><stop offset="1" stopColor="#cbbdf6" stopOpacity="0"/></radialGradient>
      <radialGradient id="planet-sphere" cx=".29" cy=".22" r=".78">
        <stop stopColor="#fcdfed"/>
        <stop offset=".34" stopColor="#cad8e8"/>
        <stop offset=".72" stopColor="#809cc7"/>
        <stop offset="1" stopColor="#485b99"/>
      </radialGradient>
      <linearGradient id="ring-haze" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#fae0e9" stopOpacity=".12"/><stop offset=".45" stopColor="#f6ebd2" stopOpacity=".9"/><stop offset="1" stopColor="#b9cbf2" stopOpacity=".18"/></linearGradient>
      <linearGradient id="comet-glow" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#d2f3ff" stopOpacity="0"/><stop offset=".77" stopColor="#f8dfff" stopOpacity=".6"/><stop offset="1" stopColor="#fff9e6"/></linearGradient>
    </defs>
    <rect width="960" height="600" fill="url(#night-sky)"/>
    {/* 손그림처럼 얇고 여러 겹 겹친 성운. 캐릭터보다 풍경이 주인공입니다. */}
    <ellipse cx="325" cy="128" rx="290" ry="130" fill="url(#cloud-aqua)" transform="rotate(-18 325 128)"/>
    <ellipse cx="536" cy="295" rx="370" ry="164" fill="url(#cloud-amethyst)" transform="rotate(-19 536 295)"/>
    <ellipse cx="330" cy="425" rx="398" ry="134" fill="url(#cloud-peach)" transform="rotate(-12 330 425)"/>
    <ellipse cx="748" cy="381" rx="306" ry="118" fill="url(#cloud-aqua)" opacity=".73" transform="rotate(-25 748 381)"/>
    <path d="M0 346Q129 307 245 343T488 334T759 314T960 355V600H0Z" fill="#efc0c8" opacity=".06"/>
    {/* 먼 은하의 얇은 빛의 띠 */}
    <path d="M-54 331 C209 246 367 310 570 186 S880 68 1020 -2" stroke="#d6b5e7" strokeWidth="36" opacity=".065" fill="none"/>
    <path d="M-54 331 C209 246 367 310 570 186 S880 68 1020 -2" stroke="#fff6df" strokeWidth="2" opacity=".16" fill="none"/>
    {stars.map((star,i)=><g key={i} opacity={star.opacity}>
      <circle cx={star.x} cy={star.y} r={star.r} fill={i%7===0?'#fff0c9':i%5===0?'#d9f1ff':'#f8f1ff'}/>
      {star.cross&&<path d={`M${star.x-5} ${star.y}h10M${star.x} ${star.y-5}v10`} stroke="#fff0ed" strokeWidth=".65"/>}
    </g>)}
    {[[157,171,12],[344,240,10],[618,104,9],[890,318,10]].map(([x,y,r])=><circle key={x} cx={x} cy={y} r={r} fill="url(#star-halo)" opacity=".56"/>)}
    {/* 커다란 고리행성: 한 장의 하늘 풍경으로만 우선 배치 */}
    <g transform="translate(765 208)">
      <ellipse cx="0" cy="0" rx="158" ry="36" fill="none" stroke="url(#ring-haze)" strokeWidth="14" transform="rotate(-27)" opacity=".61"/>
      <circle r="73" fill="url(#planet-sphere)"/>
      <path d="M-56 -48 Q-7 -20 60 -50 M-71 -10 Q0 10 67 -14 M-65 27 Q0 47 56 38" fill="none" stroke="#f7e8f2" strokeOpacity=".16" strokeWidth="12"/>
      <ellipse cx="0" cy="0" rx="158" ry="36" fill="none" stroke="url(#ring-haze)" strokeWidth="10" transform="rotate(-27)" strokeDasharray="214 800" strokeDashoffset="-15" opacity=".85"/>
      <circle r="73" fill="none" stroke="#ffe7f0" strokeOpacity=".24" strokeWidth="2"/>
    </g>
    {/* 정지된 혜성은 2단계에서 실제 이동하도록 변경 예정 */}
    <path d="M355 90Q403 112 459 127" fill="none" stroke="url(#comet-glow)" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="459" cy="127" r="2.9" fill="#fff8e3"/>
  </svg>
}
