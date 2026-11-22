import {useId} from 'react'
import {growthPercent,growthStage,crystalVariant,species,rarityNames,type CrystalGrowing,type CrystalId,type Variant,type Rarity} from './Crystals'

/**
 * 여덟 종류를 서로 다른 SVG 실루엣으로 그립니다. 성장과 색 변이는 기존 저장 모델을 그대로 사용합니다.
 * 반짝임은 SVG/CSS로만 처리하므로 재배병을 열어도 별도 타이머나 React 재렌더가 생기지 않습니다.
 */
const variantTint:Record<Variant,string>={normal:'#d9e8ff',dawn:'#a8e6e9',dusk:'#f2b1c8',night:'#9299f7'}
function mix(a:string,b:string,t:number){
 const val=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))
 const x=val(a),y=val(b)
 return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')
}
function livingColor(g:CrystalGrowing){
 const weights=g.influence,total=Object.values(weights).reduce((a,b)=>a+b,0)
 return (['dawn','dusk','night'] as const).reduce((c,v)=>mix(c,variantTint[v],Math.min(.5,weights[v]/Math.max(1,total))),species[g.seed.id].color)
}

type ShapeProps={id:CrystalId;stage:number;gradient:string;highlight:string;deep:string;facet:string;accent:string}
function CrystalShape({id,stage,gradient,highlight,deep,facet,accent}:ShapeProps){
 const side=stage>=2,full=stage===3
 const common={stroke:highlight,strokeWidth:1.45,strokeLinejoin:'round' as const}
 switch(id){
  case 'stardrop':
   return <>
    {side&&<><path d="M85 185L80 154L92 135L104 154L105 188Z" fill={deep} {...common}/><path d="M139 189L144 156L155 143L165 164L160 190Z" fill={accent} {...common}/></>}
    <path d="M105 187L99 121L119 76L140 120L134 188L120 196Z" fill={gradient} {...common}/>
    <path d="M119 76L119 191L99 121Z" fill={facet} opacity=".44"/><path d="M119 76L140 120L119 191Z" fill={deep} opacity=".29"/>
    {full&&<><path d="M99 121L119 134L140 120" stroke={highlight} opacity=".55" fill="none"/><circle cx="119" cy="92" r="2.2" fill="#fff" opacity=".8"/></>}
   </>
  case 'lilac':
   return <>
    {side&&<><path d="M82 186L66 151L73 129L100 152L111 189Z" fill={deep} {...common}/><path d="M133 190L146 142L168 128L170 151L159 189Z" fill={accent} {...common}/></>}
    <path d="M98 190L80 125L96 107L118 145L119 191Z" fill={gradient} {...common}/>
    <path d="M114 193L107 109L126 79L142 112L135 191Z" fill={gradient} {...common}/>
    <path d="M126 79L126 186L107 109Z" fill={facet} opacity=".38"/>
    <path d="M138 190L151 115L163 104L174 132L156 191Z" fill={gradient} {...common}/>
    {full&&<><path d="M67 151L87 160M151 115L159 150M110 151L133 151" stroke={highlight} strokeOpacity=".65" fill="none"/></>}
   </>
  case 'aqua':
   return <>
    {side&&<path d="M81 190L79 155L98 141L114 157L113 190Z" fill={accent} {...common}/>}
    <path d="M98 189L98 121L120 87L142 121L142 190Z" fill={gradient} {...common}/>
    <path d="M120 87L120 188L98 121Z" fill={facet} opacity=".36"/>
    <path d="M98 131H142M98 149H142M100 167H141" stroke={highlight} strokeOpacity=".57" strokeWidth="2.3"/>
    <path d="M139 190L141 137L164 120L174 141L166 190Z" fill={deep} {...common}/>
    <path d="M143 145Q157 151 171 143M141 163Q156 168 169 163" stroke={highlight} strokeOpacity=".48" fill="none"/>
    {full&&<><path d="M91 178Q114 169 140 180Q151 184 169 175" stroke="#fff" strokeOpacity=".75" fill="none"/><circle cx="159" cy="128" r="2" fill="#fff"/></>}
   </>
  case 'frost':
   return <>
    {side&&<><path d="M115 145L74 110L65 98L88 105L122 132Z" fill={facet} {...common}/><path d="M122 135L155 101L179 93L169 112L129 145Z" fill={accent} {...common}/></>}
    <path d="M111 192L110 137L121 74L131 138L129 192Z" fill={gradient} {...common}/>
    <path d="M121 74L121 187L110 137" fill={facet} opacity=".58"/>
    <path d="M120 150L85 164L76 180L103 169L120 176L139 169L168 182L156 163Z" fill={gradient} {...common}/>
    {full&&<><path d="M121 92V185M95 148L147 148M105 116L134 116" stroke="#fff" strokeOpacity=".67" fill="none" strokeWidth="1.8"/><path d="M121 109L114 101M121 109L128 101M94 148L88 139M94 148L88 158M148 148L154 140M148 148L154 158" stroke={highlight} strokeOpacity=".7"/></>}
   </>
  case 'amber':
   return <>
    {side&&<><path d="M76 186L70 152L90 137L110 155L108 190Z" fill={accent} {...common}/><path d="M144 190L147 150L168 139L182 158L175 190Z" fill={deep} {...common}/></>}
    <path d="M98 115L118 91L151 111L158 153L139 190H102L86 152Z" fill={gradient} {...common}/>
    <path d="M98 115L118 91L119 153L86 152Z" fill={facet} opacity=".48"/>
    <path d="M118 91L151 111L119 153Z" fill={accent} opacity=".7"/>
    <path d="M119 153L158 153L139 190L118 185Z" fill={deep} opacity=".5"/>
    <path d="M98 115L119 153L102 190M119 153L151 111M119 153L139 190" stroke={highlight} strokeOpacity=".62" fill="none"/>
    {full&&<><path d="M108 108L127 103" stroke="#fff" strokeOpacity=".85" strokeWidth="2.4"/><circle cx="140" cy="126" r="3" fill="#fff" opacity=".5"/></>}
   </>
  case 'orbit':
   return <>
    {side&&<><path d="M97 176L78 159L91 143L106 151Z" fill={deep} {...common}/><path d="M141 175L164 151L175 166L162 187Z" fill={accent} {...common}/></>}
    <path d="M120 91L149 118L144 168L120 195L96 168L91 118Z" fill={gradient} {...common}/>
    <path d="M120 91V195M91 118L120 135L149 118M96 168L120 135L144 168" stroke={highlight} strokeOpacity=".65" fill="none"/>
    <path d="M120 91L120 135L91 118Z" fill={facet} opacity=".47"/>
    {side&&<ellipse cx="120" cy="142" rx="73" ry="22" transform="rotate(-22 120 142)" fill="none" stroke={highlight} strokeOpacity=".58" strokeWidth="4.3"/>}
    {full&&<><ellipse cx="120" cy="142" rx="78" ry="25" transform="rotate(-22 120 142)" fill="none" stroke={accent} strokeOpacity=".75" strokeWidth="2" strokeDasharray="150 45 65 320"/><circle cx="185" cy="124" r="3" fill="#fff"/></>}
   </>
  case 'aurora':
   return <>
    {side&&<><path d="M78 190L83 138L100 120L110 154L106 192Z" fill={accent} {...common}/><path d="M147 192L153 132L171 106L174 156L164 192Z" fill={deep} {...common}/></>}
    <path d="M100 194L105 122L128 75L141 121L137 193Z" fill={gradient} {...common}/>
    <path d="M128 75L126 188L105 122Z" fill={facet} opacity=".38"/>
    <path d="M110 138Q121 127 137 141M109 158Q123 145 139 163M107 178Q127 164 138 178" stroke={highlight} strokeWidth="3" strokeLinecap="round" strokeOpacity=".7" fill="none"/>
    {full&&<><path d="M81 157Q95 145 109 165M153 148Q164 134 174 151" stroke="#fff" strokeOpacity=".45" strokeWidth="2.5" fill="none"/><path d="M115 96L129 85" stroke="#fff" strokeWidth="2" strokeOpacity=".85"/></>}
   </>
  case 'meteor':
   return <>
    {side&&<><path d="M69 176L70 144L86 126L98 149L89 186Z" fill={deep} {...common}/><path d="M153 191L168 142L186 155L178 184Z" fill={facet} {...common}/><path d="M76 128L69 104L91 116L104 139Z" fill={accent} {...common}/></>}
    <path d="M120 83L150 107L158 154L120 195L83 154L91 107Z" fill={gradient} {...common}/>
    <path d="M120 83L120 190L91 107Z" fill={facet} opacity=".34"/>
    <path d="M91 107L120 130L150 107M83 154L120 130L158 154M120 130V195" fill="none" stroke={highlight} strokeWidth="1.6" strokeOpacity=".8"/>
    <path d="M120 124L131 141L120 160L109 141Z" fill="#fff6eb" opacity={full?.65:.4}/>
    {full&&<><path d="M153 108L176 91L169 116Z" fill={accent} {...common}/><path d="M93 185L74 196L91 165Z" fill={facet} opacity=".75"/></>}
   </>
 }
}

