import {CanvasScene} from './CanvasScene'
export {sceneryOrder,routeInfo} from './routeData'
export type {Scenery} from './routeData'
import type {Scenery} from './routeData'

/** The window view is now a Canvas 2D painting; the train interior stays SVG. */
export function Sky({scenery,stopped=false}: {scenery:Scenery;stopped?:boolean}){
 return <CanvasScene scenery={scenery} light="dusk" mode="cabin" stopped={stopped}/>
}
