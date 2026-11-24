import {useId} from 'react'
import {growthPercent,growthStage,crystalVariant,species,rarityNames,type CrystalGrowing,type CrystalId,type Variant,type Rarity} from './Crystals'

/**
 * 수정 12종을 서로 다른 입체 실루엣으로 그립니다. 성장과 색 변이는 기존 저장 모델을 그대로 사용합니다.
 *
 * v3 그림 방식: 육각 기둥(Prism)을 기본 부품으로 삼아 면마다 빛을 다르게 받게 하고(왼쪽 위 광원),
 * 안쪽 빛·유리 같은 모서리·반사 줄무늬를 겹칩니다. 보석형(궤도·유성 심장석)·구슬형(달무리)·꽃잎형·깃털형은 별도 도형입니다.
 * 반짝임·떠오름·불씨는 SVG/CSS로만 처리하므로 별도 타이머나 React 재렌더가 생기지 않습니다.
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

/** 파스텔 원색을 보석답게 채도·깊이를 올린다. 색상(hue)은 그대로 둔다. */
function vivid(hex:string,sat=1.45,maxL=.66){
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn
 let h=0,s=0
 if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}
 s=Math.min(1,s*sat);const L=Math.min(l,maxL)
 const c=(1-Math.abs(2*L-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=L-c/2
 const [rr,gg,bb]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x]
 return '#'+[rr,gg,bb].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('')
}
type Pal={base:string;l1:string;l2:string;l3:string;d1:string;d2:string;rim:string}
const lite=(c:string,t:number)=>mix(c,'#ffffff',t)
const dark=(c:string,t:number)=>mix(c,'#1b2150',t)
const palette=(c:string):Pal=>({base:c,l1:lite(c,.58),l2:lite(c,.3),l3:lite(c,.1),d1:dark(c,.24),d2:dark(c,.46),rim:lite(c,.82)})
const path=(pts:readonly (readonly [number,number])[])=>'M'+pts.map(p=>`${+p[0].toFixed(1)} ${+p[1].toFixed(1)}`).join('L')+'Z'

type Ids={sheen:string;glow:string}
/** 육각 기둥 한 개. 기준점(0,0)이 바닥 중앙이며 위로 자랍니다. */
function Prism({x,y,w,h,t,lean=0,rot=0,pal,ids,a=.97,glowStrength=1,streak=true}:{x:number;y:number;w:number;h:number;t:number;lean?:number;rot?:number;pal:Pal;ids:Ids;a?:number;glowStrength?:number;streak?:boolean}){
 const x0=-w/2,x1=-w/4,x2=w/4,x3=w/2,tw=.88,s=lean*.55
 const tx=[x0,x1,x2,x3].map(v=>v*tw+s),ax=lean,ay=-h-t
 const sil=path([[x0,0],[x1,4],[x2,4],[x3,0],[tx[3],-h],[ax,ay],[tx[0],-h]])
 return <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={a}>
  <path d={path([[x0,0],[x1,4],[tx[1],-h],[tx[0],-h]])} fill={pal.l2}/>
  <path d={path([[x1,4],[x2,4],[tx[2],-h],[tx[1],-h]])} fill={pal.l3}/>
  <path d={path([[x2,4],[x3,0],[tx[3],-h],[tx[2],-h]])} fill={pal.d1}/>
  <path d={path([[tx[0],-h],[tx[1],-h],[ax,ay]])} fill={pal.l1}/>
  <path d={path([[tx[1],-h],[tx[2],-h],[ax,ay]])} fill={lite(pal.base,.3)}/>
  <path d={path([[tx[2],-h],[tx[3],-h],[ax,ay]])} fill={pal.base}/>
  <path d={sil} fill={`url(#${ids.sheen})`}/>
  <path d={sil} fill={`url(#${ids.glow})`} opacity={.55*glowStrength} style={{mixBlendMode:'screen'}}/>
  <path d={`M${x1} 4L${tx[1]} ${-h}M${x2} 4L${tx[2]} ${-h}M${tx[1]} ${-h}L${ax} ${ay}M${tx[2]} ${-h}L${ax} ${ay}`} stroke={pal.rim} strokeOpacity=".5" strokeWidth=".9" fill="none"/>
  <path d={`M${tx[0]} ${-h}L${tx[1]} ${-h}L${tx[2]} ${-h}L${tx[3]} ${-h}`} stroke={pal.rim} strokeOpacity=".32" strokeWidth=".8" fill="none"/>
  {streak&&<path d={path([[x0+w*.07,-h*.1],[x0+w*.15,-h*.05],[tx[0]+w*.17,-h*.88],[tx[0]+w*.08,-h*.92]])} fill="#fff" opacity=".4"/>}
  {streak&&<path d={path([[x1+w*.06,-h*.18],[x1+w*.1,-h*.16],[tx[1]+w*.1,-h*.62],[tx[1]+w*.06,-h*.64]])} fill="#fff" opacity=".2"/>}
  <path d={sil} fill="none" stroke={pal.rim} strokeOpacity=".62" strokeWidth="1.15" strokeLinejoin="round"/>
 </g>
}

