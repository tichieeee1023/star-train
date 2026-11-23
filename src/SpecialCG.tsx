import type {MemoryId} from './TrainLife'

const stars=Array.from({length:78},(_,i)=>({x:18+(i*139+((i*i*31)%333))%930,y:18+(i*67+((i*i*7)%157))%420,size:i%9===0?2.4:.6+(i%4)*.32,alpha:.22+(i%6)*.12}))
/** 보상으로 열리는 선실 내 특별 CG. 외부 이미지/네트워크 없이 열리는 자체 SVG 장면. */
export function SpecialCG({scene}:{scene:MemoryId}){
 const cocoa=scene==='cocoa-night',moon=scene==='moon-picnic',fish=scene==='fish-starlight',cherry=scene==='cherry-moon',rice=scene==='nebula-supper'
 const sky=fish?['#10172e','#334a78','#6f9eba']:cherry?['#311b43','#936482','#e1a1b0']:rice?['#101f42','#41748c','#87aca5']:cocoa?['#101b3a','#435b89','#bc8caa']:moon?['#1a2554','#776c9f','#dca7b2']:['#0c203b','#416d83','#97b2aa']
 return <svg className="special-cg" viewBox="0 0 960 600" role="img" aria-label={fish?'반짝이는 생선 과자와 우주고양이의 작은 잔치':cherry?'체리빛 달 아래서 마카롱을 나누는 소녀와 고양이':rice?'성운 주먹밥을 함께 먹는 두 친구':cocoa?'코코아 향이 감도는 별빛 선실에서 소녀와 하얀 고양이':moon?'커다란 달 아래 타르트를 나누는 소녀와 고양이':'은하 도시락을 나누며 창밖으로 별을 바라보는 두 친구'} xmlns="http://www.w3.org/2000/svg">
  <defs>
   <linearGradient id="cg-sky" x1=".1" y1="0" x2=".9" y2="1"><stop stopColor={sky[0]}/><stop offset=".5" stopColor={sky[1]}/><stop offset="1" stopColor={sky[2]}/></linearGradient>
   <radialGradient id="cg-moon"><stop stopColor="#fffaf3"/><stop offset=".45" stopColor="#fff0de"/><stop offset="1" stopColor="#b7c9e9"/></radialGradient>
   <linearGradient id="cg-wall" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#364661"/><stop offset="1" stopColor="#222944"/></linearGradient>
   <linearGradient id="cg-coat" x1="0" y1="0" x2=".2" y2="1"><stop stopColor="#263b68"/><stop offset="1" stopColor="#8094bd"/></linearGradient>
   <linearGradient id="cg-wood" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c1a0a2"/><stop offset="1" stopColor="#665876"/></linearGradient>
   <radialGradient id="cg-glow"><stop stopColor="#f0d6ed" stopOpacity=".55"/><stop offset="1" stopColor="#d2c7f5" stopOpacity="0"/></radialGradient>
   <filter id="cg-blur"><feGaussianBlur stdDeviation="13"/></filter>
  </defs>
  <rect width="960" height="600" fill="url(#cg-wall)"/>
  <rect x="50" y="32" width="860" height="432" rx="42" fill="#202f51" stroke="#bca6a8" strokeWidth="12"/>
  <rect x="69" y="49" width="822" height="396" rx="30" fill="url(#cg-sky)" stroke="#e6c8aa" strokeWidth="3"/>
  <g opacity=".42"><ellipse cx="500" cy="248" rx="330" ry="120" fill="url(#cg-glow)"/></g>
  {stars.map((s,i)=><circle key={i} cx={s.x} cy={s.y} r={s.size} fill="#fff4ef" opacity={s.alpha}/>)}
  <path d="M69 383 Q230 275 443 374 T891 332 L891 445 H69Z" fill="#9980a9" opacity=".23"/>
  <path d="M69 405 Q240 342 425 409 T891 384 V445 H69Z" fill="#a9acdc" opacity=".29"/>
  {moon||cherry?<><circle cx="673" cy="194" r="101" fill="url(#cg-moon)"/><ellipse cx="673" cy="194" rx="155" ry="46" fill="none" stroke="#eddfec" strokeOpacity=".6" strokeWidth="8" transform="rotate(-26 673 194)"/><ellipse cx="655" cy="169" rx="43" ry="13" fill="#fff7eb" opacity=".24"/></>:<><circle cx="724" cy="171" r="78" fill="url(#cg-moon)" opacity=".92"/><ellipse cx="724" cy="171" rx="132" ry="31" fill="none" stroke="#f6ebeb" strokeOpacity=".46" strokeWidth="9" transform="rotate(-27 724 171)"/></>}
  <path d="M50 460 H910 L960 600 H0 Z" fill="#2f3652"/><path d="M0 533 H960" stroke="#84758d" strokeOpacity=".36" strokeWidth="3"/>
  <rect x="85" y="456" width="790" height="13" rx="6" fill="#d1ac9f"/>
  {/* girl's galaxy dress and hair, from slightly behind / side */}
  <ellipse cx="292" cy="553" rx="147" ry="17" fill="#101a2f" opacity=".55"/>
  <path d="M235 377 Q213 427 183 537 Q272 574 367 532 L337 396Z" fill="url(#cg-coat)" stroke="#94aed0" strokeWidth="3"/>
  <path d="M248 410 Q230 467 207 527 M324 418 Q343 474 349 527" fill="none" stroke="#c0c6eb" strokeWidth="2" opacity=".35"/>
  {[[256,452],[302,486],[226,520],[342,531],[289,527],[257,514]].map(([x,y],i)=><g key={i} stroke="#d2e2fa" opacity={.6+(i%2)*.25}><path d={`M${x-4} ${y}h8 M${x} ${y-5}v10`}/></g>)}
  <path d="M248 398 Q229 437 211 469" fill="none" stroke="#65769d" strokeWidth="26" strokeLinecap="round"/><path d="M334 398 Q353 436 366 461" fill="none" stroke="#65769d" strokeWidth="27" strokeLinecap="round"/>
  <ellipse cx="290" cy="330" rx="66" ry="85" fill="#2a2543"/>
  <path d="M234 315 Q231 227 288 231 Q363 222 350 337 L351 421 Q327 443 301 417 Q265 444 233 416Z" fill="#322c4d" stroke="#554561" strokeWidth="2"/>
  <path d="M294 246 Q303 332 295 409 M256 264 Q263 332 249 397 M331 271 Q318 350 339 405" fill="none" stroke="#695777" strokeOpacity=".7" strokeWidth="3"/>
  <polygon points="342,273 347,286 360,287 351,295 354,308 343,301 332,308 335,295 326,287 339,285" fill="#ffd57d" stroke="#ffefbb" strokeWidth="2"/>
  {/* table and warm snacks */}
  <ellipse cx="585" cy="540" rx="232" ry="24" fill="#111b32" opacity=".45"/>
  <path d="M400 472 H829 L847 501 H388Z" fill="url(#cg-wood)" stroke="#e6bbae" strokeWidth="4"/>
  <path d="M419 501 L405 590 M810 501 L829 590" stroke="#665e77" strokeWidth="14" strokeLinecap="round"/>
  {cocoa?<>
   <ellipse cx="518" cy="462" rx="60" ry="16" fill="#e8cfc5"/><path d="M479 415 H552 L542 465 H490Z" fill="#e9d3bd" stroke="#f7e6df" strokeWidth="3"/><path d="M552 427 Q593 418 581 450 Q572 465 546 453" stroke="#eddcd7" strokeWidth="9" fill="none"/><ellipse cx="516" cy="414" rx="40" ry="12" fill="#815f68"/><path d="M489 410 Q514 395 542 409" stroke="#f6ead7" strokeWidth="8" fill="none"/>
   <path d="M501 398 Q483 367 508 350 M526 395 Q545 371 527 354" stroke="#f6d7cc" strokeWidth="4" fill="none" opacity=".53"/>
   <ellipse cx="667" cy="462" rx="85" ry="16" fill="#e8d1c7"/><rect x="622" y="447" width="89" height="15" rx="6" fill="#b28292"/>
   {[[639,438],[670,436],[697,440]].map(([x,y],i)=><g key={i}><rect x={x-14} y={y-16} width="27" height="17" rx="5" fill="#e6c18d"/><path d={`M${x} ${y-19}l-3 5 5 0z`} fill="#fff1c7"/></g>)}
  </>:moon?<>
   <ellipse cx="574" cy="462" rx="115" ry="20" fill="#e9d4dc"/><path d="M492 447 Q507 408 574 413 Q655 412 665 447 Z" fill="#dfb8b4" stroke="#f7e5d3" strokeWidth="4"/>
   <path d="M498 442 Q573 457 659 440" stroke="#b37b97" strokeWidth="5" fill="none"/>
   {[[521,432],[557,425],[588,427],[628,437]].map(([x,y],i)=><g key={i}><path d={`M${x} ${y-10}l5 8 9 -4 -1 11 -13 -1z`} fill="#f7e8bd"/><circle cx={x+5} cy={y-12} r="4" fill="#e6a6b2"/></g>)}
   <ellipse cx="743" cy="463" rx="36" ry="10" fill="#efdee3"/><path d="M722 448 L755 448 L746 461 L727 461Z" fill="#caadc5"/>
  </>:fish?<>
   <ellipse cx="584" cy="456" rx="122" ry="20" fill="#ddd4df" stroke="#f5e7da" strokeWidth="4"/>
   {[[513,439],[562,437],[613,440],[665,439]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><path d="M-17 0 Q-8 -13 7 -5 L18 -15 V13 L7 6 Q-8 14 -17 0Z" fill={i%2?'#d3b2aa':'#eed8a7'} stroke="#fff0d8" strokeWidth="2"/><circle cx="-6" cy="-1" r="2" fill="#8e6882"/></g>)}
   <path d="M478 402 Q561 367 671 394" fill="none" stroke="#cad7fc" strokeOpacity=".7" strokeWidth="2" strokeDasharray="3 15"/>
  </>:cherry?<>
   <ellipse cx="595" cy="458" rx="125" ry="20" fill="#f2d6de"/>
   {[[540,437],[594,430],[653,438]].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y+8} rx="29" ry="11" fill="#bb779b"/><ellipse cx={x} cy={y} rx="29" ry="15" fill={i%2?'#f4bfd1':'#f1a9bd'} stroke="#fff0e5" strokeWidth="2"/><ellipse cx={x} cy={y+3} rx="25" ry="6" fill="#fff1d8"/><circle cx={x+9} cy={y-10} r="5" fill="#a53d75"/></g>)}
   <path d="M500 413 Q594 379 696 417" fill="none" stroke="#ffdee5" strokeWidth="3" strokeDasharray="2 12"/>
  </>:rice?<>
   <rect x="463" y="410" width="265" height="62" rx="13" fill="#c1a1ad" stroke="#f3ddcd" strokeWidth="5"/>
   {[[515,437],[593,435],[670,440]].map(([x,y],i)=><g key={i}><path d={`M${x-27} ${y+12}Q${x-33} ${y-20} ${x} ${y-20}Q${x+34} ${y-16} ${x+27} ${y+12}Z`} fill={['#bad9d3','#e1c5db','#b7c1e5'][i]} stroke="#f6eddf" strokeWidth="2"/><rect x={x-17} y={y+4} width="34" height="12" rx="3" fill="#50667a"/><circle cx={x+7} cy={y-8} r="4" fill="#fff1d7"/></g>)}
  </>:<>
   <path d="M450 445 Q591 403 783 441 L769 474 H455Z" fill="#d1b5b7" stroke="#f5dfcd" strokeWidth="4"/>
   {[[492,442],[545,433],[601,428],[656,435],[715,443]].map(([x,y],i)=><g key={i}><rect x={x-21} y={y-9} width="44" height="20" rx="5" fill={['#d8b88d','#a7baba','#9ba4cf','#d7aba1','#dfcea8'][i]}/><path d={`M${x} ${y-8}l4 6 8 0 -6 5 1 8 -7 -5 -7 5 1 -8 -6 -5 8 0Z`} fill="#f9eed1"/></g>)}
  </>}
  {/* resting white space cat curled at the table */}
  <ellipse cx="797" cy="438" rx="52" ry="32" fill="#eae5ec" stroke="#fff7f2" strokeWidth="3"/>
  <path d="M755 435 Q715 424 738 403 Q753 389 758 409" fill="none" stroke="#eeeaf2" strokeWidth="17" strokeLinecap="round"/>
  <path d="M816 389 L832 364 L848 390 L868 369 L882 403 Q899 446 848 455 Q818 451 816 389Z" fill="#f6f3f5" stroke="#fff7f6" strokeWidth="2"/>
  <path d="M829 382 L834 373 L842 387 M866 387 L873 375 L877 393" fill="#e5aebc"/>
  <path d="M835 416 q8 8 15 0 M857 416 q8 8 15 0" stroke="#6c627b" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
  <path d="M851 425 l-5 0 3 4 4 -4" fill="#cb9fae"/>
  <ellipse cx="776" cy="450" rx="23" ry="11" fill="#f6f3f5"/>
  <g><circle cx="505" cy="325" r="75" fill="url(#cg-glow)" opacity=".35"/>{[[411,270],[626,334],[777,304],[474,146],[856,265]].map(([x,y],i)=><g key={i} stroke="#fff0d1" opacity={.5+i*.08}><path d={`M${x-7} ${y}h14 M${x} ${y-10}v20`} strokeWidth="1.6"/></g>)}</g>
 </svg>
}
