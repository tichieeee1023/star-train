/**
 * 2단계 창밖 풍경: 같은 객실에서 '성운 항로'와 '유리도시 항로'를 미리봅니다.
 * 하늘·별·혜성·도시 스카이라인은 객실 일러스트와 독립된 SVG 레이어입니다.
 * 시차 애니메이션은 CSS만 사용하므로 타이머나 React 재렌더링이 없습니다.
 */
export const sceneryOrder = ['nebula','ringsea','snowfield','auroraforest','canyon','city'] as const
export type Scenery = typeof sceneryOrder[number]

export const routeInfo:Record<Scenery,{name:string;label:string;title:string;description:string;icon:string}> = {
  nebula:{name:'라일락 성운역',label:'라일락 성운',title:'별 사이를 달리는 밤',description:'연보라 성운과 별가루가 아주 천천히 흘러갑니다.',icon:'✦'},
  ringsea:{name:'청람 고리해안역',label:'청람 고리해안',title:'거대한 고리 아래에서',description:'유리처럼 투명한 바다 위로 고리행성이 지나갑니다.',icon:'◌'},
  snowfield:{name:'혜성 설원역',label:'혜성 설원',title:'푸른 별의 설원을 건너',description:'은빛 설산과 얼음벌판을 따라 혜성이 미끄러집니다.',icon:'❄'},
  auroraforest:{name:'오로라 숲역',label:'오로라 숲',title:'초록빛이 잠든 숲',description:'어두운 숲 위로 청록 오로라가 파도처럼 펼쳐집니다.',icon:'♧'},
  canyon:{name:'황금 유성협곡역',label:'황금 유성협곡',title:'황금빛 운석의 길',description:'따뜻한 협곡 너머 금빛 유성이 먼 하늘을 가릅니다.',icon:'☄'},
  city:{name:'유리도시 중앙역',label:'유리도시',title:'멀리 반짝이는 도시',description:'별빛 아래, 먼 지평선에 작은 도시의 불빛이 보입니다.',icon:'▥'}
}