type Spec={x:number;y:number;w:number;h:number;t:number;lean?:number;rot?:number;min?:number;a?:number}
function Cluster({list,stage,pal,ids}:{list:Spec[];stage:number;pal:Pal;ids:Ids}){
 return <>{list.filter(s=>(s.min??0)<=stage).map((s,i)=><Prism key={i} {...s} pal={pal} ids={ids}/>)}</>
}

type ShapeProps={id:CrystalId;stage:number;pal:Pal;ids:Ids;chosen:string;uid:string}

function CrystalShape({id,stage,pal,ids,chosen,uid}:ShapeProps){
 const full=stage===3,two=stage>=2
 switch(id){
  case 'stardrop':
   return <>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:92,y:190,w:12,h:20,t:11,rot:-26,min:3},{x:151,y:191,w:12,h:24,t:12,rot:24,min:3},
     {x:101,y:191,w:15,h:30,t:15,rot:-14,min:1},{x:142,y:191,w:14,h:26,t:13,rot:15,min:2},
     {x:121,y:192,w:30,h:70,t:36,lean:3}]}/>
    {two&&<path d="M121 98l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff" opacity=".85"/>}
    {full&&<g fill="#fff"><circle cx="95" cy="127" r="1.6" opacity=".8"/><circle cx="156" cy="112" r="1.3" opacity=".7"/><circle cx="141" cy="76" r="1.5" opacity=".6"/></g>}
   </>
  case 'lilac':
   return <>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:88,y:190,w:13,h:30,t:16,rot:-32,min:2},{x:156,y:192,w:13,h:34,t:16,rot:30,min:2},
     {x:104,y:192,w:19,h:52,t:26,rot:-17,min:1},{x:139,y:192,w:19,h:56,t:25,rot:15,min:1},
     {x:122,y:193,w:25,h:76,t:31,rot:2},{x:113,y:196,w:11,h:22,t:12,rot:-5,min:3}]}/>
    {full&&<path d="M95 158Q110 150 124 160M128 140Q141 134 150 144" stroke={pal.rim} strokeOpacity=".5" fill="none" strokeLinecap="round"/>}
   </>
  case 'aqua':
   return <>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:96,y:191,w:17,h:38,t:19,rot:-13,min:2},{x:149,y:192,w:21,h:50,t:22,rot:12,min:1},
     {x:120,y:193,w:32,h:80,t:34}]}/>
    <g stroke={pal.rim} strokeOpacity=".5" strokeWidth="1.5" fill="none" strokeLinecap="round">
     <path d="M106 160Q120 164 134 160M106 142Q120 146 134 142M107 124Q120 128 133 124"/></g>
    {two&&<g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2"><circle cx="86" cy="140" r="4"/><circle cx="170" cy="120" r="3"/>{full&&<circle cx="80" cy="112" r="2.4"/>}</g>}
    {full&&<path d="M88 184Q104 176 120 184T152 184" stroke="#fff" strokeOpacity=".6" fill="none" strokeWidth="1.4"/>}
   </>
  case 'frost':
   return <>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:120,y:192,w:12,h:44,t:22,rot:-62,min:3},{x:122,y:192,w:12,h:44,t:22,rot:62,min:3},
     {x:119,y:192,w:13,h:56,t:26,rot:-36,min:2},{x:123,y:192,w:13,h:56,t:26,rot:36,min:2},
     {x:121,y:193,w:17,h:80,t:38}]}/>
    {full&&<g stroke="#fff" strokeOpacity=".72" strokeLinecap="round" fill="none" strokeWidth="1.2">
     <path d="M121 110V178M121 130L111 120M121 130L131 120M121 152L112 143M121 152L130 143"/></g>}
    {two&&<g transform="translate(160 90)"><g className="crystal-float" stroke={pal.rim} strokeOpacity=".85" strokeWidth="1.3" strokeLinecap="round" fill="none">
     <path d="M0-9V9M-8-4.5L8 4.5M-8 4.5L8-4.5M0-9l-2-2M0-9l2-2M0 9l-2 2M0 9l2 2"/></g></g>}
   </>
  case 'amber':
   return <>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:124,y:190,w:26,h:64,t:26,rot:3,min:1},
     {x:88,y:192,w:22,h:32,t:15,rot:-17,min:2},{x:157,y:192,w:24,h:40,t:17,rot:12,min:2},
     {x:109,y:193,w:36,h:50,t:22,lean:-3}]}/>
    <ellipse cx="116" cy="165" rx={full?20:12} ry={full?24:14} fill="#ffe4a8" opacity={full?.4:.2} style={{mixBlendMode:'screen'}} className="crystal-core-pulse"/>
    {full&&<g stroke="#fff3cf" strokeOpacity=".6" strokeWidth="1.1" fill="none" strokeLinecap="round"><path d="M102 176L112 150L119 168M125 176L131 142"/></g>}
    {two&&<path d="M101 140l9-3" stroke="#fff" strokeOpacity=".8" strokeWidth="2.2" strokeLinecap="round"/>}
   </>
  case 'orbit': {
   const gem=(
    <g className="crystal-float">
     <path d="M120 74L80 127L120 143Z" fill={pal.l2}/><path d="M120 74L160 127L120 143Z" fill={pal.base}/>
     <path d="M80 127L120 182L120 143Z" fill={pal.d1}/><path d="M160 127L120 182L120 143Z" fill={pal.d2}/>
     <path d="M120 74L100 127L120 143Z" fill={pal.l1} opacity=".6"/><path d="M120 182L140 127L120 143Z" fill={pal.d2} opacity=".5"/>
     <path d={path([[120,74],[80,127],[120,182],[160,127]])} fill={`url(#${ids.sheen})`}/>
     <path d={path([[120,74],[80,127],[120,182],[160,127]])} fill={`url(#${ids.glow})`} opacity=".55" style={{mixBlendMode:'screen'}}/>
     <path d="M80 127L120 143L160 127M120 74V182M100 127L120 143L140 127" fill="none" stroke={pal.rim} strokeOpacity=".7" strokeWidth="1"/>
     <path d={path([[120,74],[80,127],[120,182],[160,127]])} fill="none" stroke={pal.rim} strokeOpacity=".75" strokeWidth="1.3" strokeLinejoin="round"/>
     <path d="M104 108L113 90M94 127L103 117" stroke="#fff" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round"/>
    </g>)
   return <>
    <ellipse cx="120" cy="190" rx={two?36:24} ry="5" fill={chosen} opacity=".28"/>
    {two&&<g transform="rotate(-20 120 130)" fill="none"><path d="M68 130A52 15 0 0 1 172 130" stroke={pal.rim} strokeOpacity=".55" strokeWidth="3.4"/></g>}
    {gem}
    {two&&<g transform="rotate(-20 120 130)" fill="none"><path d="M68 130A52 15 0 0 0 172 130" stroke={pal.rim} strokeOpacity=".9" strokeWidth="3.4"/><path d="M68 130A52 15 0 0 0 172 130" stroke={dark(chosen,.3)} strokeOpacity=".5" strokeWidth="1.2" transform="translate(0 2.5)"/></g>}
    {full&&<g className="crystal-orbit-spin"><circle cx="170" cy="122" r="4.2" fill={pal.l1}/><circle cx="170" cy="122" r="1.8" fill="#fff"/></g>}
    <g fill={pal.l1}><circle cx="90" cy="176" r="2.4" opacity=".7"/><circle cx="153" cy="178" r="3" opacity=".6"/></g>
   </>
  }
  case 'aurora': {
   const cp=`${uid}auroraclip`
   return <>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:90,y:192,w:16,h:42,t:20,rot:-13,min:2},{x:154,y:192,w:19,h:56,t:25,rot:12,min:2},
     {x:135,y:193,w:22,h:62,t:27,rot:6,min:1},{x:113,y:194,w:30,h:96,t:38,lean:4}]}/>
    <defs><clipPath id={cp}><path d={path([[98,194],[113,98],[117,58],[135,98],[128,194]])}/></clipPath>
     <linearGradient id={uid+'rib'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a8fff0"/><stop offset=".5" stopColor="#c0a8ff"/><stop offset="1" stopColor="#ffb6e1"/></linearGradient></defs>
    {two&&<g clipPath={`url(#${cp})`} fill="none" strokeLinecap="round">
     <path className="crystal-ribbon" d="M96 168Q110 148 120 164T142 150" stroke={`url(#${uid}rib)`} strokeWidth="6" opacity=".55"/>
     <path className="crystal-ribbon r2" d="M96 140Q112 120 122 136T142 122" stroke={`url(#${uid}rib)`} strokeWidth="5" opacity=".45"/>
     {full&&<path className="crystal-ribbon r3" d="M98 112Q112 94 122 108T140 96" stroke={`url(#${uid}rib)`} strokeWidth="4" opacity=".5"/>}
    </g>}
    {full&&<path d="M116 74L123 66" stroke="#fff" strokeWidth="2" strokeOpacity=".9" strokeLinecap="round"/>}
   </>
  }
  case 'meteor': {
   const edge={stroke:pal.rim,strokeOpacity:.7,strokeWidth:1,strokeLinejoin:'round' as const}
   const g=[84,104,120,136,156],cols=[pal.d1,pal.base,pal.l3,pal.d1]
   return <>
    {two&&<g className="crystal-tail"><path d="M146 102Q160 80 172 58L150 108Z" fill={pal.l2} opacity=".5"/><path d="M150 106Q160 94 170 78" stroke="#fff" strokeOpacity=".75" strokeWidth="1.5" fill="none" strokeLinecap="round"/></g>}
    <ellipse cx="120" cy="196" rx={two?38:24} ry="5" fill={chosen} opacity=".3"/>
    <g className="crystal-float">
     {g.slice(0,4).map((gx,i)=><path key={i} d={path([[gx,118],[g[i+1],118],[120,186]])} fill={cols[i]} {...edge}/>)}
     <path d={path([[84,118],[100,96],[106,98],[98,110]])} fill={pal.l2} {...edge}/>
     <path d={path([[156,118],[140,96],[134,98],[142,110]])} fill={pal.base} {...edge}/>
     <path d={path([[106,98],[134,98],[142,110],[98,110]])} fill={pal.l1} {...edge}/>
     <path d={path([[84,118],[98,110],[120,118]])} fill={pal.l3} {...edge}/>
     <path d={path([[98,110],[142,110],[120,118]])} fill={pal.l2} {...edge}/>
     <path d={path([[156,118],[142,110],[120,118]])} fill={pal.d1} {...edge}/>
     <path d={path([[100,96],[140,96],[156,118],[120,186],[84,118]])} fill={`url(#${ids.sheen})`}/>
     {two&&<path className="crystal-core-pulse" d="M120 122c-9-10-20-5-18 6c2 9 14 15 18 22c4-7 16-13 18-22c2-11-9-16-18-6z" fill="#fff0ec" opacity=".5" style={{mixBlendMode:'screen'}}/>}
     <path d="M108 100L118 100M92 116L98 111" stroke="#fff" strokeWidth="2" strokeOpacity=".85" strokeLinecap="round"/>
    </g>
   </>
  }
  case 'moonhalo': {
   const rg=uid+'moon'
   return <>
    <defs><radialGradient id={rg} cx=".36" cy=".32" r=".8"><stop stopColor="#fff"/><stop offset=".45" stopColor={pal.l2}/><stop offset="1" stopColor={pal.d1}/></radialGradient></defs>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:84,y:192,w:15,h:32,t:15,rot:-24,min:2},{x:157,y:192,w:16,h:38,t:17,rot:22,min:2},
     {x:100,y:196,w:14,h:20,t:11,rot:-10,min:1},{x:142,y:196,w:14,h:22,t:11,rot:10,min:1}]}/>
    {two&&<g fill="none" stroke={pal.rim}><circle className="crystal-halo-ring" cx="121" cy="128" r="52" strokeOpacity=".4" strokeWidth="1.4"/>{full&&<circle className="crystal-halo-ring r2" cx="121" cy="128" r="62" strokeOpacity=".22" strokeWidth="1"/>}</g>}
    <g className="crystal-float">
     <circle cx="121" cy="128" r="38" fill={`url(#${rg})`}/>
     <path d="M121 90A38 38 0 0 1 121 166A27 38 0 0 0 121 90Z" fill={pal.d2} opacity=".42"/>
     <g fill={pal.d1} opacity=".25"><circle cx="109" cy="118" r="6"/><circle cx="134" cy="140" r="4.5"/><circle cx="127" cy="110" r="2.8"/><circle cx="106" cy="145" r="3.2"/></g>
     <circle cx="121" cy="128" r="38" fill="none" stroke={pal.rim} strokeOpacity=".7" strokeWidth="1.3"/>
     <path d="M99 108Q107 97 120 94" stroke="#fff" strokeOpacity=".85" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </g>
   </>
  }
  case 'bloom': {
   const petal=(angle:number,len:number,w:number,k:number,min:number)=>stage>=min?<g key={k} transform={`translate(121 178) rotate(${angle})`}>
     <path d={`M0 0Q${-w} ${-len*.46} 0 ${-len}Z`} fill={pal.l2}/><path d={`M0 0Q${w} ${-len*.46} 0 ${-len}Z`} fill={pal.d1}/>
     <path d={`M0 0Q${-w} ${-len*.46} 0 ${-len}Q${w} ${-len*.46} 0 0Z`} fill={`url(#${ids.sheen})`}/>
     <path d={`M0 0V${-len}M0 ${-len*.4}L${-w*.55} ${-len*.5}M0 ${-len*.55}L${w*.55} ${-len*.64}`} stroke={pal.rim} strokeOpacity=".55" strokeWidth=".9" fill="none"/>
     <path d={`M0 0Q${-w} ${-len*.46} 0 ${-len}Q${w} ${-len*.46} 0 0Z`} fill="none" stroke={pal.rim} strokeOpacity=".65" strokeWidth="1.1" strokeLinejoin="round"/>
     <path d={`M${-w*.45} ${-len*.5}Q${-w*.2} ${-len*.82} 0 ${-len*.9}`} stroke="#fff" strokeOpacity=".5" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </g>:null
   return <>
    {petal(-68,50,16,0,3)}{petal(68,50,16,1,3)}{petal(-42,64,19,2,2)}{petal(42,64,19,3,2)}{petal(-18,76,22,4,1)}{petal(18,76,22,5,1)}{petal(0,88,24,6,0)}
    <Cluster stage={stage} pal={palette(mix(chosen,'#fff5d8',.35))} ids={ids} list={[{x:121,y:190,w:17,h:34,t:16,min:0}]}/>
    {full&&<g className="crystal-float" fill={pal.l1}><path d="M82 90q6-8 12 0q-6 8-12 0z" opacity=".8"/><path d="M160 74q5-7 10 0q-5 7-10 0z" opacity=".7"/></g>}
   </>
  }
  case 'ember': {
   const dk=palette(mix(vivid(chosen),'#2a0f1e',.6)),glow='#ff9a4a'
   return <>
    <Cluster stage={stage} pal={dk} ids={ids} list={[
     {x:88,y:192,w:19,h:34,t:15,rot:-19,min:2},{x:157,y:192,w:22,h:46,t:18,rot:16,min:2},
     {x:140,y:194,w:25,h:62,t:24,rot:7,min:1},{x:114,y:195,w:32,h:80,t:30,lean:-3}]}/>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
     <g className="crystal-lava"><path d="M104 188L112 160L106 136L116 112" stroke={glow} strokeWidth="7" strokeOpacity=".4"/><path d="M104 188L112 160L106 136L116 112" stroke="#fff0c0" strokeWidth="2.2"/>
     {two&&<><path d="M114 160L128 146L124 126" stroke={glow} strokeWidth="6" strokeOpacity=".38"/><path d="M114 160L128 146L124 126" stroke="#ffe2a0" strokeWidth="2"/></>}
     {two&&<><path d="M140 190L146 168L138 150" stroke={glow} strokeWidth="6" strokeOpacity=".38"/><path d="M140 190L146 168L138 150" stroke="#ffe2a0" strokeWidth="2"/></>}
     {full&&<path d="M158 188L164 170" stroke="#ffe2a0" strokeWidth="1.8"/>}</g></g>
    <ellipse cx="118" cy="191" rx="42" ry="7" fill="#ff8a4a" opacity=".28" className="crystal-core-pulse"/>
    {two&&<g fill="#ffd08a"><circle className="crystal-ember e1" cx="104" cy="120" r="2"/><circle className="crystal-ember e2" cx="133" cy="108" r="1.6"/>{full&&<circle className="crystal-ember e3" cx="118" cy="96" r="1.8"/>}</g>}
   </>
  }
  case 'songfeather': {
   const fg=uid+'feather'
   return <>
    <defs><linearGradient id={fg} x1="0" y1="1" x2="1" y2="0"><stop stopColor={pal.d1}/><stop offset=".5" stopColor={pal.base}/><stop offset="1" stopColor={pal.l1}/></linearGradient></defs>
    <Cluster stage={stage} pal={pal} ids={ids} list={[
     {x:94,y:193,w:15,h:26,t:14,rot:-21,min:2},{x:151,y:193,w:15,h:30,t:15,rot:20,min:2}]}/>
    <g transform="translate(120 192) scale(.93) translate(-120 -192)"><g className="crystal-float">
     <path d="M118 190Q96 150 106 108Q112 82 136 58Q146 100 142 130Q138 165 118 190Z" fill={`url(#${fg})`}/>
     <path d="M118 190Q96 150 106 108Q112 82 136 58" fill="none" stroke={pal.rim} strokeOpacity=".8" strokeWidth="1.6"/>
     <path d="M136 58Q146 100 142 130Q138 165 118 190" fill="none" stroke={pal.rim} strokeOpacity=".5" strokeWidth="1.1"/>
     <path d={`M118 190Q122 130 136 58`} stroke={pal.l1} strokeOpacity=".9" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
     <g stroke={pal.rim} strokeOpacity=".55" strokeWidth="1" fill="none" strokeLinecap="round">
      <path d="M121 168L107 148M123 150L108 128M125 132L110 108M128 114L114 90M131 96L120 76M122 162L138 150M124 146L140 128M127 128L142 108M130 108L142 88"/></g>
     <path d="M110 104Q114 90 124 78" stroke="#fff" strokeOpacity=".7" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
     {two&&<g transform="translate(136 58) rotate(20)"><path d="M0-12L7 0L0 12L-7 0Z" fill={pal.l1}/><path d="M0-12L7 0L0 0Z" fill="#fff" opacity=".55"/><path d="M0-12L7 0L0 12L-7 0Z" fill="none" stroke={pal.rim} strokeWidth="1"/></g>}
    </g></g>
    {two&&<g fill={pal.rim} fontFamily="Georgia,serif" fontWeight="700"><text className="crystal-note n1" x="82" y="108" fontSize="15">♪</text>{full&&<><text className="crystal-note n2" x="158" y="96" fontSize="17">♬</text><text className="crystal-note n3" x="168" y="150" fontSize="12">♩</text></>}</g>}
   </>
  }
 }
}

