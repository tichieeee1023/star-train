/**
 * 2단계 창밖 풍경: 같은 객실에서 '성운 항로'와 '유리도시 항로'를 미리봅니다.
 * 하늘·별·혜성·도시 스카이라인은 객실 일러스트와 독립된 SVG 레이어입니다.
 * 시차 애니메이션은 CSS만 사용하므로 타이머나 React 재렌더링이 없습니다.
 */
export type Scenery = 'nebula' | 'city'

type Star = { x: number; y: number; r: number; opacity: number; cross: boolean }
type Building = { x: number; width: number; top: number; shade: number; windows: { x: number; y: number; bright: number }[]; spire: boolean }

function seededRandom(seed: number) {
  let n = seed
  return () => {
    n = (Math.imul(1664525, n) + 1013904223) >>> 0
    return n / 4294967296
  }
}

function createStars(): Star[] {
  const rand = seededRandom(12893)
  return Array.from({ length: 165 }, (_, i) => ({
    x: 27 + rand() * 904,
    y: 19 + rand() * 403,
    r: i % 11 === 0 ? 1.65 : i % 4 === 0 ? 1.05 : .45 + rand() * .42,
    opacity: .27 + rand() * .65,
    cross: i % 17 === 0
  }))
}
const stars = createStars()

function createBuildings(seed: number, distant: boolean): Building[] {
  const rand = seededRandom(seed)
  const buildings: Building[] = []
  let x = 0
  while (x < 970) {
    const width = (distant ? 31 : 46) + Math.round(rand() * (distant ? 30 : 37))
    const top = (distant ? 246 : 271) + Math.round(rand() * (distant ? 110 : 118))
    const windows: Building['windows'] = []
    const stepX = distant ? 11 : 13
    const stepY = distant ? 13 : 16
    for (let wx = 8; wx < width - 5; wx += stepX) {
      for (let wy = top + 16; wy < 442; wy += stepY) {
        const brightness = rand()
        if (brightness > (distant ? .68 : .52)) windows.push({ x: wx, y: wy, bright: brightness })
      }
    }
    buildings.push({ x, width, top, shade: rand(), windows, spire: rand() > .8 })
    x += width + (distant ? 4 : 7)
  }
  return buildings
}
const farBuildings = createBuildings(1037, true)
const nearBuildings = createBuildings(5094, false)

function StarField() {
  return <g className="star-field">
    {stars.map((star, i) => <g key={i} opacity={star.opacity}>
      <g className={i % 7 === 0 ? 'twinkling-star' : undefined}
        style={i % 7 === 0 ? { animationDuration: `${3.6 + (i % 5) * .85}s`, animationDelay: `-${(i % 9) * .57}s` } : undefined}>
        <circle cx={star.x} cy={star.y} r={star.r} fill={i % 7 === 0 ? '#fff0c9' : i % 5 === 0 ? '#d9f1ff' : '#f8f1ff'} />
        {star.cross && <path d={`M${star.x-5} ${star.y}h10M${star.x} ${star.y-5}v10`} stroke="#fff0ed" strokeWidth=".65" />}
      </g>
    </g>)}
    {[[157,171,12],[344,240,10],[618,104,9],[890,318,10]].map(([x,y,r]) => <circle key={x} cx={x} cy={y} r={r} fill="url(#star-halo)" opacity=".56" />)}
  </g>
}

function Comet() {
  return <g className="travel-comet">
    <path d="M-244 100Q-189 111 -116 129" stroke="url(#comet-glow)" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M-175 115L-116 129" stroke="#f8e5ff" strokeOpacity=".28" strokeWidth="1.2" fill="none" />
    <circle cx="-116" cy="129" r="3.1" fill="#fff7e6" />
    <circle cx="-116" cy="129" r="9" fill="url(#star-halo)" />
  </g>
}

