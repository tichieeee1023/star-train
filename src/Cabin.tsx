import type {Light} from './Palette'
import type {Weather} from './CanvasPaint'
import {Sky, type Scenery} from './Sky'
import {StationApproach} from './Station'
import {VoyageSky,type TravelWindow} from './VoyageSky'

/** 이동 중: 전용 우주 Canvas. 도착 후: 목적지 Canvas. 객실/캐릭터 SVG는 보존. */
export function Cabin({scenery, state, light='dusk',weather='clear',journey=null}: {scenery: Scenery; state: 'moving'|'arriving'|'stopped';light?:Light;weather?:Weather;journey?:TravelWindow|null}) {
  return <div className={`cabin${state==='stopped'?' scene-still':''}`} role="img" aria-label={state==='moving'?'우주를 달리는 은하 열차 선실. 창밖으로 별과 성운이 천천히 지나갑니다.':'도착한 행성의 풍경을 바라보는 은하 열차 선실.'}>
    {state==='moving'?<VoyageSky journey={journey}/>:<Sky scenery={scenery} light={light} weather={weather} stopped={state==='stopped'}/>}
    {state!=='moving'&&<StationApproach scenery={scenery} arriving={state==='arriving'}/>}
    <img className="cabin-interior" src="/art/galaxy-cabin.svg" alt="" draggable={false}/>
  </div>
}
