import type {MomentAction} from './PlaceMoment'
import {CanvasScene} from './CanvasScene'
import type {Scenery} from './routeData'
import type {Light} from './Palette'
import type {Weather} from './CanvasPaint'
import {VistaPeople} from './CompanionsLayer'

export type {Light} from './Palette'
export type {Weather} from './CanvasPaint'
export const lights:Record<Light,string>={dawn:'새벽빛',dusk:'노을빛',night:'한밤빛'}
export const weathers:Record<Weather,string>={clear:'맑은 하늘',rain:'별빛 소나기',snow:'하얀 별눈',meteor:'별똥별',aurora:'오로라'}
const sceneNames:Record<Scenery,string>={nebula:'라일락 성운',ringsea:'청람 고리해안',snowfield:'혜성 설원',auroraforest:'오로라 숲',canyon:'황금 유성협곡',city:'유리도시',dunes:'은모래 사막',garden:'꽃별 정원',ruins:'멈춘 시계탑',volcano:'불씨 화산',lanternsea:'초롱 등불바다',cloudwhale:'구름고래 해역',crystalcave:'거울수정 동굴',starcherry:'별벚꽃 언덕'}
/** Landscape is painted by Canvas. The girl and cat are drawn by Companions.ts (canvas) so they can breathe, sway and react to snacks. */
export function Vista({scenery,light='dusk',weather='clear',moment=0,momentAction=null}: {scenery:Scenery;light?:Light;weather?:Weather;moment?:number;momentAction?:MomentAction|null}){
 return <div className="vista" role="img" aria-label={`${sceneNames[scenery]}의 ${lights[light]} 풍경, ${weathers[weather]}. 소녀와 하얀 고양이, 작은 황금빛 카나리아가 풍경을 바라봅니다.`}>
  <CanvasScene scenery={scenery} light={light} weather={weather} moment={moment} momentAction={momentAction}/>
  <VistaPeople scenery={scenery} light={light} weather={weather}/>
 </div>
}