const sparklePositions:[number,number,number][]=[[90,105,6],[157,89,4.5],[174,150,5],[77,157,3],[117,62,4.8],[153,201,2.7]]
const sparkleCount:Record<Rarity,number>={common:2,special:3,rare:5,mystic:6}
const sparkleInterval:Record<Rarity,number>={common:5.4,special:3.8,rare:2.6,mystic:1.9}
function Sparkles({rarity,stage}: {rarity:Rarity;stage:number}) {
 const count=stage===0?Math.min(1,sparkleCount[rarity]):stage===1?Math.min(2,sparkleCount[rarity]):sparkleCount[rarity]
 return <g className="crystal-sparkle-group" pointerEvents="none">
  {sparklePositions.slice(0,count).map(([x,y,r],i)=><g key={i} className="crystal-sparkle" style={{animationDuration:`${sparkleInterval[rarity]+i*.3}s`,animationDelay:`-${i*.8+.35}s`}}>
    <path d={`M${x} ${y-r}v${r*2}M${x-r} ${y}h${r*2}`} fill="none" stroke={i%2?'#fff5da':'#f3fbff'} strokeWidth={i%3===0?1.5:1.1} strokeLinecap="round"/>
    <circle cx={x} cy={y} r="1.2" fill="#fff" />
   </g>)}
 </g>
}

