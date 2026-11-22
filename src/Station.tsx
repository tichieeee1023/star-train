import {Sky, type Scenery} from './Sky'

export const stationInfo = {
  nebula: {
    name: '라일락 성운역',
    subtitle: '보랏빛 별들이 머무는 정거장',
    caption: '조용한 플랫폼에 별빛을 닮은 가로등 하나가 켜졌어요.',
    accent: '#ceb8f5'
  },
  city: {
    name: '유리도시 중앙역',
    subtitle: '불빛이 잠들지 않는 도시',
    caption: '아득한 도시의 불빛 아래, 작은 플랫폼이 반짝여요.',
    accent: '#ffe0a8'
  }
} satisfies Record<Scenery, {name:string; subtitle:string; caption:string; accent:string}>

/**
 * 플랫폼은 정적인 SVG 한 장입니다.
 * 항로마다 배경 하늘은 Sky를 재사용하고, 이 플랫폼의 색과 역명만 교체합니다.
 * 가로등 하나 외에 무거운 건축물/캐릭터 이동 연출은 넣지 않습니다.
 */
export function StationPlatform({scenery}: {scenery: Scenery}) {
  const city = scenery === 'city'
  const glow = city ? '#ffda91' : '#c6c0ff'
  const sign = stationInfo[scenery].name
  return <svg className="platform-art" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="platform-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={city?'#6e6a7d':'#5d637e'}/>
        <stop offset=".28" stopColor={city?'#464b67':'#424660'}/>
        <stop offset="1" stopColor="#1b293c"/>
      </linearGradient>
      <linearGradient id="platform-edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#edd3b9" stopOpacity=".8"/>
        <stop offset="1" stopColor="#8f7891" stopOpacity=".64"/>
      </linearGradient>
      <linearGradient id="lamp-pole" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#263647"/><stop offset=".48" stopColor="#7c8193"/><stop offset="1" stopColor="#2a3348"/>
      </linearGradient>
      <radialGradient id="station-halo">
        <stop stopColor={glow} stopOpacity=".57"/>
        <stop offset=".25" stopColor={glow} stopOpacity=".28"/>
        <stop offset="1" stopColor={glow} stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="station-ground-glow">
        <stop stopColor={glow} stopOpacity=".31"/>
        <stop offset="1" stopColor={glow} stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="rail-steel" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#e3c8b6"/><stop offset="1" stopColor="#47566d"/>
      </linearGradient>
    </defs>
    {/* 플랫폼의 수평선: 배경 하늘이 70% 이상 보이도록 낮게 유지 */}
    <path d="M0 448Q240 441 475 450T960 444V600H0Z" fill="url(#platform-ground)"/>
    <path d="M0 461Q280 453 480 460T960 455" fill="none" stroke="#cbb4bc" strokeOpacity=".3" strokeWidth="2"/>
    <ellipse cx="237" cy="505" rx="230" ry="94" fill="url(#station-ground-glow)"/>
    <path d="M0 469H960" fill="none" stroke="url(#platform-edge)" strokeWidth="4"/>
    {/* 절제된 바닥 타일과 철도 가장자리 */}
    <g stroke="#b9b0bd" strokeOpacity=".16" strokeWidth="2" fill="none">
      <path d="M0 509H960M0 558H960"/>
      <path d="M120 466L44 600M327 467L316 600M519 466L563 600M735 466L836 600"/>
    </g>
    <path d="M0 577Q426 559 960 574V600H0Z" fill="#1d2635" opacity=".63"/>
    <path d="M0 577Q426 559 960 574" stroke="url(#rail-steel)" strokeWidth="3" fill="none" opacity=".75"/>
    {/* 유일한 가로등: 분홍/청색 별빛 또는 도시의 따뜻한 빛 */}
    <ellipse cx="232" cy="213" rx="154" ry="165" fill="url(#station-halo)"/>
    <path d="M217 477L219 220" stroke="#131f31" strokeWidth="18" strokeLinecap="round"/>
    <path d="M217 477L219 220" stroke="url(#lamp-pole)" strokeWidth="11" strokeLinecap="round"/>
    <path d="M213 475H222L232 487H205Z" fill="#2b3445" stroke="#b8a1a4" strokeOpacity=".43"/>
    <path d="M215 222Q217 188 251 190H272" stroke="url(#lamp-pole)" strokeWidth="9" strokeLinecap="round" fill="none"/>
    <path d="M255 196L258 188L286 188L289 196L282 224Q274 231 262 224Z" fill="#3b4055" stroke="#e0ced0" strokeOpacity=".63" strokeWidth="2"/>
    <path d="M260 197H284L279 221H265Z" fill={glow} opacity=".83"/>
    <path d="M258 199L286 199" stroke="#fff2dc" strokeOpacity=".6" strokeWidth="1.4"/>
    <ellipse cx="272" cy="229" rx="9" ry="3" fill={glow} opacity=".85"/>
    {/* 같은 가로등 기둥에 걸린 작은 역명 표지판 */}
    <path d="M222 318H278" stroke="#424a5e" strokeWidth="7"/>
    <rect x="236" y="297" width="178" height="49" rx="8" fill="#253145" stroke="#a99ca8" strokeWidth="2"/>
    <rect x="242" y="303" width="166" height="37" rx="5" fill="#3a4157" opacity=".8"/>
    <text x="325" y="318" textAnchor="middle" fontSize="9" letterSpacing="2" fill={glow}>GALAXY RAILWAY</text>
    <text x="325" y="334" textAnchor="middle" fontSize="16" fontWeight="500" fill="#f7eade">{sign}</text>
    <circle cx="247" cy="309" r="1.5" fill={glow}/><circle cx="403" cy="309" r="1.5" fill={glow}/>
    {/* 멀리 희미한 별빛을 반사하는 플랫폼 난간: 아주 낮고 단순하게 */}
    <path d="M492 457H960" stroke="#d2b5b8" strokeWidth="3" strokeOpacity=".39"/>
    <path d="M539 453V466M696 453V465M851 453V465" stroke="#c6b1bf" strokeWidth="3" strokeOpacity=".32"/>
  </svg>
}

/** 정차 시 객실 유리창 너머로 다가오는 역 플랫폼. */
export function StationApproach({scenery, arriving}: {scenery: Scenery; arriving:boolean}) {
  return <div key={scenery + (arriving?'-arriving':'-stopped')}
    className={arriving?'station-approach is-arriving':'station-approach is-stopped'} aria-hidden="true">
    <StationPlatform scenery={scenery}/>
  </div>
}

/** 소녀가 걷는 애니메이션 없이 화면 전환만으로 하차를 표현합니다. */
export function StationView({scenery}: {scenery: Scenery}) {
  return <div className="station-view scene-still" role="img" aria-label={`${stationInfo[scenery].name}의 조용한 플랫폼과 단 하나의 가로등, 그리고 끝없이 펼쳐진 은하 풍경`}>
    <Sky scenery={scenery}/>
    <StationPlatform scenery={scenery}/>
  </div>
}