function Planet() {
  return <g transform="translate(765 208)" className="planet-float">
    <ellipse cx="0" cy="0" rx="158" ry="36" fill="none" stroke="url(#ring-haze)" strokeWidth="14" transform="rotate(-27)" opacity=".61" />
    <circle r="73" fill="url(#planet-sphere)" />
    <path d="M-56 -48 Q-7 -20 60 -50 M-71 -10 Q0 10 67 -14 M-65 27 Q0 47 56 38" fill="none" stroke="#f7e8f2" strokeOpacity=".16" strokeWidth="12" />
    <ellipse cx="0" cy="0" rx="158" ry="36" fill="none" stroke="url(#ring-haze)" strokeWidth="10" transform="rotate(-27)" strokeDasharray="214 800" strokeDashoffset="-15" opacity=".85" />
    <circle r="73" fill="none" stroke="#ffe7f0" strokeOpacity=".24" strokeWidth="2" />
  </g>
}

function BuildingStrip({distant}: {distant: boolean}) {
  const buildings = distant ? farBuildings : nearBuildings
  const foot = distant ? 451 : 469
  return <g className={distant ? 'city-far-slide' : 'city-near-slide'}>
    {[0, 960].map(offset => <g key={offset} transform={`translate(${offset} 0)`}>
      <rect x="0" y={foot-7} width="960" height="480" fill={distant ? '#4b5681' : '#243c5c'} />
      {buildings.map((b, i) => <g key={i} transform={`translate(${b.x} 0)`}>
        <rect width={b.width} x="0" y={b.top} height={foot - b.top + 12} rx={distant ? 1 : 2} fill={distant ? (b.shade > .5 ? '#667393' : '#586986') : (b.shade > .5 ? '#304663' : '#3b4b6c')} />
        {!distant && <path d={`M0 ${b.top+4}H${b.width}`} stroke="#c6a9c5" strokeOpacity=".13" strokeWidth="2" />}
        {b.spire && <path d={`M${b.width/2} ${b.top}v-21`} stroke="#b8b2d5" strokeOpacity=".54" strokeWidth="2" />}
        {b.windows.map((w, wi) => <rect key={wi} x={w.x} y={w.y} width={distant ? 3 : 4.5} height={distant ? 5 : 7} rx=".6"
          fill={w.bright > .87 ? '#fff0cf' : w.bright > .68 ? '#d9c8d9' : '#9ac4d5'} opacity={distant ? .44 : .55 + w.bright * .35} />)}
      </g>)}
    </g>)}
  </g>
}

function CityView() {
  return <>
    <rect width="960" height="600" fill="url(#city-sky)" />
    <g className="city-haze-breathe">
      <ellipse cx="510" cy="365" rx="675" ry="170" fill="url(#city-horizon)" />
      <ellipse cx="695" cy="286" rx="300" ry="126" fill="url(#cloud-peach)" opacity=".32" />
    </g>
    <ellipse cx="544" cy="152" rx="90" ry="90" fill="url(#star-halo)" opacity=".23" />
    <circle cx="545" cy="150" r="45" fill="url(#city-moon)" opacity=".84" />
    <StarField />
    <g opacity=".84"><BuildingStrip distant /></g>
    <path d="M0 398Q190 354 445 388Q670 341 960 397V600H0Z" fill="#b0a7bf" opacity=".065" />
    <BuildingStrip distant={false} />
    <rect y="436" width="960" height="34" fill="url(#city-ground-light)" opacity=".65" />
  </>
}

function NebulaView() {
  return <>
    <rect width="960" height="600" fill="url(#night-sky)" />
    <g className="nebula-drift-a">
      <ellipse cx="325" cy="128" rx="290" ry="130" fill="url(#cloud-aqua)" transform="rotate(-18 325 128)" />
      <ellipse cx="536" cy="295" rx="370" ry="164" fill="url(#cloud-amethyst)" transform="rotate(-19 536 295)" />
    </g>
    <g className="nebula-drift-b">
      <ellipse cx="330" cy="425" rx="398" ry="134" fill="url(#cloud-peach)" transform="rotate(-12 330 425)" />
      <ellipse cx="748" cy="381" rx="306" ry="118" fill="url(#cloud-aqua)" opacity=".73" transform="rotate(-25 748 381)" />
      <path d="M0 346Q129 307 245 343T488 334T759 314T960 355V600H0Z" fill="#efc0c8" opacity=".06" />
    </g>
    <g className="nebula-breathe">
      <path d="M-54 331 C209 246 367 310 570 186 S880 68 1020 -2" stroke="#d6b5e7" strokeWidth="36" opacity=".065" fill="none" />
      <path d="M-54 331 C209 246 367 310 570 186 S880 68 1020 -2" stroke="#fff6df" strokeWidth="2" opacity=".16" fill="none" />
    </g>
    <StarField />
    <Planet />
    <Comet />
  </>
}