export function CrystalArt({id,growing,variant='normal',size='regular',bare=false}:{id:CrystalId;growing?:CrystalGrowing|null;variant?:Variant;size?:'small'|'regular';bare?:boolean}){
 const grad=useId().replace(/:/g,'')
 const pct=growing?growthPercent(growing):100
 const stage=growing?growthStage(pct):3
 const rarity=species[id].rarity
 const base=species[id].color
 const chosen=growing?(stage===3?mix(base,variantTint[crystalVariant(growing)],.48):livingColor(growing)):mix(base,variantTint[variant],.53)
 const facet=mix(chosen,'#ffffff',.50)
 const highlight=mix(chosen,'#ffffff',.72)
 const deep=mix(chosen,'#343b74',.44)
 const accent=mix(chosen,'#f8e3cb',.38)
 const scale=[.36,.63,.83,1][stage]
 const gradient=`url(#${grad}crystal)`
 return <svg className={`crystal-svg ${size} crystal-${rarity}`} data-rarity={rarity} data-stage={stage} viewBox="0 0 240 240" role="img" aria-label={`${species[id].name} · ${rarityNames[rarity]} 등급 · ${growing?`${pct.toFixed(0)}퍼센트 성장`:'완성된 결정'}`}>
  <defs>
   <linearGradient id={grad+'crystal'} x1="0" y1="0" x2="1" y2="1"><stop stopColor={facet}/><stop offset=".42" stopColor={chosen}/><stop offset="1" stopColor={deep}/></linearGradient>
   <radialGradient id={grad+'halo'}><stop stopColor={chosen} stopOpacity={rarity==='mystic'?'.75':rarity==='rare'?'.58':'.42'}/><stop offset="1" stopColor={chosen} stopOpacity="0"/></radialGradient>
   <radialGradient id={grad+'core'}><stop stopColor="#fff" stopOpacity=".78"/><stop offset=".28" stopColor={chosen} stopOpacity=".5"/><stop offset="1" stopColor={chosen} stopOpacity="0"/></radialGradient>
   <linearGradient id={grad+'glass'} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#f2f6ff" stopOpacity=".2"/><stop offset=".5" stopColor="#a6d5e9" stopOpacity=".07"/><stop offset="1" stopColor="#fff5ec" stopOpacity=".25"/></linearGradient>
  </defs>
  {!bare&&<><ellipse cx="120" cy="208" rx="78" ry="12" fill="#0e152e" opacity=".3"/>
   <path d="M68 61Q68 43 84 43H156Q172 43 172 61V185Q172 203 151 205H89Q68 203 68 185Z" fill={`url(#${grad}glass)`} stroke="#c8d8e8" strokeOpacity=".65" strokeWidth="2.7"/>
   <path d="M76 180Q119 171 164 181V191Q120 205 76 191Z" fill={chosen} opacity=".17"/>
   <ellipse cx="120" cy="191" rx="43" ry="6" fill={facet} opacity=".12"/>
   <path d="M82 62Q76 72 77 105V172" fill="none" stroke="#f8ffff" strokeOpacity=".4" strokeWidth="3.5" strokeLinecap="round"/>
  </>}
  {/* 결정 아래 은은한 빛무리. 희귀도에 따라 크기와 빛이 달라집니다. */}
  <ellipse className="crystal-aura" cx="120" cy="145" rx={rarity==='mystic'?80:68} ry={rarity==='mystic'?82:70} fill={`url(#${grad}halo)`}/>
  <g transform={`translate(120 188) scale(${scale}) translate(-120 -188)`}>
   <CrystalShape id={id} stage={stage} gradient={gradient} highlight={highlight} deep={deep} facet={facet} accent={accent}/>
   {rarity==='mystic'&&stage>=2&&<ellipse className="crystal-core-pulse" cx="120" cy="143" rx="35" ry="43" fill={`url(#${grad}core)`} pointerEvents="none"/>}
   {rarity==='rare'&&stage>=2&&<path className="crystal-refraction" d="M87 146L108 120M151 100L168 86" stroke="#fff" strokeWidth="2" strokeOpacity=".55" strokeLinecap="round"/>}
  </g>
  {/* 씨앗부터 신비 등급은 작게 빛나며, 완성되면 반짝임의 수가 늘어납니다. */}
  <Sparkles rarity={rarity} stage={stage}/>
  {rarity==='mystic'&&stage===3&&<g className="crystal-orbit-particles" fill={highlight}>
   <circle cx="120" cy="58" r="2.3"/><circle cx="162" cy="116" r="1.8"/><circle cx="104" cy="209" r="1.6"/>
  </g>}
  {!bare&&<><path d="M86 39H154" stroke="#f0e7dd" strokeOpacity=".72" strokeWidth="5" strokeLinecap="round"/>
   <path d="M86 38Q85 34 92 33H149Q155 33 155 38" stroke="#d8bda5" strokeWidth="3" fill="none"/></>}
 </svg>
}
