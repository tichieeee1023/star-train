import {CanvasScene} from './CanvasScene'
export {sceneryOrder,routeInfo} from './routeData'
export type {Scenery} from './routeData'
import type {Scenery} from './routeData'
import type {Light} from './Palette'
import type {Weather} from './CanvasPaint'

/** The window view is now a Canvas 2D painting; the train interior stays SVG. */
export function Sky({scenery,stopped=false,light='dusk',weather='clear'}: {scenery:Scenery;stopped?:boolean;light?:Light;weather?:Weather}){
 return <CanvasScene scenery={scenery} light={light} weather={weather} mode="cabin" stopped={stopped}/>
}