const sparklePositions:[number,number,number][]=[[88,112,6],[160,86,4.5],[172,150,5],[76,160,3],[119,56,4.8],[154,198,2.7],[96,70,3.2],[178,112,3.4]]
const sparkleCount:Record<Rarity,number>={common:2,special:4,rare:6,mystic:8}
const sparkleInterval:Record<Rarity,number>={common:5.4,special:3.8,rare:2.6,mystic:1.9}
function Sparkles({rarity,stage}: {rarity:Rarity;stage:number}) {
 const count=stage===0?Math.min(1,sparkleCount[rarity]):stage===1?Math.min(2,sparkleCount[rarity]):stage===2?Math.min(sparkleCount[rarity],Math.ceil(sparkleCount[rarity]*.65)):sparkleCount[rarity]
 return <g className="crystal-sparkle-group" pointerEvents="none">
  {sparklePositions.slice(0,count).map(([x,y,r],i)=><g key={i} className="crystal-sparkle" style={{animationDuration:`${sparkleInterval[rarity]+i*.3}s`,animationDelay:`-${i*.8+.35}s`}}>
    <path d={`M${x} ${y-r}Q${x+r*.12} ${y-r*.12} ${x+r} ${y}Q${x+r*.12} ${y+r*.12} ${x} ${y+r}Q${x-r*.12} ${y+r*.12} ${x-r} ${y}Q${x-r*.12} ${y-r*.12} ${x} ${y-r}Z`} fill={i%2?'#fff5da':'#f3fbff'}/>
    <circle cx={x} cy={y} r="1.1" fill="#fff" />
   </g>)}
 </g>
}