export function Sky({scenery}: {scenery: Scenery}) {
  return <svg className="sky-art" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="night-sky" x1="0" y1="0" x2="1" y2=".95"><stop offset="0" stopColor="#0b2041"/><stop offset=".25" stopColor="#25416c"/><stop offset=".5" stopColor="#5a568e"/><stop offset=".75" stopColor="#a17da9"/><stop offset="1" stopColor="#e2b8b4"/></linearGradient>
      <linearGradient id="city-sky" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stopColor="#111f45"/><stop offset=".18" stopColor="#314475"/><stop offset=".40" stopColor="#70618e"/><stop offset=".64" stopColor="#b88eab"/><stop offset="1" stopColor="#efb5a9"/></linearGradient>
      <radialGradient id="cloud-amethyst"><stop stopColor="#d1acde" stopOpacity=".73"/><stop offset=".45" stopColor="#b38add" stopOpacity=".36"/><stop offset="1" stopColor="#9855bd" stopOpacity="0"/></radialGradient>
      <radialGradient id="cloud-aqua"><stop stopColor="#a6e6e0" stopOpacity=".64"/><stop offset=".52" stopColor="#76bcbf" stopOpacity=".25"/><stop offset="1" stopColor="#63a5be" stopOpacity="0"/></radialGradient>
      <radialGradient id="cloud-peach"><stop stopColor="#ffe0c3" stopOpacity=".63"/><stop offset=".48" stopColor="#f3aaac" stopOpacity=".23"/><stop offset="1" stopColor="#ee9ab9" stopOpacity="0"/></radialGradient>
      <radialGradient id="star-halo"><stop stopColor="#fff5d5" stopOpacity=".9"/><stop offset=".2" stopColor="#f8d9ec" stopOpacity=".4"/><stop offset="1" stopColor="#cbbdf6" stopOpacity="0"/></radialGradient>
      <radialGradient id="planet-sphere" cx=".29" cy=".22" r=".78"><stop stopColor="#fcdfed"/><stop offset=".34" stopColor="#cad8e8"/><stop offset=".72" stopColor="#809cc7"/><stop offset="1" stopColor="#485b99"/></radialGradient>
      <linearGradient id="ring-haze" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#fae0e9" stopOpacity=".12"/><stop offset=".45" stopColor="#f6ebd2" stopOpacity=".9"/><stop offset="1" stopColor="#b9cbf2" stopOpacity=".18"/></linearGradient>
      <linearGradient id="comet-glow" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox"><stop stopColor="#d2f3ff" stopOpacity="0"/><stop offset=".77" stopColor="#f8dfff" stopOpacity=".65"/><stop offset="1" stopColor="#fff9e6"/></linearGradient>
      <radialGradient id="city-horizon"><stop stopColor="#ffc7b3" stopOpacity=".33"/><stop offset=".48" stopColor="#d6a6da" stopOpacity=".16"/><stop offset="1" stopColor="#bd8ec8" stopOpacity="0"/></radialGradient>
      <radialGradient id="city-moon" cx=".3" cy=".25" r=".76"><stop stopColor="#f8e9da"/><stop offset=".6" stopColor="#e8d8df"/><stop offset="1" stopColor="#aaaed0"/></radialGradient>
      <linearGradient id="city-ground-light" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e3b6bb" stopOpacity=".26"/><stop offset="1" stopColor="#3b4b6a" stopOpacity="0"/></linearGradient>
    </defs>
    {scenery === 'city' ? <CityView /> : <NebulaView />}
  </svg>
}
