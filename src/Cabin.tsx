import {Sky, type Scenery} from './Sky'
import {StationApproach} from './Station'

/** 객실과 캐릭터는 그대로. 접근 중일 때 창밖에 플랫폼 실루엣만 겹칩니다. */
export function Cabin({scenery, state}: {scenery: Scenery; state: 'moving'|'arriving'|'stopped'}) {
  return <div className={`cabin${state==='stopped'?' scene-still':''}`} role="img" aria-label={scenery==='city'
    ? '은하 전망 열차에서 바라보는 유리도시의 불빛. 소녀는 앉아 있고 고양이는 꼬리만 움직입니다.'
    : '은하 전망 열차 창밖의 성운과 별, 고리행성. 소녀는 움직이지 않고 앉아 있습니다.'}>
    <Sky scenery={scenery} stopped={state==='stopped'}/>
    {state!=='moving'&&<StationApproach scenery={scenery} arriving={state==='arriving'}/>}
    <img className="cabin-interior" src="/art/galaxy-cabin.svg" alt="" draggable={false}/>
  </div>
}