/** 씨앗 단계: 별모래 위에 반쯤 묻힌 빛나는 씨앗 돌. */
function SeedStone({pal,chosen}:{pal:Pal;chosen:string}){
 return <g>
  <ellipse cx="120" cy="190" rx="30" ry="6" fill={chosen} opacity=".3" className="crystal-core-pulse"/>
  <g className="crystal-float">
   <path d="M120 146Q100 164 103 184Q120 198 137 184Q140 164 120 146Z" fill={pal.base}/>
   <path d="M120 146Q100 164 103 184Q112 190 120 190Z" fill={pal.l2}/><path d="M120 146Q140 164 137 184Q128 190 120 190Z" fill={pal.d1}/>
   <path d="M120 146L112 170L120 190L128 170Z" fill={pal.l1} opacity=".55"/>
   <path d="M120 146Q100 164 103 184Q120 198 137 184Q140 164 120 146Z" fill="none" stroke={pal.rim} strokeOpacity=".75" strokeWidth="1.2"/>
   <path d="M111 160Q114 154 119 152" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </g>
 </g>
}

export function CrystalArt({id,growing,variant='normal',size='regular',bare=false}:{id:CrystalId;growing?:CrystalGrowing|null;variant?:Variant;size?:'small'|'regular';bare?:boolean}){
 const uid=useId().replace(/:/g,'')
 const pct=growing?growthPercent(growing):100
 const stage=growing?growthStage(pct):3
 const rarity=species[id].rarity
 const base=species[id].color
 const tintOf=(v:Variant)=>v==='normal'?0:.5 // 본래 빛깔은 종의 색 그대로, 새벽·노을·한밤은 색이 한 방향으로 물든다
 const chosen=growing?(stage===3?mix(base,variantTint[crystalVariant(growing)],tintOf(crystalVariant(growing))):livingColor(growing)):mix(base,variantTint[variant],tintOf(variant))
 const pal=palette(id==='moonhalo'?chosen:vivid(chosen))
 const scale=[1,.8,.96,1.1][stage]
 const ids:Ids={sheen:uid+'sheen',glow:uid+'glow'}
 return <svg className={`crystal-svg ${size} crystal-${rarity} crystal-${id}`} data-rarity={rarity} data-stage={stage} viewBox="0 0 240 240" role="img" aria-label={`${species[id].name} · ${rarityNames[rarity]} 등급 · ${growing?`${pct.toFixed(0)}퍼센트 성장`:'완성'}`}>
  <defs>
   <linearGradient id={ids.sheen} x1="0" y1="1" x2="0" y2="0"><stop stopColor="#0c1038" stopOpacity=".42"/><stop offset=".45" stopColor="#0c1038" stopOpacity="0"/><stop offset="1" stopColor="#fff" stopOpacity=".34"/></linearGradient>
   <radialGradient id={ids.glow} cx=".5" cy=".72" r=".62"><stop stopColor="#fff" stopOpacity=".9"/><stop offset=".4" stopColor={pal.l2} stopOpacity=".55"/><stop offset="1" stopColor={chosen} stopOpacity="0"/></radialGradient>
   <radialGradient id={uid+'halo'}><stop stopColor={chosen} stopOpacity={rarity==='mystic'?'.8':rarity==='rare'?'.62':'.46'}/><stop offset="1" stopColor={chosen} stopOpacity="0"/></radialGradient>
   <radialGradient id={uid+'room'} cx=".5" cy=".62" r=".75"><stop stopColor="#4a5a96" stopOpacity=".55"/><stop offset=".6" stopColor="#252d5c" stopOpacity=".4"/><stop offset="1" stopColor="#141a3c" stopOpacity=".55"/></radialGradient>
   <linearGradient id={uid+'glass'} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#f2f6ff" stopOpacity=".26"/><stop offset=".45" stopColor="#a6d5e9" stopOpacity=".05"/><stop offset="1" stopColor="#fff5ec" stopOpacity=".3"/></linearGradient>
   <linearGradient id={uid+'sand'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8d7fb0"/><stop offset="1" stopColor="#4c4478"/></linearGradient>
   <linearGradient id={uid+'cork'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e9cf9f"/><stop offset="1" stopColor="#b58f60"/></linearGradient>
   <clipPath id={uid+'inside'}><path d="M64 72Q64 50 86 48H154Q176 50 176 72V178Q176 204 150 206H90Q64 204 64 178Z"/></clipPath>
  </defs>
  {!bare&&<>
   <ellipse cx="120" cy="214" rx="66" ry="9" fill="#0b1029" opacity=".4"/>
   <path d="M64 72Q64 50 86 48H154Q176 50 176 72V178Q176 204 150 206H90Q64 204 64 178Z" fill={`url(#${uid}room)`}/>
   <g clipPath={`url(#${uid}inside)`}>
    <g fill="#fff" opacity=".7"><circle cx="80" cy="66" r="1"/><circle cx="160" cy="62" r="1.2"/><circle cx="96" cy="92" r=".8"/><circle cx="166" cy="104" r=".9"/><circle cx="74" cy="124" r=".8"/><circle cx="170" cy="150" r="1"/></g>
    <path d="M60 188Q120 172 180 188V210H60Z" fill={`url(#${uid}sand)`}/>
    <path d="M60 188Q120 172 180 188" stroke="#d9cbf5" strokeOpacity=".5" fill="none"/>
    <g fill="#f1e5ff" opacity=".7"><circle cx="82" cy="193" r="1"/><circle cx="104" cy="197" r="1.2"/><circle cx="130" cy="195" r=".9"/><circle cx="152" cy="193" r="1.1"/><circle cx="166" cy="198" r=".8"/><circle cx="118" cy="201" r="1"/></g>
    <ellipse cx="120" cy="196" rx="52" ry="8" fill={chosen} opacity=".16"/>
   </g>
  </>}
  <ellipse className="crystal-aura" cx="120" cy="140" rx={rarity==='mystic'?86:72} ry={rarity==='mystic'?88:74} fill={`url(#${uid}halo)`}/>
  <g transform={`translate(120 192) scale(${scale}) translate(-120 -192)`}>
   {stage===0?<SeedStone pal={pal} chosen={chosen}/>:<CrystalShape id={id} stage={stage} pal={pal} ids={ids} chosen={chosen} uid={uid}/>}
   {(rarity==='mystic'&&stage>=2)&&<ellipse className="crystal-core-pulse" cx="120" cy="140" rx="36" ry="46" fill={`url(#${ids.glow})`} pointerEvents="none"/>}
   {(rarity==='rare'&&stage>=2)&&<path className="crystal-refraction" d="M87 146L108 120M151 100L168 86" stroke="#fff" strokeWidth="2" strokeOpacity=".55" strokeLinecap="round"/>}
  </g>
  <Sparkles rarity={rarity} stage={stage}/>
  {rarity==='mystic'&&stage===3&&<g className="crystal-orbit-particles" fill={pal.rim}>
   <circle cx="120" cy="54" r="2.3"/><circle cx="166" cy="116" r="1.8"/><circle cx="102" cy="214" r="1.6" opacity="0"/>
  </g>}
  {!bare&&<>
   <path d="M64 72Q64 50 86 48H154Q176 50 176 72V178Q176 204 150 206H90Q64 204 64 178Z" fill={`url(#${uid}glass)`} stroke="#d4e2f0" strokeOpacity=".7" strokeWidth="2.4"/>
   <path d="M78 66Q71 80 72 112V172" fill="none" stroke="#fbffff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
   <path d="M168 76V120" fill="none" stroke="#fbffff" strokeOpacity=".3" strokeWidth="2.4" strokeLinecap="round"/>
   <path d="M80 200Q120 210 160 200" stroke="#fff" strokeOpacity=".28" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
   <rect x="82" y="36" width="76" height="13" rx="6" fill="#d8b36a"/><rect x="82" y="36" width="76" height="5" rx="3" fill="#f6e3ae" opacity=".7"/>
   <path d="M90 36Q92 21 120 20Q148 21 150 36Z" fill={`url(#${uid}cork)`}/>
   <path d="M98 31l1.6 3.4 3.7.5-2.7 2.5.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.5 3.7-.5z" transform="translate(21 -9)" fill="#fff4d8" opacity=".75"/>
  </>}
 </svg>
}
